import React, { useState, useRef } from 'react';
import { FaCheck, FaTimes, FaPrint, FaRedo, FaGift } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ScratchCard from './ScratchCard';
import './AptitudeTest.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDI34cJ_jMMjDgM-kr1vfoZlHBoPgTnAkM",
  authDomain: "career-test-b0769.firebaseapp.com",
  projectId: "career-test-b0769",
  storageBucket: "career-test-b0769.firebasestorage.app",
  messagingSenderId: "309231346456",
  appId: "1:309231346456:web:36068fd374d6817cc4f46d",
  measurementId: "G-RWQFPQZZGM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

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
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [recaptchaVerifierRef, setRecaptchaVerifierRef] = useState(null);
  const [cooldown, setCooldown] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [testData, setTestData] = useState(null);
  const [showScratchCard, setShowScratchCard] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  
  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const currentCategory = categories[currentCategoryIndex];
  const currentQuestion = currentCategory.questions[currentQuestionIndex];
  const questionId = `${currentCategory.id}_${currentQuestionIndex}`;

  const handleStartTest = () => {
    setTestStarted(true);
    setCurrentCategoryIndex(0);
    setCurrentQuestionIndex(0);
    setAnswers({});
  };

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

  const getCareerSuggestions = (showAll = false) => {
    // Filter out categories with 0 score and sort by score (highest first)
    const sortedScores = Object.entries(scores)
      .filter(([_, score]) => score > 0)
      .sort((a, b) => b[1] - a[1]);
      
    const allCategories = sortedScores.map(item => item[0]);
    const nonZeroCategories = allCategories.filter(cat => scores[cat] > 0);
    
    // Determine how many categories to show
    let categoriesToShow = [];
    
    if (nonZeroCategories.length === 0) {
      // If no categories have scores, show all
      categoriesToShow = allCategories;
    } else if (nonZeroCategories.length === 1) {
      // If only 1 category has a score, show only that one
      categoriesToShow = nonZeroCategories;
    } else if (nonZeroCategories.length <= 3) {
      // If 2-3 categories have scores, show top 2
      categoriesToShow = nonZeroCategories.slice(0, 2);
    } else if (Object.values(scores).every(score => score === 4)) {
      // If all categories have perfect scores, show all
      categoriesToShow = allCategories;
    } else {
      // Default: show top 2
      categoriesToShow = nonZeroCategories.slice(0, 2);
    }
    
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

    return categoriesToShow.map(category => ({
      ...careerData[category],
      score: scores[category]
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    if (!otpVerified) {
      alert('Please verify your mobile number first');
      return;
    }
    
    // Store test data
    setTestData({
      name: formData.name,
      phone: '+91' + mobile,
      className: formData.className,
      scores: scores
    });
    
    setShowForm(false);
    setShowResults(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSendOtp = async () => {
    if (!mobile || mobile.length !== 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }
    
    setIsSendingOtp(true);
    
    try {
      // Clear any existing reCAPTCHA
      const recaptchaContainer = document.getElementById('recaptcha-container');
      if (recaptchaContainer) {
        recaptchaContainer.innerHTML = '';
      }
      
      // Setup reCAPTCHA verifier
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          // Reset reCAPTCHA
        }
      });
      
      setRecaptchaVerifierRef(verifier);
      
      // Send OTP
      const phoneNumber = '+91' + mobile;
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      
      setConfirmationResult(confirmation);
      setOtpSent(true);
      setOtpVerified(false);
      setOtpError('');
      toast.success('OTP sent to +91' + mobile);
      
      // Start 30-second cooldown
      setCooldown(30);
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error) {
      console.error('Error sending OTP:', error);
      let errorMessage = 'Failed to send OTP. Please try again.';
      
      if (error.code === 'auth/argument-error') {
        errorMessage = 'Invalid phone number format. Please check your number.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (error.code === 'auth/invalid-app-credential') {
        errorMessage = 'App verification failed. Please refresh and try again.';
      }
      
      setOtpError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      if (confirmationResult) {
        const result = await confirmationResult.confirm(otp);
        // OTP verified successfully
        setOtpVerified(true);
        setOtpError('');
        toast.success('Mobile number verified successfully!');
      } else {
        setOtpError('Please send OTP first');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setOtpError('Invalid OTP. Please try again.');
      toast.error('Invalid OTP. Please try again.');
    }
  };

  const revealScratchCard = () => {
    setShowScratchCard(true);
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
                <i className="fas fa-user"></i>
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
                <label>Mobile Number (with WhatsApp)</label>
                <div className="mobile-input">
                  <span className="country-code">+91</span>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 10) {
                        setMobile(value);
                      }
                    }}
                    required
                    placeholder="Enter 10-digit mobile number"
                    disabled={otpVerified}
                  />
                </div>
                {!otpVerified && mobile.length === 10 && (
                  <button 
                    type="button" 
                    onClick={handleSendOtp} 
                    className="otp-button"
                    disabled={isSendingOtp || cooldown > 0}
                    style={{marginTop: '10px', width: '100%'}}
                  >
                    {isSendingOtp ? 'Sending...' : cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Send OTP'}
                  </button>
                )}
              </div>

              {otpSent && !otpVerified && (
                <div className="form-group">
                  <label>Enter OTP</label>
                  <div className="otp-verify">
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 6) {
                          setOtp(value);
                        }
                      }}
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                    />
                    <button 
                      type="button" 
                      onClick={handleVerifyOtp}
                      className="verify-button"
                      disabled={otp.length !== 6}
                    >
                      Verify OTP
                    </button>
                  </div>
                  <div className="resend-container">
                    <button 
                      type="button" 
                      onClick={handleSendOtp}
                      className="resend-button"
                      disabled={cooldown > 0 || isSendingOtp}
                    >
                      {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
                    </button>
                  </div>
                  {otpError && <div className="error-message">{otpError}</div>}
                </div>
              )}

              {otpVerified && (
                <div className="success-message">
                  ✓ Mobile number verified
                </div>
              )}

              <div className="form-group">
                <label htmlFor="className">Class/Grade</label>
                <i className="fas fa-graduation-cap"></i>
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
              
              <button 
                type="submit" 
                className="submit-button"
                disabled={!otpVerified}
              >
                View Result
              </button>
            </form>
          </div>
        </div>
        
        {/* Firebase reCAPTCHA container */}
        <div id="recaptcha-container" style={{display: 'none'}}></div>
        
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

  // Calculate total questions (6 categories * 4 questions each = 24 total)
  const totalQuestions = categories.length * categories[0].questions.length;
  // Calculate current question number (0-23) + 1 for 1-based index
  const currentQuestionNumber = (currentCategoryIndex * categories[0].questions.length) + currentQuestionIndex + 1;
  // Calculate progress percentage
  const progress = ((currentQuestionNumber / totalQuestions) * 100).toFixed(1);

  // Show welcome message before starting the test
  if (!testStarted) {
    return (
      <div className="welcome-container">
        <h2>Confused, What to do after 12th?</h2>
        <p className="welcome-text">
          Take our free, 5-minute scientific aptitude test to discover the Course and Career that actually fits your personality.
        </p>
        
        <button 
          className="start-test-btn"
          onClick={handleStartTest}
          style={{marginTop: '2rem'}}
        >
          Start my Free Test 
        </button>
        
        <div className="faq-section">
          <h3>Frequently Asked Questions</h3>
          
          {[
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
            }
          ].map((faq, index) => (
            <div 
              key={index} 
              className={`faq-item ${openFaqIndex === index ? 'open' : ''}`}
              onClick={() => toggleFaq(index)}
            >
              <div className="faq-question">
                <h4>Q{index + 1}: {faq.q}</h4>
                <span className="faq-toggle">
                  {openFaqIndex === index ? '−' : '+'}
                </span>
              </div>
              {openFaqIndex === index && (
                <div className="faq-answer">
                  <p><strong>A:</strong> {faq.a}</p>
                  {faq.list && (
                    <ul>
                      {faq.list.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="aptitude-test-container">
      {/* Progress Bar */}
      <div className="progress-container" style={{ marginBottom: '20px' }}>
        <div className="progress-bar">
          <div 
            className="progress" 
            style={{ 
              width: `${progress}%`,
              height: '8px',
              backgroundColor: '#4a90e2',
              borderRadius: '4px',
              transition: 'width 0.3s ease'
            }}
          ></div>
        </div>
        <div style={{ 
          textAlign: 'right',
          fontSize: '0.9rem',
          color: '#666',
          marginTop: '4px'
        }}>
          {progress}% Complete
        </div>
      </div>
      
      {/* Question Counter */}
      <div className="question-counter">
        Question {currentQuestionNumber} of {totalQuestions}
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
