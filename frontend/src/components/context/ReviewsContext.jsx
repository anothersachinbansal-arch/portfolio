import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';



const ReviewsContext = createContext(null);

export const ReviewsProvider = ({ children }) => {
  const [reviews, setReviews] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch reviews from backend on component mount
  const fetchReviews = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get("https://portfolio-x0gj.onrender.com/api/reviews", {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.data && Array.isArray(response.data)) {
        // The backend already sorts by createdAt: -1, but we'll sort again to be sure
        const sortedReviews = [...response.data].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setReviews(sortedReviews);
      } else {
        console.error('Unexpected response format:', response.data);
        setError('Received unexpected data format from server');
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const addReview = async ({ name, rating, text, comment, email, avatar, avatarFile }) => {
    try {
      const formData = new FormData();
      
      // Add text fields to form data
      formData.append('name', name?.trim() || 'Anonymous');
      formData.append('email', email || 'anonymous@example.com');
      formData.append('rating', parseInt(rating) || 5);
      formData.append('comment', (comment || text || '').trim());
      formData.append('status', 'pending');
      
      // Add file if provided
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      } else if (avatar && avatar.trim()) {
        // If avatar is a URL (from preview)
        formData.append('avatar', avatar.trim());
      }


      const response = await axios.post("https://portfolio-x0gj.onrender.com/api/reviews", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Update local state with the new review
      setReviews(prev => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      console.error('Error adding review:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || 'Failed to submit review. Please try again.');
    }
  };

  const deleteReview = async (id) => {
    if (!id) {
      console.error('No review ID provided for deletion');
      throw new Error('Invalid review ID');
    }
    
    try {

      const response = await axios.delete(`${"https://portfolio-x0gj.onrender.com/api/reviews"}/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        validateStatus: (status) => status < 500, // Don't throw for 4xx errors
      });
      

      
      if (response.data.success === false) {
        throw new Error(response.data.message || 'Failed to delete review');
      }
      
      // Update local state by removing the deleted review
      setReviews(prev => prev.filter(review => 
        review._id !== id && review.id !== id
      ));
      
      return response.data;
    } catch (error) {
      console.error('Error in deleteReview:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // If review not found or already deleted, still remove it from local state
      if (error.response?.status === 404 || error.message.includes('not found')) {
        setReviews(prev => prev.filter(review => 
          review._id !== id && review.id !== id
        ));
      }
      
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to delete review. Please try again.'
      );
    }
  };

  const addAchievement = (achievement) => {
    setAchievements(prev => [achievement, ...prev]);
  };

  return (
    <ReviewsContext.Provider value={{ 
      reviews, 
      addReview, 
      deleteReview, 
      addAchievement, 
      achievements, 
      isLoading, 
      error 
    }}>
      {children}
    </ReviewsContext.Provider>
  );
};

export const useReviews = () => {
  const ctx = useContext(ReviewsContext);
  if (!ctx) throw new Error('useReviews must be used within ReviewsProvider');
  return ctx;
};
