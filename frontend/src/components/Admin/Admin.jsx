import React, { useState, useEffect, useRef } from 'react';

import axios from 'axios';

import './Admin.css';
import './AdminOrders.css';

import { useReviews } from '../context/ReviewsContext';







const AdminDashboard = () => {

  const { reviews, deleteReview, addAchievement } = useReviews();

  const [achievers, setAchievers] = useState([]);

  const [questions, setQuestions] = useState([]);

  const [youtubeVideos, setYoutubeVideos] = useState([]);

  // Books Management State
  const [books, setBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [bookError, setBookError] = useState('');
  
  // Book Form State
  const [bookForm, setBookForm] = useState({
    bookId: '',
    title: '',
    description: '',
    price: '',
    imageUrl: '',
    image: null,
    quantity: '',
    category: '',
    classLevel: '',
    author: '',
    pages: '',
    language: '',
    isAvailable: true
  });
  const [editingBookId, setEditingBookId] = useState(null);

  // Orders Management State
  const [orders, setOrders] = useState([]);
  const [orderTab, setOrderTab] = useState('success');
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderNotes, setOrderNotes] = useState({});
  const [showNoteForm, setShowNoteForm] = useState(null);
  const [newNote, setNewNote] = useState('');

  // view can be 'reviews' | 'upload' | 'manage' | 'questions' | 'add-question' | 'youtube' | 'add-youtube' | 'orders' | 'books' | 'add-book' | 'edit-book'

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

  const [youtubeForm, setYoutubeForm] = useState({

    url: '',

    title: ''

  });

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

      const response = await axios.get('https://portfolio-x0gj.onrender.com/api/questions');

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



  // Fetch YouTube videos from API

  const fetchYoutubeVideos = async () => {

    try {

      const response = await axios.get('https://portfolio-x0gj.onrender.com/api/youtube-videos');

      if (response.data.success) {

        setYoutubeVideos(response.data.data);

      }

    } catch (error) {

      console.error('Error fetching YouTube videos:', error);

    }

  };



  useEffect(() => {

    fetchYoutubeVideos();

  }, []);

  // Fetch Books from API
  const fetchBooks = async () => {
    setLoadingBooks(true);
    setBookError('');
    try {
      const response = await fetch('https://portfolio-x0gj.onrender.com/api/books/admin/all');
      const data = await response.json();
      if (data.success) {
        setBooks(data.books || []);
      } else {
        setBookError('Failed to fetch books');
      }
    } catch (err) {
      console.error('Error fetching books:', err);
      setBookError('Error connecting to server');
    } finally {
      setLoadingBooks(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);



  // Fetch Orders from API usl
  const fetchOrders = async () => {
    setLoadingOrders(true);
    setOrderError('');
    try {
      const response = await fetch(`https://portfolio-x0gj.onrender.com/api/admin/purchased-books`);
      const data = await response.json();
      if (data.success) {
        setOrders(data.payments || []);
      } else {
        setOrderError('Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setOrderError('Error connecting to server');
    } finally {
      setLoadingOrders(false);
    }
  };

  // Mark Order as Delivered
  const markAsDelivered = async (paymentId) => {
    try {
      const response = await fetch(`https://portfolio-x0gj.onrender.com/api/admin/mark-delivered/${paymentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.success) {
        setOrders(orders.map(order => 
          order.id === paymentId ? { ...order, delivered: true, deliveredAt: data.deliveredAt } : order
        ));
        alert('Order marked as delivered!');
      } else {
        alert('Failed to mark as delivered');
      }
    } catch (err) {
      alert('Error marking as delivered');
    }
  };

  // Add Note to Order
  const addNoteToOrder = async (paymentId) => {
    if (!newNote.trim()) {
      alert('Please enter a note');
      return;
    }
    
    try {
      const response = await fetch(`https://portfolio-x0gj.onrender.com/api/admin/add-note/${paymentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: newNote.trim()
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update local state with the new note
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === paymentId 
              ? { ...order, adminNotes: [...(order.adminNotes || []), data.note] }
              : order
          )
        );
        
        setNewNote('');
        setShowNoteForm(null);
        
        // Show success message
        console.log('Note added successfully:', data.note);
      } else {
        alert('Failed to add note: ' + data.message);
      }
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Error adding note');
    }
  };

  // Delete Note
  const deleteNote = async (paymentId, noteId) => {
    try {
      const response = await fetch(`https://portfolio-x0gj.onrender.com/api/admin/delete-note/${paymentId}/${noteId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update local state to remove the note
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === paymentId 
              ? { ...order, adminNotes: order.adminNotes.filter(note => note.id !== noteId) }
              : order
          )
        );
        
        console.log('Note deleted successfully');
      } else {
        alert('Failed to delete note: ' + data.message);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Error deleting note');
    }
  };

  // Filter orders by tab
  const filteredOrders = orders.filter(order => {
    if (orderTab === 'success') return order.status === 'success';
    if (orderTab === 'failed') return order.status === 'failed';
    if (orderTab === 'pending') return order.status === 'pending';
    return true;
  });

  // Get counts
  const successCount = orders.filter(o => o.status === 'success').length;
  const failedCount = orders.filter(o => o.status === 'failed').length;
  const pendingCount = orders.filter(o => o.status === 'pending').length;

  // Book Management Functions
  const updateBookQuantity = async (bookId, action, quantity) => {
    try {
      const response = await fetch(`https://portfolio-x0gj.onrender.com/api/books/admin/update-quantity/${bookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, quantity })
      });
      const data = await response.json();
      if (data.success) {
        fetchBooks(); // Refresh books list
      } else {
        alert('Failed to update book quantity');
      }
    } catch (err) {
      alert('Error updating book quantity');
    }
  };

  const toggleBookAvailability = async (bookId) => {
    try {
      console.log(`🔄 Toggling availability for book: ${bookId}`);
      const response = await fetch(`https://portfolio-x0gj.onrender.com/api/books/admin/toggle-availability/${bookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      console.log('📊 Toggle availability response:', data);
      
      if (data.success) {
        alert(`Book ${data.isAvailable ? 'marked as available' : 'marked as unavailable'} successfully!`);
        fetchBooks(); // Refresh books list
      } else {
        console.error('❌ Toggle availability failed:', data);
        alert(`Failed to update book availability: ${data.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('❌ Error toggling book availability:', err);
      alert('Error updating book availability. Please try again.');
    }
  };

  const deleteBook = async (bookId, bookTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${bookTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`https://portfolio-x0gj.onrender.com/api/books/admin/delete/${bookId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Book deleted successfully!');
        fetchBooks(); // Refresh books list
      } else {
        alert('Failed to delete book: ' + data.message);
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Error deleting book. Please try again.');
    }
  };

  const editBook = (book) => {
    // Set the form with current book data
    setBookForm({
      bookId: book.bookId,
      title: book.title,
      description: book.description,
      price: book.price,
      imageUrl: book.imageUrl,
      image: null, // Reset image when editing
      quantity: book.quantity,
      category: book.category,
      classLevel: book.classLevel,
      author: book.author,
      pages: book.pages,
      language: book.language,
      isAvailable: book.isAvailable
    });
    setEditingBookId(book._id || book.id);
    setView('edit-book'); // Switch to edit book view
  };

  // Book Form Handlers
  const handleBookChange = (e) => {
    const { name, value } = e.target;
    setBookForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBookImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBookForm(prev => ({
        ...prev,
        image: file,
        imageUrl: '' // Clear existing URL when new image is selected
      }));
    }
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    try {
      const isEditing = editingBookId !== null;
      
      let response;
      
      if (bookForm.image) {
        // Use FormData for image upload
        const formData = new FormData();
        
        // Add all book fields except image and imageUrl
        Object.keys(bookForm).forEach(key => {
          if (key !== 'image' && key !== 'imageUrl') {
            formData.append(key, bookForm[key]);
          }
        });
        
        // Add image file
        formData.append('image', bookForm.image);
        
        const url = isEditing 
          ? `https://portfolio-x0gj.onrender.com/api/books/admin/update/${editingBookId}`
          : 'https://portfolio-x0gj.onrender.com/api/books/admin/add';
        
        const method = isEditing ? 'PUT' : 'POST';
        
        response = await fetch(url, {
          method: method,
          body: formData
          // Don't set Content-Type header for FormData - browser sets it automatically with boundary
        });
      } else {
        // Use JSON for no image case
        const url = isEditing 
          ? `https://portfolio-x0gj.onrender.com/api/books/admin/update/${editingBookId}`
          : 'https://portfolio-x0gj.onrender.com/api/books/admin/add';
        
        const method = isEditing ? 'PUT' : 'POST';
        
        response = await fetch(url, {
          method: method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookForm)
        });
      }
      
      const data = await response.json();
      if (data.success) {
        alert(`Book ${isEditing ? 'updated' : 'added'} successfully!`);
        setBookForm({
          bookId: '',
          title: '',
          description: '',
          price: '',
          imageUrl: '',
          image: null,
          quantity: '',
          category: '',
          classLevel: '',
          author: '',
          pages: '',
          language: '',
          isAvailable: true
        });
        setEditingBookId(null);
        setView('books');
        fetchBooks();
      } else {
        alert(`Failed to ${isEditing ? 'update' : 'add'} book: ` + data.message);
      }
    } catch (error) {
      console.error(`Error ${editingBookId ? 'updating' : 'adding'} book:`, error);
      alert(`Error ${editingBookId ? 'updating' : 'adding'} book. Please try again.`);
    }
  };


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

      await axios.delete(`https://portfolio-x0gj.onrender.com/api/achievers/${id}`);

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

      const res = await axios.patch(`https://portfolio-x0gj.onrender.com/api/achievers/${id}`, fd, {

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



  // YouTube video management functions

  const extractVideoId = (url) => {

    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;

    const match = url.match(regex);

    return match ? match[1] : null;

  };



  const getThumbnailUrl = (videoId) => {

    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  };



  const handleYoutubeSubmit = async (e) => {

    e.preventDefault();

    

    if (!youtubeForm.url.trim()) {

      alert('Please enter a YouTube URL');

      return;

    }



    const videoId = extractVideoId(youtubeForm.url);

    if (!videoId) {

      alert('Invalid YouTube URL');

      return;

    }



    try {

      const videoData = {

        url: youtubeForm.url.trim(),

        title: youtubeForm.title.trim() || 'YouTube Video',

        videoId: videoId,

        thumbnail: getThumbnailUrl(videoId)

      };



      const response = await axios.post('https://portfolio-x0gj.onrender.com/api/youtube-videos', videoData);

      

      console.log('YouTube Add Response:', response);

      console.log('Response data:', response.data);

      console.log('Response status:', response.status);

      

      if (response.data.success || response.status === 201) {

        setYoutubeForm({ url: '', title: '' });

        fetchYoutubeVideos();

        showNotification('YouTube video added successfully');

        setView('youtube');

      } else {

        alert('Failed to add YouTube video');

      }

    } catch (error) {

      console.error('Error adding YouTube video:', error);

      alert('Failed to add YouTube video');

    }

  };



  const handleDeleteYoutubeVideo = async (id) => {

    if (!window.confirm('Are you sure you want to delete this YouTube video?')) return;

    

    try {

      const response = await axios.delete(`https://portfolio-x0gj.onrender.com/api/youtube-videos/${id}`);

      

      console.log('YouTube Delete Response:', response);

      console.log('Response data:', response.data);

      console.log('Response status:', response.status);

      

      if (response.data.success || response.status === 200) {

        setYoutubeVideos(prev => prev.filter(video => video._id !== id));

        showNotification('YouTube video deleted successfully');

      } else {

        alert('Failed to delete YouTube video');

      }

    } catch (error) {

      console.error('Error deleting YouTube video:', error);

      alert('Failed to delete YouTube video');

    }

  };



  const handleYoutubeChange = (e) => {

    const { name, value } = e.target;

    setYoutubeForm(prev => ({

      ...prev,

      [name]: value

    }));

  };



  const showNotification = (message) => {

    setNotification(message);

    setTimeout(() => setNotification(''), 3000);

  };



  const handleQuestionSubmit = async (e) => {

    e.preventDefault();

    try {

      if (editingQuestion) {

        // Update existing question

        await axios.put(`https://portfolio-x0gj.onrender.com/api/questions/${editingQuestion._id}`, questionForm);

        showNotification('Question updated successfully');

      } else {

        // Add new question

        await axios.post('https://portfolio-x0gj.onrender.com/api/questions', questionForm);

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

      await axios.delete(`https://portfolio-x0gj.onrender.com/api/questions/${id}`);

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

            className={`sidebar-btn ${view === 'youtube' ? 'active' : ''}`}

            onClick={() => {

              setView('youtube');

            }}

            style={{ marginBottom: '8px' }}

          >

            Manage YouTube Videos

          </button>

          <button

            className={`sidebar-btn ${view === 'orders' ? 'active' : ''}`}

            onClick={() => {

              setView('orders');

              // Fetch orders when switching to orders view
              fetchOrders();

            }}

            style={{ marginBottom: '8px' }}

          >

            Manage Orders

          </button>

          <button

            className={`sidebar-btn ${view === 'books' ? 'active' : ''}`}

            onClick={() => {

              setView('books');

              // Fetch books when switching to books view
              fetchBooks();

            }}

            style={{ marginBottom: '8px' }}

          >

            Manage Books

          </button>

          <button

            className={`sidebar-btn ${view === 'add-youtube' ? 'active' : ''}`}

            onClick={() => {

              setYoutubeForm({ url: '', title: '' });

              setView('add-youtube');

            }}

          >

            Add YouTube Video

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

          ) : view === 'youtube' ? (

            <div className="youtube-admin">

              <h2>Manage YouTube Videos</h2>

              {youtubeVideos.length === 0 ? (

                <div className="no-results">

                  <p>No YouTube videos added yet</p>

                  <button 

                    className="btn-primary" 

                    onClick={() => setView('add-youtube')}

                    style={{ marginTop: '1rem' }}

                  >

                    Add First Video

                  </button>

                </div>

              ) : (

                <div className="youtube-videos-grid">

                  {youtubeVideos.map((video) => (

                    <div key={video._id} className="youtube-video-card">

                      <div className="video-thumbnail">

                        <img 

                          src={video.thumbnail} 

                          alt={video.title}

                          loading="lazy"

                        />

                        <div className="video-overlay">

                          <i className="fab fa-youtube"></i>

                        </div>

                      </div>

                      <div className="video-details">

                        <h4>{video.title}</h4>

                        <p className="video-url">{video.url}</p>

                        <p className="added-date">

                          Added: {new Date(video.createdAt).toLocaleDateString()}

                        </p>

                        <button 

                          className="btn-delete"

                          onClick={() => handleDeleteYoutubeVideo(video._id)}

                        >

                          <i className="fas fa-trash"></i> Remove

                        </button>

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </div>

          ) : view === 'add-youtube' ? (

            <div className="youtube-form-section">

              <h2>Add New YouTube Video</h2>

              <form onSubmit={handleYoutubeSubmit} className="youtube-form">

                <div className="form-group">

                  <label htmlFor="youtube-url">YouTube URL:</label>

                  <input

                    type="url"

                    id="youtube-url"

                    name="url"

                    value={youtubeForm.url}

                    onChange={handleYoutubeChange}

                    placeholder="https://www.youtube.com/watch?v=..."

                    required

                  />

                </div>

                <div className="form-group">

                  <label htmlFor="youtube-title">Video Title (Optional):</label>

                  <input

                    type="text"

                    id="youtube-title"

                    name="title"

                    value={youtubeForm.title}

                    onChange={handleYoutubeChange}

                    placeholder="Enter video title"

                  />

                </div>

                <div className="form-actions">

                  <button type="button" className="btn-secondary" onClick={() => setView('youtube')}>

                    Cancel

                  </button>

                  <button type="submit" className="btn-primary">

                    Add YouTube Video

                  </button>

                </div>

              </form>

            </div>

          ) : view === 'orders' ? (

            <div className="orders-admin">
              <h2>Order Management</h2>
              
              <div className="orders-header">
                <button className="refresh-btn" onClick={fetchOrders} disabled={loadingOrders}>
                  {loadingOrders ? 'Loading...' : 'Refresh Orders'}
                </button>
                <div className="order-stats">
                  <span className="stat-badge success">Success: {successCount}</span>
                  <span className="stat-badge failed">Failed: {failedCount}</span>
                  <span className="stat-badge pending">Pending: {pendingCount}</span>
                </div>
              </div>

              {/* Order Tabs */}
              <div className="order-tabs">
                <button 
                  className={`tab-btn ${orderTab === 'success' ? 'active' : ''}`}
                  onClick={() => setOrderTab('success')}
                >
                  Payment Success ({successCount})
                </button>
                <button 
                  className={`tab-btn ${orderTab === 'failed' ? 'active' : ''}`}
                  onClick={() => setOrderTab('failed')}
                >
                  Failed ({failedCount})
                </button>
                <button 
                  className={`tab-btn ${orderTab === 'pending' ? 'active' : ''}`}
                  onClick={() => setOrderTab('pending')}
                >
                  Pending ({pendingCount})
                </button>
              </div>

              {/* Orders List */}
              <div className="orders-content">
                {orderError && <div className="error-message">{orderError}</div>}
                
                {loadingOrders ? (
                  <div className="loading">Loading orders...</div>
                ) : filteredOrders.length === 0 ? (
                  <div className="no-orders">
                    <p>No {orderTab} orders found.</p>
                  </div>
                ) : (
                  <div className="orders-list">
                    {filteredOrders.map((order) => (
                      <div key={order.id} className={`order-card ${order.status}`}>
                        <div className="order-header">
                          <div className="order-status">
                            <span className={`status-badge ${order.status}`}>
                              {order.status.toUpperCase()}
                            </span>
                            {order.delivered && (
                              <span className="delivered-badge">
                                ✓ DELIVERED
                              </span>
                            )}
                          </div>
                          <div className="order-date">
                            {new Date(order.createdAt).toLocaleString('en-IN')}
                          </div>
                        </div>

                        <div className="order-details">
                          <div className="detail-row">
                            <span className="label">Book:</span>
                            <span className="value book-title">{order.bookTitle}</span>
                          </div>
                          <div className="detail-row">
                            <span className="label">Amount:</span>
                            <span className="value amount">₹{order.amount}</span>
                          </div>
                          <div className="detail-row">
                            <span className="label">Customer:</span>
                            <span className="value">{order.name}</span>
                          </div>
                          <div className="detail-row">
                            <span className="label">Email:</span>
                            <span className="value">{order.email}</span>
                          </div>
                          <div className="detail-row">
                            <span className="label">Mobile:</span>
                            <span className="value">
                              {order.mobile}
                              <a 
                                href={`https://wa.me/${order.mobile.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="whatsapp-link"
                                title="Chat on WhatsApp"
                              >
                                <i className="fab fa-whatsapp whatsapp-icon"></i>
                              </a>
                            </span>
                          </div>
                          <div className="detail-row">
                            <span className="label">Address:</span>
                            <span className="value">{order.address}, {order.pincode}</span>
                          </div>
                          <div className="detail-row">
                            <span className="label">Transaction ID:</span>
                            <span className="value transaction-id">{order.transaction_id}</span>
                          </div>
                          {order.order_id && (
                            <div className="detail-row">
                              <span className="label">Order ID:</span>
                              <span className="value">{order.order_id}</span>
                            </div>
                          )}
                          {order.payment_id && (
                            <div className="detail-row">
                              <span className="label">Payment ID:</span>
                              <span className="value">{order.payment_id}</span>
                            </div>
                          )}
                        </div>

                        {/* Notes Section */}
                        <div className="order-notes">
                          <h4>Notes</h4>
                          {order.adminNotes && order.adminNotes.length > 0 ? (
                            <div className="notes-list">
                              {order.adminNotes.map(note => (
                                <div key={note.id} className="note-item">
                                  <span className="note-text">{note.text}</span>
                                  <span className="note-time">
                                    {new Date(note.timestamp).toLocaleString('en-IN')}
                                  </span>
                                  <button 
                                    className="delete-note-btn"
                                    onClick={() => deleteNote(order.id, note.id)}
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="no-notes">No notes added yet</p>
                          )}
                          
                          {showNoteForm === order.id ? (
                            <div className="note-form">
                              <textarea
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="Add a note..."
                                rows="3"
                                autoFocus
                              />
                              <div className="note-form-actions">
                                <button 
                                  className="btn-secondary"
                                  onClick={() => {
                                    setShowNoteForm(null);
                                    setNewNote('');
                                  }}
                                >
                                  Cancel
                                </button>
                                <button 
                                  className="btn-primary"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    addNoteToOrder(order.id);
                                  }}
                                >
                                  Add Note
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button 
                              className="add-note-btn"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowNoteForm(order.id);
                              }}
                            >
                              + Add Note
                            </button>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="order-actions">
                          {order.status === 'success' && !order.delivered && (
                            <button 
                              className="deliver-btn"
                              onClick={() => markAsDelivered(order.id)}
                            >
                              Mark as Delivered
                            </button>
                          )}
                          {order.delivered && (
                            <div className="delivered-info">
                              ✓ Delivered on {new Date(order.deliveredAt).toLocaleDateString('en-IN')}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          ) : view === 'books' ? (
            <div className="books-admin">
              <h2>Book Management</h2>
              
              <div className="books-header">
                <button className="refresh-btn" onClick={fetchBooks} disabled={loadingBooks}>
                  {loadingBooks ? 'Loading...' : 'Refresh Books'}
                </button>
                <button 
                  className="btn-primary"
                  onClick={() => setView('add-book')}
                >
                  + Add New Book
                </button>
              </div>

              {/* Books List */}
              <div className="books-content">
                {bookError && <div className="error-message">{bookError}</div>}
                
                {loadingBooks ? (
                  <div className="loading">Loading books...</div>
                ) : books.length === 0 ? (
                  <div className="no-books">
                    <p>No books found. Add your first book!</p>
                  </div>
                ) : (
                  <div className="books-list">
                    {books.map((book) => (
                      <div key={book.id} className={`book-card ${!book.isAvailable ? 'unavailable' : ''}`}>
                        <div className="book-header">
                          <div className="book-info">
                            <h3>{book.title}</h3>
                            <p className="book-id">ID: {book.bookId}</p>
                            <p className="book-author">by {book.author}</p>
                            <p className="book-category">{book.category} - {book.classLevel}</p>
                          </div>
                          <div className="book-status">
                            <span className={`status-badge ${book.isAvailable ? 'available' : 'unavailable'}`}>
                              {book.isAvailable ? 'Available' : 'Not Available'}
                            </span>
                          </div>
                        </div>

                        <div className="book-details">
                          <div className="book-image">
                            <img src={book.imageUrl} alt={book.title} />
                          </div>
                          <div className="book-meta">
                            <p><strong>Price:</strong> ₹{book.price}</p>
                            <p><strong>Quantity:</strong> {book.quantity}</p>
                            <p><strong>Pages:</strong> {book.pages}</p>
                            <p><strong>Language:</strong> {book.language}</p>
                          </div>
                        </div>

                        <div className="book-description">
                          <p>{book.description}</p>
                        </div>

                        <div className="book-actions">
                          <div className="quantity-controls">
                            <label>Quantity:</label>
                            <div className="quantity-buttons">
                              <button 
                                onClick={() => updateBookQuantity(book.bookId, 'subtract', 1)}
                                disabled={book.quantity <= 0}
                              >
                                -
                              </button>
                              <span>{book.quantity}</span>
                              <button 
                                onClick={() => updateBookQuantity(book.bookId, 'add', 1)}
                              >
                                +
                              </button>
                            </div>
                          </div>
                          
                          <button 
                            className="btn-primary"
                            onClick={() => editBook(book)}
                          >
                            Edit
                          </button>
                          
                          <button 
                            className="btn-delete"
                            onClick={() => deleteBook(book.bookId, book.title)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          ) : view === 'add-book' ? (
            <div className="add-book-form">
              <h2>Add New Book</h2>
              
              <form onSubmit={handleBookSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="bookId">Book ID:</label>
                    <input
                      type="text"
                      id="bookId"
                      name="bookId"
                      value={bookForm.bookId}
                      onChange={handleBookChange}
                      placeholder="e.g., MATH_10_CLASS"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="title">Book Title:</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={bookForm.title}
                      onChange={handleBookChange}
                      placeholder="e.g., Mathematics for Class 10"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="author">Author:</label>
                    <input
                      type="text"
                      id="author"
                      name="author"
                      value={bookForm.author}
                      onChange={handleBookChange}
                      placeholder="e.g., Sachin Bansal"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="price">Price (₹):</label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={bookForm.price}
                      onChange={handleBookChange}
                      placeholder="299"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="quantity">Quantity:</label>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      value={bookForm.quantity}
                      onChange={handleBookChange}
                      placeholder="100"
                      min="0"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="pages">Pages:</label>
                    <input
                      type="number"
                      id="pages"
                      name="pages"
                      value={bookForm.pages}
                      onChange={handleBookChange}
                      placeholder="250"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="category">Category:</label>
                    <input
                      type="text"
                      id="category"
                      name="category"
                      value={bookForm.category}
                      onChange={handleBookChange}
                      placeholder="e.g., Mathematics"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="classLevel">Class Level:</label>
                    <input
                      type="text"
                      id="classLevel"
                      name="classLevel"
                      value={bookForm.classLevel}
                      onChange={handleBookChange}
                      placeholder="e.g., Class 10"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="language">Language:</label>
                    <select
                      id="language"
                      name="language"
                      value={bookForm.language}
                      onChange={handleBookChange}
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Bilingual">Bilingual</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="image">Book Image:</label>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleBookImageUpload}
                    required
                  />
                  {bookForm.image && (
                    <div style={{ marginTop: '10px' }}>
                      <img 
                        src={URL.createObjectURL(bookForm.image)} 
                        alt="Preview" 
                        style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover' }}
                      />
                      <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
                        Selected: {bookForm.image.name}
                      </p>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description:</label>
                  <textarea
                    id="description"
                    name="description"
                    value={bookForm.description}
                    onChange={handleBookChange}
                    placeholder="Enter book description..."
                    rows="4"
                    required
                  />
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setView('books')}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Add Book
                  </button>
                </div>
              </form>
            </div>

          ) : view === 'edit-book' ? (
            <div className="add-book-form">
              <h2>Edit Book</h2>
              
              <form onSubmit={handleBookSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="bookId">Book ID:</label>
                    <input
                      type="text"
                      id="bookId"
                      name="bookId"
                      value={bookForm.bookId}
                      onChange={handleBookChange}
                      placeholder="e.g., MATH_10_CLASS"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="title">Book Title:</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={bookForm.title}
                      onChange={handleBookChange}
                      placeholder="e.g., Mathematics for Class 10"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="author">Author:</label>
                    <input
                      type="text"
                      id="author"
                      name="author"
                      value={bookForm.author}
                      onChange={handleBookChange}
                      placeholder="e.g., Sachin Bansal"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="price">Price (₹):</label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={bookForm.price}
                      onChange={handleBookChange}
                      placeholder="e.g., 499"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="category">Category:</label>
                    <input
                      type="text"
                      id="category"
                      name="category"
                      value={bookForm.category}
                      onChange={handleBookChange}
                      placeholder="e.g., Mathematics"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="classLevel">Class Level:</label>
                    <input
                      type="text"
                      id="classLevel"
                      name="classLevel"
                      value={bookForm.classLevel}
                      onChange={handleBookChange}
                      placeholder="e.g., Class 10"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="quantity">Quantity:</label>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      value={bookForm.quantity}
                      onChange={handleBookChange}
                      placeholder="e.g., 100"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="pages">Pages:</label>
                    <input
                      type="number"
                      id="pages"
                      name="pages"
                      value={bookForm.pages}
                      onChange={handleBookChange}
                      placeholder="e.g., 200"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="language">Language:</label>
                    <input
                      type="text"
                      id="language"
                      name="language"
                      value={bookForm.language}
                      onChange={handleBookChange}
                      placeholder="e.g., English"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="image">Book Image:</label>
                    <input
                      type="file"
                      id="image"
                      name="image"
                      accept="image/*"
                      onChange={handleBookImageUpload}
                    />
                    {bookForm.imageUrl && !bookForm.image && (
                      <div style={{ marginTop: '10px' }}>
                        <p style={{ fontSize: '0.8rem', color: '#666' }}>
                          Current image: {bookForm.imageUrl}
                        </p>
                        <img 
                          src={bookForm.imageUrl} 
                          alt="Current" 
                          style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover' }}
                        />
                      </div>
                    )}
                    {bookForm.image && (
                      <div style={{ marginTop: '10px' }}>
                        <img 
                          src={URL.createObjectURL(bookForm.image)} 
                          alt="Preview" 
                          style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover' }}
                        />
                        <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
                          New image: {bookForm.image.name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label htmlFor="description">Description:</label>
                    <textarea
                      id="description"
                      name="description"
                      value={bookForm.description}
                      onChange={handleBookChange}
                      placeholder="Enter book description..."
                      rows="4"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        name="isAvailable"
                        checked={bookForm.isAvailable}
                        onChange={(e) => setBookForm(prev => ({...prev, isAvailable: e.target.checked}))}
                      />
                      Available for Purchase
                    </label>
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => {
                      setBookForm({
                        bookId: '',
                        title: '',
                        description: '',
                        price: '',
                        imageUrl: '',
                        quantity: '',
                        category: '',
                        classLevel: '',
                        author: '',
                        pages: '',
                        language: '',
                        isAvailable: true
                      });
                      setEditingBookId(null);
                      setView('books');
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Update Book
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