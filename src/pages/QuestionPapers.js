import React, { useState, useEffect } from 'react';
import { questionPaperAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import './QuestionPapers.css';

const QuestionPapers = () => {
  const { user, isAdmin, isEditor } = useAuth();
  const [questionPapers, setQuestionPapers] = useState([]);
  const [allPapers, setAllPapers] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [filters, setFilters] = useState({ 
    examName: '', 
    batchYear: '', 
    paperNumber: '',
    status: 'all',
    sortBy: 'latest'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    examName: '',
    paperNumber: '',
    batchYear: '',
    file: null
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [papersPerPage] = useState(9);
  const [showPreview, setShowPreview] = useState(false);
  const [previewPaper, setPreviewPaper] = useState(null);

  useEffect(() => {
    fetchQuestionPapers();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, searchQuery, allPapers]);

  const fetchQuestionPapers = async () => {
    try {
      const response = await questionPaperAPI.getAll();
      const papers = response.data.data;
      setAllPapers(papers);
      setQuestionPapers(papers);
    } catch (error) {
      console.error('Error fetching question papers:', error);
      setMessage({ type: 'error', text: 'Failed to fetch question papers' });
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...allPapers];

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(paper => 
        paper.examName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paper.paperNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paper.batchYear.includes(searchQuery)
      );
    }

    // Apply filters
    if (filters.examName) {
      filtered = filtered.filter(paper => 
        paper.examName.toLowerCase().includes(filters.examName.toLowerCase())
      );
    }
    if (filters.batchYear) {
      filtered = filtered.filter(paper => paper.batchYear === filters.batchYear);
    }
    if (filters.paperNumber) {
      filtered = filtered.filter(paper => 
        paper.paperNumber.toLowerCase().includes(filters.paperNumber.toLowerCase())
      );
    }
    if (filters.status !== 'all') {
      filtered = filtered.filter(paper => paper.status === filters.status.toUpperCase());
    }

    // Apply sorting
    if (filters.sortBy === 'latest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (filters.sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (filters.sortBy === 'examName') {
      filtered.sort((a, b) => a.examName.localeCompare(b.examName));
    }

    setQuestionPapers(filtered);
    setCurrentPage(1);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    // Validate file type
    if (!formData.file) {
      setMessage({ type: 'error', text: 'Please select a file' });
      return;
    }

    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(formData.file.type)) {
      setMessage({ type: 'error', text: 'Invalid file type. Only PDF and images are allowed' });
      return;
    }

    // Check file size (max 10MB)
    if (formData.file.size > 10 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size must be less than 10MB' });
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append('file', formData.file);
    uploadFormData.append('examName', formData.examName);
    uploadFormData.append('paperNumber', formData.paperNumber);
    uploadFormData.append('batchYear', formData.batchYear);

    try {
      await questionPaperAPI.upload(uploadFormData);
      const statusMessage = user.role === 'ADMIN' || user.role === 'EDITOR' 
        ? 'Question paper uploaded and auto-approved!' 
        : 'Question paper uploaded! Waiting for verification.';
      setMessage({ type: 'success', text: statusMessage });
      setShowUploadForm(false);
      setFormData({ examName: '', paperNumber: '', batchYear: '', file: null });
      fetchQuestionPapers();
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Upload failed' });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  const resetFilters = () => {
    setFilters({ 
      examName: '', 
      batchYear: '', 
      paperNumber: '',
      status: 'all',
      sortBy: 'latest'
    });
    setSearchQuery('');
  };

  const handlePreview = (paper) => {
    setPreviewPaper(paper);
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewPaper(null);
  };

  // Pagination
  const indexOfLastPaper = currentPage * papersPerPage;
  const indexOfFirstPaper = indexOfLastPaper - papersPerPage;
  const currentPapers = questionPapers.slice(indexOfFirstPaper, indexOfLastPaper);
  const totalPages = Math.ceil(questionPapers.length / papersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { emoji: '⏳', label: 'Pending Approval', class: 'status-pending' },
      APPROVED: { emoji: '✅', label: 'Approved', class: 'status-approved' },
      REJECTED: { emoji: '❌', label: 'Rejected', class: 'status-rejected' }
    };
    const config = statusConfig[status] || statusConfig.PENDING;
    return (
      <span className={`status-badge ${config.class}`}>
        {config.emoji} {config.label}
      </span>
    );
  };

  return (
    <div className="question-papers container">
      <div className="page-header">
        <h1>📄 Question Papers Repository</h1>
        <p className="subtitle">Browse, upload, and access verified question papers</p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.type === 'success' ? '✅' : '⚠️'} {message.text}
        </div>
      )}

      {user && (
        <div className="action-buttons">
          <button
            className={`btn btn-primary ${showUploadForm ? 'active' : ''}`}
            onClick={() => setShowUploadForm(!showUploadForm)}
          >
            {showUploadForm ? '❌ Cancel Upload' : '📤 Upload Question Paper'}
          </button>
        </div>
      )}

      {showUploadForm && user && (
        <div className="upload-card card">
          <h3>📤 Upload Question Paper</h3>
          <p className="info-text">
            {user?.role === 'ADMIN' || user?.role === 'EDITOR' 
              ? '✨ Your uploads will be auto-approved and published immediately!' 
              : '⏳ Your upload will be reviewed by admins/editors before being published. You can upload question papers to contribute to the repository!'}
          </p>
          <form onSubmit={handleUpload} className="upload-form">
            <div className="form-row">
              <div className="form-group">
                <label>📚 Exam Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Data Structures"
                  value={formData.examName}
                  onChange={(e) => setFormData({ ...formData, examName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>🔢 Paper Number *</label>
                <input
                  type="text"
                  placeholder="e.g., Paper-1"
                  value={formData.paperNumber}
                  onChange={(e) => setFormData({ ...formData, paperNumber: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>📅 Batch Year *</label>
                <input
                  type="text"
                  placeholder="e.g., 2024"
                  value={formData.batchYear}
                  onChange={(e) => setFormData({ ...formData, batchYear: e.target.value })}
                  required
                  pattern="[0-9]{4}"
                  title="Please enter a valid year (e.g., 2024)"
                />
              </div>
            </div>
            <div className="form-group">
              <label>📎 Upload File (PDF/Image, Max 10MB) *</label>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                required
                className="file-input"
              />
              {formData.file && (
                <div className="file-info">
                  Selected: {formData.file.name} ({(formData.file.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
            </div>
            <button type="submit" className="btn btn-success">
              ✅ Upload Question Paper
            </button>
          </form>
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="filters-section card">
        <h3>🔍 Search & Filter</h3>
        
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔎 Search by exam name, paper number, or batch year..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters-grid">
          <div className="form-group">
            <label>📚 Exam Name</label>
            <input
              type="text"
              placeholder="Filter by exam"
              value={filters.examName}
              onChange={(e) => setFilters({ ...filters, examName: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>🔢 Paper Number</label>
            <input
              type="text"
              placeholder="Filter by paper number"
              value={filters.paperNumber}
              onChange={(e) => setFilters({ ...filters, paperNumber: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>📅 Batch Year</label>
            <input
              type="text"
              placeholder="Filter by year"
              value={filters.batchYear}
              onChange={(e) => setFilters({ ...filters, batchYear: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>🏷️ Status</label>
            <select 
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="all">All Status</option>
              <option value="approved">✅ Approved</option>
              <option value="pending">⏳ Pending</option>
              <option value="rejected">❌ Rejected</option>
            </select>
          </div>
          <div className="form-group">
            <label>🔄 Sort By</label>
            <select 
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            >
              <option value="latest">⬇️ Latest First</option>
              <option value="oldest">⬆️ Oldest First</option>
              <option value="examName">🔤 Exam Name (A-Z)</option>
            </select>
          </div>
          <div className="form-group filter-actions">
            <button className="btn btn-secondary" onClick={resetFilters}>
              🔄 Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <p>
          📊 Showing <strong>{currentPapers.length}</strong> of <strong>{questionPapers.length}</strong> question papers
        </p>
      </div>

      {/* Question Papers Grid */}
      {currentPapers.length === 0 ? (
        <div className="no-results card">
          <h3>📭 No Question Papers Found</h3>
          <p>Try adjusting your filters or search query</p>
        </div>
      ) : (
        <div className="papers-grid">
          {currentPapers.map((paper) => (
            <div key={paper.id} className="paper-card card">
              <div className="card-header">
                <h3>{paper.examName}</h3>
                {getStatusBadge(paper.status)}
              </div>
              
              <div className="card-body">
                <div className="info-row">
                  <span className="label">🔢 Paper Number:</span>
                  <span className="value">{paper.paperNumber}</span>
                </div>
                <div className="info-row">
                  <span className="label">📅 Batch Year:</span>
                  <span className="value">{paper.batchYear}</span>
                </div>
                <div className="info-row">
                  <span className="label">👤 Uploaded by:</span>
                  <span className="value">{paper.uploadedBy?.name}</span>
                </div>
                <div className="info-row">
                  <span className="label">📆 Upload Date:</span>
                  <span className="value">{new Date(paper.createdAt).toLocaleDateString()}</span>
                </div>
                {paper.verifiedBy && (
                  <div className="info-row">
                    <span className="label">✓ Verified by:</span>
                    <span className="value">{paper.verifiedBy.name}</span>
                  </div>
                )}
              </div>

              <div className="card-actions">
                {paper.status === 'APPROVED' && (
                  <>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => handlePreview(paper)}
                    >
                      👁️ Preview
                    </button>
                    <a 
                      href={`https://backend-repo-lzwq.onrender.com${paper.filePath}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-primary btn-sm"
                      onClick={(e) => {
                        e.preventDefault();
                        const link = document.createElement('a');
                        link.href = `https://backend-repo-lzwq.onrender.com${paper.filePath}`;
                        link.download = `${paper.examName}_${paper.paperNumber}_${paper.batchYear}.pdf`;
                        link.target = '_blank';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                    >
                      📥 Download
                    </a>
                  </>
                )}
                {paper.status === 'PENDING' && (
                  <div className="pending-message">
                    ⏳ Awaiting verification
                  </div>
                )}
                {paper.status === 'REJECTED' && (
                  <div className="rejected-message">
                    ❌ This paper was rejected
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
              <button
                key={number}
                className={`page-btn ${currentPage === number ? 'active' : ''}`}
                onClick={() => paginate(number)}
              >
                {number}
              </button>
            ))}
          </div>

          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && previewPaper && (
        <div className="modal-overlay" onClick={closePreview}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📄 {previewPaper.examName}</h2>
              <button className="btn-close" onClick={closePreview}>✖</button>
            </div>
            <div className="modal-body">
              {previewPaper.filePath?.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={`https://backend-repo-lzwq.onrender.com${previewPaper.filePath}#toolbar=1`}
                  title="Preview"
                  className="preview-iframe"
                  type="application/pdf"
                />
              ) : (
                <img 
                  src={`https://backend-repo-lzwq.onrender.com${previewPaper.filePath}`} 
                  alt={previewPaper.examName}
                  className="preview-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div class="error-message">❌ Unable to load image preview</div>';
                  }}
                />
              )}
            </div>
            <div className="modal-footer">
              <a 
                href={`https://backend-repo-lzwq.onrender.com${previewPaper.filePath}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                🔗 Open in New Tab
              </a>
              <button 
                className="btn btn-success"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = `https://backend-repo-lzwq.onrender.com${previewPaper.filePath}`;
                  link.download = `${previewPaper.examName}_${previewPaper.paperNumber}_${previewPaper.batchYear}.pdf`;
                  link.target = '_blank';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                📥 Download
              </button>
              <button className="btn btn-secondary" onClick={closePreview}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionPapers;
