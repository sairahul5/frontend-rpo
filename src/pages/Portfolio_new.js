import React, { useState, useEffect } from 'react';
import { portfolioAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import './Portfolio.css';

const Portfolio = () => {
  const { user, isAdminOrEditor } = useAuth();
  const [projects, setProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showDetails, setShowDetails] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    technology: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'IN_PROGRESS',
    projectUrl: '',
    technologies: '',
    image: null
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage] = useState(6);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [filters, searchQuery, allProjects]);

  const fetchProjects = async () => {
    try {
      const response = await portfolioAPI.getAll();
      const projectsData = response.data.data;
      setAllProjects(projectsData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setMessage({ type: 'error', text: 'Failed to fetch projects' });
    }
  };

  const applyFiltersAndSearch = () => {
    let filtered = [...allProjects];

    if (searchQuery) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.id.toString().includes(searchQuery) ||
        (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(project => project.status === filters.status);
    }

    if (filters.technology) {
      filtered = filtered.filter(project =>
        project.technologies && 
        project.technologies.toLowerCase().includes(filters.technology.toLowerCase())
      );
    }

    setProjects(filtered);
    setCurrentPage(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setMessage({ type: 'error', text: 'Project title is required' });
      return;
    }

    const submitFormData = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] && key !== 'image') {
        submitFormData.append(key, formData[key]);
      }
    });
    
    if (formData.image) {
      submitFormData.append('image', formData.image);
    }

    try {
      if (editingProject) {
        await portfolioAPI.update(editingProject.id, submitFormData);
        setMessage({ type: 'success', text: 'Project updated successfully!' });
      } else {
        await portfolioAPI.create(submitFormData);
        setMessage({ type: 'success', text: 'Project created successfully!' });
      }
      setShowForm(false);
      setEditingProject(null);
      resetForm();
      fetchProjects();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Operation failed' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'IN_PROGRESS',
      projectUrl: '',
      technologies: '',
      image: null
    });
  };

  const handleEdit = (project) => {
    if (user?.role !== 'ADMIN' && user?.role !== 'EDITOR') {
      setMessage({ type: 'error', text: 'You do not have permission to edit projects' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }
    
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description || '',
      status: project.status,
      projectUrl: project.projectUrl || '',
      technologies: project.technologies || '',
      image: null
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (user?.role !== 'ADMIN') {
      setMessage({ type: 'error', text: 'Only admins can delete projects' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await portfolioAPI.delete(id);
        setMessage({ type: 'success', text: 'Project deleted successfully' });
        fetchProjects();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete project' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    }
  };

  const resetFilters = () => {
    setFilters({ status: 'all', technology: '' });
    setSearchQuery('');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      COMPLETED: { emoji: '✅', label: 'Completed', class: 'status-completed' },
      IN_PROGRESS: { emoji: '🚧', label: 'In Progress', class: 'status-in-progress' }
    };
    const config = statusConfig[status] || statusConfig.IN_PROGRESS;
    return (
      <span className={`status-badge ${config.class}`}>
        {config.emoji} {config.label}
      </span>
    );
  };

  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = projects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(projects.length / projectsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="portfolio container">
      <div className="page-header">
        <h1>💼 Portfolio Projects</h1>
        <p className="subtitle">Explore our completed and ongoing projects</p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.type === 'success' ? '✅' : '⚠️'} {message.text}
        </div>
      )}

      {isAdminOrEditor() && (
        <div className="action-buttons">
          <button
            className={`btn btn-primary ${showForm ? 'active' : ''}`}
            onClick={() => {
              setShowForm(!showForm);
              setEditingProject(null);
              resetForm();
            }}
          >
            {showForm ? '❌ Cancel' : '➕ Add New Project'}
          </button>
        </div>
      )}

      {showForm && isAdminOrEditor() && (
        <div className="form-card card">
          <h3>{editingProject ? '✏️ Edit Project' : '➕ Create New Project'}</h3>
          <p className="info-text">
            {user?.role === 'ADMIN' ? '👑 Admin privileges - Full control' : '✏️ Editor privileges - Can create and edit'}
          </p>
          <form onSubmit={handleSubmit} className="project-form">
            <div className="form-row">
              <div className="form-group">
                <label>📝 Project Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter project title"
                  required
                />
              </div>
              <div className="form-group">
                <label>🏷️ Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  required
                >
                  <option value="IN_PROGRESS">🚧 In Progress</option>
                  <option value="COMPLETED">✅ Completed</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>📄 Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the project..."
                rows="4"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>🔗 Project URL</label>
                <input
                  type="url"
                  value={formData.projectUrl}
                  onChange={(e) => setFormData({ ...formData, projectUrl: e.target.value })}
                  placeholder="https://project-demo.com"
                />
              </div>
              <div className="form-group">
                <label>💻 Technologies</label>
                <input
                  type="text"
                  value={formData.technologies}
                  onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                  placeholder="React, Node.js, MongoDB"
                />
              </div>
            </div>
            <div className="form-group">
              <label>🖼️ Project Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                className="file-input"
              />
              {formData.image && (
                <div className="file-info">Selected: {formData.image.name}</div>
              )}
            </div>
            <button type="submit" className="btn btn-success">
              {editingProject ? '💾 Update Project' : '✨ Create Project'}
            </button>
          </form>
        </div>
      )}

      <div className="filters-section card">
        <h3>🔍 Search & Filter Projects</h3>
        
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔎 Search by project name, ID, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters-grid">
          <div className="form-group">
            <label>🏷️ Filter by Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="all">All Projects</option>
              <option value="COMPLETED">✅ Completed</option>
              <option value="IN_PROGRESS">🚧 In Progress</option>
            </select>
          </div>
          <div className="form-group">
            <label>💻 Filter by Technology</label>
            <input
              type="text"
              placeholder="e.g., React, Python"
              value={filters.technology}
              onChange={(e) => setFilters({ ...filters, technology: e.target.value })}
            />
          </div>
          <div className="form-group filter-actions">
            <button className="btn btn-secondary" onClick={resetFilters}>
              🔄 Reset Filters
            </button>
          </div>
        </div>
      </div>

      <div className="results-summary">
        <p>
          📊 Showing <strong>{currentProjects.length}</strong> of <strong>{projects.length}</strong> projects
        </p>
      </div>

      {currentProjects.length === 0 ? (
        <div className="no-results card">
          <h3>📭 No Projects Found</h3>
          <p>Try adjusting your filters or search query</p>
        </div>
      ) : (
        <div className="projects-grid">
          {currentProjects.map((project) => (
            <div key={project.id} className="project-card card">
              {project.imagePath && (
                <div className="project-image">
                  <img src={`http://localhost:8080${project.imagePath}`} alt={project.title} />
                </div>
              )}
              
              <div className="card-header">
                <h3>{project.title}</h3>
                {getStatusBadge(project.status)}
              </div>

              <div className="card-body">
                <div className="info-row">
                  <span className="label">🆔 Project ID:</span>
                  <span className="value">#{project.id}</span>
                </div>
                
                {project.description && (
                  <div className="project-description">
                    <p>{project.description}</p>
                  </div>
                )}

                {project.technologies && (
                  <div className="technologies">
                    <span className="label">💻 Technologies:</span>
                    <div className="tech-tags">
                      {project.technologies.split(',').map((tech, index) => (
                        <span key={index} className="tech-tag">{tech.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="info-row">
                  <span className="label">👤 Created by:</span>
                  <span className="value">{project.createdBy?.name}</span>
                </div>
                <div className="info-row">
                  <span className="label">📅 Created:</span>
                  <span className="value">{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
                {project.updatedAt !== project.createdAt && (
                  <div className="info-row">
                    <span className="label">🔄 Updated:</span>
                    <span className="value">{new Date(project.updatedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="card-actions">
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowDetails(showDetails === project.id ? null : project.id)}
                >
                  {showDetails === project.id ? '👁️ Hide Details' : '👁️ View Details'}
                </button>
                {project.projectUrl && (
                  <a
                    href={project.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm"
                  >
                    🔗 Visit Project
                  </a>
                )}
                {isAdminOrEditor() && (
                  <button
                    className="btn btn-info btn-sm"
                    onClick={() => handleEdit(project)}
                  >
                    ✏️ Edit
                  </button>
                )}
                {user?.role === 'ADMIN' && (
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(project.id)}
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>

              {showDetails === project.id && (
                <div className="project-details">
                  <h4>📋 Project Details</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <strong>ID:</strong> #{project.id}
                    </div>
                    <div className="detail-item">
                      <strong>Status:</strong> {project.status.replace('_', ' ')}
                    </div>
                    <div className="detail-item">
                      <strong>Created by:</strong> {project.createdBy?.name}
                    </div>
                    <div className="detail-item">
                      <strong>Created at:</strong> {new Date(project.createdAt).toLocaleString()}
                    </div>
                    {project.updatedAt !== project.createdAt && (
                      <div className="detail-item">
                        <strong>Last updated:</strong> {new Date(project.updatedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

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
    </div>
  );
};

export default Portfolio;
