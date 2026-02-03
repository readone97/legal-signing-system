import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import z from 'zod';
import { RateLimiterMemory } from '@upstash/ratelimit'; // Correction: use the correct import
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

const schema = z.object({
  title: z.string().min(3),
  fields: z.array(z.object({
    name: z.string(),
    type: z.string().enum(['text', 'signature', 'checkbox', 'date']),
  })).min(10), // At least 10 fields
});

const ratelimit = new RateLimiterMemory({
  redis: undefined, // Assume Upstash config in env
  limit: 5,
  window: '1 m',
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'PARTY_A') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { success } = await ratelimit.limit(session.user.id.toString());
  if (!success) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

  try {
    const body = await req.json();
    const parsed = schema.parse(body);

    // Create in DocuSeal
    const docuRes = await axios.post(`${process.env.DOCUSEAL_API_URL}/templates`, {
      name: parsed.title,
      fields: parsed.fields,
    }, { headers: { Authorization: `Bearer ${process.env.DOCUSEAL_API_KEY}` } });

    const doc = await prisma.document.create({
      data: {
        title: parsed.title,
        status: 'DRAFT',
        docusealId: docuRes.data.id,
        creatorId: session.user.id,
      },
    });

    logger.info(`Document created: ${doc.id}`);

    return NextResponse.json(doc);
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}