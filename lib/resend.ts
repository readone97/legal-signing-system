// lib/resend.ts
import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY!);

// Example template functions
export const sendReminder = async (to: string, docTitle: string) => {
  await resend.emails.send({
    from: 'Prenup Sign <no-reply@yourdomain.com>',
    to,
    subject: 'Signature Reminder',
    html: `<p>Please sign ${docTitle} soon.</p>`,
  });
};