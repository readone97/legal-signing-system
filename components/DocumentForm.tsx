// components/DocumentForm.tsx
'use client';

import { useForm, UseFormReturn } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  partyAName: z.string().min(2, 'Name required'),
  partyAAddress: z.string().min(5, 'Address required'),
  partyADOB: z.date().or(z.string().refine(date => !isNaN(Date.parse(date)), { message: 'Invalid date' })),
  partyBName: z.string().min(2, 'Name required'),
  partyBAddress: z.string().min(5, 'Address required'),
  partyBDOB: z.date().or(z.string().refine(date => !isNaN(Date.parse(date)), { message: 'Invalid date' })),
  asset1: z.string().optional(),
  asset2: z.string().optional(),
  asset3: z.string().optional(),
  asset4: z.string().optional(),
  asset5: z.string().optional(),
  debt1: z.string().optional(),
  debt2: z.string().optional(),
  financialObligations: z.string().optional(),
  spousalSupport: z.string().optional(),
  inheritanceClauses: z.string().optional(),
  // Add more if needed to reach 10+ (already >10)
});

type FormData = z.infer<typeof formSchema>;

interface Props {
  onSubmit: (data: FormData) => void;
  defaultValues?: Partial<FormData>;
}

export default function DocumentForm({ onSubmit, defaultValues }: Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Render form fields similar to create/page.tsx
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Inputs as in create/page.tsx */}
      <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded">
        Submit
      </button>
    </form>
  );
}