import nodemailer from 'nodemailer';
import { config } from '../config';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: config.email.user && config.email.pass ? {
    user: config.email.user,
    pass: config.email.pass,
  } : undefined,
});

export const sendWelcomeEmail = async (
  to: string,
  firstName: string
): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Legal Signing System! 🎉</h1>
        </div>
        <div class="content">
          <p>Hello ${firstName},</p>
          <p>Thank you for creating an account with Legal Signing System. We're excited to help you manage your legal document signing workflows with ease and security.</p>
          <p><strong>What you can do:</strong></p>
          <ul>
            <li>Create and manage legal documents</li>
            <li>Invite parties to review and sign</li>
            <li>Track document status in real-time</li>
            <li>Maintain complete audit trails</li>
          </ul>
          <a href="${config.frontendUrl}/dashboard" class="button">Go to Dashboard</a>
          <p style="margin-top: 30px; font-size: 14px; color: #666;">If you have any questions, please don't hesitate to reach out to our support team.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: config.email.from,
    to,
    subject: 'Welcome to Legal Signing System',
    html,
  });
};

export const sendDocumentInvitationEmail = async (
  to: string,
  recipientName: string,
  senderName: string,
  documentTitle: string,
  documentId: string
): Promise<void> => {
  const reviewUrl = `${config.frontendUrl}/documents/${documentId}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .document-info { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Document Ready for Your Review 📄</h1>
        </div>
        <div class="content">
          <p>Hello ${recipientName},</p>
          <p><strong>${senderName}</strong> has invited you to review and sign a document:</p>
          <div class="document-info">
            <h3 style="margin-top: 0;">${documentTitle}</h3>
            <p style="color: #666; margin-bottom: 0;">Please review the document carefully before signing.</p>
          </div>
          <p><strong>Next Steps:</strong></p>
          <ol>
            <li>Click the button below to review the document</li>
            <li>Read through all terms carefully</li>
            <li>Add your signature when ready</li>
          </ol>
          <a href="${reviewUrl}" class="button">Review Document</a>
          <p style="margin-top: 30px; font-size: 14px; color: #666;">This is an automated message from Legal Signing System.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: config.email.from,
    to,
    subject: `Document ready for review: ${documentTitle}`,
    html,
  });
};

export const sendDocumentReadyForNotaryEmail = async (
  to: string,
  notaryName: string,
  documentTitle: string,
  documentId: string
): Promise<void> => {
  const notarizeUrl = `${config.frontendUrl}/notary/documents/${documentId}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .document-info { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Document Ready for Notarization ⚖️</h1>
        </div>
        <div class="content">
          <p>Hello ${notaryName},</p>
          <p>A document is ready for your notarization:</p>
          <div class="document-info">
            <h3 style="margin-top: 0;">${documentTitle}</h3>
            <p style="color: #666; margin-bottom: 0;">Both parties have signed and the document is awaiting notarization.</p>
          </div>
          <p><strong>Notarization Checklist:</strong></p>
          <ul>
            <li>Verify identity of all signatories</li>
            <li>Ensure all signatures are present</li>
            <li>Review document completeness</li>
            <li>Apply notary seal</li>
          </ul>
          <a href="${notarizeUrl}" class="button">Begin Notarization</a>
          <p style="margin-top: 30px; font-size: 14px; color: #666;">This is an automated message from Legal Signing System.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: config.email.from,
    to,
    subject: `Document ready for notarization: ${documentTitle}`,
    html,
  });
};

export const sendDocumentCompletedEmail = async (
  to: string,
  recipientName: string,
  documentTitle: string
): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .success-box { background: #d1fae5; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Document Executed Successfully! ✅</h1>
        </div>
        <div class="content">
          <p>Hello ${recipientName},</p>
          <div class="success-box">
            <h2 style="color: #065f46; margin-top: 0;">🎉 Congratulations!</h2>
            <p style="color: #047857; margin-bottom: 0;"><strong>${documentTitle}</strong> has been fully executed and notarized.</p>
          </div>
          <p><strong>What this means:</strong></p>
          <ul>
            <li>All parties have signed the document</li>
            <li>The document has been notarized</li>
            <li>The document is legally binding</li>
            <li>A copy is available in your account</li>
          </ul>
          <a href="${config.frontendUrl}/dashboard" class="button">View Document</a>
          <p style="margin-top: 30px; font-size: 14px; color: #666;">Keep this email for your records. You can download the executed document from your dashboard at any time.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: config.email.from,
    to,
    subject: `Document executed: ${documentTitle}`,
    html,
  });
};

export const sendReminderEmail = async (
  to: string,
  recipientName: string,
  documentTitle: string,
  documentId: string
): Promise<void> => {
  const reviewUrl = `${config.frontendUrl}/documents/${documentId}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Reminder: Document Awaiting Signature ⏰</h1>
        </div>
        <div class="content">
          <p>Hello ${recipientName},</p>
          <p>This is a friendly reminder that the following document is still awaiting your signature:</p>
          <h3>${documentTitle}</h3>
          <p>Please review and sign the document at your earliest convenience.</p>
          <a href="${reviewUrl}" class="button">Review & Sign Now</a>
          <p style="margin-top: 30px; font-size: 14px; color: #666;">This is an automated reminder from Legal Signing System.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: config.email.from,
    to,
    subject: `Reminder: ${documentTitle} awaiting signature`,
    html,
  });
};
