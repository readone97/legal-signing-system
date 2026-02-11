import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import SignatureCanvas from 'react-signature-canvas';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import { Document, SignatureType } from '../types';

const NotaryDashboard: React.FC = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState({ pending: 0, completed: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [showNotarizeModal, setShowNotarizeModal] = useState(false);
  const [signatureType, setSignatureType] = useState<SignatureType>(SignatureType.DRAW);
  const [typedSignature, setTypedSignature] = useState('');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [identityVerified, setIdentityVerified] = useState(false);
  const [signaturesVerified, setSignaturesVerified] = useState(false);
  const [documentComplete, setDocumentComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const sigCanvas = useRef<SignatureCanvas>(null);

  useEffect(() => {
    loadDocuments();
    loadStats();
  }, []);

  const loadDocuments = async () => {
    try {
      const response = await api.get('/notary/pending');
      setDocuments(response.data.data);
    } catch (error) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get('/notary/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to load stats');
    }
  };

  const handleNotarize = (doc: Document) => {
    setSelectedDoc(doc);
    setShowNotarizeModal(true);
    resetForm();
  };

  const resetForm = () => {
    setSignatureType(SignatureType.DRAW);
    setTypedSignature('');
    setVerificationNotes('');
    setIdentityVerified(false);
    setSignaturesVerified(false);
    setDocumentComplete(false);
    if (sigCanvas.current) {
      sigCanvas.current.clear();
    }
  };

  const handleSubmitNotarization = async () => {
    if (!selectedDoc) return;

    // Validation
    if (!identityVerified || !signaturesVerified || !documentComplete) {
      toast.error('Please complete all verification steps');
      return;
    }

    let signatureData = '';

    if (signatureType === SignatureType.DRAW) {
      if (sigCanvas.current?.isEmpty()) {
        toast.error('Please draw your notary seal');
        return;
      }
      signatureData = sigCanvas.current?.toDataURL() || '';
    } else if (signatureType === SignatureType.TYPE) {
      if (!typedSignature.trim()) {
        toast.error('Please type your signature');
        return;
      }
      const canvas = document.createElement('canvas');
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
      await api.post(`/notary/${selectedDoc.id}/notarize`, {
        signatureType,
        signatureData,
        verificationNotes,
      });
      
      toast.success('Document notarized successfully! ⚖️');
      setShowNotarizeModal(false);
      loadDocuments();
      loadStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to notarize document');
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

  const canNotarize = identityVerified && signaturesVerified && documentComplete;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-display font-bold text-gradient">
                Legal Signing
              </h1>
              <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <span className="text-purple-600 font-semibold">Notary Portal</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.firstName} {user?.lastName}
              </span>
              <button
                onClick={logout}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">
            Notary Dashboard
          </h2>
          <p className="text-gray-600">
            Review and notarize pending documents
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Review</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Notarized</p>
                <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Documents</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Notary License Info */}
        <div className="card mb-8 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-100">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-purple-100 rounded-full mr-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                Licensed Notary Public - {user?.notaryState}
              </p>
              <p className="text-sm text-gray-600">
                License: {user?.notaryLicense} • Expires: {user?.notaryExpiration ? new Date(user.notaryExpiration).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Documents List */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-display font-bold text-gray-900">
              Pending Documents
            </h3>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block p-4 bg-purple-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-purple-600 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-gray-600">Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">All caught up!</h3>
              <p className="text-gray-600">
                No documents pending notarization at this time.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-6 rounded-lg border-2 border-gray-200 hover:border-purple-300 hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2 text-lg">
                        {doc.title}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Party A</p>
                          <p className="text-sm font-medium text-gray-900">
                            {doc.partyA?.firstName} {doc.partyA?.lastName}
                          </p>
                          <p className="text-xs text-green-600 flex items-center mt-1">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Signed {doc.partyASignedAt ? new Date(doc.partyASignedAt).toLocaleDateString() : ''}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Party B</p>
                          <p className="text-sm font-medium text-gray-900">
                            {doc.partyB?.firstName} {doc.partyB?.lastName}
                          </p>
                          <p className="text-xs text-green-600 flex items-center mt-1">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Signed {doc.partyBSignedAt ? new Date(doc.partyBSignedAt).toLocaleDateString() : ''}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Submitted</p>
                          <p className="text-sm text-gray-900">
                            {new Date(doc.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          {doc.signatures?.length || 0} signatures
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {doc.documentType}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col space-y-2">
                      <Link
                        to={`/documents/${doc.id}`}
                        className="btn-secondary text-sm"
                      >
                        Review
                      </Link>
                      <button
                        onClick={() => handleNotarize(doc)}
                        className="btn-primary text-sm"
                      >
                        Notarize
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notarize Modal */}
      {showNotarizeModal && selectedDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-display font-bold text-gray-900">
                  Notarize Document
                </h2>
                <button
                  onClick={() => setShowNotarizeModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">{selectedDoc.title}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Party A:</span>
                    <span className="ml-2 font-medium">{selectedDoc.partyA?.firstName} {selectedDoc.partyA?.lastName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Party B:</span>
                    <span className="ml-2 font-medium">{selectedDoc.partyB?.firstName} {selectedDoc.partyB?.lastName}</span>
                  </div>
                </div>
              </div>

              {/* Verification Checklist */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Verification Checklist
                </h3>
                <div className="space-y-3">
                  <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={identityVerified}
                      onChange={(e) => setIdentityVerified(e.target.checked)}
                      className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <div className="ml-3">
                      <p className="font-semibold text-gray-900">Identity Verification</p>
                      <p className="text-sm text-gray-600">
                        Verified government-issued ID for both parties (driver's license, passport, etc.)
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={signaturesVerified}
                      onChange={(e) => setSignaturesVerified(e.target.checked)}
                      className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <div className="ml-3">
                      <p className="font-semibold text-gray-900">Signatures Verified</p>
                      <p className="text-sm text-gray-600">
                        Confirmed all required signatures are present and authentic
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={documentComplete}
                      onChange={(e) => setDocumentComplete(e.target.checked)}
                      className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <div className="ml-3">
                      <p className="font-semibold text-gray-900">Document Completeness</p>
                      <p className="text-sm text-gray-600">
                        Reviewed document for completeness and accuracy
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Verification Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Notes (Optional)
                </label>
                <textarea
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  rows={3}
                  className="input-field"
                  placeholder="Add any additional notes about the verification process..."
                />
              </div>

              {/* Notary Seal/Signature */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Notary Seal
                </h3>

                {/* Signature Type Selector */}
                <div className="mb-4">
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
                      <span className="text-sm font-medium">Draw Seal</span>
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
                      <span className="text-sm font-medium">Type Signature</span>
                    </button>
                  </div>
                </div>

                {/* Signature Input */}
                {signatureType === SignatureType.DRAW ? (
                  <div>
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
                    <input
                      type="text"
                      value={typedSignature}
                      onChange={(e) => setTypedSignature(e.target.value)}
                      className="input-field"
                      placeholder="Your full name"
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
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-purple-900">
                  <strong>Notary Certification:</strong> By notarizing this document, you certify that you
                  have verified the identities of all signatories, witnessed their signatures, and confirmed
                  that they signed the document willingly and with full understanding of its contents.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowNotarizeModal(false)}
                  className="btn-secondary flex-1"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitNotarization}
                  disabled={submitting || !canNotarize}
                  className="btn-primary flex-1"
                >
                  {submitting ? 'Notarizing...' : 'Complete Notarization'}
                </button>
              </div>

              {!canNotarize && (
                <p className="mt-3 text-center text-sm text-red-600">
                  Please complete all verification steps before notarizing
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotaryDashboard;
