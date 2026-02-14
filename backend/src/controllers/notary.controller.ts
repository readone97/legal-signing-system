import { Response } from 'express';
import { PrismaClient, DocumentStatus } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import { createAuditLog } from '../utils/audit';
import { sendDocumentCompletedEmail } from '../services/email.service';
import { generatePDF } from '../services/pdf.service';
import { notarizeSchema } from '../validators/notary.validator';

const prisma = new PrismaClient();

export const getPendingDocuments = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    if (req.user.role !== 'NOTARY') {
      throw new AppError('Only notaries can access this endpoint', 403);
    }

    const documents = await prisma.document.findMany({
      where: {
        status: DocumentStatus.PENDING_NOTARY,
        OR: [
          { notaryId: req.user.id },
          { notaryId: null },
        ],
      },
      include: {
        partyA: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        partyB: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        signatures: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({
      success: true,
      data: documents,
    });
  } catch (error) {
    throw error;
  }
};

export const notarizeDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { documentId } = req.params;
    const validatedData = notarizeSchema.parse(req.body);

    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    if (req.user.role !== 'NOTARY') {
      throw new AppError('Only notaries can notarize documents', 403);
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        partyA: true,
        partyB: true,
        notary: true,
        signatures: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    if (document.notaryId != null && document.notaryId !== req.user.id) {
      throw new AppError('You are not assigned to notarize this document', 403);
    }

    if (document.status !== DocumentStatus.PENDING_NOTARY) {
      throw new AppError('Document is not ready for notarization', 400);
    }

    if (!document.partyASignedAt || !document.partyBSignedAt) {
      throw new AppError('Both parties must sign before notarization', 400);
    }

    // Create notary signature
    await prisma.signature.create({
      data: {
        documentId,
        userId: req.user.id,
        signatureType: validatedData.signatureType,
        signatureData: validatedData.signatureData,
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('user-agent') || 'unknown',
      },
    });

    // Update document (assign notary if was unassigned)
    const now = new Date();
    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        status: DocumentStatus.COMPLETED,
        notaryId: document.notaryId ?? req.user.id,
        notarizedAt: now,
        completedAt: now,
      },
      include: {
        partyA: true,
        partyB: true,
        notary: true,
        signatures: {
          include: {
            user: true,
          },
        },
      },
    });

    await createAuditLog({
      action: 'NOTARIZATION_COMPLETED',
      userId: req.user.id,
      documentId,
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('user-agent'),
      metadata: {
        verificationNotes: validatedData.verificationNotes,
        identityVerified: validatedData.identityVerified,
        signaturesVerified: validatedData.signaturesVerified,
        documentComplete: validatedData.documentComplete,
      },
    });

    // Generate PDF (async, don't wait)
    generatePDF(updatedDocument).catch(console.error);

    // Send completion emails
    if (document.partyA) {
      sendDocumentCompletedEmail(
        document.partyA.email,
        document.partyA.firstName,
        document.title
      ).catch(console.error);
    }

    if (document.partyB) {
      sendDocumentCompletedEmail(
        document.partyB.email,
        document.partyB.firstName,
        document.title
      ).catch(console.error);
    }

    res.json({
      success: true,
      message: 'Document notarized successfully',
      data: updatedDocument,
    });
  } catch (error) {
    throw error;
  }
};

export const getNotaryStats = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    if (req.user.role !== 'NOTARY') {
      throw new AppError('Only notaries can access this endpoint', 403);
    }

    const [pending, completed, total] = await Promise.all([
      prisma.document.count({
        where: {
          status: DocumentStatus.PENDING_NOTARY,
          OR: [
            { notaryId: req.user.id },
            { notaryId: null },
          ],
        },
      }),
      prisma.document.count({
        where: {
          notaryId: req.user.id,
          status: DocumentStatus.COMPLETED,
        },
      }),
      prisma.document.count({
        where: {
          OR: [
            { notaryId: req.user.id },
            { status: DocumentStatus.PENDING_NOTARY, notaryId: null },
          ],
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        pending,
        completed,
        total,
      },
    });
  } catch (error) {
    throw error;
  }
};
