import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { contactAPI, questionPaperAPI, solutionAPI, portfolioAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [dashboardStats, setDashboardStats] = useState({
    totalPapers: 0,
    pendingPapers: 0,
    approvedPapers: 0,
    totalSolutions: 0,
    totalProjects: 0,
    recentPapers: [],
    recentSolutions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) {
      fetchDashboardData();
    }
  }, [user?.email]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch question papers
      const papersResponse = await questionPaperAPI.getAll();
      console.log('Papers response:', papersResponse);
      let papers = [];
      if (Array.isArray(papersResponse.data)) {
        papers = papersResponse.data;
      } else if (papersResponse.data?.data && Array.isArray(papersResponse.data.data)) {
        papers = papersResponse.data.data;
      }
      console.log('Processed papers:', papers);
      
      const approvedPapers = papers.filter(p => p.status === 'APPROVED' || p.isVerified);
      const pendingPapers = papers.filter(p => p.status === 'PENDING' || !p.isVerified);
      
      // Fetch solutions
      let solutions = [];
      try {
        const solutionsResponse = await solutionAPI.getAll();
        solutions = Array.isArray(solutionsResponse.data) ? solutionsResponse.data : 
                    (solutionsResponse.data?.data || []);
      } catch (err) {
        console.log('Solutions not available');
      }
      
      // Fetch projects
      let projects = [];
      try {
        const projectsResponse = await portfolioAPI.getAll();
        projects = Array.isArray(projectsResponse.data) ? projectsResponse.data : 
                   (projectsResponse.data?.data || []);
      } catch (err) {
        console.log('Projects not available');
      }
      
      // Get recent items (last 5)
      const recentPapers = approvedPapers
        .sort((a, b) => new Date(b.uploadDate || 0) - new Date(a.uploadDate || 0))
        .slice(0, 5);
      
      const recentSolutions = solutions
        .sort((a, b) => new Date(b.id) - new Date(a.id))
        .slice(0, 3);
      
      setDashboardStats({
        totalPapers: papers.length,
        pendingPapers: pendingPapers.length,
        approvedPapers: approvedPapers.length,
        totalSolutions: solutions.length,
        totalProjects: projects.length,
        completedProjects: projects.filter(p => p.status === 'COMPLETED').length,
        inProgressProjects: projects.filter(p => p.status === 'IN_PROGRESS').length,
        recentPapers,
        recentSolutions
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await contactAPI.send(formData);
      setSuccess('Message sent successfully!');
      setError('');
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to send message');
      setSuccess('');
    }
  };

  const features = [
    {
      icon: '📤',
      title: 'Upload Question Papers',
      description: 'Easily upload and share question papers from various exams, subjects, and years',
      link: '/question-papers',
      color: 'blue'
    },
    {
      icon: '📁',
      title: 'Manage & Organize',
      description: 'Organize papers by subject, year, and exam type with powerful search filters',
      link: '/question-papers',
      color: 'purple'
    },
    {
      icon: '🔒',
      title: 'Secure Access',
      description: 'Role-based access control ensures only verified papers are publicly available',
      link: user ? '/question-papers' : '/login',
      color: 'green'
    },
    {
      icon: '💡',
      title: 'View Solutions',
      description: 'Access detailed video solutions and tutorials for complex problems',
      link: '/solutions',
      color: 'orange'
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-icon">🎓</span>
            <span className="badge-text">Academic Resource Hub</span>
          </div>
          <h1 className="hero-title">
            Question Paper
            <span className="gradient-text"> Management System</span>
          </h1>
          <p className="hero-description">
            Your one-stop platform for uploading, managing, and accessing verified question papers. 
            Collaborate with peers and access a comprehensive library of academic resources.
          </p>
          <div className="hero-actions">
            <Link to="/question-papers" className="btn btn-primary btn-lg hero-btn-primary">
              <span className="btn-icon">📄</span>
              View Question Papers
            </Link>
            {user && (
              <Link to="/question-papers" className="btn btn-secondary btn-lg hero-btn-secondary">
                <span className="btn-icon">📤</span>
                Upload Paper
              </Link>
            )}
            {!user && (
              <Link to="/login" className="btn btn-ghost btn-lg hero-btn-secondary">
                <span className="btn-icon">🔐</span>
                Sign In to Upload
              </Link>
            )}
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-value">{loading ? '...' : dashboardStats.totalPapers}+</div>
              <div className="stat-label">Question Papers</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-value">{loading ? '...' : dashboardStats.approvedPapers}+</div>
              <div className="stat-label">Verified Papers</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-value">{loading ? '...' : dashboardStats.totalSolutions}+</div>
              <div className="stat-label">Video Solutions</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Powerful Features</h2>
            <p className="section-subtitle">
              Everything you need to manage academic resources effectively
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <Link 
                to={feature.link} 
                key={index} 
                className={`feature-card feature-${feature.color}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="feature-icon-wrapper">
                  <span className="feature-icon">{feature.icon}</span>
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <div className="feature-arrow">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Stats Section */}
      <section className="dashboard-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Platform Analytics</h2>
            <p className="section-subtitle">
              Real-time statistics and insights from our academic resource hub
            </p>
          </div>
          
          <div className="dashboard-grid">
            {/* Main Stats Cards */}
            <div className="dashboard-card large">
              <div className="card-header">
                <h3>📊 Overview</h3>
                <span className="card-badge">Live</span>
              </div>
              <div className="stats-overview">
                <div className="overview-item">
                  <div className="overview-icon blue">📄</div>
                  <div className="overview-content">
                    <h4>{loading ? '...' : dashboardStats.totalPapers}</h4>
                    <p>Total Papers</p>
                    <span className="trend positive">↑ Growing</span>
                  </div>
                </div>
                <div className="overview-item">
                  <div className="overview-icon green">✓</div>
                  <div className="overview-content">
                    <h4>{loading ? '...' : dashboardStats.approvedPapers}</h4>
                    <p>Verified Papers</p>
                    <span className="trend positive">
                      {loading ? '...' : Math.round((dashboardStats.approvedPapers / dashboardStats.totalPapers) * 100 || 0)}% verified
                    </span>
                  </div>
                </div>
                <div className="overview-item">
                  <div className="overview-icon orange">⏳</div>
                  <div className="overview-content">
                    <h4>{loading ? '...' : dashboardStats.pendingPapers}</h4>
                    <p>Pending Review</p>
                    <span className="trend neutral">In queue</span>
                  </div>
                </div>
                <div className="overview-item">
                  <div className="overview-icon purple">🎥</div>
                  <div className="overview-content">
                    <h4>{loading ? '...' : dashboardStats.totalSolutions}</h4>
                    <p>Video Solutions</p>
                    <span className="trend positive">Available</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Projects Card */}
            <div className="dashboard-card projects-card">
              <div className="card-header">
                <h3>💼 Portfolio Projects</h3>
                <span className="total-count">{loading ? '...' : dashboardStats.totalProjects} Total</span>
              </div>
              
              <div className="projects-summary">
                <div className="summary-row">
                  <div className="summary-icon completed">✓</div>
                  <div className="summary-details">
                    <div className="summary-label">Completed Projects</div>
                    <div className="summary-number">{loading ? '...' : dashboardStats.completedProjects}</div>
                  </div>
                  <div className="summary-percentage completed">
                    {loading ? '0' : Math.round((dashboardStats.completedProjects / (dashboardStats.totalProjects || 1)) * 100)}%
                  </div>
                </div>
                
                <div className="progress-bar">
                  <div 
                    className="progress-fill completed" 
                    style={{ width: `${loading ? 0 : (dashboardStats.completedProjects / (dashboardStats.totalProjects || 1)) * 100}%` }}
                  ></div>
                </div>

                <div className="summary-row">
                  <div className="summary-icon in-progress">⚙</div>
                  <div className="summary-details">
                    <div className="summary-label">In Progress</div>
                    <div className="summary-number">{loading ? '...' : dashboardStats.inProgressProjects}</div>
                  </div>
                  <div className="summary-percentage in-progress">
                    {loading ? '0' : Math.round((dashboardStats.inProgressProjects / (dashboardStats.totalProjects || 1)) * 100)}%
                  </div>
                </div>
                
                <div className="progress-bar">
                  <div 
                    className="progress-fill in-progress" 
                    style={{ width: `${loading ? 0 : (dashboardStats.inProgressProjects / (dashboardStats.totalProjects || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <Link to="/portfolio" className="card-action">
                <span>View All Projects</span>
                <span className="action-arrow">→</span>
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="dashboard-card">
              <div className="card-header">
                <h3>⚡ Quick Actions</h3>
              </div>
              <div className="quick-actions">
                <Link to="/question-papers" className="action-btn">
                  <span className="action-icon">📄</span>
                  <span>Browse Papers</span>
                </Link>
                {user && (
                  <Link to="/question-papers" className="action-btn">
                    <span className="action-icon">📤</span>
                    <span>Upload Paper</span>
                  </Link>
                )}
                <Link to="/solutions" className="action-btn">
                  <span className="action-icon">🎥</span>
                  <span>Watch Solutions</span>
                </Link>
                <Link to="/portfolio" className="action-btn">
                  <span className="action-icon">💼</span>
                  <span>View Projects</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          {!loading && (dashboardStats.recentPapers.length > 0 || dashboardStats.recentSolutions.length > 0) && (
            <div className="recent-activity">
              {dashboardStats.recentPapers.length > 0 && (
                <div className="activity-section">
                  <h3 className="activity-title">📑 Recently Added Papers</h3>
                  <div className="activity-list">
                    {dashboardStats.recentPapers.map((paper, index) => (
                      <div key={paper.id || index} className="activity-item">
                        <div className="activity-icon">📄</div>
                        <div className="activity-content">
                          <h4>{paper.examName || 'Question Paper'}</h4>
                          <p>
                            {paper.paperNumber && `Paper ${paper.paperNumber}`}
                            {paper.batchYear && ` • ${paper.batchYear}`}
                          </p>
                        </div>
                        <Link to="/question-papers" className="activity-link">
                          View →
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {dashboardStats.recentSolutions.length > 0 && (
                <div className="activity-section">
                  <h3 className="activity-title">🎥 Latest Solutions</h3>
                  <div className="activity-list">
                    {dashboardStats.recentSolutions.map((solution, index) => (
                      <div key={solution.id || index} className="activity-item">
                        <div className="activity-icon">🎥</div>
                        <div className="activity-content">
                          <h4>{solution.title || 'Video Solution'}</h4>
                          <p>{solution.platform || 'YouTube'}</p>
                        </div>
                        <Link to="/solutions" className="activity-link">
                          Watch →
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Get started in three simple steps</p>
          </div>
          <div className="steps-container">
            <div className="step-item">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3 className="step-title">Create Account</h3>
                <p className="step-description">Sign up to access all features and start contributing</p>
              </div>
            </div>
            <div className="step-connector"></div>
            <div className="step-item">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3 className="step-title">Upload Papers</h3>
                <p className="step-description">Share question papers with the community</p>
              </div>
            </div>
            <div className="step-connector"></div>
            <div className="step-item">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3 className="step-title">Access Resources</h3>
                <p className="step-description">Browse, download, and benefit from verified content</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="container">
          <div className="contact-wrapper">
            <div className="contact-info">
              <h2 className="contact-title">Get in Touch</h2>
              <p className="contact-description">
                Have questions or suggestions? We'd love to hear from you. 
                Send us a message and we'll respond as soon as possible.
              </p>
              <div className="contact-features">
                <div className="contact-feature-item">
                  <span className="contact-feature-icon">⚡</span>
                  <span>Quick Response</span>
                </div>
                <div className="contact-feature-item">
                  <span className="contact-feature-icon">🤝</span>
                  <span>Friendly Support</span>
                </div>
                <div className="contact-feature-item">
                  <span className="contact-feature-icon">🔒</span>
                  <span>Secure Communication</span>
                </div>
              </div>
            </div>
            <div className="contact-form-wrapper">
              <form onSubmit={handleSubmit} className="contact-form">
                {success && (
                  <div className="alert alert-success">
                    ✅ {success}
                  </div>
                )}
                {error && (
                  <div className="alert alert-error">
                    ⚠️ {error}
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Your Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="form-textarea"
                    placeholder="Tell us what's on your mind..."
                    rows="5"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-lg btn-block">
                  <span className="btn-icon">📧</span>
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
