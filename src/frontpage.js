import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
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

  const hospitalReviews = [
    { id: 1, text: 'Excellent emergency care service', rating: '4.8/5' },
    { id: 2, text: 'Friendly staff and clean facilities', rating: '4.5/5' },
    { id: 3, text: 'Short waiting times', rating: '4.7/5' }
  ];

  const senderName = localStorage.getItem('userName') || 'You';
  const senderRole = localStorage.getItem('userType') || 'patient';

socket.emit('sendMessage', {
  room,
  text: inputValue,
  sender: senderName,
  role: senderRole
});


  const sendMessage = () => {
    if (inputValue.trim()) {
      socket.emit('sendMessage', { room, text: inputValue, sender: 'patient' });
      setInputValue('');
    }
  };

  useEffect(() => {
    socket.emit('joinRoom', { room });

    socket.on('message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.off('message');
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    document.documentElement.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const chatWindow = document.querySelector('.chat-window');
    if (chatWindow) chatWindow.scrollTop = chatWindow.scrollHeight;
  }, [messages]);

  return (
    <div className="frontpage">
      <button className="dark-toggle" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </button>

      <div className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Emergency Medical Services</h1>
          <p>Your safety and health are our top priority.</p>
          <button className="cta-button" onClick={onGetStarted}>
            Get Started
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
        </div>

        <div className="tab-content">
          {activeTab === 'Instructions' && (
            <div className="content">
              <h2>Instructions</h2>
              <ol>
                <li>Click "Get Started" to access the dashboard.</li>
                <li>Use the live chat to connect with a professional.</li>
                <li>Search hospitals by zipcode for nearby emergency care.</li>
              </ol>
            </div>
          )}

          {activeTab === 'Hospital Record' && (
            <div className="content">
              <h2>Hospital Record</h2>
              <p>View and manage your hospital records here.</p>
            </div>
          )}
        </div>

        {showReviewsPopup && (
          <div className="reviews-popup">
            <div className="reviews-content">
              <h3>Hospital Service Reviews</h3>
              <button
                className="close-button"
                onClick={() => setShowReviewsPopup(false)}
              >
                ×
              </button>
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
                <div key={index} className={`message ${msg.sender}`}>
                  <strong>{msg.sender === 'doctor' ? 'Doctor' : 'You'}:</strong> {msg.text}
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
        </div>
      </div>
    </div>
  );
};

export default Frontpage;
