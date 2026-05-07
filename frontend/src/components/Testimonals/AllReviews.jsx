import React from 'react';
import './Testimonials.css';
import { useReviews } from '../context/ReviewsContext';
import { Link } from 'react-router-dom';

const AllReviews = () => {
  const { reviews } = useReviews();

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <span key={i} className={i < rating ? "star filled" : "star"}>★</span>
    ));
  };

  return (
    <section className="testimonials-section" aria-label="All reviews">
      <div className="container">
        <h2>All Reviews</h2>
        <p className="subheading">Read what our students say about us</p>

        <div className="testimonials-grid">
          {reviews.map((review) => (
            <div key={review.id} className="testimonial-card">
              <div className="testimonial-content">
                <p>"{review.comment || review.text || 'No review text available'}"</p>
              </div>
              <div className="rating">{renderStars(review.rating)}</div>
              <div className="testimonial-author">
                {review.avatar ? (
                  <img
                    src={review.avatar}
                    alt={review.name || 'User'}
                    className="avatar"
                    width="50"
                    height="50"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.name || 'User')}&background=random`;
                    }}
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {(review.name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="author-name">{review.name || 'Anonymous'}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="actions">
          <Link to="/writereview" className="review-button">Write a review</Link>
          <Link to="/" className="link-button">Back to home</Link>
        </div>
      </div>
    </section>
  );
};

export default AllReviews;
