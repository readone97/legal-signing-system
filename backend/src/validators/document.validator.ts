import { z } from 'zod';

export const createDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  documentType: z.string().default('PRENUPTIAL_AGREEMENT'),
  templateFields: z.any(),
  fieldValues: z.any().optional(),
});

export const updateDocumentSchema = z.object({
  title: z.string().min(1).optional(),
  fieldValues: z.any().optional(),
});
