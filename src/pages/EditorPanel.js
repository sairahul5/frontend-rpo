import React, { useState, useEffect } from 'react';
import { questionPaperAPI } from '../api/api';
import './EditorPanel.css';

const EditorPanel = () => {
  const [pendingPapers, setPendingPapers] = useState([]);

  useEffect(() => {
    fetchPendingPapers();
  }, []);

  const fetchPendingPapers = async () => {
    try {
      const response = await questionPaperAPI.getPending();
      setPendingPapers(response.data.data);
    } catch (error) {
      console.error('Error fetching pending papers:', error);
    }
  };

  const handleVerify = async (id, status) => {
    try {
      await questionPaperAPI.verify(id, status);
      fetchPendingPapers();
    } catch (error) {
      console.error('Error verifying paper:', error);
    }
  };

  return (
    <div className="editor-panel container">
      <h1>Editor Panel</h1>

      <section className="editor-section">
        <h2>Pending Question Papers</h2>
        {pendingPapers.length === 0 ? (
          <p>No pending question papers</p>
        ) : (
          <div className="grid">
            {pendingPapers.map((paper) => (
              <div key={paper.id} className="card pending-card">
                <h3>{paper.examName}</h3>
                <p><strong>Paper Number:</strong> {paper.paperNumber}</p>
                <p><strong>Batch Year:</strong> {paper.batchYear}</p>
                <p><strong>Uploaded by:</strong> {paper.uploadedBy.name}</p>
                <p><strong>Uploaded on:</strong> {new Date(paper.createdAt).toLocaleDateString()}</p>
                <a 
                  href={`https://backend-repo-lzwq.onrender.com${paper.filePath}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-secondary"
                >
                  View PDF
                </a>
                <div className="verify-actions">
                  <button
                    className="btn btn-success"
                    onClick={() => handleVerify(paper.id, 'APPROVED')}
                  >
                    Approve
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleVerify(paper.id, 'REJECTED')}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default EditorPanel;
