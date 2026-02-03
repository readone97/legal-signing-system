// app/api/documents/status/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import winston from 'winston';
import { configureLogger } from '../../../../../winston.config';


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

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const documentId = parseInt(params.id, 10);
    if (isNaN(documentId)) {
      return NextResponse.json({ error: 'Invalid document ID' }, { status: 400 });
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        signatures: true,
        auditLogs: true,
        creator: { select: { email: true } },
        partyB: { select: { email: true } },
        notary: { select: { email: true } },
      },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Check if user is involved
    if (
      document.creatorId !== session.user.id &&
      document.partyBId !== session.user.id &&
      document.notaryId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    logger.info(`Status requested for document ${documentId} by user ${session.user.id}`);

    return NextResponse.json(document);
  } catch (err: any) {
    logger.error('Status fetch failed', { error: err.message });
    return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}