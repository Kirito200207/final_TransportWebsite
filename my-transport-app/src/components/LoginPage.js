import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiService from '../services/api';
import '../styles/LoginPage.css';

const LoginPage = ({ onLogin, onRegister, onForgotPassword }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            console.log('Submitting login form:', formData);
            
            const response = await apiService.login(formData);
            console.log('Login response details:', response);
            
            if (response.data && response.data.token) {
                // Save token and user information
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                
                console.log('Login successful, user info:', response.data.user);
                
                // Call onLogin callback if provided
                if (onLogin) {
                    onLogin(response.data.user);
                }
            } else {
                console.error('Login failed, response data format unexpected:', response.data);
                setError(response.data?.error || 'Login failed, incorrect response format');
            }
        } catch (err) {
            console.error('Login error:', err);
            console.error('Error details:', err.response?.data);
            setError(err.response?.data?.error || 'An error occurred during login, please try again later');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <h2 className="login-title">Login</h2>
                
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}
                
                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            autoComplete="username"
                            placeholder="Enter your username"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            autoComplete="current-password"
                            placeholder="Enter your password"
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                
                <div className="login-footer">
                    <p>
                        Don&apos;t have an account?
                        <button 
                            className="link-button"
                            onClick={onRegister}
                        >
                            Register
                        </button>
                    </p>
                    <p>
                        <button 
                            className="link-button"
                            onClick={onForgotPassword}
                        >
                            Forgot Password?
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage; 