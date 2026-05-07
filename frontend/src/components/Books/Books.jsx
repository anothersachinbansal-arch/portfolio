import React, { useState, useEffect, useRef } from "react";
import PaymentForm from "../PaymentForm/PaymentForm";
import "./Books.css";

const books = [
  {
    id: "BK101",
    cardClass: "card-ps12",
    badge: "Class 12 · Political Science",
    title: "Class 12 Political Science Guide (CBSE) – Notes, Important Questions & Exam Preparation",
    price: 499,
    stars: 5,
    description: `A focused guide for Class XII students studying Political Science under the CBSE curriculum. Presents key concepts in a clear and structured way, making it easier to understand, revise, and apply in exams. Built on classroom experience, the book offers concise notes, important questions, and exam-oriented content to help students prepare with clarity and confidence. It also supports better answer writing and systematic revision. This book is designed to supplement your preparation and is not a substitute for NCERT textbooks.`,
    images: ["/book1.png", "/book1back.png"],
    fallbackEmojis: ["📘", "📖"],
    fallbackClasses: ["cover-ps12-a", "cover-ps12-b"],
  },
  {
    id: "BK102",
    cardClass: "card-ps11",
    badge: "Class 11 · Political Science",
    title: "Class 11 Political Science Guide (CBSE) – Notes, Important Questions & Exam Preparation",
    price: 499,
    stars: 5,
    description: `A focused guide for Class XI students studying Political Science under the CBSE curriculum. Presents key concepts in a clear and structured way, making it easier to understand, revise, and apply in exams. Built on classroom experience with concise notes, important questions, and exam-oriented content to help students prepare with clarity and confidence. It also supports better answer writing and systematic revision. This book is designed to supplement your preparation and is not a substitute for NCERT textbooks.`,
    images: ["/book2.png", "/book2back.png"],
    fallbackEmojis: ["📗", "📚"],
    fallbackClasses: ["cover-ps11-a", "cover-ps11-b"],
  },
  {
    id: "BK103",
    cardClass: "card-soc12",
    badge: "Class 12 · Sociology",
    title: "CBSE Class 12 Sociology – Complete Guide with Notes and Important Questions",
    price: 499,
    stars: 5,
    description: `A practical and student-friendly guide for Class XII Sociology based on the CBSE curriculum. Designed to help students understand key sociological concepts with clarity while preparing effectively for board examinations. Offers well-structured notes, clear explanations, and carefully selected important questions to support systematic learning and revision. Focuses on building conceptual understanding along with improving answer-writing skills, which are essential for scoring well in exams.`,
    images: ["/book3.png", "/book3back.png"],
    fallbackEmojis: ["📙", "🔬"],
    fallbackClasses: ["cover-soc12-a", "cover-soc12-b"],
  },
  {
    id: "BK104",
    cardClass: "card-soc11",
    badge: "Class 11 · Sociology",
    title: "CBSE Class 11 Sociology – Complete Guide with Notes and Important Questions",
    price: 499,
    stars: 5,
    description: `A practical and student-friendly guide for Class XI Sociology based on the CBSE curriculum. Designed to help students understand key sociological concepts with clarity while preparing effectively for board examinations. Offers well-structured notes, clear explanations, and carefully selected important questions to support systematic learning and revision. Focuses on building conceptual understanding along with improving answer-writing skills, which are essential for scoring well in exams.`,
    images: ["/book4.png", "/book4back.png"],
    fallbackEmojis: ["📓", "🧩"],
    fallbackClasses: ["cover-soc11-a", "cover-soc11-b"],
  },
];

/* ── Image Carousel ── */
const ImageCarousel = ({ book, onImageClick }) => {
  const [current, setCurrent] = useState(0);
  const [imgErrors, setImgErrors] = useState({});
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % book.images.length);
    }, 3000);
    return () => clearInterval(timerRef.current);
  }, [book.images.length]);

  const goTo = (idx) => {
    setCurrent(idx);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % book.images.length);
    }, 3000);
  };

  return (
    <div className="image-carousel" onClick={() => onImageClick(current)}>
      <div
        className="carousel-slides"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {book.images.map((src, i) =>
          imgErrors[i] ? (
            <div key={i} className={`carousel-slide ${book.fallbackClasses[i]}`}>
              {book.fallbackEmojis[i]}
            </div>
          ) : (
            <div key={i} className="carousel-slide">
              <img
                src={src}
                alt={`${book.title} cover ${i + 1}`}
                onError={() => setImgErrors((prev) => ({ ...prev, [i]: true }))}
              />
            </div>
          )
        )}
      </div>

      <div className="carousel-dots">
        {book.images.map((_, i) => (
          <span
            key={i}
            className={`dot ${i === current ? "active" : ""}`}
            onClick={(e) => { e.stopPropagation(); goTo(i); }}
          />
        ))}
      </div>

      <div className="expand-hint">⛶</div>
    </div>
  );
};

/* ── Lightbox ── */
const Lightbox = ({ book, slideIndex, onClose, onBuyNow }) => {
  if (!book) return null;
  const [currentSlide, setCurrentSlide] = useState(slideIndex);
  const [imgErrors, setImgErrors] = useState({});

  useEffect(() => { setCurrentSlide(slideIndex); }, [slideIndex]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % book.images.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + book.images.length) % book.images.length);
  };

  const handleImageError = (index) => {
    setImgErrors(prev => ({ ...prev, [index]: true }));
  };

  return (
    <div className="lightbox open" onClick={onClose}>
      <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
        <button className="lightbox-close" onClick={onClose}>✕</button>
        
        {/* Book Details */}
        <div className="lightbox-book-info">
          <h3>{book.title}</h3>
          <p className="lightbox-subtitle">{book.badge}</p>
          <div className="lightbox-price">₹{book.price}</div>
          <div className="lightbox-stars">{"★".repeat(book.stars)}{"☆".repeat(5 - book.stars)}</div>
        </div>

        {/* Image Gallery */}
        <div className="lightbox-gallery">
          <button className="lightbox-nav prev" onClick={(e) => { e.stopPropagation(); prevSlide(); }}>
            ‹
          </button>
          
          <div className="lightbox-main-image">
            {imgErrors[currentSlide] ? (
              <div className={`lightbox-fallback ${book.fallbackClasses[currentSlide]}`}>
                {book.fallbackEmojis[currentSlide]}
              </div>
            ) : (
              <img
                src={book.images[currentSlide]}
                alt={`${book.title} - View ${currentSlide + 1}`}
                onError={() => handleImageError(currentSlide)}
              />
            )}
          </div>
          
          <button className="lightbox-nav next" onClick={(e) => { e.stopPropagation(); nextSlide(); }}>
            ›
          </button>
        </div>

        {/* Image Indicators */}
        <div className="lightbox-indicators">
          {book.images.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={(e) => { e.stopPropagation(); goToSlide(index); }}
            />
          ))}
        </div>

        {/* Image Labels */}
        <div className="lightbox-image-labels">
          {book.images.map((_, index) => (
            <div
              key={index}
              className={`image-label ${index === currentSlide ? 'active' : ''}`}
              onClick={(e) => { e.stopPropagation(); goToSlide(index); }}
            >
              {index === 0 ? 'Front Cover' : 'Back Cover'}
            </div>
          ))}
        </div>

        {/* Book Description and Buy Button */}
        <div className="lightbox-book-details">
          <div className="lightbox-description">
            {book.description}
          </div>
          <button 
            className="lightbox-buy-btn"
            onClick={(e) => { 
              e.stopPropagation(); 
              onClose(); 
              // Directly trigger Buy Now functionality
              setTimeout(() => {
                onBuyNow(book);
              }, 100);
            }}
          >
            Buy Now - ₹{book.price}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Main Component ── */
const Books = () => {
  const [loading, setLoading] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [lightbox, setLightbox] = useState({ book: null, slideIndex: 0 });
  const [expandedDesc, setExpandedDesc] = useState({});
  const [bookmarks, setBookmarks] = useState({});

  const handleBuyNow = (book) => {
    setSelectedBook(book);
    setShowPaymentForm(true);
  };

  const handleFormSubmit = async (formData) => {
    if (!selectedBook) return;
    if (loading === selectedBook.id) return;

    let paymentCompleted = false;
    const cleanFormData = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      mobile: formData.mobile.trim(),
      address: formData.address.trim(),
      pincode: formData.pincode.trim(),
    };

    if (!cleanFormData.name || cleanFormData.name.length < 3) { alert("Please enter a valid name (at least 3 characters)"); return; }
    if (!cleanFormData.email || !cleanFormData.email.includes("@")) { alert("Please enter a valid email address"); return; }
    if (!cleanFormData.mobile || !/^[0-9]{10}$/.test(cleanFormData.mobile)) { alert("Please enter a valid 10-digit mobile number"); return; }

    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(selectedBook.id);

    try {
      const response = await fetch(`https://portfolio-x0gj.onrender.com/api/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: selectedBook.id, title: selectedBook.title, amount: selectedBook.price, ...cleanFormData }),
      });
      const orderData = await response.json();
      if (!orderData.success) throw new Error(orderData.message || "Failed to create order");
      setShowPaymentForm(false);

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Sachin Bansal",
        description: `Pay ₹${selectedBook.price} for ${selectedBook.title}`,
        order_id: orderData.order_id,
        prefill: { name: cleanFormData.name, email: cleanFormData.email, contact: cleanFormData.mobile },
        notes: { book_id: selectedBook.id, book_title: selectedBook.title, customer_name: cleanFormData.name, customer_email: cleanFormData.email },
        handler: async function (response) {
          paymentCompleted = true;
          try {
            const verifyResponse = await fetch(`https://portfolio-x0gj.onrender.com/api/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                payment_record_id: orderData.payment_id,
              }),
            });
            const verifyData = await verifyResponse.json();
            if (verifyData.success) {
              const params = new URLSearchParams({
                transaction_id: verifyData.transaction_id, order_id: verifyData.order_id,
                name: verifyData.user_details.name, email: verifyData.user_details.email,
                mobile: verifyData.user_details.mobile, address: verifyData.user_details.address,
                pincode: verifyData.user_details.pincode, book: verifyData.user_details.bookTitle,
                amount: verifyData.user_details.amount,
              });
              window.location.href = `/payment-success?${params.toString()}`;
            } else {
              alert("Payment verification failed. Please contact support.");
            }
          } catch (error) {
            alert("Payment verification failed. Please contact support.");
          } finally {
            setLoading(null);
          }
        },
        modal: {
          ondismiss: async function () {
            if (!paymentCompleted) {
              try {
                await fetch(`https://portfolio-x0gj.onrender.com/api/payment-failed`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ razorpay_order_id: orderData.order_id, payment_record_id: orderData.payment_id, error_description: "Payment cancelled by user" }),
                });
              } catch (e) { console.error(e); }
            }
            setLoading(null);
          },
          escape: true, animation: true, backdropclose: false, handleback: false,
        },
        theme: { color: "#3399cc" },
      };

      if (!window.Razorpay) throw new Error("Razorpay SDK not loaded. Please refresh.");
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", async function (response) {
        try {
          await fetch(`https://portfolio-x0gj.onrender.com/api/payment-failed`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.error.metadata?.order_id || orderData.order_id,
              razorpay_payment_id: response.error.metadata?.payment_id,
              payment_record_id: orderData.payment_id,
              error_description: response.error.description || "Payment failed",
              error_code: response.error.code, error_reason: response.error.reason,
            }),
          });
        } catch (e) { console.error(e); }
        setLoading(null);
        if (confirm(response.error.description + "\n\nWould you like to try again?")) setShowPaymentForm(true);
      });
      rzp.open();
    } catch (error) {
      alert("Failed to initiate payment. Please try again.");
      setLoading(null);
    }
  };

  return (
    <section className="books-section">
      <div className="books-container">
        <h1 className="section-label">📚 My Books</h1>
        <p className="section-sub">Authored for CBSE students — Political Science & Sociology</p>

        <div className="cards-grid">
          {books.map((book, bi) => (
            <div key={book.id} data-book-id={book.id} className={`book-card ${book.cardClass} ${expandedDesc[bi] ? 'expanded' : ''}`}>

              {/* Image Carousel */}
              <ImageCarousel
                book={book}
                onImageClick={(si) => setLightbox({ book, slideIndex: si })}
              />

              {/* Content */}
              <div className="card-content">
                <span className="badge">{book.badge}</span>
                <h3 className="book-title">{book.title}</h3>
                <p className="book-author">By Sachin Bansal</p>
                <div className="stars">{"★".repeat(book.stars)}{"☆".repeat(5 - book.stars)}</div>

                <p className={`book-desc ${expandedDesc[bi] ? "expanded" : ""}`}>
                  {book.description}
                </p>
                <button
                  className="view-more"
                  onClick={() => setExpandedDesc((prev) => ({ ...prev, [bi]: !prev[bi] }))}
                >
                  {expandedDesc[bi] ? "View less" : "View more"}
                </button>

                <div className="card-footer">
                  <div className="price-block">
                    <span className="price-label">Price</span>
                    <span className="price-value">₹{book.price}</span>
                  </div>
                  <button
                    className="buy-btn"
                    onClick={() => handleBuyNow(book)}
                    disabled={loading !== null}
                  >
                    {loading === book.id ? "Processing..." : loading !== null ? "Please wait..." : "Buy Now"}
                  </button>
                </div>
              </div>

              {/* Bookmark */}
              <button
                className={`bookmark-btn ${bookmarks[bi] ? "saved" : ""}`}
                onClick={() => setBookmarks((prev) => ({ ...prev, [bi]: !prev[bi] }))}
              >
                🔖
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox.book && (
        <Lightbox
          book={lightbox.book}
          slideIndex={lightbox.slideIndex}
          onClose={() => setLightbox({ book: null, slideIndex: 0 })}
          onBuyNow={handleBuyNow}
        />
      )}

      {/* Payment Form */}
      {showPaymentForm && selectedBook && (
        <PaymentForm
          book={selectedBook}
          onFormSubmit={handleFormSubmit}
          onClose={() => { setShowPaymentForm(false); setSelectedBook(null); }}
        />
      )}
    </section>
  );
};

export default Books;