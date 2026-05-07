import React, { useEffect, useRef, useState } from "react";
import "./AboutHero.css";

const stats = [
  { label: "Students mentored", value: 7000 },
  { label: "Students scored 90% + Marks", value: 750 },
  { label: "Years of Experience", value: 7 },
  { label: "Free Resources", value: 50 },
];

const AboutHero = () => {
  const sectionRef = useRef(null);
  const [counterVisible, setCounterVisible] = useState(false);
  const [counters, setCounters] = useState(stats.map(() => 0));

  // Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCounterVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
  }, []);

  // Counter animation
  useEffect(() => {
    if (counterVisible) {
      stats.forEach((stat, i) => {
        let startTime = null;
        const duration = 1500;

        const animate = (timestamp) => {
          if (!startTime) startTime = timestamp;
          const progress = Math.min((timestamp - startTime) / duration, 1);
          const value = Math.floor(progress * stat.value);

          setCounters((prev) => {
            const newVal = [...prev];
            newVal[i] = value;
            return newVal;
          });

          if (progress < 1) requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
      });
    }
  }, [counterVisible]);

  return (
    <section
      id="about"
      className="about-hero"
      ref={sectionRef}
      aria-label="About Sachin Bansal"
    >
      <div className="about-hero-container centered">
        {/* Centered Content */}
        <div className="about-hero-content">
          <h1 className="name">About Me</h1>

          <h2 className="section-title">👋 Who I Am</h2>
          <p className="description">
            I’m <strong>Sachin Bansal</strong>, a passionate teacher and mentor
            based in Vikaspuri, New Delhi. I specialize in Political Science and
            currently serve as a PGT at Mamta Modern Sr. Sec. School. Teaching
            for me is not just a career—it’s a way to shape young minds and
            inspire growth.
          </p>

          <h2 className="section-title">📚 My Teaching Journey</h2>
          <p className="description">
            My teaching journey began in <strong>2016</strong> when I launched a
            small YouTube channel, <strong>SOL Updates</strong>, to help
            undergraduate students in Political Science. What started as a few
            videos turned into a thriving community of{" "}
            <strong>1,00,000+ learners</strong>.
          </p>
          <p className="description">
            Since 2017, I have been teaching Social Sciences and mentoring
            students for board exams and beyond. While many of my students
            proudly score 90+ marks, I believe true success lies in helping them
            become more confident, capable, and better than yesterday.
          </p>

          <h2 className="section-title">🌱 Beyond the Classroom</h2>
          <p className="description">
            In 2019, I founded the <strong>Secular House Foundation</strong>, an
            NGO that works on literacy, culture, and education under the motto{" "}
            <em>Read, Write, and Recite</em>. Through this initiative, I’ve
            organized open mics, workshops, and cultural events in Delhi
            University colleges, creating spaces where young voices can be heard
            and celebrated.
          </p>

          <h2 className="section-title">✍ Author & Mentor</h2>
          <p className="description">
            I’ve authored Political Science books for Class 11 and 12, combining
            academic knowledge with classroom experience to make learning
            meaningful and relatable.
          </p>
          <p className="description">
            <strong>My academic journey includes:</strong>
            <br />• B.A. (Hons.) Political Science
            <br />• M.A. Political Science
            <br />• B.Ed. from Maharaja Surajmal Institute, Janakpuri
          </p>

          <h2 className="section-title">❤ My Belief</h2>
          <p className="description">
            At the end of the day, I don’t measure my success in numbers or
            grades. My real achievement is seeing my students grow into
            confident individuals who discover their own potential and keep
            moving forward—one step at a time.
          </p>

          {/* Stats Section */}
          
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
