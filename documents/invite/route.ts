import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { Resend } from 'resend';
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
const resend = new Resend(process.env.RESEND_API_KEY!);
const logger = configureLogger();

const inviteSchema = z.object({
  documentId: z.number().int().positive(),
  inviteeEmail: z.string().email(),
  role: z.enum(['PARTY_B', 'NOTARY']),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'PARTY_A') {
    return NextResponse.json({ error: 'Unauthorized – only Party A can invite' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { documentId, inviteeEmail, role } = inviteSchema.parse(body);

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { creator: true },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (document.creatorId !== session.user.id) {
      return NextResponse.json({ error: 'You are not the creator of this document' }, { status: 403 });
    }

    // Determine order: Party B = 2, Notary = 3 (Party A is assumed to have signed already)
    const submitterOrder = role === 'PARTY_B' ? 2 : 3;

    // Create submission in DocuSeal
    const submissionRes = await axios.post(
      `${process.env.DOCUSEAL_API_URL}/submissions`,
      {
        template_id: document.docusealId,
        submitters: [
          {
            email: inviteeEmail,
            name: inviteeEmail.split('@')[0],
            order: submitterOrder,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DOCUSEAL_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const signingUrl = submissionRes.data.submitters[0].signing_url;

    // Update document in DB
    const updateData =
      role === 'PARTY_B'
        ? { partyBId: (await prisma.user.findUnique({ where: { email: inviteeEmail } }))?.id, status: 'PENDING_PARTY_B' }
        : { notaryId: (await prisma.user.findUnique({ where: { email: inviteeEmail } }))?.id, status: 'PENDING_NOTARY' };

    await prisma.document.update({
      where: { id: documentId },
      data: updateData,
    });

    // Send email
    await resend.emails.send({
      from: 'Prenup Sign <no-reply@yourdomain.com>',
      to: inviteeEmail,
      subject: role === 'PARTY_B' ? 'Please Review & Sign the Prenuptial Agreement' : 'Notarization Request – Document Ready',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hello,</h2>
          <p>You have been invited to ${role === 'PARTY_B' ? 'review and sign' : 'notarize'} a prenuptial agreement.</p>
          <p>Document: <strong>${document.title}</strong></p>
          <p>Prepared by: ${document.creator.email}</p>
          <p style="margin: 30px 0;">
            <a href="${signingUrl}"
               style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              ${role === 'PARTY_B' ? 'Review & Sign Now' : 'Notarize Document'}
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">
            This link is secure and will expire in 7 days. Do not share it.
          </p>
          <p>Best regards,<br/>Prenup Sign Team</p>
        </div>
      `,
    });

    logger.info(`Invitation sent to ${inviteeEmail} for document ${documentId} as ${role}`);

    return NextResponse.json({ success: true, signingUrl });
  } catch (err: any) {
    logger.error('Invite failed', { error: err.message, stack: err.stack });
    return NextResponse.json(
      { error: err instanceof z.ZodError ? 'Invalid input' : 'Failed to send invitation' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}