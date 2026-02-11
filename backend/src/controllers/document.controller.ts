import { Response } from 'express';
import { PrismaClient, DocumentStatus } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import { createAuditLog } from '../utils/audit';
import {
  sendDocumentInvitationEmail,
  sendDocumentReadyForNotaryEmail,
  // sendDocumentCompletedEmail,
} from '../services/email.service';
import {
  createDocumentSchema,
  updateDocumentSchema,
} from '../validators/document.validator';

const prisma = new PrismaClient();

export const createDocument = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = createDocumentSchema.parse(req.body);

    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const document = await prisma.document.create({
      data: {
        title: validatedData.title,
        documentType: validatedData.documentType,
        partyAId: req.user.id,
        templateFields: validatedData.templateFields,
        fieldValues: validatedData.fieldValues || {},
        status: DocumentStatus.DRAFT,
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
      },
    });

    await createAuditLog({
      action: 'DOCUMENT_CREATED',
      userId: req.user.id,
      documentId: document.id,
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('user-agent'),
    });

    res.status(201).json({
      success: true,
      message: 'Document created successfully',
      data: document,
    });
  } catch (error) {
    throw error;
  }
};

export const getDocuments = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { status, page = 1, limit = 10 } = req.query;

    const where: any = {
      OR: [
        { partyAId: req.user.id },
        { partyBId: req.user.id },
        { notaryId: req.user.id },
      ],
    };

    if (status) {
      where.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
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
          notary: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              notaryLicense: true,
            },
          },
        },
      }),
      prisma.document.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        documents,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    throw error;
  }
};

export const getDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const document = await prisma.document.findUnique({
      where: { id },
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
        notary: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            notaryLicense: true,
            notaryState: true,
          },
        },
        signatures: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        revisions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    // Check access
    const hasAccess =
      document.partyAId === req.user.id ||
      document.partyBId === req.user.id ||
      document.notaryId === req.user.id;

    if (!hasAccess) {
      throw new AppError('Access denied', 403);
    }

    res.json({
      success: true,
      data: document,
    });
  } catch (error) {
    throw error;
  }
};

export const updateDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateDocumentSchema.parse(req.body);

    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    if (document.partyAId !== req.user.id) {
      throw new AppError('Only the document creator can update it', 403);
    }

    if (document.status !== DocumentStatus.DRAFT) {
      throw new AppError('Cannot update document after it has been sent', 400);
    }

    const updatedDocument = await prisma.document.update({
      where: { id },
      data: {
        title: validatedData.title,
        fieldValues: validatedData.fieldValues,
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
      },
    });

    await createAuditLog({
      action: 'DOCUMENT_UPDATED',
      userId: req.user.id,
      documentId: id,
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      message: 'Document updated successfully',
      data: updatedDocument,
    });
  } catch (error) {
    throw error;
  }
};

export const sendToPartyB = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { partyBEmail } = req.body;

    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        partyA: true,
      },
    });

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    if (document.partyAId !== req.user.id) {
      throw new AppError('Only the document creator can send it', 403);
    }

    if (document.status !== DocumentStatus.DRAFT) {
      throw new AppError('Document has already been sent', 400);
    }

    // Find or validate Party B
    const partyB = await prisma.user.findUnique({
      where: { email: partyBEmail },
    });

    if (!partyB) {
      throw new AppError('Party B user not found', 404);
    }

    const updatedDocument = await prisma.document.update({
      where: { id },
      data: {
        partyBId: partyB.id,
        status: DocumentStatus.PENDING_PARTY_B,
      },
      include: {
        partyA: true,
        partyB: true,
      },
    });

    await createAuditLog({
      action: 'DOCUMENT_SENT',
      userId: req.user.id,
      documentId: id,
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('user-agent'),
      metadata: { recipient: partyB.email },
    });

    // Send email notification
    sendDocumentInvitationEmail(
      partyB.email,
      partyB.firstName,
      document.partyA.firstName + ' ' + document.partyA.lastName,
      document.title,
      id
    ).catch(console.error);

    res.json({
      success: true,
      message: 'Document sent to Party B successfully',
      data: updatedDocument,
    });
  } catch (error) {
    throw error;
  }
};

export const sendToNotary = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { notaryId } = req.body;

    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        partyA: true,
        partyB: true,
      },
    });

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    // Only Party A or Party B can send to notary
    if (document.partyAId !== req.user.id && document.partyBId !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    if (document.status !== DocumentStatus.PENDING_PARTY_B) {
      throw new AppError('Both parties must sign before sending to notary', 400);
    }

    if (!document.partyASignedAt || !document.partyBSignedAt) {
      throw new AppError('Both parties must sign the document first', 400);
    }

    const notary = await prisma.user.findUnique({
      where: { id: notaryId },
    });

    if (!notary || notary.role !== 'NOTARY') {
      throw new AppError('Invalid notary selected', 404);
    }

    const updatedDocument = await prisma.document.update({
      where: { id },
      data: {
        notaryId: notary.id,
        status: DocumentStatus.PENDING_NOTARY,
      },
      include: {
        partyA: true,
        partyB: true,
        notary: true,
      },
    });

    await createAuditLog({
      action: 'DOCUMENT_SENT',
      userId: req.user.id,
      documentId: id,
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('user-agent'),
      metadata: { recipient: notary.email, recipientRole: 'NOTARY' },
    });

    // Send email notification
    sendDocumentReadyForNotaryEmail(
      notary.email,
      notary.firstName,
      document.title,
      id
    ).catch(console.error);

    res.json({
      success: true,
      message: 'Document sent to notary successfully',
      data: updatedDocument,
    });
  } catch (error) {
    throw error;
  }
};

export const deleteDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    if (document.partyAId !== req.user.id) {
      throw new AppError('Only the document creator can delete it', 403);
    }

    if (document.status !== DocumentStatus.DRAFT) {
      throw new AppError('Cannot delete document after it has been sent', 400);
    }

    await prisma.document.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    throw error;
  }
};
