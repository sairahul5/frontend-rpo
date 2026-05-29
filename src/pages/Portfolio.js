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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.id.toString().includes(searchQuery) ||
        (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(project => project.status === filters.status);
    }

    // Apply technology filter
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
    
    // Validation
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

  // Pagination
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = projects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(projects.length / projectsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="portfolio container">
      <h1>Portfolio</h1>

      {isAdminOrEditor() && (
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(!showForm);
            setEditingProject(null);
            setFormData({ title: '', description: '', status: 'IN_PROGRESS', projectUrl: '', technologies: '', image: null });
          }}
        >
          {showForm ? 'Cancel' : 'Add Project'}
        </button>
      )}

      {showForm && isAdminOrEditor() && (
        <div className="card">
          <h3>{editingProject ? 'Edit Project' : 'Add New Project'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div className="form-group">
              <label>Project URL</label>
              <input
                type="url"
                value={formData.projectUrl}
                onChange={(e) => setFormData({ ...formData, projectUrl: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Technologies</label>
              <input
                type="text"
                value={formData.technologies}
                onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                placeholder="React, Node.js, MongoDB"
              />
            </div>
            <div className="form-group">
              <label>Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
              />
            </div>
            <button type="submit" className="btn btn-success">
              {editingProject ? 'Update' : 'Create'}
            </button>
          </form>
        </div>
      )}

      <div className="filters card">
        <h3>Filters</h3>
        <div className="filter-row">
          <input
            type="text"
            placeholder="Search by title, ID, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <select 
            value={filters.status} 
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="all">All Status</option>
            <option value="COMPLETED">Completed</option>
            <option value="IN_PROGRESS">In Progress</option>
          </select>
          <input
            type="text"
            placeholder="Filter by technology..."
            value={filters.technology}
            onChange={(e) => setFilters({ ...filters, technology: e.target.value })}
          />
          <button className="btn btn-secondary" onClick={resetFilters}>Reset Filters</button>
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="grid">
        {currentProjects.map((project) => (
          <div key={project.id} className="card project-card">
            {project.imagePath && (
              <img src={`http://localhost:8080${project.imagePath}`} alt={project.title} />
            )}
            <h3>{project.title}</h3>
            <p className="project-description">{project.description}</p>
            <p><strong>Status:</strong> {getStatusBadge(project.status)}</p>
            {project.technologies && (
              <p><strong>Technologies:</strong> {project.technologies}</p>
            )}
            {project.projectUrl && (
              <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                View Project
              </a>
            )}
            {isAdminOrEditor() && (
              <div className="project-actions">
                <button className="btn btn-secondary" onClick={() => handleEdit(project)}>Edit</button>
                {user?.role === 'ADMIN' && (
                  <button className="btn btn-danger" onClick={() => handleDelete(project.id)}>Delete</button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="btn btn-secondary"
          >
            Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button 
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="btn btn-secondary"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
