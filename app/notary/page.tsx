// app/notary/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import NotaryChecklist from '@/components/NotaryChecklist';
import { Document } from '@prisma/client';

export default function NotaryDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated' || session?.user?.role !== 'NOTARY') router.push('/');
    if (status === 'authenticated') fetchPendingDocs();
  }, [status, router, session]);

  const fetchPendingDocs = async () => {
    try {
      const res = await axios.get('/api/notary/pending'); // Assume endpoint to list pending for notary
      setDocuments(res.data);
    } catch (err) {
      console.error('Failed to fetch pending documents');
    }
  };

  const handleSuccess = (docId: number) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-purple-800">Notary Dashboard</h1>
      <div className="space-y-8">
        {documents.map(doc => (
          <div key={doc.id} className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">{doc.title}</h2>
            <p>Status: {doc.status}</p>
            <NotaryChecklist documentId={doc.id} onSuccess={() => handleSuccess(doc.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}