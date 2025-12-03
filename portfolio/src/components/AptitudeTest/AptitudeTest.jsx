import React, { useState } from 'react';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import './AptitudeTest.css';
import { FaArrowLeft, FaArrowRight, FaCheck, FaTimes, FaGift } from 'react-icons/fa';
import ScratchCard from './ScratchCard';

const questions = [
  {
    id: 1,
    question: 'If a train travels at a speed of 60 km/h, how far will it travel in 2.5 hours?',
    options: [
      { id: 'a', text: '120 km' },
      { id: 'b', text: '150 km' },
      { id: 'c', text: '180 km' },
      { id: 'd', text: '200 km' },
    ],
    correctAnswer: 'b'
  },
  {
    id: 2,
    question: 'What is 25% of 200?',
    options: [
      { id: 'a', text: '25' },
      { id: 'b', text: '50' },
      { id: 'c', text: '75' },
      { id: 'd', text: '100' },
    ],
    correctAnswer: 'b'
  },
  {
    id: 3,
    question: 'If x + 5 = 10, what is the value of x?',
    options: [
      { id: 'a', text: '2' },
      { id: 'b', text: '3' },
      { id: 'c', text: '4' },
      { id: 'd', text: '5' },
    ],
    correctAnswer: 'd'
  }
];

const AptitudeTest = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showScratchCard, setShowScratchCard] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    className: ''
  });
  const [testData, setTestData] = useState(null); // Store test data

  const handleOptionChange = (questionId, optionId) => {
    setAnswers({
      ...answers,
      [questionId]: optionId
    });
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        score++;
      }
    });
    return score;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const score = calculateScore();
    
    // Store test data for later use when consultation is booked
    setTestData({
      name: formData.name,
      phone: formData.phone,
      className: formData.className,
      score: score,
      total: questions.length
    });
    
    setShowForm(false);
    setShowResults(true);
  };

  const revealScratchCard = () => {
    setShowScratchCard(true);
  };

  const handleConsultationSubmit = async (consultationData) => {
    // Merge test data with consultation data
    const completeData = {
      ...testData,
      consultationDate: consultationData.date,
      consultationTime: consultationData.time
    };
    
    console.log('Sending complete data:', completeData);
    
    try {
      const response = await axios.post("https://portfolio-x0gj.onrender.com/send-mail", completeData);
      
      if (response.data.success) {
        alert("Email sent successfully with all details!");
        // Navigate to /aptitude-test after successful submission
        navigate('/aptitude-test');
      } else {
        alert("Email sending failed.");
      }
    } catch (error) {
      console.log(error);
      alert("Server error. Email could not be sent.");
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    if (currentQuestion === questions.length - 1) {
      setShowForm(true);
    } else {
      nextQuestion();
    }
  };

  const score = calculateScore();
  const percentage = Math.round((score / questions.length) * 100);

  if (showResults) {
    const correctPercentage = (score / questions.length) * 100;
    
    const barData = [
      { label: 'Correct', value: score, color: '#4CAF50' },
      { label: 'Incorrect', value: questions.length - score, color: '#f44336' },
      { label: 'Total', value: questions.length, color: '#3498db' }
    ];

    const maxValue = Math.max(...barData.map(item => item.value), 1);

    return (
      <div className="results-container">
        <h2>Your Results</h2>
        <div className="score-display">
          <div className="score-circle">
            <div className="score-text">
              {score}<span>/{questions.length}</span>
              <span className="score-percentage">{Math.round(correctPercentage)}%</span>
            </div>
          </div>
        </div>

        <div className="bar-graph">
          {barData.map((bar, index) => (
            <div key={index} className="bar-container">
              <div 
                className="bar" 
                style={{
                  height: `${(bar.value / maxValue) * 150}px`,
                  background: bar.color
                }}
              >
                <span className="bar-value">{bar.value}</span>
              </div>
              <div className="bar-label">{bar.label}</div>
            </div>
          ))}
        </div>

        <div style={{margin: '2rem 0'}}>
          {!showScratchCard ? (
            <button 
              className="show-gift-btn"
              onClick={revealScratchCard}
            >
              <FaGift className="gift-icon" />
              <span>Reveal Your Gift!</span>
            </button>
          ) : (
            <div className="scratch-card-wrapper">
              <ScratchCard 
                onReveal={() => console.log('Revealed!')}
                onSubmit={handleConsultationSubmit}
              />
            </div>
          )}
        </div>
        
        <div className="answers-review">
          <h3>Review Answers</h3>
          {questions.map((question, index) => {
            const isCorrect = answers[question.id] === question.correctAnswer;
            return (
              <div key={index} className={`answer-item ${isCorrect ? 'correct' : 'incorrect'}`}>
                <div className="question-text">
                  <strong>Q{index + 1}.</strong> {question.question}
                </div>
                <div className="answer-details">
                  <span>Your answer: {answers[question.id] || 'Not answered'}</span>
                  {!isCorrect && (
                    <span className="correct-answer">
                      Correct answer: {question.correctAnswer}
                    </span>
                  )}
                  {isCorrect ? (
                    <FaCheck className="answer-icon correct" />
                  ) : (
                    <FaTimes className="answer-icon incorrect" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="aptitude-test-container">
      <h1>Aptitude Test</h1>
      <div className="question-container">
        <div className="question">
          <div className="progress-bar">
            <div 
              className="progress" 
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>

          <h3>Question {currentQuestion + 1} of {questions.length}</h3>
          <p>{currentQ.question}</p>

          <div className="options">
            {currentQ.options.map((option) => (
              <label key={option.id} className={answers[currentQ.id] === option.id ? 'selected' : ''}>
                <input
                  type="radio"
                  name={`q${currentQ.id}`}
                  value={option.id}
                  checked={answers[currentQ.id] === option.id}
                  onChange={() => handleOptionChange(currentQ.id, option.id)}
                />
                {option.text}
              </label>
            ))}
          </div>
        </div>

        <div className="navigation-buttons">
          <button 
            className="nav-btn prev" 
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
          >
            <FaArrowLeft /> Previous
          </button>

          <button 
            className="submit-btn" 
            onClick={handleSubmit}
            disabled={!answers[currentQ.id]}
          >
            {currentQuestion === questions.length - 1 ? 'Submit Test' : 'Next'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Please enter your details</h3>
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label>Name:</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required 
                />
              </div>

              <div className="form-group">
                <label>Phone Number:</label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required 
                  pattern="[0-9]{10}"
                />
              </div>

              <div className="form-group">
                <label>Class:</label>
                <input 
                  type="text" 
                  name="className" 
                  value={formData.className}
                  onChange={(e) =>
                    setFormData({ ...formData, className: e.target.value })
                  }
                  required 
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">View Results</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AptitudeTest;
