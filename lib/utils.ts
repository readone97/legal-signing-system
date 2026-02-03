// lib/utils.ts
import { z } from 'zod';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

// Schemas (e.g., for shared validation)
export const userSchema = z.object({
  email: z.string().email(),
  role: z.enum(['PARTY_A', 'PARTY_B', 'NOTARY']),
});

export const sanitizeInput = (input: string) => purify.sanitize(input);