import React, { useState } from 'react';
import './WriteReview.css';
import { useReviews } from '../context/ReviewsContext';
import { useNavigate, Link } from 'react-router-dom';


const WriteReview = () => {
  const { addReview, isLoading } = useReviews();
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    name: '', 
    email: '',
    rating: 5, 
    text: '', 
    avatarUrl: '' 
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    setAvatarFile(file || null);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview('');
    }
  };

  const handleRatingClick = (rating) => {
    setForm((prev) => ({ ...prev, rating }));
  };

  const handleRatingHover = (rating) => {
    setHoverRating(rating);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const wordCount = form.text.split(/\s+/).filter(word => word.length > 0).length;
    
    if (!form.text.trim()) {
      setError('Please write your review before submitting.');
      return;
    }
    
    if (wordCount > 1000) {
      setError('Review should not exceed 1000 words.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await addReview({ 
        name: form.name, 
        email: form.email,
        rating: parseInt(form.rating), 
        text: form.text, 
        comment: form.text, // Send as both text and comment for compatibility
        avatar: preview, // Send the preview URL if no file is selected
        avatarFile: avatarFile // Send the actual file
      });
      
      // Reset form
      setForm({ name: '', email: '', rating: 5, text: '', avatarUrl: '' });
      setPreview('');
      setAvatarFile(null);
      
      // Show success message
      alert('Thank you for your review!.');
      navigate('/');
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="write-review-section" aria-label="Write a review">
      <div className="write-review-container">
        <div className="write-review-header">
          <h2>Share Your Experience</h2>
          <p className="subheading">Your feedback helps others make better decisions</p>
        </div>

        <form onSubmit={handleSubmit} className="review-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Your Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
                className="form-input"
              />
            </div>

            

            <div className="form-group">
              <label>Your Rating</label>
              <div className="rating-selector" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`rating-star ${(hoverRating || form.rating) >= star ? 'active' : ''}`}
                    onClick={() => handleRatingClick(star)}
                    onMouseEnter={() => handleRatingHover(star)}
                    onMouseLeave={() => handleRatingHover(0)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '2rem',
                      cursor: 'pointer',
                      padding: '0 2px',
                      WebkitTextFillColor: 'transparent',
                      WebkitTextStroke: '1.5px #ffc107',
                      position: 'relative',
                      display: 'inline-block',
                      lineHeight: '1',
                    }}
                    aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                  >
                    <span 
                      className="star-icon"
                      style={{
                        position: 'relative',
                        display: 'inline-block',
                      }}
                    >
                      <span 
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          width: (hoverRating || form.rating) >= star ? '100%' : '0%',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          color: '#ffc107',
                          WebkitTextFillColor: '#ffc107',
                          WebkitTextStroke: '1.5px #ffc107',
                          transition: 'width 0.2s ease-in-out',
                        }}
                      >
                        ★
                      </span>
                      <span style={{
                        WebkitTextFillColor: 'transparent',
                        WebkitTextStroke: '1.5px #e4e5e9',
                      }}>
                        ★
                      </span>
                    </span>
                  </button>
                ))}
                <div className="rating-text" style={{ marginLeft: '10px', fontWeight: 'bold', color: '#555' }}>
                  {form.rating === 5 ? 'Excellent' : 
                   form.rating === 4 ? 'Good' : 
                   form.rating === 3 ? 'Average' : 
                   form.rating === 2 ? 'Below Average' : 'Poor'}
                </div>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="text">Your Review</label>
            <textarea
              id="text"
              name="text"
              value={form.text}
              onChange={handleChange}
              rows="5"
              required
              placeholder="Share your detailed experience. What did you like? What could be improved?"
              className="form-textarea"
            />
            <div className="character-count">
              {form.text.split(/\s+/).filter(word => word.length > 0).length}/1000 words
              {form.text.split(/\s+/).filter(word => word.length > 0).length > 1000 && (
                <span className="error-message"> Maximum 1000 words allowed</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="avatar-label">Profile Image (Optional)</label>
            <div className="avatar-upload-container">
              <div className="avatar-preview">
                {preview || form.avatarUrl ? (
                  <img
                    src={preview || form.avatarUrl}
                    alt="Preview"
                    className="avatar-preview-image"
                  />
                ) : (
                  <div className="avatar-placeholder">
                    <span className="placeholder-icon">👤</span>
                  </div>
                )}
              </div>
              
              <div className="avatar-upload-options">
                <div className="upload-option">
                  <label htmlFor="avatarFile" className="file-upload-label">
                    <span className="upload-icon">📁</span>
                    Upload Photo
                  </label>
                  <input
                    type="file"
                    id="avatarFile"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file-input"
                  />
                </div>
                
                
                
                
              </div>
            </div>
          </div>

          <div className="form-actions">
            <Link to="/" className="cancel-button">
              Cancel
            </Link>
            {error && (
              <div className="error-message" style={{ color: '#e74c3c', margin: '10px 0', textAlign: 'center', width: '100%' }}>
                {error}
              </div>
            )}
          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting || isLoading}
            style={{
              backgroundColor: 'rgb(34 54 84)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: isSubmitting || isLoading ? 'not-allowed' : 'pointer',
              opacity: isSubmitting || isLoading ? 0.7 : 1,
              transition: 'background-color 0.3s',
              width: '100%',
              maxWidth: '300px',
              margin: '20px auto',
              display: 'block'
            }}
          >
            {isSubmitting || isLoading ? (
              <>
                <span className="spinner"></span>
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default WriteReview;