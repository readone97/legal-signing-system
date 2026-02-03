'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { useState } from 'react';

const checklistSchema = z.object({
  idVerified: z.boolean(),
  addressVerified: z.boolean(),
  willingnessVerified: z.boolean(),
  notes: z.string().optional(),
  idProofUrl: z.string().url().optional(),
});

type ChecklistForm = z.infer<typeof checklistSchema>;

interface Props {
  documentId: number;
  onSuccess: () => void;
}

export default function NotaryChecklist({ documentId, onSuccess }: Props) {
  const [uploading, setUploading] = useState(false);
  const [idProofUrl, setIdProofUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChecklistForm>({
    resolver: zodResolver(checklistSchema),
    defaultValues: { idVerified: false, addressVerified: false, willingnessVerified: false },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentId', documentId.toString());
    formData.append('purpose', 'id-proof');

    try {
      const res = await axios.post('/api/files/upload', formData);
      setIdProofUrl(res.data.url);
    } catch (err) {
      alert('Failed to upload ID proof');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: ChecklistForm) => {
    try {
      await axios.post('/api/notary/verify', {
        ...data,
        documentId,
        idProofUrl: idProofUrl || undefined,
      });
      onSuccess();
      alert('Document notarized successfully');
    } catch (err) {
      alert('Notarization failed');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold text-purple-800">Notary Verification Checklist</h2>

      <div className="space-y-4">
        <label className="flex items-center">
          <input type="checkbox" {...register('idVerified')} className="mr-2" />
          Photo ID verified
        </label>

        <label className="flex items-center">
          <input type="checkbox" {...register('addressVerified')} className="mr-2" />
          Address matches records
        </label>

        <label className="flex items-center">
          <input type="checkbox" {...register('willingnessVerified')} className="mr-2" />
          Parties appear to sign willingly
        </label>

        <div>
          <label className="block text-sm font-medium mb-1">Upload ID Proof (optional but recommended)</label>
          <input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
          {uploading && <p className="text-blue-600 mt-1">Uploading...</p>}
          {idProofUrl && <p className="text-green-600 mt-1">ID proof uploaded</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Additional Notes</label>
          <textarea {...register('notes')} rows={3} className="w-full border rounded p-2" />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-purple-700 text-white py-3 rounded hover:bg-purple-800 disabled:opacity-50"
      >
        {isSubmitting ? 'Processing...' : 'Complete Notarization'}
      </button>
    </form>
  );
}