import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import winston from 'winston';
import { configureLogger } from '../../../../winston.config';


/**
 * @swagger
 * /api/documents/create:
 *   post:
 *     summary: Create a new prenuptial agreement document
 *     description: Creates a document template in DocuSeal and stores metadata. Requires Party A role.
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - fields
 *             properties:
 *               title:
 *                 type: string
 *                 example: "My Prenup 2026"
 *               fields:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name: { type: string }
 *                     type: { type: string, enum: [text, signature, date] }
 *     responses:
 *       200:
 *         description: Document created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: integer }
 *                 title: { type: string }
 *                 status: { type: string }
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
const prisma = new PrismaClient();
const logger = configureLogger();

const verifySchema = z.object({
  documentId: z.number().int().positive(),
  idVerified: z.boolean(),
  addressVerified: z.boolean(),
  willingnessVerified: z.boolean(),
  notes: z.string().optional(),
  idProofUrl: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'NOTARY') {
    return NextResponse.json({ error: 'Only notaries can verify documents' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { documentId, idVerified, addressVerified, willingnessVerified, notes, idProofUrl } = verifySchema.parse(body);

    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document || document.notaryId !== session.user.id) {
      return NextResponse.json({ error: 'Document not found or not assigned to you' }, { status: 403 });
    }

    if (!idVerified || !addressVerified || !willingnessVerified) {
      return NextResponse.json({ error: 'All verification steps must be completed' }, { status: 400 });
    }

    // Finalize notarization – in real system you might call DocuSeal to apply notary seal field
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'COMPLETED' },
    });

    await prisma.auditLog.create({
      data: {
        documentId,
        action: 'NOTARIZED',
        details: notes || 'Notarization completed successfully',
        ip: req.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    logger.info(`Document ${documentId} notarized by notary ${session.user.id}`);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    logger.error('Notary verification failed', { error: err.message });
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}