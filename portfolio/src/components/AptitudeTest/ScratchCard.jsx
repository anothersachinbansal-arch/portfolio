import React, { useState, useEffect } from 'react';
import './ScratchCard.css';
import { FaGift, FaCalendarAlt, FaClock } from 'react-icons/fa';
import { motion } from 'framer-motion';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ScratchCard = ({ onReveal, onSubmit }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isScratching, setIsScratching] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [canvas, setCanvas] = useState(null);
  const [ctx, setCtx] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: null,
    time: ''
  });
  
  // Generate dates for the next 30 days (including weekends)
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      dates.push(new Date(date));
    }
    return dates;
  };

  const availableDates = generateAvailableDates();
  
  // Generate time slots from 9 AM to 6 PM with 1-hour intervals
  const generateAvailableTimes = () => {
    const times = [];
    for (let hour = 9; hour <= 18; hour++) {
      // Skip lunch time (1 PM to 2 PM)
      if (hour === 13) continue;
      
      const timeString = `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
      times.push(timeString);
    }
    return times;
  };
  
  const availableTimes = generateAvailableTimes();

  useEffect(() => {
    // Check if device is mobile
    const checkIfMobile = () => {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  useEffect(() => {
    if (canvas) {
      const context = canvas.getContext('2d');
      
      // Set canvas size for high quality
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      // Set actual canvas size accounting for device pixel ratio
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      // Scale the context to match device pixel ratio
      context.scale(dpr, dpr);
      
      // Load and draw background image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Draw image to fill canvas (using logical dimensions)
        context.drawImage(img, 0, 0, rect.width, rect.height);
        
        // Add subtle overlay for better scratch effect
        context.fillStyle = 'rgba(255, 255, 255, 0.15)';
        context.fillRect(0, 0, rect.width, rect.height);
        
        // Draw main text with improved contrast
        context.save();
        // Remove shadow for better clarity
        context.shadowColor = 'transparent';
        context.shadowBlur = 0;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        
        // Main text
        context.fillStyle = '#333'; // Darker color for better contrast
        context.font = 'bold 24px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        

        context.fillStyle = '#e74c3c'; // Red color for emphasis
        context.font = 'bold 36px Arial';
      
        context.restore();
        
        setCtx(context);
      };
      img.onerror = () => {
        // Fallback to gradient background if image fails to load
        const gradient = context.createLinearGradient(0, 0, rect.width, rect.height);
        gradient.addColorStop(0, '#ff9a9e');
        gradient.addColorStop(1, '#fad0c4');
        context.fillStyle = gradient;
        context.fillRect(0, 0, rect.width, rect.height);
        
        // Draw text even if image fails
        context.save();
        context.fillStyle = '#333';
        context.font = 'bold 24px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        
        context.fillStyle = '#e74c3c';
        context.font = 'bold 36px Arial';
        
        context.restore();
        
        setCtx(context);
      };
      img.src = '/reward.png';
    }
  }, [canvas]);

  // Store last point for smooth line drawing
  const lastPoint = React.useRef({ x: 0, y: 0 });
  const isDrawing = React.useRef(false);

  const startScratching = (e) => {
  if (!canvas || !ctx) return;

  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  const x = (clientX - rect.left) * dpr;
  const y = (clientY - rect.top) * dpr;

  lastPoint.current = { x, y };
  isDrawing.current = true;
  setIsScratching(true);

  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(x, y, 12 * dpr, 0, Math.PI * 2);
  ctx.fill();
};

  const scratch = (e) => {
  if (!isScratching || !isDrawing.current || !ctx) return;

  e.preventDefault(); // mobile pe scroll rokne ke liye

  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  const x = (clientX - rect.left) * dpr;
  const y = (clientY - rect.top) * dpr;

  ctx.globalCompositeOperation = 'destination-out';
  ctx.lineWidth = 20 * dpr; // 50 tha, 20 kiya
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Smooth curve — last point aur current point ke beech midpoint se curve
  const midX = (lastPoint.current.x + x) / 2;
  const midY = (lastPoint.current.y + y) / 2;

  ctx.beginPath();
  ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
  ctx.quadraticCurveTo(lastPoint.current.x, lastPoint.current.y, midX, midY);
  ctx.stroke();

  lastPoint.current = { x, y };

  // Scratched area check
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  let transparentPixels = 0;

  for (let i = 3; i < pixels.length; i += 4) {
    if (pixels[i] === 0) transparentPixels++;
  }

  const transparentRatio = transparentPixels / (canvas.width * canvas.height);

  if (transparentRatio > 0.4 && !isRevealed) {
    setIsRevealed(true);
    setShowConfetti(true);
    onReveal();
    setTimeout(() => setShowConfetti(false), 3000);
  }
};

  const endScratching = () => {
    isDrawing.current = false;
    setIsScratching(false);
  };

  const handleMouseLeave = () => {
    if (isScratching) {
      endScratching();
    }
  };

  const handleTouchStart = (e) => {
    startScratching(e);
  };

  const handleTouchMove = (e) => {
    scratch(e);
  };

  const handleTouchEnd = () => {
    endScratching();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    ('Form submission attempt with formData:', formData);
    if (onSubmit && formData.date && formData.time) {
      // Get local date without timezone conversion
      const year = formData.date.getFullYear();
      const month = String(formData.date.getMonth() + 1).padStart(2, '0');
      const day = String(formData.date.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      ('Submitting consultation data:', {
        date: formattedDate,
        time: formData.time,
        rawDate: formData.date,
        localDateString: formData.date.toLocaleDateString()
      });
      onSubmit({
        date: formattedDate,
        time: formData.time
      });
    } else {
      ('Form validation failed:', {
        hasDate: !!formData.date,
        hasTime: !!formData.time,
        date: formData.date,
        time: formData.time
      });
      alert('Please select both date and time');
    }
  };

  return (
    <div className="scratch-card-container">
      {!showForm ? (
        <>
          <div className="scratch-card">
            <div className="gift-content">
              <motion.div 
                className="floating-gifts"
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ 
                  y: { 
                    repeat: Infinity, 
                    repeatType: 'reverse',
                    duration: 2,
                    ease: 'easeInOut'
                  } 
                }}
              >
                <FaGift className="gift-float gift-1" />
                <FaGift className="gift-float gift-2" />
                <FaGift className="gift-float gift-3" />
              </motion.div>
              
              <h3>Congratulations! 🎉🎉</h3>
              
              <h2 className="offer-text">You've won a Free 1 to 1 Career Strategy Session</h2>
              <p>Value: ₹999/-</p>
              
              <button 
                className="claim-btn"
                onClick={() => setShowForm(true)}
              >
                Book My Slot Now
              </button>
              
              <div className="coupon-code">
                <span>🔥Only 3 Slots left for this week</span>
              </div>
            </div>
        <canvas
          ref={setCanvas}
          style={{ 
            touchAction: 'none',
            width: '100%',
            height: '100%'
          }}
          onMouseDown={startScratching}
          onMouseMove={scratch}
          onMouseUp={endScratching}
          onMouseLeave={endScratching}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={endScratching}
          className={isRevealed ? 'scratched' : ''}
        />
          </div>
          
          {showConfetti && (
            <div className="confetti">
              {[...Array(50)].map((_, i) => (
                <div 
                  key={i} 
                  className="confetti-piece"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${3 + Math.random() * 4}s`,
                    background: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#FFD166'][Math.floor(Math.random() * 6)]
                  }}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="consultation-form-container">
          <h3>Book Your Free Consultation</h3>
          <p className="form-subtitle">Fill in your details to schedule your session</p>
          
          <form onSubmit={handleFormSubmit} className="consultation-form">
            
            <div className="form-group">
              <div className="input-icon">
               
              </div>
              <div className="date-picker-container">
                <DatePicker
                  selected={formData.date}
                  onChange={(date) => {
                    ('Date selected:', date);
                    setFormData({...formData, date});
                  }}
                  minDate={new Date()}
                  maxDate={new Date().setDate(new Date().getDate() + 30)}
                  dateFormat="EEEE, MMMM d, yyyy"
                  placeholderText="Select a date"
                  className="date-picker"
                  required
                  showDisabledMonthNavigation
                  inline
                />
              </div>
            </div>
            
            <div className="form-group">
              <div className="input-icon">
                
              </div>
              <div className="time-slots-container">
                <h4>Select a Time Slot</h4>
                <div className="time-slots">
                  {availableTimes.map(time => (
                    <button
                      key={time}
                      type="button"
                      className={`time-slot ${formData.time === time ? 'selected' : ''}`}
                      onClick={() => {
                        ('Time selected:', time);
                        setFormData(prev => ({...prev, time}));
                      }}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button type="submit" className="submit-btn">
                Book My Free Session
              </button>
            </div>
          </form>
        </div>
      )}
      
      <style jsx>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default ScratchCard;
