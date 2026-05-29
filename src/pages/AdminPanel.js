import React, { useState, useEffect } from 'react';
import { adminAPI, questionPaperAPI, portfolioAPI, solutionAPI } from '../api/api';
import './AdminPanel.css';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [editors, setEditors] = useState([]);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [questionPapers, setQuestionPapers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [solutions, setSolutions] = useState([]);
  const [showCreateEditor, setShowCreateEditor] = useState(false);
  const [editorForm, setEditorForm] = useState({ name: '', email: '', password: '' });
  const [passwordResetRequests, setPasswordResetRequests] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'messages') fetchMessages();
    if (activeTab === 'papers') fetchQuestionPapers();
    if (activeTab === 'portfolio') fetchProjects();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'solutions') fetchSolutions();
    if (activeTab === 'editors') fetchEditors();
    if (activeTab === 'password-reset') fetchPasswordResetRequests();
  }, [activeTab]);

  const fetchEditors = async () => {
    try {
      const response = await adminAPI.getEditors();
      setEditors(response.data.data || []);
    } catch (error) {
      console.error('Error fetching editors:', error);
      setEditors([]);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await adminAPI.getStats();
      setStats(response.data.data);
      const editorsRes = await adminAPI.getEditors();
      setEditors(editorsRes.data.data);
      // Don't fetch question papers here - let the tab handle it
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await adminAPI.getMessages();
      setMessages(response.data.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchQuestionPapers = async () => {
    try {
      const response = await adminAPI.getAllQuestionPapers();
      console.log('Question papers response:', response.data);
      console.log('Question papers data:', response.data.data);
      console.log('Number of papers:', response.data.data?.length);
      setQuestionPapers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching question papers:', error);
      setQuestionPapers([]);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await portfolioAPI.getAll();
      setProjects(response.data.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchSolutions = async () => {
    try {
      const response = await solutionAPI.getAll();
      setSolutions(response.data.data);
    } catch (error) {
      console.error('Error fetching solutions:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getUsers();
      setUsers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  const fetchPasswordResetRequests = async () => {
    try {
      const response = await adminAPI.getAllPasswordResetRequests();
      setPasswordResetRequests(response.data.data || []);
    } catch (error) {
      console.error('Error fetching password reset requests:', error);
      setPasswordResetRequests([]);
    }
  };

  const handleCreateEditor = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createEditor(editorForm);
      setShowCreateEditor(false);
      setEditorForm({ name: '', email: '', password: '' });
      fetchDashboardData();
      alert('Editor created successfully');
    } catch (error) {
      console.error('Error creating editor:', error);
      alert('Failed to create editor');
    }
  };

  const handleDeleteEditor = async (id) => {
    if (window.confirm('Are you sure you want to delete this editor?')) {
      try {
        await adminAPI.deleteEditor(id);
        fetchDashboardData();
        alert('Editor deleted successfully');
      } catch (error) {
        console.error('Error deleting editor:', error);
        alert('Failed to delete editor');
      }
    }
  };

  const handleDeleteMessage = async (id) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await adminAPI.deleteMessage(id);
        fetchMessages();
        alert('Message deleted successfully');
      } catch (error) {
        console.error('Error deleting message:', error);
        alert('Failed to delete message');
      }
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await adminAPI.markAsRead(id);
      fetchMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleDeletePaper = async (id) => {
    if (window.confirm('Are you sure you want to delete this question paper?')) {
      try {
        await questionPaperAPI.delete(id);
        fetchQuestionPapers();
        alert('Question paper deleted successfully');
      } catch (error) {
        console.error('Error deleting paper:', error);
        alert('Failed to delete question paper');
      }
    }
  };

  const handleVerifyPaper = async (id, status) => {
    try {
      await questionPaperAPI.verify(id, status);
      fetchQuestionPapers();
      alert(`Question paper ${status.toLowerCase()} successfully`);
    } catch (error) {
      console.error('Error verifying paper:', error);
      alert('Failed to verify question paper');
    }
  };

  const handleUpdatePaper = async (paper) => {
    const examName = prompt('Enter exam name:', paper.examName);
    const paperNumber = prompt('Enter paper number:', paper.paperNumber);
    const batchYear = prompt('Enter batch year:', paper.batchYear);
    
    if (examName && paperNumber && batchYear) {
      try {
        await questionPaperAPI.update(paper.id, { examName, paperNumber, batchYear });
        fetchQuestionPapers();
        alert('Question paper updated successfully');
      } catch (error) {
        console.error('Error updating paper:', error);
        alert('Failed to update question paper');
      }
    }
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await portfolioAPI.delete(id);
        fetchProjects();
        alert('Project deleted successfully');
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project');
      }
    }
  };

  const handleDeleteSolution = async (id) => {
    if (window.confirm('Are you sure you want to delete this solution?')) {
      try {
        await solutionAPI.delete(id);
        fetchSolutions();
        alert('Solution deleted successfully');
      } catch (error) {
        console.error('Error deleting solution:', error);
        alert('Failed to delete solution');
      }
    }
  };

  const handleAcceptPasswordReset = async (requestId) => {
    if (window.confirm('Accept this password reset request and send code to user?')) {
      try {
        await adminAPI.acceptPasswordResetRequest(requestId);
        fetchPasswordResetRequests();
        alert('Password reset request accepted. Code has been sent to the user.');
      } catch (error) {
        console.error('Error accepting password reset:', error);
        alert('Failed to accept password reset request');
      }
    }
  };

  return (
    <div className="admin-panel container">
      <h1>Admin Panel</h1>

      <div className="tabs-container">
        <div className="admin-tabs">
          <button 
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span>📊</span>
            <span>Dashboard</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <span>👥</span>
            <span>Users</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'editors' ? 'active' : ''}`}
            onClick={() => setActiveTab('editors')}
          >
            <span>✏️</span>
            <span>Editors</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'papers' ? 'active' : ''}`}
            onClick={() => setActiveTab('papers')}
          >
            <span>📄</span>
            <span>Question Papers</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'portfolio' ? 'active' : ''}`}
            onClick={() => setActiveTab('portfolio')}
          >
            <span>💼</span>
            <span>Portfolio</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'solutions' ? 'active' : ''}`}
            onClick={() => setActiveTab('solutions')}
          >
            <span>💡</span>
            <span>Solutions</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            <span>✉️</span>
            <span>Messages</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'password-reset' ? 'active' : ''}`}
            onClick={() => setActiveTab('password-reset')}
          >
            <span>🔐</span>
            <span>Password Reset</span>
          </button>
        </div>
      </div>

      <div className="admin-content">
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-section">
            <h2>Dashboard Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>{stats.totalUsers || 0}</h3>
                <p>Total Users</p>
                <small>Registered accounts</small>
              </div>
              <div className="stat-card">
                <h3>{stats.totalEditors || 0}</h3>
                <p>Total Editors</p>
                <small>Editor accounts</small>
              </div>
              <div className="stat-card">
                <h3>{stats.totalPapers || 0}</h3>
                <p>Total Question Papers</p>
                <small>{stats.pendingPapers || 0} pending | {stats.approvedPapers || 0} approved</small>
              </div>
              <div className="stat-card">
                <h3>{stats.totalProjects || 0}</h3>
                <p>Total Projects</p>
                <small>{stats.completedProjects || 0} completed | {stats.inProgressProjects || 0} in progress</small>
              </div>
              <div className="stat-card">
                <h3>{stats.totalSolutions || 0}</h3>
                <p>Total Solutions</p>
                <small>Video tutorials</small>
              </div>
              <div className="stat-card">
                <h3>{stats.totalMessages || 0}</h3>
                <p>Total Messages</p>
                <small>{stats.unreadMessages || 0} unread</small>
              </div>
              <div className="stat-card">
                <h3>{passwordResetRequests.filter(r => r.status === 'PENDING').length}</h3>
                <p>Password Reset Requests</p>
                <small>{passwordResetRequests.filter(r => r.status === 'PENDING' && !r.code).length} pending approval | {passwordResetRequests.filter(r => r.status === 'COMPLETED').length} completed</small>
              </div>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="users-section">
            <div className="section-header">
              <div>
                <h2>👥 User Management</h2>
                <p className="section-description">View and manage all registered users ({users.length} total)</p>
              </div>
            </div>
            
            <div className="users-grid">
              {users.length > 0 ? (
                users.map((user) => (
                  <div key={user.id} className="user-card">
                    <div className="user-card-header">
                      <div className="user-avatar">
                        {user.role === 'ADMIN' && '👑'}
                        {user.role === 'EDITOR' && '✏️'}
                        {user.role === 'USER' && '👤'}
                      </div>
                      <div className="user-info">
                        <h3>{user.name}</h3>
                        <p className="user-email">{user.email}</p>
                      </div>
                    </div>
                    <div className="user-card-body">
                      <div className="user-detail">
                        <span className="detail-label">User ID</span>
                        <span className="detail-value">#{user.id}</span>
                      </div>
                      <div className="user-detail">
                        <span className="detail-label">Role</span>
                        <span className={`role-badge role-${user.role?.toLowerCase()}`}>
                          {user.role}
                        </span>
                      </div>
                      <div className="user-detail">
                        <span className="detail-label">Joined</span>
                        <span className="detail-value">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-users">
                  <p>No users found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* EDITORS TAB */}
        {activeTab === 'editors' && (
          <div className="editors-section">
              <div className="section-header">
                <h2>Editor Accounts</h2>
                <button className="btn btn-primary" onClick={() => setShowCreateEditor(!showCreateEditor)}>
                  {showCreateEditor ? 'Cancel' : '+ Create Editor'}
                </button>
              </div>

              {showCreateEditor && (
                <div className="card form-card">
                  <h3>Create New Editor</h3>
                  <form onSubmit={handleCreateEditor}>
                    <div className="form-group">
                      <label>Name</label>
                      <input
                        type="text"
                        value={editorForm.name}
                        onChange={(e) => setEditorForm({ ...editorForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={editorForm.email}
                        onChange={(e) => setEditorForm({ ...editorForm, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Password</label>
                      <input
                        type="password"
                        value={editorForm.password}
                        onChange={(e) => setEditorForm({ ...editorForm, password: e.target.value })}
                        required
                        minLength="6"
                      />
                    </div>
                    <button type="submit" className="btn btn-success">Create Editor</button>
                  </form>
                </div>
              )}

              <div className="editors-grid">
                {editors.map((editor) => (
                  <div key={editor.id} className="card editor-card">
                    <h4>{editor.name}</h4>
                    <p><strong>Email:</strong> {editor.email}</p>
                    <p><strong>Role:</strong> <span className="role-badge editor">{editor.role}</span></p>
                    <p><strong>Created:</strong> {new Date(editor.createdAt).toLocaleDateString()}</p>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteEditor(editor.id)}>
                      Delete
                    </button>
                  </div>
                ))}
              </div>
          </div>
        )}

        {/* QUESTION PAPERS TAB */}
        {activeTab === 'papers' && (
          <div className="papers-section">
            <h2>📄 Question Papers Management</h2>
            
            {/* Pending Approvals Section */}
            {questionPapers.filter(p => p.status === 'PENDING').length > 0 && (
              <div className="pending-section">
                <h3>⏳ Pending Approvals ({questionPapers.filter(p => p.status === 'PENDING').length})</h3>
                <div className="grid">
                  {questionPapers.filter(p => p.status === 'PENDING').map((paper) => (
                    <div key={paper.id} className="card pending-card">
                      <span className="badge-new">NEW</span>
                      <h3>{paper.examName}</h3>
                      <p><strong>Paper Number:</strong> {paper.paperNumber}</p>
                      <p><strong>Batch Year:</strong> {paper.batchYear}</p>
                      <p><strong>Status:</strong> <span className="status-badge status-pending">⏳ PENDING</span></p>
                      <p><strong>Uploaded by:</strong> {paper.uploadedBy?.name || 'Unknown'}</p>
                      <p><strong>Date:</strong> {new Date(paper.createdAt).toLocaleDateString()}</p>
                      <div className="card-actions">
                        <a 
                          href={`https://backend-repo-lzwq.onrender.com${paper.filePath}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="btn btn-sm btn-secondary"
                        >
                          📄 View PDF
                        </a>
                        <button 
                          className="btn btn-sm btn-success" 
                          onClick={() => handleVerifyPaper(paper.id, 'APPROVED')}
                        >
                          ✅ Approve
                        </button>
                        <button 
                          className="btn btn-sm btn-danger" 
                          onClick={() => handleVerifyPaper(paper.id, 'REJECTED')}
                        >
                          ❌ Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Approved Question Papers - Always Show */}
            <div className="approved-section">
              <h3>✅ Approved Question Papers ({questionPapers.filter(p => p.status === 'APPROVED').length})</h3>
              <div className="grid">
                {questionPapers.filter(p => p.status === 'APPROVED').length > 0 ? (
                  questionPapers.filter(p => p.status === 'APPROVED').map((paper) => (
                    <div key={paper.id} className="card">
                      <h3>{paper.examName}</h3>
                      <p><strong>Paper Number:</strong> {paper.paperNumber}</p>
                      <p><strong>Batch Year:</strong> {paper.batchYear}</p>
                      <p><strong>Status:</strong> <span className="status-badge status-approved">✅ APPROVED</span></p>
                      <p><strong>Uploaded by:</strong> {paper.uploadedBy?.name || 'Unknown'}</p>
                      <p><strong>Approved by:</strong> {paper.verifiedBy?.name || 'Unknown'}</p>
                      <p><strong>Date:</strong> {new Date(paper.createdAt).toLocaleDateString()}</p>
                      <div className="card-actions">
                        <a 
                          href={`https://backend-repo-lzwq.onrender.com${paper.filePath}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="btn btn-sm btn-secondary"
                        >
                          📄 View PDF
                        </a>
                        <button 
                          className="btn btn-sm btn-primary" 
                          onClick={() => handleUpdatePaper(paper)}
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-danger" 
                          onClick={() => handleDeletePaper(paper.id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-data">
                    <p>No approved question papers yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Rejected Question Papers */}
            {questionPapers.filter(p => p.status === 'REJECTED').length > 0 && (
              <div className="rejected-section">
                <h3>❌ Rejected Question Papers ({questionPapers.filter(p => p.status === 'REJECTED').length})</h3>
                <div className="grid">
                  {questionPapers.filter(p => p.status === 'REJECTED').map((paper) => (
                    <div key={paper.id} className="card">
                      <h3>{paper.examName}</h3>
                      <p><strong>Paper Number:</strong> {paper.paperNumber}</p>
                      <p><strong>Batch Year:</strong> {paper.batchYear}</p>
                      <p><strong>Status:</strong> <span className="status-badge status-rejected">❌ REJECTED</span></p>
                      <p><strong>Uploaded by:</strong> {paper.uploadedBy?.name || 'Unknown'}</p>
                      <p><strong>Date:</strong> {new Date(paper.createdAt).toLocaleDateString()}</p>
                      <div className="card-actions">
                        <a 
                          href={`https://backend-repo-lzwq.onrender.com${paper.filePath}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="btn btn-sm btn-secondary"
                        >
                          📄 View PDF
                        </a>
                        <button 
                          className="btn btn-sm btn-danger" 
                          onClick={() => handleDeletePaper(paper.id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Papers Message */}
            {questionPapers.length === 0 && (
              <div className="no-data">
                <p>No question papers found</p>
              </div>
            )}
          </div>
        )}

        {/* PORTFOLIO TAB */}
        {activeTab === 'portfolio' && (
          <div className="portfolio-section">
            <h2>Portfolio Management</h2>
            <div className="grid">
              {projects.map((project) => (
                <div key={project.id} className="card">
                  {project.imagePath && (
                    <img src={`https://backend-repo-lzwq.onrender.com${project.imagePath}`} alt={project.title} className="project-img" />
                  )}
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <p><strong>Status:</strong> <span className={`status-badge ${project.status.toLowerCase()}`}>{project.status.replace('_', ' ')}</span></p>
                  <p><strong>Technologies:</strong> {project.technologies}</p>
                  <p><strong>Created by:</strong> {project.createdBy.name}</p>
                  <div className="card-actions">
                    {project.projectUrl && (
                      <a 
                        href={project.projectUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn btn-sm btn-secondary"
                      >
                        View Project
                      </a>
                    )}
                    <button 
                      className="btn btn-sm btn-danger" 
                      onClick={() => handleDeleteProject(project.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SOLUTIONS TAB */}
        {activeTab === 'solutions' && (
          <div className="solutions-section">
            <h2>Solutions Management</h2>
            <div className="grid">
              {solutions.map((solution) => (
                <div key={solution.id} className="card">
                  {solution.thumbnailPath && (
                    <img src={`https://backend-repo-lzwq.onrender.com${solution.thumbnailPath}`} alt={solution.title} className="solution-img" />
                  )}
                  <h3>{solution.title}</h3>
                  <p><strong>Question:</strong> {solution.question}</p>
                  <p><strong>Platform:</strong> <span className="platform-badge">{solution.platform}</span></p>
                  <p>{solution.description}</p>
                  <p><strong>Created by:</strong> {solution.createdBy.name}</p>
                  <div className="card-actions">
                    <a 
                      href={solution.videoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-sm btn-secondary"
                    >
                      Watch Video
                    </a>
                    <button 
                      className="btn btn-sm btn-danger" 
                      onClick={() => handleDeleteSolution(solution.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MESSAGES TAB */}
        {activeTab === 'messages' && (
          <div className="messages-section">
            <h2>Contact Messages</h2>
            <div className="messages-list">
              {messages.map((message) => (
                <div key={message.id} className={`card message-card ${message.status.toLowerCase()}`}>
                  <div className="message-header">
                    <h4>{message.name}</h4>
                    <span className={`status-badge ${message.status.toLowerCase()}`}>{message.status}</span>
                  </div>
                  <p><strong>Email:</strong> {message.email}</p>
                  <p><strong>Message:</strong> {message.message}</p>
                  <p><strong>Date:</strong> {new Date(message.createdAt).toLocaleString()}</p>
                  <div className="card-actions">
                    {message.status === 'UNREAD' && (
                      <button className="btn btn-sm btn-primary" onClick={() => handleMarkAsRead(message.id)}>
                        Mark as Read
                      </button>
                    )}
                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteMessage(message.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PASSWORD RESET TAB */}
        {activeTab === 'password-reset' && (
          <div className="password-reset-section">
            <div className="section-header">
              <div>
                <h2>🔐 Password Reset Management</h2>
                <p className="section-description">
                  Manage password reset requests ({passwordResetRequests.length} total)
                </p>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="password-reset-stats">
              <div className="reset-stat-card pending">
                <div className="reset-stat-icon">⏳</div>
                <div className="reset-stat-content">
                  <h4>{passwordResetRequests.filter(r => r.status === 'PENDING' && !r.code).length}</h4>
                  <p>Awaiting Approval</p>
                </div>
              </div>
              <div className="reset-stat-card approved">
                <div className="reset-stat-icon">✉️</div>
                <div className="reset-stat-content">
                  <h4>{passwordResetRequests.filter(r => r.status === 'PENDING' && r.code).length}</h4>
                  <p>Code Sent</p>
                </div>
              </div>
              <div className="reset-stat-card completed">
                <div className="reset-stat-icon">✓</div>
                <div className="reset-stat-content">
                  <h4>{passwordResetRequests.filter(r => r.status === 'COMPLETED').length}</h4>
                  <p>Completed</p>
                </div>
              </div>
            </div>

            <div className="reset-table-container">
              <table className="reset-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Code</th>
                    <th>Requested</th>
                    <th>Completed</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {passwordResetRequests.length > 0 ? (
                    passwordResetRequests.map((request) => (
                      <tr key={request.id}>
                        <td>
                          <div className="user-cell">
                            <span className="user-icon">👤</span>
                            <span className="user-name">{request.username}</span>
                          </div>
                        </td>
                        <td>
                          <span className="email-text">{request.email}</span>
                        </td>
                        <td>
                          <span className={`status-badge ${request.status.toLowerCase()}`}>
                            {request.status === 'PENDING' && '⏳ '}
                            {request.status === 'COMPLETED' && '✓ '}
                            {request.status}
                          </span>
                        </td>
                        <td>
                          {request.code ? (
                            <code className="reset-code">{request.code}</code>
                          ) : (
                            <span className="text-muted">Not generated</span>
                          )}
                        </td>
                        <td>
                          <div className="date-cell">
                            <span className="date-icon">📅</span>
                            <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                            <small>{new Date(request.createdAt).toLocaleTimeString()}</small>
                          </div>
                        </td>
                        <td>
                          {request.completedAt ? (
                            <div className="date-cell">
                              <span className="date-icon">✓</span>
                              <span>{new Date(request.completedAt).toLocaleDateString()}</span>
                              <small>{new Date(request.completedAt).toLocaleTimeString()}</small>
                            </div>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          {request.status === 'PENDING' && !request.code && (
                            <button 
                              className="btn btn-sm btn-success" 
                              onClick={() => handleAcceptPasswordReset(request.id)}
                            >
                              ✓ Accept Request
                            </button>
                          )}
                          {request.status === 'PENDING' && request.code && (
                            <span className="text-info">
                              <span className="status-icon">✉️</span>
                              Code sent
                            </span>
                          )}
                          {request.status === 'COMPLETED' && (
                            <span className="text-success">
                              <span className="status-icon">✓</span>
                              Completed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center empty-state">
                        <div className="empty-icon">🔐</div>
                        <p>No password reset requests found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="info-box">
              <h3>ℹ️ Password Reset Process</h3>
              <ul>
                <li><strong>Pending:</strong> User has requested password reset, waiting for admin approval</li>
                <li><strong>Accept Request:</strong> Generate a 6-digit code and send it to user's email</li>
                <li><strong>Completed:</strong> User has successfully reset their password</li>
                <li><strong>Auto-cleanup:</strong> Completed requests are automatically deleted after 24 hours</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
