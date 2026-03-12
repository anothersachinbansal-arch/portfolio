import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import './YouTubeVideos.css';

const YouTubeVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Fetch videos from API
  const fetchVideos = async () => {
    try {
      const response = await axios.get('https://portfolio-x0gj.onrender.com/api/youtube-videos');
      if (response.data.success) {
        setVideos(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching YouTube videos:', error);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Auto-scroll functionality
  useEffect(() => {
    if (videos.length === 0 || isDragging) return;

    const interval = setInterval(() => {
      setScrollPosition((prev) => {
        const maxScroll = Math.max(0, (videos.length - 3) * 320); // 3 videos visible, 320px each
        const nextScroll = prev + 320; // Scroll by one video width
        return nextScroll > maxScroll ? 0 : nextScroll; // Reset to 0 when reaching end
      });
    }, 2000); // Scroll every 2 seconds

    return () => clearInterval(interval);
  }, [videos.length, isDragging]);

  // Touch handlers
  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setScrollLeft(scrollPosition);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.touches[0].clientX;
    const walk = (startX - x) * 1.5; // Reduced speed multiplier for better control
    const newScrollPosition = Math.max(0, scrollLeft + walk);
    const maxScroll = Math.max(0, (videos.length - 3) * 320);
    setScrollPosition(Math.min(newScrollPosition, maxScroll));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Mouse handlers (for desktop)
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setScrollLeft(scrollPosition);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.clientX;
    const walk = (startX - x) * 1.5; // Reduced speed multiplier for better control
    const newScrollPosition = Math.max(0, scrollLeft + walk);
    const maxScroll = Math.max(0, (videos.length - 3) * 320);
    setScrollPosition(Math.min(newScrollPosition, maxScroll));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

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

  // Get embed URL
  const getEmbedUrl = (videoId) => {
    return `https://www.youtube.com/embed/${videoId}`;
  };

  // Handle video click
  const handleVideoClick = (video) => {
    setSelectedVideo(video);
  };

  // Close modal
  const closeModal = () => {
    setSelectedVideo(null);
  };

  return (
    <div className="youtube-videos-section">
      <div className="container">
        <h2 className="section-title">YouTube Videos</h2>

        {videos.length === 0 ? (
          <div className="no-videos">
            <p>No videos available yet.</p>
          </div>
        ) : (
          <div 
            className="videos-scroll-container"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            <div 
              className="videos-row"
              style={{
                transform: `translateX(-${scrollPosition}px)`,
                transition: isDragging ? 'none' : 'transform 0.5s ease',
                cursor: isDragging ? 'grabbing' : 'grab'
              }}
            >
              {videos.map((video) => {
                const videoId = extractVideoId(video.url);
                if (!videoId) return null;

                return (
                  <div
                    key={video._id}
                    className="video-card"
                    onClick={() => handleVideoClick(video)}
                  >
                    <div className="video-thumbnail">
                      <img
                        src={video.thumbnail || getThumbnailUrl(videoId)}
                        alt={video.title || 'YouTube Video'}
                        loading="lazy"
                      />
                      <div className="play-button">
                        <i className="fab fa-youtube"></i>
                      </div>
                    </div>
                    <div className="video-info">
                      <h3>{video.title || 'YouTube Video'}</h3>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Video Modal */}
        {selectedVideo && (
          <div className="video-modal" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="close-btn" onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
              <div className="video-player">
                <iframe
                  src={getEmbedUrl(extractVideoId(selectedVideo.url))}
                  title={selectedVideo.title || 'YouTube Video'}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default YouTubeVideos;
