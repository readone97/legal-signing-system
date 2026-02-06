// lib/utils.ts
import { z } from 'zod';
import createDOMPurify from 'isomorphic-dompurify';
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

// createDOMPurify works in both browser and Node (uses jsdom on Node)
// pass browser window if available to avoid extra server setup
const purify = createDOMPurify(typeof window !== 'undefined' ? (window as any) : undefined);

// Schemas (e.g., for shared validation)
export const userSchema = z.object({
  email: z.string().email(),
  role: z.enum(['PARTY_A', 'PARTY_B', 'NOTARY']),
});

export const sanitizeInput = (input: string) => purify.sanitize(input) as string;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
