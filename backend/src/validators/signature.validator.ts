import { z } from 'zod';
import { SignatureType } from '@prisma/client';

export const signatureSchema = z.object({
  signatureType: z.nativeEnum(SignatureType),
  signatureData: z.string().min(1, 'Signature data is required'),
});
