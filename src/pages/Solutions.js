import React, { useState, useEffect } from 'react';
import { solutionAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import './Solutions.css';

const Solutions = () => {
  const { isAdminOrEditor } = useAuth();
  const [solutions, setSolutions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    question: '',
    videoUrl: '',
    platform: 'YOUTUBE',
    thumbnail: null
  });

  useEffect(() => {
    fetchSolutions();
  }, []);

  const fetchSolutions = async () => {
    try {
      const response = await solutionAPI.getAll();
      setSolutions(response.data.data);
    } catch (error) {
      console.error('Error fetching solutions:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitFormData = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) {
        submitFormData.append(key, formData[key]);
      }
    });

    try {
      await solutionAPI.create(submitFormData);
      setShowForm(false);
      setFormData({ title: '', description: '', question: '', videoUrl: '', platform: 'YOUTUBE', thumbnail: null });
      fetchSolutions();
    } catch (error) {
      console.error('Error creating solution:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this solution?')) {
      try {
        await solutionAPI.delete(id);
        fetchSolutions();
      } catch (error) {
        console.error('Error deleting solution:', error);
      }
    }
  };

  const handleFilter = async () => {
    if (filter) {
      try {
        const response = await solutionAPI.filter(filter);
        setSolutions(response.data.data);
      } catch (error) {
        console.error('Error filtering:', error);
      }
    } else {
      fetchSolutions();
    }
  };

  return (
    <div className="solutions container">
      <h1>Solutions</h1>

      {isAdminOrEditor() && (
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add Solution'}
        </button>
      )}

      {showForm && isAdminOrEditor() && (
        <div className="card">
          <h3>Add New Solution</h3>
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
              <label>Question</label>
              <textarea
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Video URL</label>
              <input
                type="url"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Platform</label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              >
                <option value="YOUTUBE">YouTube</option>
                <option value="INSTAGRAM">Instagram</option>
                <option value="BOTH">Both</option>
              </select>
            </div>
            <div className="form-group">
              <label>Thumbnail</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, thumbnail: e.target.files[0] })}
              />
            </div>
            <button type="submit" className="btn btn-success">Create</button>
          </form>
        </div>
      )}

      <div className="filters card">
        <h3>Filter by Platform</h3>
        <div className="filter-row">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All</option>
            <option value="YOUTUBE">YouTube</option>
            <option value="INSTAGRAM">Instagram</option>
            <option value="BOTH">Both</option>
          </select>
          <button className="btn btn-primary" onClick={handleFilter}>Apply Filter</button>
        </div>
      </div>

      <div className="grid">
        {solutions.map((solution) => (
          <div key={solution.id} className="card solution-card">
            {solution.thumbnailPath && (
              <img src={`http://localhost:8080${solution.thumbnailPath}`} alt={solution.title} />
            )}
            <h3>{solution.title}</h3>
            <p className="solution-question"><strong>Question:</strong> {solution.question}</p>
            <p>{solution.description}</p>
            <p><strong>Platform:</strong> <span className="platform">{solution.platform}</span></p>
            <a href={solution.videoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              Watch Video
            </a>
            {isAdminOrEditor() && (
              <button className="btn btn-danger" onClick={() => handleDelete(solution.id)}>Delete</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Solutions;
