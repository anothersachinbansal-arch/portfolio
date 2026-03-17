import React, { useState, useEffect, useRef } from "react";
import "./Hero.css";

const slides = [
  { title: "With Shri OM Birla , Hon'ble Speaker Of Loksabha", img: "2nd.png", alt: "Slide 1" },
  { title: "With Ms. Mukti Sanyal, Principle Of Bharti College, DU", img: "3rd.png", alt: "Slide 2" },
  { title: "With My SOL Updates Team", img: "4th.png", alt: "Slide 3" },
  { title: "With Political Science DEPT. Of HINDU College, DU", img: "5th.png", alt: "Slide 4" },
  { title: "With Political Science DEPT. Of BHASKARACHARYA College, DU Of Applied Sciences", img: "6th.png", alt: "Slide 5" },
  { title: "With The Principle Of SHIVAJI College, DU", img: "7th.png", alt: "Slide 6" },
  { title: "Books In This Series", img: "1st.png", alt: "Slide 7" },
  { title: "ECHOES Of History : OLD VS NEW", img: "8th.png", alt: "Slide 8" }
];

const Hero = () => {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const direction = useRef("right");

  // Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [current]);

  const nextSlide = () => {
    const nextIndex = (current + 1) % slides.length;

    setPrev(current);
    setCurrent(nextIndex);
    direction.current = "right";
    setIsAnimating(true);

    setTimeout(() => {
      setPrev(null);
      setIsAnimating(false);
    }, 800); // animation duration
  };

  const prevSlide = () => {
    const prevIndex = (current - 1 + slides.length) % slides.length;

    setPrev(current);
    setCurrent(prevIndex);
    direction.current = "left";
    setIsAnimating(true);

    setTimeout(() => {
      setPrev(null);
      setIsAnimating(false);
    }, 800);
  };

  const goToSlide = (index) => {
    if (index === current || isAnimating) return;

    direction.current = index > current ? "right" : "left";
    setPrev(current);
    setCurrent(index);
    setIsAnimating(true);

    setTimeout(() => {
      setPrev(null);
      setIsAnimating(false);
    }, 800);
  };

  // Touch swipe
  let touchStartX = 0;
  const onTouchStart = (e) => { touchStartX = e.changedTouches[0].clientX; };
  const onTouchEnd = (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
  };

  return (
    <section
      className="hero-section"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="hero-slider">
        {slides.map((slide, index) => {
          let className = "hero-slide";

          if (index === current && isAnimating) {
            className += direction.current === "right" ? " slide-in-right" : " slide-in-left";
          } else if (index === prev && isAnimating) {
            className += direction.current === "right" ? " slide-out-left" : " slide-out-right";
          } else if (index === current) {
            className += " active";
          }

          return (
            <div key={index} className={className}>
              <div className="hero-container">
                <div className="hero-left">
                  <h2>{slide.title}</h2>
                </div>
                <div className="hero-right">
                  <img src={slide.img} alt={slide.alt} className="slide-img" loading={index === 0 ? "eager" : "lazy"} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hero-dots-container">
        <div className="hero-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`dot ${current === index ? "active" : ""}`}
              onClick={() => goToSlide(index)}
              disabled={isAnimating}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
