import { Response } from 'express';
import { PrismaClient, DocumentStatus } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import { createAuditLog } from '../utils/audit';
import { signatureSchema } from '../validators/signature.validator';

const prisma = new PrismaClient();

export const addSignature = async (req: AuthRequest, res: Response) => {
  try {
    const { documentId } = req.params;
    const validatedData = signatureSchema.parse(req.body);

    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        partyA: true,
        partyB: true,
      },
    });

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    // Check if user is authorized to sign
    const isPartyA = document.partyAId === req.user.id;
    const isPartyB = document.partyBId === req.user.id;

    if (!isPartyA && !isPartyB) {
      throw new AppError('You are not authorized to sign this document', 403);
    }

    // Check if already signed
    const existingSignature = await prisma.signature.findFirst({
      where: {
        documentId,
        userId: req.user.id,
      },
    });

    if (existingSignature) {
      throw new AppError('You have already signed this document', 400);
    }

    // Create signature
    const signature = await prisma.signature.create({
      data: {
        documentId,
        userId: req.user.id,
        signatureType: validatedData.signatureType,
        signatureData: validatedData.signatureData,
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('user-agent') || 'unknown',
      },
    });

    // Update document with signature timestamp
    const updateData: any = {};
    if (isPartyA) {
      updateData.partyASignedAt = new Date();
    } else if (isPartyB) {
      updateData.partyBSignedAt = new Date();
    }

    // If both parties have signed, update status
    const bothSigned =
      (isPartyA && document.partyBSignedAt) ||
      (isPartyB && document.partyASignedAt);

    if (bothSigned) {
      updateData.status = DocumentStatus.PENDING_NOTARY;
    }

    await prisma.document.update({
      where: { id: documentId },
      data: updateData,
    });

    await createAuditLog({
      action: 'SIGNATURE_ADDED',
      userId: req.user.id,
      documentId,
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('user-agent'),
      metadata: {
        signatureType: validatedData.signatureType,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Signature added successfully',
      data: signature,
    });
  } catch (error) {
    throw error;
  }
};

export const getDocumentSignatures = async (req: AuthRequest, res: Response) => {
  try {
    const { documentId } = req.params;

    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId },
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

    const signatures = await prisma.signature.findMany({
      where: { documentId },
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
    });

    res.json({
      success: true,
      data: signatures,
    });
  } catch (error) {
    throw error;
  }
};
