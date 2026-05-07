import React, { useState } from 'react';
import './FAQ.css';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  // Normalized FAQ data with consistent structure: { q: string, a: string, list?: string[] }
  const faqs = [
    {
      q: 'Is this like a school exam? Will it be hard?',
      a: 'Not at all. There are zero math problems and zero general knowledge questions. It\'s just 24 simple "Yes or No" questions about what you like (e.g., "Do you like fixing things?" or "Do you like helping people?"). You can\'t fail this test!'
    },
    {
      q: 'How is this different from the advice my relatives give me?',
      a: 'Your relatives love you, but they might not know every modern career option. This test is based on the RIASEC Model, a global standard used by professional career counselors. It relies on data and psychology, not just opinions or trends.'
    },
    {
      q: 'What exactly will I get after the test?',
      a: 'You will instantly get a Personalized Career Profile that tells you:',
      list: [
        'Your Dominant Personality Type (e.g., Leader, Creator, Thinker).',
        'The specific Bachelor\'s Courses (BBA, B.Tech, BA, etc.) that fit you best.',
        'A list of career roles you would enjoy working in.'
      ]
    },
    {
      q: 'Do I have to pay for the results?',
      a: 'The basic test and your Summary Result are 100% FREE. We believe every student deserves clarity about their future. If you want a detailed roadmap or college admission help later, you can book a 1-on-1 session with Sachin Sir.'
    },
    {
      q: "What subjects do you teach?",
      a: "I specialize in Political Science for Class 11 and 12, covering both Indian Politics and International Relations. I also provide guidance for Political Science honors students at the undergraduate level."
    },
    {
      q: "How many years of teaching experience do you have?",
      a: "I have 7+ years of teaching experience, starting from 2016. I've mentored over 7000 students during this period, with many scoring 90+ marks in their board exams."
    },
    {
      q: "Do you offer online classes?",
      a: "Yes, I offer both online and offline classes. My online sessions include interactive whiteboard teaching, recorded lectures for revision, and personalized doubt-clearing sessions."
    },
    {
      q: "What is your teaching methodology?",
      a: "My approach focuses on conceptual clarity, current affairs integration, and exam-oriented preparation. I use visual aids, real-world examples, and regular practice tests to ensure comprehensive understanding."
    },
    {
      q: "How can I join your classes?",
      a: "You can contact me through the website's contact form, call me directly, or message on social media platforms. I offer free demo classes to help you understand my teaching style."
    },
    {
      q: "Do you provide study materials?",
      a: "Yes, I provide comprehensive study materials including handwritten notes, previous year papers solutions, current affairs compilations, and practice question banks. All materials are regularly updated."
    },
    {
      q: "What are your class timings?",
      a: "I offer flexible timing options including weekday batches, weekend batches, and one-on-one sessions. We can schedule classes according to your convenience and learning pace."
    },
    {
      q: "Do you help with career guidance?",
      a: "Absolutely! I provide career aptitude tests and guidance for students after Class 12. I help them explore various career options in Political Science and related fields."
    }
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="faq-section" aria-label="Frequently Asked Questions">
      <div className="container">
        <div className="faq-header">
          <h2>Frequently Asked Questions</h2>
          <p>Find answers to common questions about Political Science coaching and mentoring</p>
        </div>
        
        <div className="faq-list">
          {faqs.map((faq, index) => {
            // Safely extract question and answer with fallbacks
            const question = faq.q || faq.question || '';
            const answer = faq.a || faq.answer || '';
            const list = faq.list || null;
            
            return (
              <div 
                key={index} 
                className={`faq-item ${activeIndex === index ? 'active' : ''}`}
              >
                <button
                  className="faq-question"
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={activeIndex === index}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span className="question-text">{question}</span>
                  <span className="faq-icon" aria-hidden="true">
                    {activeIndex === index ? '−' : '+'}
                  </span>
                </button>
                
                <div
                  id={`faq-answer-${index}`}
                  className={`faq-answer ${activeIndex === index ? 'show' : ''}`}
                  role="region"
                  aria-labelledby={`faq-question-${index}`}
                >
                  {answer && <p>{answer}</p>}
                  
                  {/* Safely render optional list */}
                  {list && Array.isArray(list) && list.length > 0 && (
                    <ul className="faq-answer-list">
                      {list.map((item, listIndex) => (
                        <li key={listIndex}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
