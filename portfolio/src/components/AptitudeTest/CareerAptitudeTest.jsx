import React, { useState } from 'react';
import { FaCheck, FaTimes, FaPrint, FaRedo, FaGift } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ScratchCard from './ScratchCard';
import './AptitudeTest.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const CareerAptitudeTest = () => {
  const categories = [
    {
      id: 'R',
      name: 'Realistic (The Doers)',
      questions: [
        'Do you enjoy working with your hands, such as fixing gadgets, assembling furniture, or gardening?',
        'Would you prefer a job where you are active and outdoors rather than sitting at a desk all day?',
        'Are you interested in understanding how engines, electronics, or machines work?',
        'In a group project, would you rather build the physical model than write the report?'
      ]
    },
    {
      id: 'I',
      name: 'Investigative (The Thinkers)',
      questions: [
        'Do you enjoy solving puzzles, playing strategy games, or figuring out complex math problems?',
        'Are you curious about the underlying theories of science, human behavior, or history?',
        'Would you prefer a job that involves research, data analysis, and finding facts?',
        'Do you find yourself fact-checking information you see online to see if it\'s true?'
      ]
    },
    {
      id: 'A',
      name: 'Artistic (The Creators)',
      questions: [
        'Do you enjoy expressing yourself through sketching, music, writing, or photography?',
        'Do you prefer tasks that allow you to be creative and original over tasks with strict rules?',
        'Would you like a career in design, fashion, entertainment, or media?',
        'Are you good at visualizing how things should look (colors, layouts, aesthetics)?'
      ]
    },
    {
      id: 'S',
      name: 'Social (The Helpers)',
      questions: [
        'Do you find it easy to listen to friends\' problems and offer advice?',
        'Would you prefer a job where you directly help, teach, or take care of people?',
        'Do you enjoy volunteering, community service, or organizing events for a cause?',
        'Are you more interested in psychology and human relationships than in technology or data?'
      ]
    },
    {
      id: 'E',
      name: 'Enterprising (The Persuaders)',
      questions: [
        'Do you enjoy leading teams, giving presentations, or persuading others to your point of view?',
        'Are you interested in starting your own business or making money through side hustles?',
        'Would you describe yourself as ambitious, competitive, and comfortable taking risks?',
        'Do you enjoy following the stock market, marketing trends, or political news?'
      ]
    },
    {
      id: 'C',
      name: 'Conventional (The Organizers)',
      questions: [
        'Do you like keeping your notes, files, and schedule highly organized and structured?',
        'Do you prefer clear instructions and rules rather than open-ended, ambiguous tasks?',
        'Would you enjoy a job that involves managing numbers, data entry, or logistical planning?',
        'Are you good at spotting errors in text or calculations?'
      ]
    }
  ];

  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [scores, setScores] = useState({
    R: 0, // Realistic
    I: 0, // Investigative
    A: 0, // Artistic
    S: 0, // Social
    E: 0, // Enterprising
    C: 0  // Conventional
  });
  const [showResults, setShowResults] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    className: ''
  });
  const [testData, setTestData] = useState(null);
  const [showScratchCard, setShowScratchCard] = useState(false);

  const currentCategory = categories[currentCategoryIndex];
  const currentQuestion = currentCategory.questions[currentQuestionIndex];
  const questionId = `${currentCategory.id}_${currentQuestionIndex}`;

  const handleAnswer = (answer) => {
    // Update answers
    const newAnswers = {
      ...answers,
      [questionId]: answer
    };
    setAnswers(newAnswers);

    // Update scores if answer is yes
    if (answer) {
      setScores({
        ...scores,
        [currentCategory.id]: scores[currentCategory.id] + 1
      });
    }

    // Move to next question or category
    if (currentQuestionIndex < currentCategory.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentCategoryIndex < categories.length - 1) {
      setCurrentCategoryIndex(currentCategoryIndex + 1);
      setCurrentQuestionIndex(0);
    } else {
      // All questions answered - show form before results
      setShowForm(true);
    }
  };

  const getCareerSuggestions = () => {
    const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const topCategories = sortedScores.slice(0, 2).map(item => item[0]);
    
    const careerData = {
      'R': {
        title: 'The Maker (Realistic)',
        description: 'Ideally suited for: Practical, hands-on, and tool-oriented careers.',
        courses: [
          'B.Tech / B.E. (Mechanical, Civil, Automobile, Robotics)',
          'B.Sc in Agriculture or Forestry',
          'B.Arch (Architecture)',
          'Merchant Navy courses',
          'Diploma in Culinary Arts'
        ],
        careers: 'Engineer, Pilot, Chef, Architect, Landscape Designer, Network Technician'
      },
      'I': {
        title: 'The Analyst (Investigative)',
        description: 'Ideally suited for: Scientific, analytical, and research-based careers.',
        courses: [
          'B.Tech (Computer Science, AI & Data Science)',
          'B.Sc (Physics, Chemistry, Biology, Mathematics)',
          'BCA (Computer Applications)',
          'B.Sc in Psychology',
          'MBBS / BDS (Medical fields)',
          'B.Sc Economics'
        ],
        careers: 'Software Developer, Data Scientist, Doctor, Researcher, Economist, Psychologist'
      },
      'A': {
        title: 'The Creative (Artistic)',
        description: 'Ideally suited for: Expressive, original, and independent careers.',
        courses: [
          'B.Des (Graphic, Fashion, Interior, Product Design)',
          'BA in Journalism & Mass Communication (BJMC)',
          'BA in English / Literature / Performing Arts',
          'Bachelor of Fine Arts (BFA)',
          'B.Sc in Animation & Multimedia'
        ],
        careers: 'Graphic Designer, UX/UI Designer, Journalist, Content Creator, Copywriter, Film Editor, Fashion Designer'
      },
      'S': {
        title: 'The Humanitarian (Social)',
        description: 'Ideally suited for: Helping, teaching, and counseling careers.',
        courses: [
          'BA in Psychology / Sociology',
          'B.Ed (Education) or B.El.Ed',
          'BSW (Social Work)',
          'B.Sc Nursing / Physiotherapy',
          'BHM (Hospitality Management)',
          'Human Resources (BBA HR)'
        ],
        careers: 'Teacher, Counselor, Social Worker, Nurse, HR Manager, NGO Manager'
      },
      'E': {
        title: 'The Leader (Enterprising)',
        description: 'Ideally suited for: Business, leadership, and persuasive careers.',
        courses: [
          'BBA / BMS (Management Studies)',
          'B.Com (Commerce)',
          'BA LLB (Law)',
          'BBA in Entrepreneurship or International Business',
          'BA in Political Science'
        ],
        careers: 'Entrepreneur, Marketing Manager, Lawyer, Sales Director, Politician, Real Estate Developer'
      },
      'C': {
        title: 'The Organizer (Conventional)',
        description: 'Ideally suited for: Structured, data-driven, and administrative careers.',
        courses: [
          'B.Com (Honors)',
          'CA (Chartered Accountancy) / CS (Company Secretary) pathway',
          'B.Sc in Statistics or Actuarial Science',
          'BBA in Finance or Banking',
          'Library Science'
        ],
        careers: 'Accountant, Financial Analyst, Actuary, Bank Manager, Database Administrator, Tax Consultant'
      }
    };

    return topCategories.map(category => ({
      ...careerData[category],
      score: scores[category]
    }));
  };

const handleConsultationSubmit = async (consultationData) => {
  if (!testData) return;

  // 🔔 IMMEDIATE SUCCESS TOAST (button click pe hi)
  toast.success("Your Session is Booked successfully", {
    position: "top-center",
    autoClose: 3000,
  });

  // Format results
  const resultsString = [
    `Realistic (The Maker): ${scores.R}/4`,
    `Investigative (The Analyst): ${scores.I}/4`,
    `Artistic (The Creator): ${scores.A}/4`,
    `Social (The Helper): ${scores.S}/4`,
    `Enterprising (The Persuader): ${scores.E}/4`,
    `Conventional (The Organizer): ${scores.C}/4`
  ].join('\n');

  const emailData = {
    name: testData.name,
    phone: testData.phone,
    className: testData.className,
    date: consultationData.date,
    time: consultationData.time,
    results: resultsString,
    testType: 'Career Aptitude Test'
  };

  // 🚀 API call background me chalega
  try {
    await axios.post(
      "https://portfolio-x0gj.onrender.com/send-mail-careertest",
      emailData
    );
  } catch (error) {
    console.error("Mail error:", error);
  }

  // 🔁 Redirect
  setTimeout(() => {
    window.location.href = '/career-aptitude-test';
  }, 2000);
};

  // Show form before showing results
  if (showForm) {
    return (
      <>
        <div className="form-overlay">
          <div className="form-container">
            <h2>Please provide your details to view results</h2>
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Mobile Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your mobile number"
                  pattern="[0-9]{10}"
                  title="Please enter a valid 10-digit mobile number"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="className">Class</label>
                <input
                  type="text"
                  id="className"
                  name="className"
                  value={formData.className}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your class/grade"
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  View Results
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </>
    );
  }

  if (showResults) {
    const results = getCareerSuggestions();
    const allCategories = [
      { id: 'R', name: 'Realistic (The Maker)', score: scores.R },
      { id: 'I', name: 'Investigative (The Analyst)', score: scores.I },
      { id: 'A', name: 'Artistic (The Creator)', score: scores.A },
      { id: 'S', name: 'Social (The Helper)', score: scores.S },
      { id: 'E', name: 'Enterprising (The Persuader)', score: scores.E },
      { id: 'C', name: 'Conventional (The Organizer)', score: scores.C }
    ].sort((a, b) => b.score - a.score);

    const getScoreBarWidth = (score) => (score / 4) * 100;
    const getScoreColor = (score) => {
      const percentage = (score / 4) * 100;
      if (percentage >= 75) return '#2ecc71'; // Green
      if (percentage >= 50) return '#3498db'; // Blue
      if (percentage >= 25) return '#f39c12'; // Orange
      return '#e74c3c'; // Red
    };

    return (
      <>
        <div className="career-results-container">
        <h2 className="results-title">Your Career Aptitude Results</h2>
        
        {/* Scratch Card Section */}
        <div style={{margin: '2rem 0', textAlign: 'center'}}>
          {!showScratchCard ? (
            <button 
              className="show-gift-btn"
              onClick={revealScratchCard}
            >
              <FaGift className="gift-icon" />
              <span>Reveal Your Free Gift!</span>
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
        
        <div className="results-summary">
          <h3>Top Career Matches</h3>
          <div className="top-results">
            {results.map((result, index) => (
              <div key={index} className="top-result-card">
                <div className="result-header">
                  <h4>{result.title.split(' (')[0]}</h4>
                  <span className="result-score">{result.score}/4</span>
                </div>
                <div className="progress-container">
                  <div 
                    className="progress-bar" 
                    style={{
                      width: `${getScoreBarWidth(result.score)}%`,
                      backgroundColor: getScoreColor(result.score)
                    }}
                  ></div>
                </div>
                <p className="result-description">{result.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="all-categories">
          <h3>Your Scores in All Categories</h3>
          <div className="category-scores">
            {allCategories.map((category, index) => (
              <div key={index} className="category-score">
                <div className="category-info">
                  <span className="category-name">{category.name}</span>
                  <span className="category-score-value">{category.score}/4</span>
                </div>
                <div className="progress-container">
                  <div 
                    className="progress-bar" 
                    style={{
                      width: `${getScoreBarWidth(category.score)}%`,
                      backgroundColor: getScoreColor(category.score)
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {results.map((result, index) => (
          <div key={`details-${index}`} className="career-details">
            <h3 className="career-title">{result.title}</h3>
            <p className="career-description">{result.description}</p>
            
            <div className="suggestions-grid">
              <div className="suggestion-box courses">
                <h4>Suggested Bachelor Courses</h4>
                <ul>
                  {result.courses.map((course, i) => (
                    <li key={i}>
                      <i className="fas fa-graduation-cap"></i>
                      {course}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="suggestion-box careers">
                <h4>Career Options</h4>
                <div className="career-tags">
                  {result.careers.split(', ').map((career, i) => (
                    <span key={i} className="career-tag">
                      <i className="fas fa-briefcase"></i>
                      {career}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        <div className="results-actions">
          <button 
            className="print-btn"
            onClick={() => window.print()}
          >
            <i className="fas fa-print"></i> Print Results
          </button>
          <button 
            className="restart-btn"
            onClick={() => window.location.reload()}
          >
            <i className="fas fa-redo"></i> Take Test Again
          </button>
        </div>
      </div>
      </>
    );
  }

  const progress = (
    (currentCategoryIndex * 100 / categories.length) + 
    ((currentQuestionIndex + 1) * 100 / (categories.length * currentCategory.questions.length))
  ).toFixed(1);

  return (
    <div className="aptitude-test-container">
      <div className="progress-bar">
        <div 
          className="progress" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="category-header">
        <h2>{currentCategory.name}</h2>
        <p>Question {currentQuestionIndex + 1} of {currentCategory.questions.length}</p>
      </div>
      
      <div className="question-container">
        <p className="question-text">{currentQuestion}</p>
        
        <div className="answer-options">
          <button 
            className="answer-btn no"
            onClick={() => handleAnswer(false)}
          >
            No
          </button>
          <button 
            className="answer-btn yes"
            onClick={() => handleAnswer(true)}
          >
            Yes
          </button>
        </div>
      </div>
      
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default CareerAptitudeTest;
