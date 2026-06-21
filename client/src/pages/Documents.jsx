import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/auth';

const DOC_TYPES = [
  { value: 'passport', label: 'Passport', icon: '🛂', description: 'Main identification document' },
  { value: 'proof_of_address', label: 'Proof of Address', icon: '🏠', description: 'Utility bill or bank statement' },
  { value: 'employment_letter', label: 'Employment Letter', icon: '💼', description: 'Letter from your employer' },
  { value: 'pps_number', label: 'PPS Number Card', icon: '🪪', description: 'Your PPS number document' },
  { value: 'irp_card', label: 'IRP Card', icon: '🟦', description: 'Irish Residence Permit card' },
  { value: 'birth_certificate', label: 'Birth Certificate', icon: '📜', description: 'Required for children enrolment' },
];

const statusConfig = {
  pending: { label: 'Pending Review', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  valid: { label: 'Valid', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  invalid: { label: 'Issues Found', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-400' },
};

export default function Documents() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch existing documents on load
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await API.get('/documents');
        setDocuments(res.data);
      } catch (err) {
        console.error('Failed to fetch documents', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  // Handle file upload
  const handleUpload = async (docType, file) => {
    if (!file) return;

    setUploading(docType);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('document', file);
    formData.append('doc_type', docType);

    try {
      const res = await API.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Update local state — add or replace the document
      setDocuments(prev => {
        const exists = prev.find(d => d.doc_type === docType);
        if (exists) {
          return prev.map(d => d.doc_type === docType ? res.data.document : d);
        }
        return [...prev, res.data.document];
      });

      setSuccess(`${docType.replace(/_/g, ' ')} uploaded successfully!`);
      setTimeout(() => setSuccess(''), 3000);

    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setUploading(null);
    }
  };

  // Handle document delete
  const handleDelete = async (docId, docType) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      await API.delete(`/documents/${docId}`);
      setDocuments(prev => prev.filter(d => d.id !== docId));
      setSuccess(`${docType.replace(/_/g, ' ')} deleted successfully`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete document');
    }
  };

  // Get uploaded document for a given type
  const getUploadedDoc = (docType) => {
    return documents.find(d => d.doc_type === docType);
  };

  // Calculate upload progress
  const uploadedCount = DOC_TYPES.filter(dt => getUploadedDoc(dt.value)).length;
  const totalCount = DOC_TYPES.length;
  const percentage = Math.round((uploadedCount / totalCount) * 100);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-lg font-semibold text-gray-900">Settle.ie</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Roadmap
          </button>
          <button
            onClick={() => navigate('/assistant')}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Ask Fáilte
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Document Vault</h2>
          <p className="text-sm text-gray-500 mt-1">
            Upload and store your important documents securely
          </p>
        </div>

        {/* Progress card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Documents uploaded</p>
              <p className="text-xs text-gray-400 mt-0.5">{uploadedCount} of {totalCount} documents</p>
            </div>
            <span className="text-2xl font-bold text-emerald-600">{percentage}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div
              className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Success message */}
        {success && (
          <div className="bg-emerald-50 text-emerald-700 text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
            <span>✅</span> {success}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12 text-gray-400 text-sm">
            Loading your documents...
          </div>
        )}

        {/* Document cards */}
        {!loading && (
          <div className="space-y-3">
            {DOC_TYPES.map(docType => {
              const uploaded = getUploadedDoc(docType.value);
              const isUploading = uploading === docType.value;
              const validation = uploaded?.ai_validation
                ? (typeof uploaded.ai_validation === 'string'
                  ? JSON.parse(uploaded.ai_validation)
                  : uploaded.ai_validation)
                : null;
              const status = validation?.status || 'pending';
              const statusStyle = statusConfig[status] || statusConfig.pending;

              return (
                <div
                  key={docType.value}
                  className="bg-white rounded-2xl border border-gray-100 p-5"
                >
                  <div className="flex items-start justify-between gap-4">

                    {/* Left side — doc info */}
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-2xl">{docType.icon}</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">
                          {docType.label}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {docType.description}
                        </p>

                        {/* Status badge if uploaded */}
                        {uploaded && (
                          <div className="mt-2">
                            <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                              {statusStyle.label}
                            </span>
                          </div>
                        )}

                        {/* Uploaded date */}
                        {uploaded && (
                          <p className="text-xs text-gray-400 mt-1">
                            Uploaded {new Date(uploaded.uploaded_at).toLocaleDateString('en-IE')}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right side — actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {uploaded ? (
                        <>
                          {/* View button */}

                          <button
                            onClick={() => window.open(uploaded.s3_key, '_blank')}
                            className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors"
                          >
                            View
                          </button>

                          {/* Replace button */}
                          <label className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
                            Replace
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.pdf"
                              className="hidden"
                              onChange={e => handleUpload(docType.value, e.target.files[0])}
                            />
                          </label>

                          {/* Delete button */}
                          <button
                            onClick={() => handleDelete(uploaded.id, docType.value)}
                            className="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        /* Upload button */
                        <label className={`text-xs px-4 py-2 rounded-xl font-medium cursor-pointer transition-colors ${isUploading
                          ? 'bg-gray-100 text-gray-400'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}>
                          {isUploading ? 'Uploading...' : 'Upload'}
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            className="hidden"
                            disabled={isUploading}
                            onChange={e => handleUpload(docType.value, e.target.files[0])}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div >
  );
}