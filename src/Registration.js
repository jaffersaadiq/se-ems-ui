import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios'; // ADD THIS to handle HTTP requests
import './Registration.css';

const Registration = () => {
  const navigate = useNavigate();
  
  const [userType, setUserType] = useState('user');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    specialty: '',
    licenseNumber: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (userType === 'doctor') {
      if (!formData.specialty) newErrors.specialty = 'Specialty is required';
      if (!formData.licenseNumber) newErrors.licenseNumber = 'License number is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await fetch('http://localhost:8080/se-ems/user/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          
          body: JSON.stringify({ 
            "fullName":formData.fullName,
            "phoneNumber":formData.phone,
            "email":formData.email,
            "password":formData.password,
            "type":userType,
            "specialty":formData.specialty,
            "licenseNumber":formData.licenseNumber
           }),
        });
        if (response.ok) {
          alert(`Registration successful as ${userType}!`);
          navigate('/');
       
        } else {
          alert('Registration Error!');
          console.error('API Error:', response.status);
         
        }

      } catch (error) {
        console.error('API Error:', error);
       
      }
    }
  };

  return (
    <div className="registration-container">
      <div className="registration-box">
        <div className="auth-header">
          <div className="ems-logo">
            <span className="ems-icon">⛑</span>
            <h1 className="ems-title">E.M.S</h1>
          </div>
          <p className="tagline">Create Your Account</p>
        </div>

        <div className="user-type-selector">
          <button
            className={`type-btn ${userType === 'user' ? 'active' : ''}`}
            onClick={() => setUserType('user')}
          >
            User
          </button>
          <button
            className={`type-btn ${userType === 'doctor' ? 'active' : ''}`}
            onClick={() => setUserType('doctor')}
          >
            Doctor
          </button>
        </div>

        <form className="registration-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Full name"
              className={errors.fullName ? 'error-input' : ''}
            />
            {errors.fullName && <span className="error-message">{errors.fullName}</span>}
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email address"
              className={errors.email ? 'error-input' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone number"
              className={errors.phone ? 'error-input' : ''}
            />
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className={errors.password ? 'error-input' : ''}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              className={errors.confirmPassword ? 'error-input' : ''}
            />
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword}</span>
            )}
          </div>

          {userType === 'doctor' && (
            <>
              <div className="form-group">
                <label>Specialty</label>
                <input
                  type="text"
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleChange}
                  placeholder="Specialty"
                  className={errors.specialty ? 'error-input' : ''}
                />
                {errors.specialty && <span className="error-message">{errors.specialty}</span>}
              </div>

              <div className="form-group">
                <label>License Number</label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  placeholder="License number"
                  className={errors.licenseNumber ? 'error-input' : ''}
                />
                {errors.licenseNumber && <span className="error-message">{errors.licenseNumber}</span>}
              </div>
            </>
          )}

          <button type="submit" className="register-button">
            Register as {userType === 'doctor' ? 'Doctor' : 'User'}
          </button>
        </form>

        <div className="navigation-buttons">
          <button className="back-button" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>

        <div className="login-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Registration;
