// app/api/webhooks/docuseal/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { Resend } from 'resend';
import Pusher from 'pusher';
import winston from 'winston';
import { configureLogger } from '@/winston.config';
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
const resend = new Resend(process.env.RESEND_API_KEY!);

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

const WEBHOOK_SECRET = process.env.DOCUSEAL_WEBHOOK_SECRET;
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

export async function POST(req: NextRequest) {
  try {
    // 1. Get raw body (must be text for signature verification)
    const rawBody = await req.text();

    // 2. Get signature header
    const signatureHeader = req.headers.get('x-docuseal-signature');

    // 3. Improved signature verification with detailed feedback
    const verificationResult = verifyDocuSealSignature(rawBody, signatureHeader);

    if (!verificationResult.isValid) {
      // Log detailed info (without exposing secret)
      logger.warn('DocuSeal webhook signature verification failed', {
        reason: verificationResult.reason,
        receivedHeader: signatureHeader || '[missing]',
        requestIp: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown',
        path: req.nextUrl.pathname,
      });

      // Return structured error in development, minimal in production
      if (IS_DEVELOPMENT) {
        return NextResponse.json(
          {
            error: 'Webhook signature verification failed',
            reason: verificationResult.reason,
            receivedSignature: signatureHeader || null,
            expectedFormat: 'sha256=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            tip:
              verificationResult.reason.includes('missing')
                ? 'Check that DocuSeal is sending x-docuseal-signature header'
                : verificationResult.reason.includes('secret')
                ? 'DOCUSEAL_WEBHOOK_SECRET is not set in .env'
                : 'Secret mismatch – verify the secret in DocuSeal dashboard matches .env',
          },
          { status: 401 }
        );
      }

      // Production: minimal leak
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    // 4. Signature is valid → parse and process
    const payload = JSON.parse(rawBody);
    const { event, data } = payload;

    logger.info(`DocuSeal webhook received and verified`, { event, submissionId: data?.submission_id });

    // ... rest of your event handling remains the same ...
    switch (event) {
      case 'submission.signed':
        await handleSubmissionSigned(data);
        break;
      case 'submission.completed':
        await handleSubmissionCompleted(data);
        break;
      // ... other cases
      default:
        logger.info(`Unhandled DocuSeal event: ${event}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error('DocuSeal webhook processing failed', {
      error: error.message,
      stack: error.stack?.split('\n').slice(0, 5).join('\n'),
    });

    return NextResponse.json(
      { error: 'Internal server error during webhook processing' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Improved signature verification with detailed diagnostics
 */
function verifyDocuSealSignature(
  rawBody: string,
  signatureHeader: string | null
): { isValid: boolean; reason?: string } {
  // Case 1: Secret not configured
  if (!WEBHOOK_SECRET) {
    return {
      isValid: false,
      reason: 'DOCUSEAL_WEBHOOK_SECRET environment variable is not set',
    };
  }

  // Case 2: Header missing
  if (!signatureHeader) {
    return {
      isValid: false,
      reason: 'Missing x-docuseal-signature header',
    };
  }

  // Case 3: Invalid format (should be sha256=hex)
  if (!signatureHeader.startsWith('sha256=')) {
    return {
      isValid: false,
      reason: 'Invalid signature format – expected sha256= followed by hex digest',
    };
  }

  // Extract received digest
  const receivedDigest = signatureHeader.slice(7); // remove "sha256="

  // Compute expected digest
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const computedDigest = hmac.update(rawBody).digest('hex');

  // Constant-time comparison
  const isValid = crypto.timingSafeEqual(
    Buffer.from(computedDigest, 'hex'),
    Buffer.from(receivedDigest, 'hex')
  );

  if (!isValid) {
    return {
      isValid: false,
      reason: 'Signature mismatch – secret does not match',
    };
  }

  return { isValid: true };
}