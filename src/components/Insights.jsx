import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserPriceReports } from '../utils/priceLogic';
import { getGeminiExplanation } from '../services/gemini';
import BottomNav from './BottomNav';

const Insights = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState({});

  const loadUserReports = useCallback(async () => {
    try {
      const userReports = await getUserPriceReports(user.uid);
      setReports(userReports);
      
      // Generate insights for each report
      const insightPromises = userReports.map(async (report) => {
        const explanation = await getGeminiExplanation(
          report.price,
          report.medianPrice || report.price,
          report.areaAverage || report.price
        );
        return { [report.id]: explanation };
      });
      
      const insightResults = await Promise.all(insightPromises);
      const insightsMap = insightResults.reduce((acc, insight) => ({ ...acc, ...insight }), {});
      setInsights(insightsMap);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadUserReports();
    }
  }, [user, loadUserReports]);

  const getStatusLabel = (userPrice, medianPrice) => {
    if (!medianPrice) return 'New Report';
    const diff = ((userPrice - medianPrice) / medianPrice) * 100;
    if (diff > 20) return 'Above Market';
    if (diff < -20) return 'Below Market';
    return 'Market Rate';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Above Market': return '#ff6b6b';
      case 'Below Market': return '#51cf66';
      default: return '#339af0';
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>Price Insights</h1>
        </div>
        <div className="loading">Loading your insights...</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Price Insights</h1>
        <p>AI-powered analysis of your price reports</p>
      </div>

      <div className="insights-container">
        {reports.length === 0 ? (
          <div className="empty-state">
            <p>No price reports yet. Start reporting prices to see insights!</p>
          </div>
        ) : (
          reports.map((report) => {
            const status = getStatusLabel(report.price, report.medianPrice);
            return (
              <div key={report.id} className="insight-card">
                <div className="insight-header">
                  <h3>{report.product}</h3>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(status) }}
                  >
                    {status}
                  </span>
                </div>
                
                <div className="price-comparison">
                  <div className="price-item">
                    <span className="label">Your Price</span>
                    <span className="value">₹{report.price}</span>
                  </div>
                  {report.medianPrice && (
                    <div className="price-item">
                      <span className="label">Market Median</span>
                      <span className="value">₹{report.medianPrice}</span>
                    </div>
                  )}
                </div>

                <div className="shop-info">
                  <span>📍 {report.shop}</span>
                  <span>📅 {new Date(report.timestamp?.toDate()).toLocaleDateString()}</span>
                </div>

                {insights[report.id] && (
                  <div className="ai-explanation">
                    <h4>💡 AI Analysis</h4>
                    <p>{insights[report.id]}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Insights;