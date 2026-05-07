import React, { useEffect, useState } from "react";
import "./Testimonials.css";
import { useReviews } from "../context/ReviewsContext";
import { Link } from "react-router-dom";

const Testimonials = () => {
  const { reviews } = useReviews();
  const [currentIndex, setCurrentIndex] = useState(0);

  // ✅ function to decide visible cards based on screen width
  const getVisibleCards = () => {
    if (window.innerWidth <= 600) return 1; // mobile
    if (window.innerWidth <= 992) return 2; // tablet
    return 3; // desktop
  };

  const [visibleCards, setVisibleCards] = useState(getVisibleCards());

  // ✅ update cards count on window resize
  useEffect(() => {
    const handleResize = () => setVisibleCards(getVisibleCards());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Auto slide every 3 sec
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex + 1 >= reviews.length ? 0 : prevIndex + 1
      );
    }, 3000);
    return () => clearInterval(interval);
  }, [reviews]);

  const renderStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <span key={i} className={i < rating ? "star filled" : "star"}>
          ★
        </span>
      ));
  };

  return (
    <section className="testimonials-section" aria-label="Student testimonials">
      <div className="container">
        <h2>Hear from our students</h2>
        <p className="subheading">You can also share your experience with us</p>

        <div className="testimonials-carousel">
          <div
            className="carousel-track"
            style={{
              transform: `translateX(-${currentIndex * (100 / visibleCards)}%)`,
            }}
          >
            {reviews.map((testimonial) => (
              <div
                key={testimonial.id}
                className="testimonial-card"
                style={{transition:"transform 0.3s ease, box-shadow 0.3s ease"}}
              >
                <div className="testimonial-content">
                  <p>"{testimonial.comment}"</p>
                </div>
                <div className="rating">{renderStars(testimonial.rating)}</div>
                <div className="testimonial-author">
                  {testimonial.avatar ? (
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="avatar"
                      width="50"
                      height="50"
                    />
                  ) : (
                    <div className="avatar-fallback" title={testimonial.name}>
                      {testimonial.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="author-name">{testimonial.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="actions">
          <Link
            to="/writereview"
            className="cta-button"
            style={{ textDecoration: "none" }}
            aria-label="Write your review"
          >
            Write your review
          </Link>
          <Link to="/allreviews" className="link-button">
            View all reviews
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
