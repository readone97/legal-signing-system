import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import SignatureCanvas from 'react-signature-canvas';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import DocuSealEmbed from '../components/DocuSealEmbed';
import { Document, DocumentStatus, SignatureType } from '../types/types';

const DocumentView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSignModal, setShowSignModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [signatureType, setSignatureType] = useState<SignatureType>(SignatureType.DRAW);
  const [typedSignature, setTypedSignature] = useState('');
  const [partyBEmail, setPartyBEmail] = useState('');
  const [notaries, setNotaries] = useState<any[]>([]);
  const [selectedNotary, setSelectedNotary] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [docusealEmbedUrl, setDocusealEmbedUrl] = useState<string | null>(null);
  const [docusealLoading, setDocusealLoading] = useState(false);
  const [creatingDocuseal, setCreatingDocuseal] = useState(false);
  
  const sigCanvas = useRef<SignatureCanvas>(null);

  useEffect(() => {
    loadDocument();
    loadNotaries();
  }, [id]);

  useEffect(() => {
    if (!document || !user || !document.docusealSubmissionId) {
      setDocusealEmbedUrl(null);
      return;
    }
    const isSigner =
      document.partyAId === user.id ||
      document.partyBId === user.id ||
      document.notaryId === user.id;
    if (!isSigner) return;
    loadDocusealEmbed();
  }, [document?.id, document?.docusealSubmissionId, user?.id]);

  const loadDocusealEmbed = async () => {
    if (!id) return;
    setDocusealLoading(true);
    try {
      const res = await api.get(`/documents/${id}/docuseal/embed`);
      setDocusealEmbedUrl(res.data.data.embedUrl || res.data.data.embedSrc);
    } catch {
      setDocusealEmbedUrl(null);
    } finally {
      setDocusealLoading(false);
    }
  };

  const handleCreateDocusealSubmission = async () => {
    if (!id) return;
    setCreatingDocuseal(true);
    try {
      await api.post(`/documents/${id}/docuseal/create-submission`, { sendEmail: true });
      toast.success('DocuSeal signing request created');
      await loadDocument();
      await loadDocusealEmbed();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create DocuSeal submission');
    } finally {
      setCreatingDocuseal(false);
    }
  };

  const handleDocusealComplete = () => {
    toast.success('Document signed via DocuSeal');
    loadDocument();
    setDocusealEmbedUrl(null);
  };

  const handleDownloadPdf = async () => {
    if (!id) return;
    try {
      const res = await api.get(`/documents/${id}/download`, { responseType: 'blob' });
      const disposition = res.headers['content-disposition'];
      const match = disposition?.match(/filename="?([^";\n]+)"?/);
      const filename = match ? match[1].trim() : `document-${id}.txt`;
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.setAttribute('download', filename);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Download started');
    } catch (err: any) {
      let message = 'Failed to download';
      const data = err.response?.data;
      if (data instanceof Blob) {
        try {
          const text = await data.text();
          const json = text ? JSON.parse(text) : {};
          if (json.message) message = json.message;
        } catch {
          // keep default message
        }
      } else if (data?.message) {
        message = data.message;
      }
      toast.error(message);
    }
  };

  const handleDownloadSignedDocuseal = async () => {
    if (!id) return;
    try {
      const res = await api.get(`/documents/${id}/docuseal/signed-documents`);
      const docs = res.data?.data?.documents || [];
      if (docs.length > 0 && docs[0].url) {
        window.open(docs[0].url, '_blank');
      } else {
        toast.info('No signed documents available yet.');
      }
    } catch {
      toast.error('Failed to get signed documents');
    }
  };

  const loadDocument = async () => {
    try {
      const response = await api.get(`/documents/${id}`);
      setDocument(response.data.data);
    } catch (error: any) {
      toast.error('Failed to load document');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadNotaries = async () => {
    try {
      const response = await api.get('/users/notaries');
      setNotaries(response.data.data);
    } catch (error) {
      console.error('Failed to load notaries');
    }
  };

  const handleSign = async () => {
    if (!document) return;

    let signatureData = '';

    if (signatureType === SignatureType.DRAW) {
      if (sigCanvas.current?.isEmpty()) {
        toast.error('Please draw your signature');
        return;
      }
      signatureData = sigCanvas.current?.toDataURL() || '';
    } else if (signatureType === SignatureType.TYPE) {
      if (!typedSignature.trim()) {
        toast.error('Please type your signature');
        return;
      }
      // Create a canvas with typed text
      const canvas = window.document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = '36px "Playfair Display", serif';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(typedSignature, canvas.width / 2, canvas.height / 2);
      }
      signatureData = canvas.toDataURL();
    }

    setSubmitting(true);
    try {
      await api.post(`/signatures/${document.id}`, {
        signatureType,
        signatureData,
      });
      
      toast.success('Document signed successfully! ✍️');
      setShowSignModal(false);
      loadDocument();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to sign document');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendToPartyB = async () => {
    if (!partyBEmail.trim()) {
      toast.error('Please enter Party B email address');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/documents/${id}/send-to-party-b`, { partyBEmail });
      toast.success('Document sent to Party B! 📧');
      setShowSendModal(false);
      loadDocument();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send document');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendToNotary = async () => {
    if (!selectedNotary) {
      toast.error('Please select a notary');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/documents/${id}/send-to-notary`, { notaryId: selectedNotary });
      toast.success('Document sent to notary! ⚖️');
      setShowSendModal(false);
      loadDocument();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send to notary');
    } finally {
      setSubmitting(false);
    }
  };

  const clearSignature = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
    }
    setTypedSignature('');
  };

  const getStatusBadge = (status: DocumentStatus) => {
    const styles = {
      [DocumentStatus.DRAFT]: 'bg-gray-100 text-gray-800',
      [DocumentStatus.PENDING_PARTY_B]: 'bg-yellow-100 text-yellow-800',
      [DocumentStatus.PENDING_NOTARY]: 'bg-blue-100 text-blue-800',
      [DocumentStatus.COMPLETED]: 'bg-green-100 text-green-800',
      [DocumentStatus.CANCELLED]: 'bg-red-100 text-red-800',
    };

    const labels = {
      [DocumentStatus.DRAFT]: 'Draft',
      [DocumentStatus.PENDING_PARTY_B]: 'Pending Party B',
      [DocumentStatus.PENDING_NOTARY]: 'Pending Notary',
      [DocumentStatus.COMPLETED]: 'Completed',
      [DocumentStatus.CANCELLED]: 'Cancelled',
    };

    return (
      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const canSign = () => {
    if (!document || !user) return false;
    
    const isPartyA = document.partyAId === user.id;
    const isPartyB = document.partyBId === user.id;
    
    if (isPartyA && !document.partyASignedAt && document.status === DocumentStatus.DRAFT) {
      return true;
    }
    
    if (isPartyB && !document.partyBSignedAt && document.status === DocumentStatus.PENDING_PARTY_B) {
      return true;
    }
    
    return false;
  };

  const canSendToPartyB = () => {
    return (
      document &&
      user &&
      document.partyAId === user.id &&
      document.status === DocumentStatus.DRAFT &&
      document.partyASignedAt
    );
  };

  const canSendToNotary = () => {
    return (
      document &&
      user &&
      (document.status === DocumentStatus.PENDING_PARTY_B || document.status === DocumentStatus.PENDING_NOTARY) &&
      document.partyASignedAt &&
      document.partyBSignedAt &&
      !document.notaryId
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block p-4 bg-purple-100 rounded-full mb-4">
            <svg className="w-12 h-12 text-purple-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
            {getStatusBadge(document.status)}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Document Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="card">
              <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                {document.title}
              </h1>
              <p className="text-sm text-gray-600">
                Created {new Date(document.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            {/* DocuSeal embedded signing form */}
            {docusealLoading && (
              <div className="card">
                <p className="text-gray-600">Loading DocuSeal signing form...</p>
              </div>
            )}
            {docusealEmbedUrl && !docusealLoading && (
              <div className="card">
                <h2 className="text-xl font-display font-bold text-gray-900 mb-4">
                  Sign with DocuSeal
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Complete the form below to sign this document. Your signature will be recorded and the document will be updated when finished.
                </p>
                <DocuSealEmbed
                  src={docusealEmbedUrl}
                  onComplete={handleDocusealComplete}
                  title="DocuSeal signing form"
                />
              </div>
            )}

            {/* Document Preview (before signing) */}
            <div className="card">
              <h2 className="text-xl font-display font-bold text-gray-900 mb-6">
                Document Preview
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Review the document details below before signing. Once all parties have signed and the document is notarized, it will be complete.
              </p>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Document Details</h3>
              <div className="space-y-6">
                {Object.entries(document.fieldValues).map(([key, value]) => {
                  const field = document.templateFields.fields.find((f: any) => f.id === key);
                  if (!field || !value) return null;
                  
                  return (
                    <div key={key} className="border-b border-gray-200 pb-4 last:border-0">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">
                        {field.label}
                      </h3>
                      <p className="text-gray-900 whitespace-pre-wrap">{value as string}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Signature blocks (Party A, Party B, Notary) */}
            {document.signatures && document.signatures.length > 0 && (
              <div className="card">
                <h2 className="text-xl font-display font-bold text-gray-900 mb-6">
                  Signature Blocks
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Signatures for Party A, Party B, and Notary. Each signature is timestamped (ISO 8601) and IP-logged for the audit trail.
                </p>
                <div className="space-y-4">
                  {document.signatures.map((sig) => (
                    <div key={sig.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex-shrink-0">
                        <img
                          src={sig.signatureData}
                          alt="Signature"
                          className="w-32 h-16 border border-gray-300 rounded bg-white object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          {sig.user?.role === 'PARTY_A' ? 'Party A signature block' : sig.user?.role === 'PARTY_B' ? 'Party B signature block' : 'Notary seal/signature block'}
                        </p>
                        <p className="font-semibold text-gray-900">
                          {sig.user?.firstName} {sig.user?.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          Signed on {new Date(sig.createdAt).toISOString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          IP: {sig.ipAddress}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              {/* Party Information */}
              <div className="card">
                <h3 className="text-lg font-display font-bold text-gray-900 mb-4">
                  Parties
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Party A</p>
                    <p className="font-semibold text-gray-900">
                      {document.partyA?.firstName} {document.partyA?.lastName}
                    </p>
                    {document.partyASignedAt && (
                      <p className="text-xs text-green-600 flex items-center mt-1">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Signed
                      </p>
                    )}
                  </div>

                  {document.partyB && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Party B</p>
                      <p className="font-semibold text-gray-900">
                        {document.partyB.firstName} {document.partyB.lastName}
                      </p>
                      {document.partyBSignedAt && (
                        <p className="text-xs text-green-600 flex items-center mt-1">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Signed
                        </p>
                      )}
                    </div>
                  )}

                  {document.notary && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Notary</p>
                      <p className="font-semibold text-gray-900">
                        {document.notary.firstName} {document.notary.lastName}
                      </p>
                      {document.notarizedAt && (
                        <p className="text-xs text-green-600 flex items-center mt-1">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Notarized
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="card space-y-3">
                <h3 className="text-lg font-display font-bold text-gray-900 mb-4">
                  Actions
                </h3>

                {canSign() && !document.docusealSubmissionId && (
                  <button
                    onClick={() => setShowSignModal(true)}
                    className="btn-primary w-full"
                  >
                    <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Sign Document
                  </button>
                )}

                {document.partyAId === user?.id && !document.docusealSubmissionId && (document.status === DocumentStatus.DRAFT || document.status === DocumentStatus.PENDING_PARTY_B) && (
                  <button
                    onClick={handleCreateDocusealSubmission}
                    disabled={creatingDocuseal}
                    className="btn-primary w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    {creatingDocuseal ? 'Creating...' : 'Sign with DocuSeal'}
                  </button>
                )}

                {canSendToPartyB() && (
                  <button
                    onClick={() => setShowSendModal(true)}
                    className="btn-primary w-full"
                  >
                    <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Send to Party B
                  </button>
                )}

                {canSendToNotary() && (
                  <button
                    onClick={() => setShowSendModal(true)}
                    className="btn-primary w-full"
                  >
                    <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Send to Notary
                  </button>
                )}

                {document.docusealSubmissionId && document.status === DocumentStatus.COMPLETED && (
                  <button
                    type="button"
                    onClick={handleDownloadSignedDocuseal}
                    className="btn-secondary w-full"
                  >
                    <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download signed (DocuSeal)
                  </button>
                )}
                <button type="button" onClick={handleDownloadPdf} className="btn-secondary w-full">
                  <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sign Modal */}
      {showSignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-display font-bold text-gray-900">
                  Sign Document
                </h2>
                <button
                  onClick={() => setShowSignModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Signature Type Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Signature Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSignatureType(SignatureType.DRAW)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      signatureType === SignatureType.DRAW
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <svg className="w-6 h-6 mx-auto mb-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span className="text-sm font-medium">Draw</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignatureType(SignatureType.TYPE)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      signatureType === SignatureType.TYPE
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <svg className="w-6 h-6 mx-auto mb-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span className="text-sm font-medium">Type</span>
                  </button>
                </div>
              </div>

              {/* Signature Input */}
              <div className="mb-6">
                {signatureType === SignatureType.DRAW ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Draw your signature below
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white">
                      <SignatureCanvas
                        ref={sigCanvas}
                        canvasProps={{
                          className: 'signature-canvas w-full h-48',
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={clearSignature}
                      className="mt-2 text-sm text-gray-600 hover:text-gray-900"
                    >
                      Clear
                    </button>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type your full name
                    </label>
                    <input
                      type="text"
                      value={typedSignature}
                      onChange={(e) => setTypedSignature(e.target.value)}
                      className="input-field"
                      placeholder="John Doe"
                      style={{ fontFamily: '"Playfair Display", serif', fontSize: '24px' }}
                    />
                    {typedSignature && (
                      <div className="mt-4 p-4 border border-gray-300 rounded-lg bg-white">
                        <p className="text-center text-3xl" style={{ fontFamily: '"Playfair Display", serif' }}>
                          {typedSignature}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Legal Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900">
                  <strong>Legal Notice:</strong> By signing this document, you acknowledge that you have read,
                  understood, and agree to all terms and conditions outlined in this agreement. Your signature
                  will be legally binding.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowSignModal(false)}
                  className="btn-secondary flex-1"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSign}
                  disabled={submitting}
                  className="btn-primary flex-1"
                >
                  {submitting ? 'Signing...' : 'Confirm Signature'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-display font-bold text-gray-900">
                  {canSendToPartyB() ? 'Send to Party B' : 'Send to Notary'}
                </h2>
                <button
                  onClick={() => setShowSendModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {canSendToPartyB() ? (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Party B Email Address
                  </label>
                  <input
                    type="email"
                    value={partyBEmail}
                    onChange={(e) => setPartyBEmail(e.target.value)}
                    className="input-field"
                    placeholder="partyb@example.com"
                  />
                  <p className="mt-2 text-sm text-gray-600">
                    Party B will receive an email invitation to review and sign the document.
                  </p>
                </div>
              ) : (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Notary
                  </label>
                  <select
                    value={selectedNotary}
                    onChange={(e) => setSelectedNotary(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Choose a notary...</option>
                    {notaries.map((notary) => (
                      <option key={notary.id} value={notary.id}>
                        {notary.firstName} {notary.lastName} - {notary.notaryState} ({notary.notaryLicense})
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-sm text-gray-600">
                    The selected notary will be notified to review and notarize the document.
                  </p>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowSendModal(false)}
                  className="btn-secondary flex-1"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  onClick={canSendToPartyB() ? handleSendToPartyB : handleSendToNotary}
                  disabled={submitting}
                  className="btn-primary flex-1"
                >
                  {submitting ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentView;
