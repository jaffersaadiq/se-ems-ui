import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import './Frontpage.css';

const socket = io('http://localhost:5001');
const room = 'hospital123';

const Frontpage = ({ onGetStarted }) => {
  const [activeTab, setActiveTab] = useState('Instructions');
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [zipcode, setZipcode] = useState('02115');
  const [hospitals, setHospitals] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [showReviewsPopup, setShowReviewsPopup] = useState(false);

  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const hospitalReviews = [
    { id: 1, text: 'Excellent emergency care service', rating: '4.8/5' },
    { id: 2, text: 'Friendly staff and clean facilities', rating: '4.5/5' },
    { id: 3, text: 'Short waiting times', rating: '4.7/5' }
  ];

  const sendMessage = () => {
    if (inputValue.trim()) {
      socket.emit('sendMessage', { room, text: inputValue, sender: 'patient' });
      setInputValue('');
    }
  };

  const askAI = async () => {
    if (!aiInput.trim()) return;
  
    const userMessage = { role: 'user', content: aiInput };
    const updatedMessages = [...aiMessages, userMessage];
    setAiMessages(updatedMessages);
    setAiInput('');
    setLoading(true);
    setError(null);
  
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo', // or 'gpt-4o' if you're using GPT-4 Omni
          messages: updatedMessages,
          temperature: 0.7,
          max_tokens: 150,
          stream: false // Optional - enable if handling stream response
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      const aiMessage = response.data.choices?.[0]?.message;
      if (!aiMessage) throw new Error('No message returned from AI');
  
      setAiMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('AI error:', err);
      setError(
        err?.response?.data?.error?.message || 'AI assistant is currently unavailable.'
      );
      setAiMessages(prev => prev.slice(0, -1)); // Remove optimistic user message
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    socket.emit('joinRoom', { room });
    socket.on('message', (msg) => setMessages((prev) => [...prev, msg]));
    return () => socket.off('message');
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    document.documentElement.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    setHospitals([
      {
        name: 'Mass General Hospital',
        specialty: 'Cardiology, Neurology',
        status: 'online'
      },
      {
        name: 'Beth Israel Deaconess',
        specialty: 'Emergency & Trauma',
        status: 'offline'
      },
      {
        name: "Boston Children's Hospital",
        specialty: 'Pediatrics',
        status: 'online'
      }
    ]);
  }, []);

  return (
    <div className="frontpage">
      <button className="dark-toggle" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </button>

      <div className="hero-section">
        <div className="hero-content">
          <h1 style={{ color: 'lightblue' }}>Welcome to Emergency Medical Services</h1>
          <p>Your safety and health are our top priority.</p>
          <button className="cta-button" onClick={onGetStarted}>
            Edit Your Records
          </button>
        </div>
      </div>

      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'Instructions' ? 'active' : ''}`}
            onClick={() => setActiveTab('Instructions')}
          >
            Instructions
          </button>
          <button
            className={`tab ${activeTab === 'Hospital Record' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('Hospital Record');
              setShowReviewsPopup(true);
            }}
          >
            Hospital Record
          </button>
          <button
            className={`tab ${activeTab === 'Assistant' ? 'active' : ''}`}
            onClick={() => setActiveTab('Assistant')}
          >
            AI Assistant
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'Instructions' && (
            <div className="content instruction-card">
              <div className="card-header">
                <h2>Instructions</h2>
                <div className="card-icon">📋</div>
              </div>
              <div className="instruction-steps">
                <div className="step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h3>Access Dashboard</h3>
                    <p>Click "Edit" to access your medical dashboard and view your health records.</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h3>Live Chat</h3>
                    <p>Connect instantly with medical professionals through our secure chat system.</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h3>AI Assistant</h3>
                    <p>Get quick health suggestions and information from our AI medical assistant.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Hospital Record' && (
            <div className="content record-card">
              <div className="card-header">
                <h2>Hospital Records</h2>
                <div className="card-icon">🏥</div>
              </div>
              <div className="record-grid">
                <div className="record-item">
                  <h3>Recent Visits</h3>
                  <ul className="visit-list">
                    <li>
                      <span className="visit-date">May 15, 2025</span>
                      <span className="visit-details">Annual Checkup - Dr. Smith</span>
                    </li>
                    <li>
                      <span className="visit-date">March 2, 2025</span>
                      <span className="visit-details">Flu Vaccination - Nurse Johnson</span>
                    </li>
                  </ul>
                </div>
                <div className="record-item">
                  <h3>Medical History</h3>
                  <div className="history-tags">
                    <span className="tag">Allergies: None</span>
                    <span className="tag">Blood Type: O+</span>
                    <span className="tag">Conditions: None</span>
                  </div>
                </div>
                <div className="record-item">
                  <h3>Upcoming Appointments</h3>
                  <div className="appointment-card">
                    <div className="appointment-date">June 10, 2025</div>
                    <div className="appointment-details">
                      <strong>Dr. Williams</strong>
                      <p>Cardiology Consultation</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Assistant' && (
            <div className="content">
              <h2>AI Assistant</h2>
              {error && <div className="error-message">{error}</div>}
              <div className="chat-box">
                <div className="chat-window">
                  {aiMessages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.role}`}>
                      <strong>{msg.role === 'assistant' ? 'Assistant' : 'You'}:</strong> {msg.content}
                    </div>
                  ))}
                  {loading && <div className="message assistant">Thinking...</div>}
                </div>
                <div className="chat-input">
                  <input
                    type="text"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder="Ask the AI Assistant..."
                    onKeyDown={(e) => e.key === 'Enter' && askAI()}
                    disabled={loading}
                  />
                  <button onClick={askAI} disabled={loading}>
                    {loading ? '...' : 'Ask'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {showReviewsPopup && (
          <div className="reviews-popup">
            <div className="reviews-content">
              <h3>Hospital Service Reviews</h3>
              <button className="close-button" onClick={() => setShowReviewsPopup(false)}>×</button>
              {hospitalReviews.map((review) => (
                <div key={review.id} className="review-item">
                  <p>{review.text}</p>
                  <p><strong>Rating:</strong> {review.rating}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="main-content">
        <div className="card">
          <h2>Live Chat with a Professional</h2>
          <div className="chat-box">
            <div className="chat-window">
            {messages.map((msg, index) => (
  <div key={index} className={`message-wrapper ${msg.sender === 'doctor' ? 'right' : 'left'}`}>
    <div className={`message ${msg.sender === 'doctor' ? 'doctor' : 'patient'}`}>
      <strong>{msg.sender === 'doctor' ? 'Doctor' : 'You'}:</strong> {msg.text}
    </div>
    <small className="timestamp">{new Date().toLocaleTimeString()}</small>
  </div>
))}

            </div>
            <div className="chat-input">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </div>
        </div>

        <div className="card">
          <h2>Find Hospitals by Zipcode</h2>
          <div className="zipcode-search">
            <input
              type="text"
              placeholder="Enter Zipcode"
              value={zipcode}
              onChange={(e) => setZipcode(e.target.value)}
            />
            <button
              onClick={() => {
                if (!zipcode.trim()) return alert('Please enter a valid zipcode.');
                setHospitals([
                  {
                    name: 'Mass General Hospital',
                    specialty: 'Cardiology, Neurology',
                    status: 'online'
                  },
                  {
                    name: 'Beth Israel Deaconess',
                    specialty: 'Emergency & Trauma',
                    status: 'offline'
                  },
                  {
                    name: "Boston Children's Hospital",
                    specialty: 'Pediatrics',
                    status: 'online'
                  }
                ]);
              }}
            >
              Search
            </button>
          </div>

          <div className="hospital-list">
            {hospitals.length > 0 ? (
              hospitals.map((hospital, index) => (
                <div className={`hospital-item ${hospital.status}`} key={index}>
                  <h4>{hospital.name}</h4>
                  <p><strong>Specialty:</strong> {hospital.specialty}</p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <span style={{ color: hospital.status === 'online' ? 'green' : 'red' }}>
                      {hospital.status.toUpperCase()}
                    </span>
                  </p>
                </div>
              ))
            ) : (
              <p className="placeholder">Enter a zipcode to see nearby hospitals.</p>
            )}
          </div>
          <div className="card hospital-database">
  <h2>All Registered Hospitals</h2>
  <p style={{ marginBottom: '15px' }}>
    This section will display data from a database or CSV file.
  </p>
  <div className="hospital-table">
    <div className="table-header">
      <div>Hospital Name</div>
      <div>Hospital Review</div>
      <div>Location</div>
      <div>Status</div>
    </div>
    <div className="table-placeholder">
      <p>📄 Data will appear here after integration.</p>
    </div>
  </div>
</div>

        </div>
      </div>
    </div>
  );
};

export default Frontpage;