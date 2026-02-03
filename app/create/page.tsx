// app/create/page.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import DocumentPreview from '@/components/DocumentPreview';
import { Button } from '@/components/ui/button'; // Assume Shadcn UI or similar for better UX
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/use-toast'; // For notifications

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

export default function CreateDocument() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [previewData, setPreviewData] = useState<FormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  if (status === 'loading') return <p>Loading...</p>;
  if (status === 'unauthenticated' || session?.user?.role !== 'PARTY_A') {
    router.push('/dashboard');
    return null;
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // Map form data to DocuSeal fields
      const fields = [
        { name: 'partyAName', type: 'text' },
        { name: 'partyAAddress', type: 'text' },
        { name: 'partyADOB', type: 'date' },
        { name: 'partyBName', type: 'text' },
        { name: 'partyBAddress', type: 'text' },
        { name: 'partyBDOB', type: 'date' },
        { name: 'asset1', type: 'text' },
        { name: 'asset2', type: 'text' },
        { name: 'asset3', type: 'text' },
        { name: 'asset4', type: 'text' },
        { name: 'asset5', type: 'text' },
        { name: 'debt1', type: 'text' },
        { name: 'debt2', type: 'text' },
        { name: 'financialObligations', type: 'text' },
        { name: 'spousalSupport', type: 'text' },
        { name: 'inheritanceClauses', type: 'text' },
        { name: 'partyASignature', type: 'signature' },
        { name: 'partyBSignature', type: 'signature' },
        { name: 'notarySeal', type: 'signature' },
      ];

      const res = await axios.post('/api/documents/create', {
        title: data.title,
        fields,
      });

      toast({ title: 'Success', description: 'Document created!' });
      router.push(`/sign/${res.data.id}`);
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.error || 'Failed to create document', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = () => {
    const formData = watch();
    setPreviewData(formData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-purple-800">Create Prenuptial Agreement</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Label htmlFor="title">Document Title</Label>
          <Input id="title" {...register('title')} placeholder="My Prenup Agreement" />
          {errors.title && <p className="text-red-600 text-sm">{errors.title.message}</p>}

          <h2 className="text-lg font-semibold mt-6">Party A Information</h2>
          <Label htmlFor="partyAName">Full Name</Label>
          <Input id="partyAName" {...register('partyAName')} placeholder="John Doe" />
          {errors.partyAName && <p className="text-red-600 text-sm">{errors.partyAName.message}</p>}

          <Label htmlFor="partyAAddress">Address</Label>
          <Input id="partyAAddress" {...register('partyAAddress')} placeholder="123 Main St, City, State" />
          {errors.partyAAddress && <p className="text-red-600 text-sm">{errors.partyAAddress.message}</p>}

          <Label htmlFor="partyADOB">Date of Birth</Label>
          <Input id="partyADOB" type="date" {...register('partyADOB')} />
          {errors.partyADOB && <p className="text-red-600 text-sm">{errors.partyADOB.message}</p>}

          <h2 className="text-lg font-semibold mt-6">Party B Information</h2>
          <Label htmlFor="partyBName">Full Name</Label>
          <Input id="partyBName" {...register('partyBName')} placeholder="Jane Smith" />
          {errors.partyBName && <p className="text-red-600 text-sm">{errors.partyBName.message}</p>}

          <Label htmlFor="partyBAddress">Address</Label>
          <Input id="partyBAddress" {...register('partyBAddress')} placeholder="456 Elm St, City, State" />
          {errors.partyBAddress && <p className="text-red-600 text-sm">{errors.partyBAddress.message}</p>}

          <Label htmlFor="partyBDOB">Date of Birth</Label>
          <Input id="partyBDOB" type="date" {...register('partyBDOB')} />
          {errors.partyBDOB && <p className="text-red-600 text-sm">{errors.partyBDOB.message}</p>}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Asset Declarations (up to 5)</h2>
          <Input {...register('asset1')} placeholder="Asset 1 (e.g., Real Estate)" />
          <Input {...register('asset2')} placeholder="Asset 2 (e.g., Investments)" />
          <Input {...register('asset3')} placeholder="Asset 3 (e.g., Vehicles)" />
          <Input {...register('asset4')} placeholder="Asset 4" />
          <Input {...register('asset5')} placeholder="Asset 5" />

          <h2 className="text-lg font-semibold mt-6">Debts</h2>
          <Input {...register('debt1')} placeholder="Debt 1 (e.g., Loans)" />
          <Input {...register('debt2')} placeholder="Debt 2" />

          <h2 className="text-lg font-semibold mt-6">Financial Sections</h2>
          <Label htmlFor="financialObligations">Financial Obligations</Label>
          <Textarea id="financialObligations" {...register('financialObligations')} placeholder="Details on income division, expenses..." />

          <Label htmlFor="spousalSupport">Spousal Support Clauses</Label>
          <Textarea id="spousalSupport" {...register('spousalSupport')} placeholder="Waiver or conditions..." />

          <Label htmlFor="inheritanceClauses">Inheritance Clauses</Label>
          <Textarea id="inheritanceClauses" {...register('inheritanceClauses')} placeholder="Estate rights, etc." />
        </div>

        <div className="col-span-1 md:col-span-2 flex justify-end space-x-4 mt-6">
          <Button type="button" variant="outline" onClick={handlePreview}>Preview Document</Button>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create & Proceed to Sign'}</Button>
        </div>
      </form>

      {previewData && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Document Preview</h2>
          <DocumentPreview data={previewData} />
        </div>
      )}
    </div>
  );
}