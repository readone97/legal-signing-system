// app/api/documents/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Pusher from 'pusher';
import { PrismaClient } from '@prisma/client';
import winston from 'winston';
import { configureLogger } from '../../../../../winston.config';

const prisma = new PrismaClient();
const logger = configureLogger();
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Verify webhook signature from DocuSeal (implement based on DocuSeal docs)
    // For example: if (!verifySignature(body, req.headers.get('x-docuseal-signature'))) return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });

    const { event, data } = body; // Assuming DocuSeal webhook format { event: 'signed', data: { submission_id, submitter_id } }

    if (event === 'signed') {
      // Map DocuSeal submission_id to our document
      const document = await prisma.document.findFirst({
        where: { docusealId: data.submission_id },
      });

      if (!document) {
        logger.warn(`Webhook for unknown document: ${data.submission_id}`);
        return NextResponse.json({ success: false });
      }

      // Update status based on who signed
      let newStatus = document.status;
      if (data.submitter_order === 1) { // Party A (initiator)
        newStatus = 'PENDING_PARTY_B';
      } else if (data.submitter_order === 2) { // Party B
        newStatus = 'PENDING_NOTARY';
      } else if (data.submitter_order === 3) { // Notary
        newStatus = 'COMPLETED';
      }

      await prisma.document.update({
        where: { id: document.id },
        data: { status: newStatus },
      });

      await prisma.auditLog.create({
        data: {
          documentId: document.id,
          action: 'SIGNED',
          details: `Signed by submitter ${data.submitter_id}`,
          timestamp: new Date(data.signed_at), // ISO 8601 from webhook
          ip: data.ip_address,
        },
      });

      // Trigger real-time update
      await pusher.trigger(`document-${document.id}`, 'status-update', { status: newStatus });

      logger.info(`Webhook processed: Document ${document.id} updated to ${newStatus}`);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    logger.error('Webhook failed', { error: err.message });
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}