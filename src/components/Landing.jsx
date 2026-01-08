import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Landing = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for cached session
    const cachedSession = localStorage.getItem('userSession');
    if (currentUser || cachedSession) {
      navigate('/home');
    }
  }, [currentUser, navigate]);

  return (
    <div className="landing">
      <h1>PriceFixing Detector</h1>
      <p>Transparent pricing for essential goods through community reporting</p>
      
      <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>How it works</h2>
        <div style={{ textAlign: 'left', marginBottom: '30px' }}>
          <div style={{ marginBottom: '16px' }}>
            <strong>• Report Prices:</strong> Share prices you see at local shops
          </div>
          <div style={{ marginBottom: '16px' }}>
            <strong>• Get Insights:</strong> Compare with community averages
          </div>
          <div style={{ marginBottom: '16px' }}>
            <strong>• AI Analysis:</strong> Understand pricing patterns
          </div>
          <div>
            <strong>• Stay Anonymous:</strong> No bills required, privacy protected
          </div>
        </div>
        
        <div className="cta-buttons">
          <Link to="/register" className="btn btn-primary">
            Get Started
          </Link>
          <Link to="/login" className="btn btn-secondary">
            Already have an account? Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Landing;