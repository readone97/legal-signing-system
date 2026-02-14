import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

/**
 * Generates a notarization certificate for a completed document.
 * Certificate includes document id, parties, notary, and timestamp in ISO 8601.
 * Saves to uploads/certificates and returns the relative URL.
 */
function generateCertificateContent(document: any): string {
  const completedAt = document.completedAt
    ? new Date(document.completedAt).toISOString()
    : new Date().toISOString();
  const partyAName = document.partyA
    ? `${document.partyA.firstName} ${document.partyA.lastName}`
    : 'Party A';
  const partyBName = document.partyB
    ? `${document.partyB.firstName} ${document.partyB.lastName}`
    : 'Party B';
  const notaryName = document.notary
    ? `${document.notary.firstName} ${document.notary.lastName}`
    : 'Notary';
  const notaryLicense = document.notary?.notaryLicense || 'N/A';
  const notaryState = document.notary?.notaryState || 'N/A';

  return `
NOTARIZATION CERTIFICATE
Document ID: ${document.id}
Title: ${document.title}

This certifies that on ${completedAt} (ISO 8601), the following parties executed this document:

Party A (Initiator): ${partyAName}
Party B (Counter-signer): ${partyBName}

The document was notarized by:
Notary: ${notaryName}
License: ${notaryLicense}
State: ${notaryState}

This certificate is generated as a digital record of the notarization.
  `.trim();
}

/**
 * Generates PDF path placeholder and certificate file for completed documents.
 * In production, use Puppeteer to generate actual PDFs; here we write a certificate text file
 * and update the document with certificateUrl.
 */
export const generatePDF = async (document: any): Promise<string> => {
  const pdfPath = `/pdfs/${document.id}.pdf`;
  const certDir = path.join(process.cwd(), 'uploads', 'certificates');
  const certFileName = `${document.id}-certificate.txt`;
  const certPath = path.join(certDir, certFileName);

  try {
    if (!fs.existsSync(path.join(process.cwd(), 'uploads'))) {
      fs.mkdirSync(path.join(process.cwd(), 'uploads'), { recursive: true });
    }
    if (!fs.existsSync(certDir)) {
      fs.mkdirSync(certDir, { recursive: true });
    }

    const certContent = generateCertificateContent(document);
    fs.writeFileSync(certPath, certContent, 'utf8');

    const certificateUrl = `/uploads/certificates/${certFileName}`;
    await prisma.document.update({
      where: { id: document.id },
      data: { certificateUrl, pdfUrl: pdfPath },
    });
  } catch (err) {
    console.error('PDF/certificate generation error:', err);
  }

  return pdfPath;
};
