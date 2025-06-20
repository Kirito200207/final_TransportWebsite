import React, { useState } from 'react';
import apiService from '../services/api';

const RegisterPage = ({ onBack, onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Username validation
    if (!formData.username) {
      newErrors.username = 'Username cannot be empty';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email cannot be empty';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password cannot be empty';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password cannot be empty';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    
    if (validateForm()) {
      setIsLoading(true);
      
      try {
        console.log('Submitting registration form:', formData);
        
        // Build request data
        const userData = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          password_confirm: formData.confirmPassword
        };
        
        const response = await apiService.register(userData);
        console.log('Registration response:', response.data);
        
        // Registration successful
        setIsSubmitted(true);
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          if (onRegisterSuccess) {
            onRegisterSuccess();
          }
        }, 2000);
      } catch (error) {
        console.error('Registration error:', error);
        
        if (error.response && error.response.data) {
          // Display error message from backend
          const errorMessage = error.response.data.error || 
                             (error.response.data.details ? error.response.data.details : 'Registration failed, please try again later');
          setSubmitError(errorMessage);
        } else {
          setSubmitError('An error occurred during registration, please try again later');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2 className="login-title">Create Account</h2>
        
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="login-form">
            {submitError && <div className="error-message">{submitError}</div>}
            
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
                required
              />
              {errors.username && <div className="error-message">{errors.username}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
              {errors.password && <div className="error-message">{errors.password}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                required
              />
              {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
            </div>
            
            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? 'Registering...' : 'Create Account'}
            </button>
            
            <div className="form-footer">
              <button 
                type="button" 
                className="text-button" 
                onClick={onBack}
              >
                Back to Login
              </button>
            </div>
          </form>
        ) : (
          <div className="success-message">
            <p>Registration successful!</p>
            <p>Redirecting to login page...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPage; 