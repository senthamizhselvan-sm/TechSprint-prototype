import { useState, useEffect, useMemo } from 'react';
import { collection, query, getDocs, where, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { getUserPriceReports } from '../utils/priceLogic';
import '../home-shelf-theme.css';
import BottomNav from './BottomNav';

const Profile = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalReports: 0,
    trustScore: 1,
    joinedDate: null,
    recentActivity: [],
    achievements: [],
    categoryBreakdown: {}
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const achievements = useMemo(() => [
    { id: 'first_report', name: 'First Reporter', description: 'Submit your first price report', icon: '🎯', threshold: 1 },
    { id: 'regular_reporter', name: 'Regular Reporter', description: 'Submit 10 price reports', icon: '📝', threshold: 10 },
    { id: 'trusted_member', name: 'Trusted Member', description: 'Submit 25 price reports', icon: '⭐', threshold: 25 },
    { id: 'price_expert', name: 'Price Expert', description: 'Submit 50 price reports', icon: '🏆', threshold: 50 },
    { id: 'community_hero', name: 'Community Hero', description: 'Submit 100 price reports', icon: '👑', threshold: 100 },
    { id: 'category_master', name: 'Category Master', description: 'Report prices in all categories', icon: '🎖️', threshold: 4 }
  ], []);

  useEffect(() => {
    if (user) {
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = async () => {
    try {
      const reports = await getUserPriceReports(user.uid);
      
      // Calculate category breakdown
      const categoryBreakdown = {};
      const productCategories = {
        'milk': 'Essential Foods', 'bread': 'Essential Foods', 'rice': 'Essential Foods', 
        'eggs': 'Essential Foods', 'chicken': 'Essential Foods', 'onions': 'Essential Foods',
        'water': 'Beverages', 'tea': 'Beverages', 'coffee': 'Beverages', 'juice': 'Beverages',
        'petrol': 'Fuel & Transport', 'diesel': 'Fuel & Transport', 'cng': 'Fuel & Transport',
        'soap': 'Personal Care', 'shampoo': 'Personal Care', 'toothpaste': 'Personal Care'
      };
      
      reports.forEach(report => {
        const category = productCategories[report.product] || 'Other';
        categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;
      });
      
      // Calculate achievements
      const earnedAchievements = [];
      const totalReports = reports.length;
      const uniqueCategories = Object.keys(categoryBreakdown).length;
      
      achievements.forEach(achievement => {
        let earned = false;
        if (achievement.id === 'category_master') {
          earned = uniqueCategories >= achievement.threshold;
        } else {
          earned = totalReports >= achievement.threshold;
        }
        
        if (earned) {
          earnedAchievements.push({
            ...achievement,
            earnedDate: new Date() // In real app, this would be stored in Firebase
          });
        }
      });
      
      // Get recent activity from actual reports
      const recentActivity = reports
        .sort((a, b) => (b.timestamp?.toDate() || new Date()) - (a.timestamp?.toDate() || new Date()))
        .slice(0, 10)
        .map(report => ({
          type: 'price_report',
          product: report.productName || report.product,
          shop: report.shop,
          price: report.price,
          date: report.timestamp?.toDate() || new Date()
        }));
      
      // Calculate trust score based on actual data
      const trustScore = Math.min(1 + (totalReports * 0.1) + (earnedAchievements.length * 0.2), 5);
      
      setStats({
        totalReports,
        trustScore,
        joinedDate: user.metadata?.creationTime || user.createdAt || new Date(),
        recentActivity,
        achievements: earnedAchievements,
        categoryBreakdown
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
      // Fallback to basic data if Firebase fails
      setStats({
        totalReports: 0,
        trustScore: 1.0,
        joinedDate: user.metadata?.creationTime || new Date(),
        recentActivity: [],
        achievements: [],
        categoryBreakdown: {}
      });
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

  const getContributorLevel = (reportCount) => {
    if (reportCount >= 100) return { level: 'Community Hero', color: '#ffd700', icon: '👑' };
    if (reportCount >= 50) return { level: 'Price Expert', color: '#ff6b35', icon: '🏆' };
    if (reportCount >= 25) return { level: 'Trusted Member', color: '#4ecdc4', icon: '⭐' };
    if (reportCount >= 10) return { level: 'Regular Reporter', color: '#45b7d1', icon: '📝' };
    if (reportCount >= 1) return { level: 'First Reporter', color: '#96ceb4', icon: '🎯' };
    return { level: 'New Member', color: '#95a5a6', icon: '👤' };
  };

  const contributorInfo = getContributorLevel(stats.totalReports);

  if (loading) {
    return (
      <div className="home-page">
        <div className="loading-state">
          <div className="loading-spinner">👤</div>
          <h3>Loading your profile...</h3>
          <p>Calculating your statistics and achievements</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Header Section */}
      <div className="home-header">
        <div className="welcome-section">
          <h1>👤 My Profile</h1>
          <p>Your contribution to price transparency</p>
          <div className="last-updated">
            Member since {new Date(stats.joinedDate).toLocaleDateString()}
          </div>
        </div>
        
        {/* User Info */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '20px', 
          marginTop: '20px',
          padding: '20px',
          background: 'rgba(255, 255, 255, 0.7)',
          borderRadius: '16px',
          border: '1px solid #e9ecef'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${contributorInfo.color}, ${contributorInfo.color}aa)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}>
            {contributorInfo.icon}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '1.4rem', color: '#212529' }}>
              {user?.email}
            </h2>
            <div style={{ 
              fontSize: '1rem', 
              fontWeight: '600', 
              color: contributorInfo.color,
              marginBottom: '4px'
            }}>
              {contributorInfo.level}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
              Trust Score: {stats.trustScore.toFixed(1)}/5.0
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="section">
        <div className="product-shelf" style={{ display: 'flex', gap: '8px', padding: '16px', flexWrap: 'wrap' }}>
          {['overview', 'achievements', 'activity'].map(tab => (
            <button
              key={tab}
              className={`action-btn ${activeTab === tab ? 'report-btn' : ''}`}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? '#0066cc' : '#f8f9fa',
                color: activeTab === tab ? 'white' : '#212529',
                border: '2px solid #e9ecef',
                textTransform: 'capitalize'
              }}
            >
              {tab === 'overview' ? '📊 Overview' : 
               tab === 'achievements' ? '🏆 Achievements' : 
               '📈 Activity'}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Grid */}
          <div className="section">
            <div className="section-header">
              <h2>📊 Your Statistics</h2>
              <p>Your contribution to the community</p>
            </div>
            
            <div className="product-shelf">
              <div className="shelf-item">
                <div className="item-image">
                  <div className="item-icon">📝</div>
                </div>
                <div className="item-details">
                  <h3>Price Reports</h3>
                  <div className="item-price">
                    <span className="current-price">{stats.totalReports}</span>
                  </div>
                  <div className="item-meta">
                    <div className="confidence-badge" data-confidence="high">
                      Total Submitted
                    </div>
                  </div>
                </div>
              </div>

              <div className="shelf-item">
                <div className="item-image">
                  <div className="item-icon">⭐</div>
                </div>
                <div className="item-details">
                  <h3>Trust Score</h3>
                  <div className="item-price">
                    <span className="current-price">{stats.trustScore.toFixed(1)}</span>
                    <span className="price-change" style={{ color: '#28a745' }}>/5.0</span>
                  </div>
                  <div className="item-meta">
                    <div className="confidence-badge" data-confidence="high">
                      Community Rating
                    </div>
                  </div>
                </div>
              </div>

              <div className="shelf-item">
                <div className="item-image">
                  <div className="item-icon">🏆</div>
                </div>
                <div className="item-details">
                  <h3>Achievements</h3>
                  <div className="item-price">
                    <span className="current-price">{stats.achievements.length}</span>
                    <span className="price-change" style={{ color: '#0066cc' }}>/{achievements.length}</span>
                  </div>
                  <div className="item-meta">
                    <div className="confidence-badge" data-confidence="medium">
                      Unlocked
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="section">
            <div className="section-header">
              <h2>📦 Category Breakdown</h2>
              <p>Your reports by product category</p>
            </div>
            
            <div className="trending-shelf">
              {Object.entries(stats.categoryBreakdown).map(([category, count]) => (
                <div key={category} className="trending-item">
                  <div className="trending-icon">
                    {category === 'Essential Foods' ? '🥛' :
                     category === 'Beverages' ? '☕' :
                     category === 'Fuel & Transport' ? '⛽' :
                     category === 'Personal Care' ? '🧼' : '📦'}
                  </div>
                  <div className="trending-info">
                    <h4>{category}</h4>
                    <div className="trending-price">{count} reports</div>
                    <div className="trending-meta">
                      {((count / stats.totalReports) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Achievements Tab */}
      {activeTab === 'achievements' && (
        <div className="section">
          <div className="section-header">
            <h2>🏆 Achievements</h2>
            <p>Your milestones and accomplishments</p>
          </div>
          
          <div className="product-shelf">
            {achievements.map((achievement) => {
              const isEarned = stats.achievements.some(a => a.id === achievement.id);
              return (
                <div 
                  key={achievement.id} 
                  className="shelf-item"
                  style={{ 
                    opacity: isEarned ? 1 : 0.6,
                    background: isEarned ? 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)' : undefined,
                    border: isEarned ? '2px solid #ffc107' : undefined
                  }}
                >
                  <div className="item-image">
                    <div className="item-icon" style={{ 
                      filter: isEarned ? 'none' : 'grayscale(100%)'
                    }}>
                      {achievement.icon}
                    </div>
                    {isEarned && (
                      <div className="item-trend">
                        <span style={{ color: '#ffc107' }}>✅</span>
                      </div>
                    )}
                  </div>
                  <div className="item-details">
                    <h3>{achievement.name}</h3>
                    <div className="item-unit">{achievement.description}</div>
                    <div className="item-meta">
                      <div 
                        className="confidence-badge" 
                        style={{
                          background: isEarned ? 'rgba(255, 193, 7, 0.2)' : 'rgba(108, 117, 125, 0.2)',
                          color: isEarned ? '#ffc107' : '#6c757d'
                        }}
                      >
                        {isEarned ? 'Earned' : 'Locked'}
                      </div>
                      <div className="report-count">
                        {achievement.threshold} required
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div className="section">
          <div className="section-header">
            <h2>📈 Recent Activity</h2>
            <p>Your latest price reports</p>
          </div>
          
          {stats.recentActivity.length > 0 ? (
            <div className="activity-feed">
              {stats.recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon">📝</div>
                  <div className="activity-content">
                    <div className="activity-text">
                      Reported <strong>{activity.product}</strong> at <strong>{activity.shop}</strong> for <strong>₹{activity.price}</strong>
                    </div>
                    <div className="activity-time">
                      {activity.date?.toLocaleString() || 'Recently'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="activity-feed">
              <div className="activity-item">
                <div className="activity-icon">📝</div>
                <div className="activity-content">
                  <div className="activity-text">
                    No recent activity. Start reporting prices to see your activity here!
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="section">
        <div className="section-header">
          <h2>⚡ Quick Actions</h2>
          <p>Manage your account and activity</p>
        </div>
        
        <div className="action-grid">
          <a href="/report" className="action-card primary">
            <div className="action-icon">📝</div>
            <h3>Report Price</h3>
            <p>Add more price reports</p>
          </a>
          
          <a href="/insights" className="action-card">
            <div className="action-icon">📊</div>
            <h3>View Insights</h3>
            <p>See your price analysis</p>
          </a>
          
          <button 
            className="action-card"
            onClick={loadUserStats}
          >
            <div className="action-icon">🔄</div>
            <h3>Refresh Stats</h3>
            <p>Update your profile data</p>
          </button>
          
          <button 
            className="action-card"
            onClick={handleLogout}
            style={{ 
              background: 'linear-gradient(135deg, #dc3545, #c82333)',
              color: 'white',
              border: '2px solid #dc3545'
            }}
          >
            <div className="action-icon">🚪</div>
            <h3>Logout</h3>
            <p>Sign out of your account</p>
          </button>
        </div>
      </div>

      {/* Privacy Info */}
      <div className="section">
        <div className="activity-feed" style={{ background: '#f8f9fa', border: '1px solid #e9ecef' }}>
          <div className="activity-item">
            <div className="activity-icon">🔒</div>
            <div className="activity-content">
              <div className="activity-text" style={{ fontWeight: '600', marginBottom: '8px' }}>
                Privacy & Data Protection
              </div>
              <div style={{ fontSize: '0.9rem', color: '#6c757d', lineHeight: '1.4' }}>
                We only store your email and price reports. Your data helps provide price transparency 
                and is never shared with third parties. You can delete your account and all data at any time.
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
};

export default Profile;