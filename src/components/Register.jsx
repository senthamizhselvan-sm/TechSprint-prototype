import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../home-shelf-theme.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    
    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    
    try {
      setError('');
      setLoading(true);
      await signup(email, password);
      navigate('/home');
    } catch (error) {
      setError('Failed to create account. Please try again.');
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      navigate('/home');
    } catch (error) {
      console.error('Google sign-up error:', error);
      setError(error.message || 'Failed to sign up with Google. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="home-page">
      {/* Header Section */}
      <div className="home-header">
        <div className="welcome-section">
          <h1>🚀 Join the Movement</h1>
          <p>Create your account and start fighting price fixing together</p>
        </div>
      </div>

      {/* Register Form Section */}
      <div className="section">
        <div style={{ 
          maxWidth: '400px', 
          margin: '0 auto',
          padding: '30px',
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '20px',
          border: '1px solid #e9ecef',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          {error && (
            <div style={{
              background: 'linear-gradient(135deg, #dc3545, #c82333)',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '12px',
              marginBottom: '20px',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>
              ⚠️ {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#495057',
                fontSize: '0.9rem'
              }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e9ecef',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  transition: 'all 0.2s ease',
                  background: 'rgba(255, 255, 255, 0.8)'
                }}
                onFocus={(e) => e.target.style.borderColor = '#007bff'}
                onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#495057',
                fontSize: '0.9rem'
              }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e9ecef',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  transition: 'all 0.2s ease',
                  background: 'rgba(255, 255, 255, 0.8)'
                }}
                onFocus={(e) => e.target.style.borderColor = '#007bff'}
                onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#495057',
                fontSize: '0.9rem'
              }}>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e9ecef',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  transition: 'all 0.2s ease',
                  background: 'rgba(255, 255, 255, 0.8)'
                }}
                onFocus={(e) => e.target.style.borderColor = '#007bff'}
                onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '1rem',
                fontWeight: '600',
                marginBottom: '16px',
                background: loading ? '#6c757d' : 'linear-gradient(135deg, #28a745, #1e7e34)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {loading ? '⏳ Creating Account...' : '🚀 Create Account'}
            </button>
          </form>
          
          <div style={{ 
            margin: '20px 0', 
            textAlign: 'center', 
            color: '#6c757d',
            fontSize: '0.9rem'
          }}>
            or
          </div>
          
          <button 
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '1rem',
              fontWeight: '600',
              marginBottom: '20px',
              background: loading ? '#6c757d' : 'linear-gradient(135deg, #db4437, #c23321)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {loading ? '⏳ Please wait...' : '🔴 Continue with Google'}
          </button>
          
          <div style={{ textAlign: 'center' }}>
            <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>
              Already have an account? 
            </span>
            <Link 
              to="/login" 
              style={{ 
                color: '#007bff', 
                textDecoration: 'none',
                fontWeight: '600',
                marginLeft: '8px'
              }}
            >
              Sign In
            </Link>
            <br />
            <Link 
              to="/" 
              style={{ 
                color: '#6c757d', 
                textDecoration: 'none',
                fontSize: '0.9rem',
                marginTop: '12px',
                display: 'inline-block'
              }}
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;