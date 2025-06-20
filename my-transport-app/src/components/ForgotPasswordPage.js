import React, { useState } from 'react';

const ForgotPasswordPage = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      // In a real app, this would send a reset link to the user's email
    }, 1500);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2 className="login-title">Forgot Password</h2>
        
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="error-message">{error}</div>}
            
            <p className="form-description">
              Enter your email address and we&apos;ll send you instructions to reset your password.
            </p>
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            
            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Reset Link'}
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
            <p>Reset link sent!</p>
            <p>Please check your email at {email} for instructions to reset your password.</p>
            <button 
              type="button" 
              className="login-button" 
              onClick={onBack}
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 