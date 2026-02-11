export const generatePDF = async (document: any): Promise<string> => {
  // Placeholder for PDF generation
  // In production, this would use Puppeteer or similar to generate PDFs
  console.log('PDF generation for document:', document.id);
  return `/pdfs/${document.id}.pdf`;
};
