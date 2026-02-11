import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import { Document, DocumentStatus } from '../types';
import { toast } from 'react-toastify';

const Dashboard: React.FC = () => {
  const { user, logout } = useContext(AuthContext);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ draft: 0, pending: 0, completed: 0 });

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const response = await api.get('/documents');
      const docs = response.data.data.documents;
      setDocuments(docs);

      // Calculate stats
      setStats({
        draft: docs.filter((d: Document) => d.status === DocumentStatus.DRAFT).length,
        pending: docs.filter((d: Document) => 
          d.status === DocumentStatus.PENDING_PARTY_B || 
          d.status === DocumentStatus.PENDING_NOTARY
        ).length,
        completed: docs.filter((d: Document) => d.status === DocumentStatus.COMPLETED).length,
      });
    } catch (error) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
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
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-display font-bold text-gradient">
                  Legal Signing
                </h1>
              </div>
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
            Welcome back, {user?.firstName}! 👋
          </h2>
          <p className="text-gray-600">
            {user?.role === 'PARTY_A' && 'Create and manage your legal documents'}
            {user?.role === 'PARTY_B' && 'Review and sign your pending documents'}
            {user?.role === 'NOTARY' && 'Notarize and certify documents'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Draft Documents</p>
                <p className="text-3xl font-bold text-gray-900">{stats.draft}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Review</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        {user?.role === 'PARTY_A' && (
          <div className="mb-8">
            <Link to="/documents/create" className="btn-primary inline-flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New Document
            </Link>
          </div>
        )}

        {user?.role === 'NOTARY' && (
          <div className="mb-8">
            <Link to="/notary" className="btn-primary inline-flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Notary Dashboard
            </Link>
          </div>
        )}

        {/* Documents List */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-display font-bold text-gray-900">
              Recent Documents
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
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents yet</h3>
              <p className="text-gray-600 mb-6">
                {user?.role === 'PARTY_A' 
                  ? 'Create your first document to get started' 
                  : 'You have no documents to review at this time'}
              </p>
              {user?.role === 'PARTY_A' && (
                <Link to="/documents/create" className="btn-primary inline-block">
                  Create Document
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <Link
                  key={doc.id}
                  to={`/documents/${doc.id}`}
                  className="block p-4 rounded-lg border-2 border-gray-200 hover:border-purple-300 hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{doc.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Created {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Party A: {doc.partyA?.firstName} {doc.partyA?.lastName}</span>
                        {doc.partyB && (
                          <span>Party B: {doc.partyB?.firstName} {doc.partyB?.lastName}</span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      {getStatusBadge(doc.status)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
