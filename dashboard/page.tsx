// app/dashboard/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Pusher from 'pusher-js';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Shadcn UI
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton'; // For loading
import { useToast } from '@/components/ui/use-toast';

interface Document {
  id: number;
  title: string;
  status: 'DRAFT' | 'PENDING_PARTY_B' | 'PENDING_NOTARY' | 'COMPLETED';
  version: number;
  // Add more if needed
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/');
    if (status === 'authenticated') fetchDocuments();
  }, [status, router]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/documents'); // Assume /api/documents lists user's docs
      setDocuments(res.data);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to load documents', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!documents.length) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const subscriptions = documents.map(doc => {
      const channel = pusher.subscribe(`document-${doc.id}`);
      channel.bind('status-update', (data: { status: Document['status'] }) => {
        setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, status: data.status } : d));
        toast({ title: 'Update', description: `Document "${doc.title}" status changed to ${data.status}` });
      });
      return channel;
    });

    return () => {
      subscriptions.forEach(channel => channel.unsubscribe());
    };
  }, [documents]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-purple-800">Your Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map(doc => (
          <Card key={doc.id}>
            <CardHeader>
              <CardTitle>{doc.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2">Status: <Badge variant={doc.status === 'COMPLETED' ? 'success' : 'secondary'}>{doc.status}</Badge></p>
              <p className="mb-4">Version: {doc.version}</p>
              <Button onClick={() => router.push(`/sign/${doc.id}`)}>View / Sign</Button>
            </CardContent>
          </Card>
        ))}
      </div>
      {documents.length === 0 && <p className="text-center mt-8 text-gray-600">No documents yet. Create one!</p>}
      {session?.user?.role === 'PARTY_A' && (
        <Button onClick={() => router.push('/create')} className="mt-8 bg-purple-700 hover:bg-purple-800">
          Create New Document
        </Button>
      )}
      {session?.user?.role === 'NOTARY' && (
        <Button onClick={() => router.push('/notary')} className="mt-8 bg-purple-700 hover:bg-purple-800">
          View Pending Notarizations
        </Button>
      )}
    </div>
  );
}