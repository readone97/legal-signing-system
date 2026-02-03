// app/sign/[id]/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import SignaturePad from '@/components/SignaturePad';
import DocumentPreview from '@/components/DocumentPreview';

export default function SignDocument() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const sigRef = useRef<{ getSignature: () => string | undefined; clear: () => void }>(null);
  const [document, setDocument] = useState<any>(null);
  const [signingUrl, setSigningUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const fetchDocument = async () => {
    try {
      const res = await axios.get(`/api/documents/status/${id}`);
      setDocument(res.data);
      // Fetch DocuSeal signing URL if available
      // For simplicity, assume we embed custom sig or use DocuSeal iframe
    } catch (err) {
      console.error('Failed to load document');
    }
  };

  const handleSign = async () => {
    const signature = sigRef.current?.getSignature();
    if (!signature) return alert('Please provide signature');

    try {
      // Upload signature image
      const blob = await (await fetch(signature)).blob();
      const formData = new FormData();
      formData.append('file', blob, 'signature.png');
      formData.append('documentId', id as string);
      formData.append('purpose', 'signature');

      const uploadRes = await axios.post('/api/files/upload', formData);

      // Update DocuSeal or DB
      await axios.post(`/api/documents/sign/${id}`, { signatureUrl: uploadRes.data.url });

      alert('Signed successfully');
      router.push('/dashboard');
    } catch (err) {
      alert('Signing failed');
    }
  };

  if (!document) return <p>Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-purple-800">Sign Document: {document.title}</h1>
      <DocumentPreview data={document} /> {/* Preview filled doc */}

      <div className="mt-8">
        <h2 className="text-xl mb-4">Your Signature</h2>
        <SignaturePad ref={sigRef} />
        <button onClick={handleSign} className="mt-4 bg-blue-600 text-white py-2 px-4 rounded">
          Submit Signature
        </button>
      </div>
    </div>
  );
}