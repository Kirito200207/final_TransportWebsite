import React, { useState } from 'react';

const LoginPage = ({ onLogin, onForgotPassword, onRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Form validation
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    // Simulate API call for authentication
    setTimeout(() => {
      // Simulate successful login
      const token = 'fake-jwt-token';
      
      // Store token in local storage
      localStorage.setItem('token', token);
      
      // Store user information
      localStorage.setItem('user', JSON.stringify({ username }));
      
      setIsLoading(false);
      
      // Notify parent component about successful login
      if (onLogin) {
        onLogin();
      }
    }, 1000);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2 className="login-title">Transit App</h2>
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
          
          <div className="form-footer">
            <button 
              type="button" 
              className="text-button" 
              onClick={onForgotPassword}
            >
              Forgot password?
            </button>
            <button 
              type="button" 
              className="text-button" 
              onClick={onRegister}
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage; 