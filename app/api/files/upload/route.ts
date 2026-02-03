import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
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
const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const logger = configureLogger();

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const documentId = formData.get('documentId') as string | null;
    const purpose = formData.get('purpose') as 'signature' | 'id-proof' | null;

    if (!file || !documentId || !purpose) {
      return NextResponse.json({ error: 'Missing file, documentId or purpose' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only PNG, JPG, JPEG allowed.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large. Max 10MB.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split('.').pop() || 'png';
    const key = `${session.user.id}/${documentId}/${purpose}/${randomUUID()}.${fileExt}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        ACL: 'private',
      })
    );

    const url = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    logger.info(`File uploaded: ${key} for user ${session.user.id}`);

    return NextResponse.json({ success: true, url });
  } catch (err: any) {
    logger.error('File upload failed', { error: err.message });
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}