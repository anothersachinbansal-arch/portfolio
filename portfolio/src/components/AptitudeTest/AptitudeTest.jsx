import React, { useState, useEffect } from 'react';
import axios from "axios";
import './AptitudeTest.css';
import { FaArrowLeft, FaArrowRight, FaCheck, FaTimes, FaGift, FaSpinner } from 'react-icons/fa';
import ScratchCard from './ScratchCard';

// API base URL
const API_URL = 'https://portfolio-x0gj.onrender.com/api';

// Default empty array since we'll be fetching from API
const defaultQuestions = [];

const AptitudeTest = () => {
  const [questions, setQuestions] = useState(defaultQuestions);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showScratchCard, setShowScratchCard] = useState(false);
  const [testData, setTestData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    className: ''
  });

  // Fetch questions from API on component mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`${API_URL}/questions`);
        if (response.data.success && response.data.data.length > 0) {
          setQuestions(response.data.data);
        } else {
          setError('Hello students 👋, We will upload questions after sometime...');
          setQuestions([]);
        }
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('Failed to load questions. Please try again later.');
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleOptionChange = (questionId, optionId) => {
    setAnswers({
      ...answers,
      [questionId]: optionId
    });
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, index) => {
      if (answers[q._id || index] === q.correctAnswer) {
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
    if (!testData) return;
    
    // Merge test data with consultation data
    const completeData = {
      ...testData,
      consultationDate: consultationData.date,
      consultationTime: consultationData.time
    };
    
    ('Sending complete data:', completeData);
    
    try {
      const response = await axios.post("https://portfolio-x0gj.onrender.com/send-mail", completeData);
      
      if (response.data.success) {
        alert("Email sent successfully with all details!");
        // Redirect to /aptitude-test after successful submission
        window.location.href = '/aptitude-test';
      } else {
        alert("Email sending failed.");
      }
    } catch (error) {
      (error);
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

  // Show loading state
  if (loading) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinner" />
        <p>Loading test...</p>
      </div>
    );
  }

  // Show error if no questions available
  if (questions.length === 0) {
    return (
      <div className="error-container">
        <h2>No questions available</h2>
        {error && <p className="error-message">{error}</p>}
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
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
                onReveal={() => ('Revealed!')}
                onSubmit={handleConsultationSubmit}
              />
            </div>
          )}
        </div>

        <div className="questions-review">
          <h3>Test Review</h3>
          {questions.map((question, qIndex) => {
            const userAnswer = answers[question._id || qIndex];
            const isCorrect = userAnswer === question.correctAnswer;
            
            return (
              <div key={qIndex} className={`question-review ${isCorrect ? 'correct' : 'incorrect'}`}>
                <div className="question-text">
                  <strong>Question {qIndex + 1}:</strong> {question.question}
                  {isCorrect ? (
                    <span className="result-icon correct"><FaCheck /></span>
                  ) : (
                    <span className="result-icon incorrect"><FaTimes /></span>
                  )}
                </div>
                <div className="options-review">
                  {question.options.map((option, oIndex) => {
                    const isUserAnswer = option.id === userAnswer;
                    const isRightAnswer = option.id === question.correctAnswer;
                    let optionClass = '';
                    
                    if (isUserAnswer && isRightAnswer) {
                      optionClass = 'correct-answer';
                    } else if (isUserAnswer && !isRightAnswer) {
                      optionClass = 'wrong-answer';
                    } else if (isRightAnswer) {
                      optionClass = 'correct-answer';
                    }
                    
                    return (
                      <div key={oIndex} className={`option-review ${optionClass}`}>
                        <input 
                          type="radio" 
                          checked={isUserAnswer}
                          readOnly 
                        />
                        <span>{option.text}</span>
                        {option.id === question.correctAnswer && (
                          <span className="correct-tick"><FaCheck /></span>
                        )}
                      </div>
                    );
                  })}
                </div>
                {!isCorrect && (
                  <div className="correct-answer-message">
                    Correct Answer: {question.options.find(opt => opt.id === question.correctAnswer)?.text}
                  </div>
                )}
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
              <label key={option.id} className={answers[currentQ._id || currentQuestion] === option.id ? 'selected' : ''}>
                <input
                  type="radio"
                  name={`q${currentQ._id || currentQuestion}`}
                  value={option.id}
                  checked={answers[currentQ._id || currentQuestion] === option.id}
                  onChange={() => handleOptionChange(currentQ._id || currentQuestion, option.id)}
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
            disabled={!answers[currentQ._id || currentQuestion]}
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