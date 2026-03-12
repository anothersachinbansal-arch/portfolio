import React, { useState, useEffect } from 'react';
import './AdminPanel.css';

const AdminPanel = () => {
  const [videos, setVideos] = useState([]);
  const [newVideo, setNewVideo] = useState({ url: '', title: '' });
  const [error, setError] = useState('');

  // Load videos from localStorage
  useEffect(() => {
    const savedVideos = localStorage.getItem('youtubeVideos');
    if (savedVideos) {
      setVideos(JSON.parse(savedVideos));
    }
  }, []);

  // Extract video ID from YouTube URL
  const extractVideoId = (url) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Get thumbnail URL
  const getThumbnailUrl = (videoId) => {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  };

  // Add new video
  const handleAddVideo = (e) => {
    e.preventDefault();
    setError('');

    if (!newVideo.url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    const videoId = extractVideoId(newVideo.url);
    if (!videoId) {
      setError('Invalid YouTube URL');
      return;
    }

    const videoToAdd = {
      id: Date.now(),
      url: newVideo.url.trim(),
      title: newVideo.title.trim() || 'YouTube Video',
      thumbnail: getThumbnailUrl(videoId),
      addedAt: new Date().toISOString()
    };

    const updatedVideos = [...videos, videoToAdd];
    setVideos(updatedVideos);
    localStorage.setItem('youtubeVideos', JSON.stringify(updatedVideos));
    
    // Reset form
    setNewVideo({ url: '', title: '' });
  };

  // Remove video
  const handleRemoveVideo = (id) => {
    const updatedVideos = videos.filter(video => video.id !== id);
    setVideos(updatedVideos);
    localStorage.setItem('youtubeVideos', JSON.stringify(updatedVideos));
  };

  return (
    <div className="admin-panel">
      <div className="container">
        <h2 className="panel-title">YouTube Videos Manager</h2>
        
        {/* Add Video Form */}
        <div className="add-video-section">
          <h3>Add New Video</h3>
          <form onSubmit={handleAddVideo} className="video-form">
            <div className="form-group">
              <label htmlFor="video-url">YouTube URL:</label>
              <input
                type="url"
                id="video-url"
                value={newVideo.url}
                onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="video-title">Video Title (Optional):</label>
              <input
                type="text"
                id="video-title"
                value={newVideo.title}
                onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                placeholder="Enter video title"
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="add-btn">
              <i className="fas fa-plus"></i> Add Video
            </button>
          </form>
        </div>

        {/* Videos List */}
        <div className="videos-list-section">
          <h3>Added Videos ({videos.length})</h3>
          {videos.length === 0 ? (
            <div className="no-videos">
              <p>No videos added yet.</p>
            </div>
          ) : (
            <div className="videos-grid">
              {videos.map((video) => {
                const videoId = extractVideoId(video.url);
                return (
                  <div key={video.id} className="video-item">
                    <div className="video-thumbnail">
                      <img 
                        src={getThumbnailUrl(videoId)} 
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
                        Added: {new Date(video.addedAt).toLocaleDateString()}
                      </p>
                      <button 
                        className="remove-btn"
                        onClick={() => handleRemoveVideo(video.id)}
                      >
                        <i className="fas fa-trash"></i> Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
