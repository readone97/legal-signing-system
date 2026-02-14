import { Response } from 'express';
import { PrismaClient, DocumentStatus } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import { createAuditLog } from '../utils/audit';
import {
  createSubmissionFromTemplate,
  getSubmission,
  getSubmissionDocuments,
  getEmbedUrlForSlug,
  getFormBaseUrl,
  isDocuSealConfigured,
  type DocuSealSubmittersMap,
} from '../services/docuseal.service';
import { config } from '../config';

const prisma = new PrismaClient();

/**
 * Create a DocuSeal submission for a document (template-based).
 * Stores submission id and submitter slugs on the document.
 */
export const createDocumentSubmission = async (req: AuthRequest, res: Response) => {
  if (!isDocuSealConfigured()) {
    throw new AppError('DocuSeal is not configured. Set DOCUSEAL_API_KEY and DOCUSEAL_DEFAULT_TEMPLATE_ID.', 503);
  }

  const { id } = req.params;
  const { templateId: bodyTemplateId, sendEmail = true } = req.body || {};
  const templateId = bodyTemplateId ?? config.docuseal?.defaultTemplateId;

  if (!templateId) {
    throw new AppError('Template ID is required. Set DOCUSEAL_DEFAULT_TEMPLATE_ID or pass templateId in the request.', 400);
  }

  if (!req.user) throw new AppError('Not authenticated', 401);

  const document = await prisma.document.findUnique({
    where: { id },
    include: {
      partyA: { select: { id: true, email: true, firstName: true, lastName: true } },
      partyB: { select: { id: true, email: true, firstName: true, lastName: true } },
      notary: { select: { id: true, email: true, firstName: true, lastName: true } },
    },
  });

  if (!document) throw new AppError('Document not found', 404);
  if (document.partyAId !== req.user.id) {
    throw new AppError('Only the document creator can create a DocuSeal submission', 403);
  }
  if (document.docusealSubmissionId) {
    throw new AppError('This document already has a DocuSeal submission', 400);
  }
  if (document.status !== DocumentStatus.DRAFT && document.status !== DocumentStatus.PENDING_PARTY_B) {
    throw new AppError('DocuSeal submission can only be created for draft or pending Party B documents', 400);
  }

  const submitters: Array<{ role: string; name?: string; email: string; order?: number }> = [
    {
      role: 'Party A',
      name: document.partyA ? `${document.partyA.firstName} ${document.partyA.lastName}` : undefined,
      email: document.partyA.email,
      order: 0,
    },
  ];

  if (document.partyB) {
    submitters.push({
      role: 'Party B',
      name: `${document.partyB.firstName} ${document.partyB.lastName}`,
      email: document.partyB.email,
      order: 1,
    });
  }

  if (document.notary) {
    submitters.push({
      role: 'Notary',
      name: `${document.notary.firstName} ${document.notary.lastName}`,
      email: document.notary.email,
      order: 2,
    });
  }

  const { submissionId, submitters: submittersMap } = await createSubmissionFromTemplate(
    Number(templateId),
    {
      name: document.title,
      submitters,
      sendEmail: !!sendEmail,
      order: 'preserved',
    }
  );

  await prisma.document.update({
    where: { id },
    data: {
      docusealSubmissionId: String(submissionId),
      docusealSubmitters: submittersMap as unknown as object,
    },
  });

  await createAuditLog({
    action: 'DOCUMENT_UPDATED',
    userId: req.user.id,
    documentId: id,
    ipAddress: req.ip || 'unknown',
    userAgent: req.get('user-agent'),
    metadata: { docusealSubmissionId: submissionId },
  });

  const embedInfo = buildEmbedInfo(submittersMap, document.partyAId, document.partyBId ?? undefined, document.notaryId ?? undefined);

  res.status(201).json({
    success: true,
    message: 'DocuSeal submission created',
    data: {
      submissionId,
      submitters: submittersMap,
      embedInfo,
      formBaseUrl: getFormBaseUrl(),
    },
  });
};

/**
 * Get embed URL/slug for the current user so the frontend can show the DocuSeal form.
 */
export const getEmbedInfo = async (req: AuthRequest, res: Response) => {
  if (!req.user) throw new AppError('Not authenticated', 401);

  const { id } = req.params;
  const document = await prisma.document.findUnique({
    where: { id },
    select: {
      id: true,
      docusealSubmissionId: true,
      docusealSubmitters: true,
      partyAId: true,
      partyBId: true,
      notaryId: true,
    },
  });

  if (!document) throw new AppError('Document not found', 404);
  if (!document.docusealSubmissionId || !document.docusealSubmitters) {
    throw new AppError('This document does not have a DocuSeal submission', 400);
  }

  const submitters = document.docusealSubmitters as DocuSealSubmittersMap;
  const embedInfo = buildEmbedInfo(
    submitters,
    document.partyAId,
    document.partyBId ?? undefined,
    document.notaryId ?? undefined,
    req.user.id
  );

  if (!embedInfo) {
    throw new AppError('You are not a signer for this DocuSeal submission', 403);
  }

  res.json({
    success: true,
    data: {
      ...embedInfo,
      formBaseUrl: getFormBaseUrl(),
      embedUrl: getEmbedUrlForSlug(embedInfo.slug),
    },
  });
};

function buildEmbedInfo(
  submitters: DocuSealSubmittersMap,
  partyAId: string,
  partyBId?: string,
  notaryId?: string,
  currentUserId?: string
): { slug: string; role: string } | null {
  if (!currentUserId) {
    return submitters.partyA ? { slug: submitters.partyA.slug, role: 'Party A' } : null;
  }
  if (partyAId === currentUserId && submitters.partyA) {
    return { slug: submitters.partyA.slug, role: 'Party A' };
  }
  if (partyBId === currentUserId && submitters.partyB) {
    return { slug: submitters.partyB.slug, role: 'Party B' };
  }
  if (notaryId === currentUserId && submitters.notary) {
    return { slug: submitters.notary.slug, role: 'Notary' };
  }
  return null;
}

/**
 * Get DocuSeal submission status (and optionally sync completed status to our document).
 */
export const getSubmissionStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (!req.user) throw new AppError('Not authenticated', 401);

  const document = await prisma.document.findUnique({
    where: { id },
    select: { docusealSubmissionId: true, partyAId: true, partyBId: true, notaryId: true },
  });

  if (!document || !document.docusealSubmissionId) {
    throw new AppError('Document or DocuSeal submission not found', 404);
  }

  const hasAccess =
    document.partyAId === req.user.id ||
    document.partyBId === req.user.id ||
    document.notaryId === req.user.id;
  if (!hasAccess) throw new AppError('Access denied', 403);

  const submission = await getSubmission(Number(document.docusealSubmissionId));

  if (submission.status === 'completed') {
    await prisma.document.update({
      where: { id },
      data: {
        status: DocumentStatus.COMPLETED,
        completedAt: new Date(),
        partyASignedAt: new Date(),
        partyBSignedAt: new Date(),
        notarizedAt: new Date(),
      },
    }).catch(() => {});
  }

  res.json({
    success: true,
    data: {
      status: submission.status,
      submitters: submission.submitters,
    },
  });
};

/**
 * Get signed document URLs from DocuSeal (for download).
 */
export const getSignedDocuments = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (!req.user) throw new AppError('Not authenticated', 401);

  const document = await prisma.document.findUnique({
    where: { id },
    select: { docusealSubmissionId: true, partyAId: true, partyBId: true, notaryId: true },
  });

  if (!document || !document.docusealSubmissionId) {
    throw new AppError('Document or DocuSeal submission not found', 404);
  }

  const hasAccess =
    document.partyAId === req.user.id ||
    document.partyBId === req.user.id ||
    document.notaryId === req.user.id;
  if (!hasAccess) throw new AppError('Access denied', 403);

  const { documents } = await getSubmissionDocuments(Number(document.docusealSubmissionId), true);

  res.json({
    success: true,
    data: { documents },
  });
};
