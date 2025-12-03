import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Admin.css';
import { useReviews } from '../context/ReviewsContext';



const AdminDashboard = () => {
  const { reviews, deleteReview, addAchievement } = useReviews();
  const [achievers, setAchievers] = useState([]);
  const [questions, setQuestions] = useState([]);
  // view can be 'reviews' | 'upload' | 'manage' | 'questions' | 'add-question'
  const [view, setView] = useState('reviews');
  const [filteredReviews, setFilteredReviews] = useState(reviews);
  const [filters, setFilters] = useState({
    rating: 'all',
    search: '',
    sort: 'newest'
  });
  const [achievementForm, setAchievementForm] = useState({
    image: null,
    preview: ''
  });
  const [showAchievementForm, setShowAchievementForm] = useState(false);
  const [notification, setNotification] = useState('');
  const [questionForm, setQuestionForm] = useState({
    question: '',
    options: [
      { id: 'a', text: '' },
      { id: 'b', text: '' },
      { id: 'c', text: '' },
      { id: 'd', text: '' }
    ],
    correctAnswer: 'a'
  });
  const [editingQuestion, setEditingQuestion] = useState(null);

  // Fetch questions from API
  const fetchQuestions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/questions');
      if (response.data.success) {
        setQuestions(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Apply filters whenever reviews or filters change
  useEffect(() => {
    let result = [...reviews];

    if (filters.rating !== 'all') {
      result = result.filter(review => review.rating === parseInt(filters.rating));
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(review =>
        review.name.toLowerCase().includes(searchTerm) ||
        review.text.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.sort === 'newest') {
      result.sort((a, b) => b.id - a.id);
    } else if (filters.sort === 'oldest') {
      result.sort((a, b) => a.id - b.id);
    } else if (filters.sort === 'highest') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (filters.sort === 'lowest') {
      result.sort((a, b) => a.rating - b.rating);
    }

    setFilteredReviews(result);
  }, [reviews, filters]);

  // Load achievers list for admin management
  useEffect(() => {
    const loadAchievers = async () => {
      try {
        const res = await axios.get("https://portfolio-x0gj.onrender.com/api/achievers");
        setAchievers(res.data || []);
      } catch (e) {
        console.error('Failed to load achievers for admin', e);
      }
    };
    loadAchievers();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeleteAchiever = async (id) => {
    if (!window.confirm('Delete this achiever image?')) return;
    try {
      await axios.delete(`${"https://portfolio-x0gj.onrender.com/api/achievers"}/${id}`);
      setAchievers((prev) => prev.filter((a) => a._id !== id));
      showNotification('Achievement deleted');
    } catch (e) {
      console.error('Delete failed', e);
      alert('Failed to delete');
    }
  };

  const handleReplaceImage = async (id, file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    try {
      const res = await axios.patch(`${"https://portfolio-x0gj.onrender.com/api/achievers"}/${id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAchievers((prev) => prev.map((a) => (a._id === id ? res.data : a)));
      showNotification('Image updated');
    } catch (e) {
      console.error('Update failed', e);
      alert('Failed to update image');
    }
  };

  const handleDeleteReview = async (id, event) => {
    // Prevent any default behavior and stop event propagation
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      event.nativeEvent?.stopImmediatePropagation?.();
    }
    
    if (!id) {
      console.error('No review ID provided for deletion');
      setNotification({
        type: 'error',
        message: 'Error: No review ID provided',
      });
      return false;
    }

    if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return false;
    }

    try {
      setNotification({
        type: 'info',
        message: 'Deleting review...',
        loading: true
      });

      // Make the delete request
      const result = await deleteReview(id);
      
      if (result && result.success) {
        // Update local state
        setFilteredReviews(prevReviews => 
          prevReviews.filter(review => review._id !== id && review.id !== id)
        );
      
        setNotification({
          type: 'success',
          message: 'Review deleted successfully',
          loading: false
        });
      
        // Optional: Refresh the list from server (aap chahe to ye hata bhi sakte ho)
        try {
          const response = await axios.get('https://portfolio-x0gj.onrender.com/api/reviews/admin', { 
            withCredentials: true 
          });
          setFilteredReviews(response.data);
        } catch (refreshError) {
          console.error('Error refreshing reviews:', refreshError);
        }
      
        // 🔴 Add this line for hard refresh
        window.location.reload();
      
        return true;
      }
       else {
        throw new Error(result?.message || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Failed to delete review:', error);
      
      // Refresh reviews from server to sync state
      try {
        const response = await axios.get('https://portfolio-x0gj.onrender.com/api/reviews/admin', { 
          withCredentials: true 
        });
        setFilteredReviews(response.data);
      } catch (refreshError) {
        console.error('Error refreshing reviews:', refreshError);
      }
      
      setNotification({
        type: 'error',
        message: error.message || 'Failed to delete review. Please try again.',
        loading: false
      });
      
      return false;
    }
  };

  const handleAchievementChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'image' && files && files[0]) {
      const file = files[0];
      const previewUrl = URL.createObjectURL(file);
      setAchievementForm(prev => ({
        ...prev,
        image: file,
        preview: previewUrl
      }));
    } else {
      setAchievementForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAchievementSubmit = async (e) => {
    e.preventDefault();

    if (!achievementForm.image) {
      alert('Please select an image to upload');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', achievementForm.image);

      await axios.post('https://portfolio-x0gj.onrender.com/api/achievers', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: false
      });

      // Optional local UI add
      addAchievement({ id: Date.now(), image: achievementForm.preview });

      // Refresh achievers list
      try {
        const res = await axios.get('https://portfolio-x0gj.onrender.com/api/achievers');
        setAchievers(res.data || []);
      } catch {}

      setAchievementForm({ image: null, preview: '' });
      setShowAchievementForm(false);
      showNotification('Achievement uploaded successfully');
    } catch (err) {
      console.error('Upload failed', err);
      alert('Failed to upload achievement');
    }
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  // Question management functions
  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingQuestion) {
        // Update existing question
        await axios.put(`http://localhost:5000/api/questions/${editingQuestion._id}`, questionForm);
        showNotification('Question updated successfully');
      } else {
        // Add new question
        await axios.post('http://localhost:5000/api/questions', questionForm);
        showNotification('Question added successfully');
      }
      
      // Reset form and fetch questions
      setQuestionForm({
        question: '',
        options: [
          { id: 'a', text: '' },
          { id: 'b', text: '' },
          { id: 'c', text: '' },
          { id: 'd', text: '' }
        ],
        correctAnswer: 'a'
      });
      setEditingQuestion(null);
      fetchQuestions();
      setView('questions');
    } catch (error) {
      console.error('Error saving question:', error);
      alert('Failed to save question');
    }
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setQuestionForm({
      question: question.question,
      options: question.options,
      correctAnswer: question.correctAnswer
    });
    setView('add-question');
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/questions/${id}`);
      showNotification('Question deleted successfully');
      fetchQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Failed to delete question');
    }
  };

  const handleQuestionChange = (e, field, optionIndex = null) => {
    if (field === 'options') {
      const newOptions = [...questionForm.options];
      newOptions[optionIndex].text = e.target.value;
      setQuestionForm(prev => ({ ...prev, options: newOptions }));
    } else {
      setQuestionForm(prev => ({ ...prev, [field]: e.target.value }));
    }
  };

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <span key={i} className={i < rating ? "star filled" : "star"}>★</span>
    ));
  };

  return (
    <div className="admin-dashboard">
      {notification && (
        <div className="notification">
          {notification}
        </div>
      )}

      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage reviews and achievements</p>
      </header>

      <div className="admin-content">
        <div className="admin-sidebar">
          <h3>Quick Actions</h3>
          <button
            className={`sidebar-btn ${view === 'reviews' ? 'active' : ''}`}
            onClick={() => {
              setView('reviews');
            }}
            style={{ marginBottom: '8px' }}
          >
            View Reviews
          </button>
          <button
            className={`sidebar-btn ${view === 'upload' ? 'active' : ''}`}
            onClick={() => {
              setShowAchievementForm(true);
              setView('upload');
            }}
            style={{ marginBottom: '8px' }}
          >
            Add Achievement
          </button>
          <button
            className={`sidebar-btn ${view === 'manage' ? 'active' : ''}`}
            onClick={() => {
              setShowAchievementForm(false);
              setView('manage');
            }}
          >
            Manage Achievements
          </button>
          <button
            className={`sidebar-btn ${view === 'questions' ? 'active' : ''}`}
            onClick={() => {
              setView('questions');
            }}
          >
            Manage Questions
          </button>
          <button
            className={`sidebar-btn ${view === 'add-question' ? 'active' : ''}`}
            onClick={() => {
              setEditingQuestion(null);
              setQuestionForm({
                question: '',
                options: [
                  { id: 'a', text: '' },
                  { id: 'b', text: '' },
                  { id: 'c', text: '' },
                  { id: 'd', text: '' }
                ],
                correctAnswer: 'a'
              });
              setView('add-question');
            }}
          >
            Add Question
          </button>

          <div className="stats">
            <h3>Statistics</h3>
            <div className="stat-item">
              <span className="stat-value">{reviews.length}</span>
              <span className="stat-label">Total Reviews</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {reviews.filter(r => r.rating === 5).length}
              </span>
              <span className="stat-label">5-Star Reviews</span>
            </div>
          </div>
        </div>

        <div className="admin-main">
          {view === 'upload' ? (
            <div className="achievement-form-section">
              <h2>Add New Achievement</h2>
              <form onSubmit={handleAchievementSubmit} className="achievement-form">
                {/* Name and Score removed as per new requirement (image-only upload) */}

                <div className="form-group">
                  <label htmlFor="image">Achievement Photo</label>
                  <div className="image-upload-container">
                    <input
                      type="file"
                      id="image"
                      name="image"
                      accept="image/*"
                      onChange={handleAchievementChange}
                      required
                    />
                    {achievementForm.preview && (
                      <div className="image-preview">
                        <img src={achievementForm.preview} alt="Preview" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary">Upload Achievement</button>
                </div>
              </form>
            </div>
          ) : view === 'reviews' ? (
            <>
              <div className="filters-section">
                <h2>Manage Reviews</h2>

                <div className="filters">
                  <div className="filter-group">
                    <label htmlFor="rating">Filter by Rating</label>
                    <select
                      id="rating"
                      name="rating"
                      value={filters.rating}
                      onChange={handleFilterChange}
                    >
                      <option value="all">All Ratings</option>
                      <option value="5">5 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="2">2 Stars</option>
                      <option value="1">1 Star</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label htmlFor="sort">Sort By</label>
                    <select
                      id="sort"
                      name="sort"
                      value={filters.sort}
                      onChange={handleFilterChange}
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="highest">Highest Rated</option>
                      <option value="lowest">Lowest Rated</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label htmlFor="search">Search</label>
                    <input
                      type="text"
                      id="search"
                      name="search"
                      value={filters.search}
                      onChange={handleFilterChange}
                      placeholder="Search by name or content"
                    />
                  </div>
                </div>
              </div>

              <div className="reviews-list">
                <div className="results-count">
                  Showing {filteredReviews.length} of {reviews.length} reviews
                </div>

                {filteredReviews.length === 0 ? (
                  <div className="no-results">
                    <p>No reviews match your filters</p>
                  </div>
                ) : (
                  filteredReviews.map((review, i) => (
                    <div key={review._id || review.id || `rev-${i}`} className="admin-review-card">
                      <div className="review-content">
                        <p>"{review.comment || review.text || 'No comment provided'}"</p>
                      </div>

                      <div className="review-meta">
                        <div className="rating">{renderStars(review.rating)}</div>
                        <div className="reviewer-info">
                          {review.avatar && (
                            <img
                              src={review.avatar}
                              alt={review.name}
                              className="avatar"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                          <span className="reviewer-name">{review.name || 'Anonymous'}</span>
                        </div>
                        <div className="review-date">
                          ID: #{review._id || review.id || 'N/A'}
                        </div>
                      </div>

                      <div className="review-actions">
                        <button
                          type="button"
                          className="btn-delete"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteReview(review._id || review.id, e);
                          }}
                          disabled={!(review._id || review.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : view === 'questions' ? (
            <div className="questions-admin">
              <h2>Manage Questions</h2>
              {questions.length === 0 ? (
                <div className="no-results">
                  <p>No questions added yet</p>
                  <button 
                    className="btn-primary" 
                    onClick={() => setView('add-question')}
                    style={{ marginTop: '1rem' }}
                  >
                    Add First Question
                  </button>
                </div>
              ) : (
                <div className="questions-list">
                  {questions.map((q, index) => (
                    <div key={q._id} className="question-card">
                      <div className="question-header">
                        <span className="question-number">Q{index + 1}</span>
                        <div className="question-actions">
                          <button 
                            className="btn-secondary" 
                            onClick={() => handleEditQuestion(q)}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn-delete" 
                            onClick={() => handleDeleteQuestion(q._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="question-content">
                        <p className="question-text">{q.question}</p>
                        <div className="options-list">
                          {q.options.map((opt) => (
                            <div 
                              key={opt.id} 
                              className={`option-item ${opt.id === q.correctAnswer ? 'correct-answer' : ''}`}
                            >
                              <span className="option-label">{opt.id.toUpperCase()}.</span>
                              <span className="option-text">{opt.text}</span>
                              {opt.id === q.correctAnswer && (
                                <span className="correct-badge">✓</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : view === 'add-question' ? (
            <div className="question-form-section">
              <h2>{editingQuestion ? 'Edit Question' : 'Add New Question'}</h2>
              <form onSubmit={handleQuestionSubmit} className="question-form">
                <div className="form-group">
                  <label htmlFor="question">Question</label>
                  <textarea
                    id="question"
                    value={questionForm.question}
                    onChange={(e) => handleQuestionChange(e, 'question')}
                    placeholder="Enter your question here..."
                    required
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label>Options</label>
                  {questionForm.options.map((option, index) => (
                    <div key={option.id} className="option-input-group">
                      <span className="option-label">{option.id.toUpperCase()}.</span>
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => handleQuestionChange(e, 'options', index)}
                        placeholder={`Option ${option.id.toUpperCase()}`}
                        required
                      />
                    </div>
                  ))}
                </div>

                <div className="form-group">
                  <label htmlFor="correctAnswer">Correct Answer</label>
                  <select
                    id="correctAnswer"
                    value={questionForm.correctAnswer}
                    onChange={(e) => handleQuestionChange(e, 'correctAnswer')}
                  >
                    <option value="a">Option A</option>
                    <option value="b">Option B</option>
                    <option value="c">Option C</option>
                    <option value="d">Option D</option>
                  </select>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setView('questions')}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingQuestion ? 'Update Question' : 'Add Question'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="achievers-admin">
              <h2>Manage Achievements</h2>
              {achievers.length === 0 ? (
                <div className="no-results"><p>No achievements uploaded yet</p></div>
              ) : (
                <div className="achievers-admin-grid">
                  {achievers.map((a) => (
                    <div className="achiever-admin-card" key={a._id}>
                      <img src={a.image} alt={a.name || 'achievement'} className="achiever-thumb" />
                      <div className="achiever-actions">
                        <label className="btn-secondary" style={{cursor:'pointer'}}>
                          Replace Image
                          <input type="file" accept="image/*" style={{display:'none'}} onChange={(e)=>handleReplaceImage(a._id, e.target.files?.[0])} />
                        </label>
                        <button className="btn-delete" onClick={()=>handleDeleteAchiever(a._id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;