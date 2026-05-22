// Centralized API Service for JWT Authentication

const API_BASE_URL = 'https://portfolio-x0gj.onrender.com/api';

// Get JWT token from localStorage
const getToken = () => {
  return localStorage.getItem('adminToken');
};

// Check if user is authenticated
const isAuthenticated = () => {
  return !!getToken();
};

// Centralized API request function
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  
  // Default headers
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Add Authorization header if token exists
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Merge with provided headers
  const headers = {
    ...defaultHeaders,
    ...options.headers,
  };

  // Create request config
  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Handle 401 Unauthorized responses
    if (response.status === 401) {
      // Clear invalid token
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminInfo');
      
      // Redirect to login page (if not already there)
      if (window.location.pathname !== '/admin') {
        window.location.href = '/admin';
      }
      
      throw new Error('Session expired. Please login again.');
    }

    // Handle other HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// Specific API methods for admin operations
export const adminAPI = {
  // Authentication
  login: async (email, password) => {
    const response = await apiRequest('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Store token on successful login
    if (response.success && response.token) {
      localStorage.setItem('adminToken', response.token);
      localStorage.setItem('adminInfo', JSON.stringify(response.admin));
    }
    
    return response;
  },

  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    window.location.href = '/admin';
  },

  // Books CRUD operations
  getBooks: async () => {
    return await apiRequest('/books/admin/all');
  },

  addBook: async (bookData) => {
    // For FormData (file uploads), don't set Content-Type header
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/books/admin/add`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: bookData, // FormData object
    });
    
    if (response.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminInfo');
      window.location.href = '/admin';
      throw new Error('Session expired. Please login again.');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  },

  updateBook: async (bookId, bookData) => {
    // For FormData (file uploads), don't set Content-Type header
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/books/admin/update/${bookId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: bookData, // FormData object
    });
    
    if (response.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminInfo');
      window.location.href = '/admin';
      throw new Error('Session expired. Please login again.');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  },

  deleteBook: async (bookId) => {
    return await apiRequest(`/books/admin/delete/${bookId}`, {
      method: 'DELETE',
    });
  },

  toggleAvailability: async (bookId) => {
    return await apiRequest(`/books/admin/toggle-availability/${bookId}`, {
      method: 'PUT',
    });
  },

  updateQuantity: async (bookId, quantity) => {
    return await apiRequest(`/books/admin/update-quantity/${bookId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },

  // Orders management
  getOrders: async () => {
    return await apiRequest('/admin/purchased-books');
  },

  markDelivered: async (paymentId) => {
    return await apiRequest(`/admin/mark-delivered/${paymentId}`, {
      method: 'PUT',
    });
  },

  addAdminNote: async (paymentId, note) => {
    return await apiRequest(`/admin/add-note/${paymentId}`, {
      method: 'POST',
      body: JSON.stringify({ text: note }),
    });
  },

  deleteAdminNote: async (paymentId, noteId) => {
    return await apiRequest(`/admin/delete-note/${paymentId}/${noteId}`, {
      method: 'DELETE',
    });
  },

  // Other admin operations
  getQuestions: async () => {
    return await apiRequest('/questions');
  },

  addQuestion: async (questionData) => {
    return await apiRequest('/questions', {
      method: 'POST',
      body: JSON.stringify(questionData),
    });
  },

  updateQuestion: async (questionId, questionData) => {
    return await apiRequest(`/questions/${questionId}`, {
      method: 'PUT',
      body: JSON.stringify(questionData),
    });
  },

  deleteQuestion: async (questionId) => {
    return await apiRequest(`/questions/${questionId}`, {
      method: 'DELETE',
    });
  },

  getYoutubeVideos: async () => {
    return await apiRequest('/youtube-videos');
  },

  addYoutubeVideo: async (videoData) => {
    return await apiRequest('/youtube-videos', {
      method: 'POST',
      body: JSON.stringify(videoData),
    });
  },

  deleteYoutubeVideo: async (videoId) => {
    return await apiRequest(`/youtube-videos/${videoId}`, {
      method: 'DELETE',
    });
  },
};

// Export utility functions
export { isAuthenticated, getToken };

export default adminAPI;
