import { z } from 'zod';
import { SignatureType } from '@prisma/client';

export const notarizeSchema = z.object({
  signatureType: z.nativeEnum(SignatureType),
  signatureData: z.string().min(1, 'Signature data is required'),
  verificationNotes: z.string().optional(),
  identityVerified: z.boolean().optional(),
  signaturesVerified: z.boolean().optional(),
  documentComplete: z.boolean().optional(),
});
