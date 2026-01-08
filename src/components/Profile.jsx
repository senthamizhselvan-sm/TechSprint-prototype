import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserPriceReports } from '../utils/priceLogic';
import BottomNav from './BottomNav';

const Profile = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalReports: 0,
    trustScore: 1,
    joinedDate: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = async () => {
    try {
      const reports = await getUserPriceReports(user.uid);
      setStats({
        totalReports: reports.length,
        trustScore: Math.min(1 + (reports.length * 0.1), 5), // Simple trust score calculation
        joinedDate: user.metadata?.creationTime || new Date()
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>Profile</h1>
        </div>
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Profile</h1>
      </div>

      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-avatar">
            <span style={{ fontSize: '48px' }}>👤</span>
          </div>
          
          <div className="profile-info">
            <h2>{user?.email}</h2>
            <p>Member since {new Date(stats.joinedDate).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-content">
              <h3>{stats.totalReports}</h3>
              <p>Price Reports</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <h3>{stats.trustScore.toFixed(1)}</h3>
              <p>Trust Score</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-content">
              <h3>{stats.totalReports > 10 ? 'Gold' : stats.totalReports > 5 ? 'Silver' : 'Bronze'}</h3>
              <p>Contributor Level</p>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button className="btn-secondary" onClick={() => window.location.href = '/insights'}>
            View My Insights
          </button>
          <button className="btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="profile-info-section">
          <h3>About Trust Score</h3>
          <p>Your trust score increases with consistent, accurate price reporting. Higher trust scores help improve the reliability of our price data.</p>
          
          <h3>Privacy & Data</h3>
          <p>We only store your email and price reports. Your data is used to provide price transparency and is never shared with third parties.</p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Profile;