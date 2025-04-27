import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './yo.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/se-ems/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        
        body: JSON.stringify({ 
          "email":username,
          "password":password
         }),
      });
      
      if (response.ok) {
        const data =   response.json();
        localStorage.setItem("token", data.token);
        navigate('/Dashboard');
        // Handle successful response
      } else {
        alert('Invalid username or password');
        console.error('API Error:', response.status);
        // Handle error response
      }
    } catch (error) {
      console.error('API Error:', error);
      
      // Handle network or other errors
    }
    
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
              placeholder="Username"
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
            New user? <a href="Registration">Create account</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;