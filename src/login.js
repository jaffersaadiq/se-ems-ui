import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // 👈 Make sure axios is installed
import './yo.css';
import Registration from './Registration';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showRegistration, setShowRegistration] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    fetch('http://localhost:8080/se-ems/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "email": username,
        "password": password
      }),
    })
      .then(response => {
        if (!response.ok) {
          return response.text().then(text => {
            throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
          });
        }
        return response.json();
      })
      .then(data => {
        localStorage.setItem("jwtToken", data.token);
        localStorage.setItem("userEmail", username);
        // Assuming the user type is directly available in the data object
        const { type: userType } = data.user;
        if (userType === 'doctor') {
          navigate('/DocChat');
        } else if (userType === 'user') {
          navigate('/Dashboard');
        } else {
          alert('Unknown user type');
        }
      })
      .catch(error => {
        console.error('Login error:', error);
        alert('Invalid username or password');
      });

  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="auth-header">
          <div className="ems-logo">
            <span className="ems-icon">⛑</span>
            <h1 className="ems-title">E.M.S</h1>
          </div>
          <p className="tagline">Emergency Medical Service Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <input
              type="text"
              placeholder="Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <span className="input-icon">👤</span>
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className="input-icon">🔒</span>
          </div>

          <button type="submit" className="login-button">
            Sign In
            <span className="button-arrow">→</span>
          </button>
        </form>

        <div className="additional-options">
          <a href="#forgot" className="forgot-password">Forgot Password?</a>
          <p className="signup-link">
            New user?{' '}
            <button onClick={() => setShowRegistration(true)} className="modal-trigger">
              Create account
            </button>
          </p>
        </div>
      </div>

      {showRegistration && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-modal" onClick={() => setShowRegistration(false)}>
              ✖
            </button>
            <Registration />
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
