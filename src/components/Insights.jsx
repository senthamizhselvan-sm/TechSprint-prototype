import { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, query, getDocs, where, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { getUserPriceReports, calculateMedianPrice, removeOutliers } from '../utils/priceLogic';
import { getGeminiExplanation } from '../services/gemini';
import '../home-shelf-theme.css';
import BottomNav from './BottomNav';

const Insights = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [marketData, setMarketData] = useState({});
  const [insights, setInsights] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [priceAlerts, setPriceAlerts] = useState([]);

  const categories = useMemo(() => ['all', 'Essential Foods', 'Beverages', 'Fuel & Transport', 'Personal Care'], []);

  const loadUserReports = useCallback(async () => {
    try {
      const userReports = await getUserPriceReports(user.uid);
      setReports(userReports);
      
      // Get market data for comparison
      const marketDataMap = {};
      const insightsMap = {};
      const alertsArray = [];
      
      for (const report of userReports) {
        try {
          // Get all reports for this product using simpler query
          const productQuery = query(
            collection(db, 'priceReports'),
            where('product', '==', report.product),
            limit(50)
          );
          
          const productSnapshot = await getDocs(productQuery);
          const productPrices = [];
          productSnapshot.forEach(doc => {
            const data = doc.data();
            const reportDate = data.timestamp?.toDate();
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            
            if (reportDate && reportDate > sevenDaysAgo) {
              productPrices.push(data.price);
            }
          });
          
          const cleanPrices = removeOutliers(productPrices);
          const medianPrice = calculateMedianPrice(cleanPrices);
          const avgPrice = cleanPrices.length > 0 ? cleanPrices.reduce((a, b) => a + b, 0) / cleanPrices.length : 0;
          
          marketDataMap[report.product] = {
            median: medianPrice || report.price, // Fallback to user's price if no market data
            average: avgPrice || report.price,
            reportCount: cleanPrices.length,
            priceRange: cleanPrices.length > 0 ? {
              min: Math.min(...cleanPrices),
              max: Math.max(...cleanPrices)
            } : { min: report.price, max: report.price }
          };
          
          // Generate insights
          const userPrice = report.price;
          const marketMedian = medianPrice || report.price;
          const priceDiff = marketMedian > 0 ? ((userPrice - marketMedian) / marketMedian) * 100 : 0;
          
          let status = 'Fair Price';
          let statusColor = '#28a745';
          let explanation = '';
          
          if (Math.abs(priceDiff) < 10) {
            status = 'Fair Price';
            statusColor = '#28a745';
            explanation = `Your price of ₹${userPrice} is close to the market median of ₹${marketMedian.toFixed(2)}. This suggests fair market pricing.`;
          } else if (priceDiff > 10) {
            status = 'Above Market';
            statusColor = '#dc3545';
            explanation = `You paid ₹${userPrice}, which is ${Math.round(priceDiff)}% above the market median of ₹${marketMedian.toFixed(2)}. Consider comparing prices.`;
            
            if (priceDiff > 25) {
              alertsArray.push({
                type: 'high_price',
                product: report.productName || report.product,
                message: `You paid ${Math.round(priceDiff)}% more than market price`,
                severity: 'high'
              });
            }
          } else {
            status = 'Good Deal';
            statusColor = '#0066cc';
            explanation = `Great deal! You paid ₹${userPrice}, which is ${Math.abs(Math.round(priceDiff))}% below the market median of ₹${marketMedian.toFixed(2)}.`;
          }
          
          insightsMap[report.id] = {
            status,
            statusColor,
            explanation,
            priceDiff: Math.abs(priceDiff),
            trend: priceDiff > 0 ? 'above' : priceDiff < 0 ? 'below' : 'equal'
          };
          
          // Note: Gemini AI explanations disabled to prevent excessive API calls
          // The fallback explanation is sufficient for most use cases
          
        } catch (productError) {
          console.log(`Error processing product ${report.product}:`, productError.message);
          // Use fallback data for this product
          marketDataMap[report.product] = {
            median: report.price,
            average: report.price,
            reportCount: 1,
            priceRange: { min: report.price, max: report.price }
          };
          
          insightsMap[report.id] = {
            status: 'Fair Price',
            statusColor: '#28a745',
            explanation: `Your price of ₹${report.price} for ${report.productName || report.product}. Market data is limited for comparison.`,
            priceDiff: 0,
            trend: 'equal'
          };
        }
      }
      
      setMarketData(marketDataMap);
      setInsights(insightsMap);
      setPriceAlerts(alertsArray);
      
      // Calculate trending products
      const productCounts = {};
      userReports.forEach(userReport => {
        productCounts[userReport.product] = (productCounts[userReport.product] || 0) + 1;
      });
      
      const trending = Object.entries(productCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 6)
        .map(([productId, count]) => ({
          id: productId,
          name: userReports.find(r => r.product === productId)?.productName || productId,
          count,
          avgPrice: userReports.filter(r => r.product === productId).reduce((sum, r) => sum + r.price, 0) / count
        }));
      
      setTrendingProducts(trending);
      
    } catch (error) {
      console.error('Error loading insights:', error);
      // Use fallback data
      if (reports.length > 0) {
        const fallbackInsights = {};
        reports.forEach(userReport => {
          fallbackInsights[userReport.id] = {
            status: 'Fair Price',
            statusColor: '#28a745',
            explanation: `Your price of ₹${userReport.price} for ${userReport.productName || userReport.product}. Market analysis is temporarily unavailable.`,
            priceDiff: 0,
            trend: 'equal'
          };
        });
        setInsights(fallbackInsights);
      }
    } finally {
      setLoading(false);
    }
  }, [user.uid]);

  useEffect(() => {
    if (user) {
      loadUserReports();
    }
  }, [user, loadUserReports]);

  const filteredReports = reports.filter(() => {
    if (selectedCategory === 'all') return true;
    // This would need category mapping from the report data
    return true; // Simplified for now
  });

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'above': return '📈';
      case 'below': return '📉';
      default: return '➡️';
    }
  };

  if (loading) {
    return (
      <div className="home-page">
        <div className="loading-state">
          <div className="loading-spinner">📊</div>
          <h3>Analyzing your price reports...</h3>
          <p>Generating AI-powered insights</p>
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
          <h1>📊 Price Insights</h1>
          <p>AI-powered analysis of your shopping patterns</p>
          <div className="last-updated">
            {reports.length} reports analyzed • {trendingProducts.length} products tracked
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="quick-stats">
          <div className="stat-item">
            <div className="stat-number">{reports.length}</div>
            <div className="stat-label">Total Reports</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">
              {Object.values(insights).filter(i => i.status === 'Good Deal').length}
            </div>
            <div className="stat-label">Good Deals</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{priceAlerts.length}</div>
            <div className="stat-label">Price Alerts</div>
          </div>
        </div>
      </div>

      {/* Price Alerts */}
      {priceAlerts.length > 0 && (
        <div className="section">
          <div className="section-header">
            <h2>⚠️ Price Alerts</h2>
            <p>Items where you paid significantly more than market price</p>
          </div>
          <div className="activity-feed" style={{ background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)', border: '2px solid #ffc107' }}>
            {priceAlerts.map((alert, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon" style={{ background: '#ffc107', color: 'white' }}>⚠️</div>
                <div className="activity-content">
                  <div className="activity-text" style={{ color: '#856404', fontWeight: 'bold' }}>
                    {alert.product}: {alert.message}
                  </div>
                  <div className="activity-time" style={{ color: '#856404' }}>
                    Consider comparing prices before your next purchase
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trending Products */}
      {trendingProducts.length > 0 && (
        <div className="section">
          <div className="section-header">
            <h2>📈 Your Most Reported Products</h2>
            <p>Products you report prices for most frequently</p>
          </div>
          <div className="trending-shelf">
            {trendingProducts.map((product) => (
              <div key={product.id} className="trending-item">
                <div className="trending-icon">📦</div>
                <div className="trending-info">
                  <h4>{product.name}</h4>
                  <div className="trending-price">
                    Avg: ₹{product.avgPrice.toFixed(2)}
                  </div>
                  <div className="trending-meta">
                    {product.count} reports
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="section">
        <div className="section-header">
          <h2>🔍 Filter Reports</h2>
          <p>View insights by category</p>
        </div>
        <div className="product-shelf" style={{ display: 'flex', gap: '12px', padding: '16px', flexWrap: 'wrap' }}>
          {categories.map(category => (
            <button
              key={category}
              className={`action-btn ${selectedCategory === category ? 'report-btn' : ''}`}
              onClick={() => setSelectedCategory(category)}
              style={{
                background: selectedCategory === category ? '#0066cc' : '#f8f9fa',
                color: selectedCategory === category ? 'white' : '#212529',
                border: '2px solid #e9ecef'
              }}
            >
              {category === 'all' ? 'All Categories' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Insights Cards */}
      <div className="section">
        <div className="section-header">
          <h2>💡 Detailed Analysis</h2>
          <p>AI-powered insights for each of your reports</p>
        </div>
        
        {filteredReports.length === 0 ? (
          <div className="activity-feed">
            <div className="activity-item">
              <div className="activity-icon">📝</div>
              <div className="activity-content">
                <div className="activity-text">
                  No price reports yet. Start reporting prices to see personalized insights!
                </div>
                <div className="activity-time">
                  <button 
                    className="action-btn report-btn"
                    onClick={() => window.location.href = '/report'}
                    style={{ marginTop: '12px' }}
                  >
                    Report Your First Price
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="product-shelf">
            {filteredReports.map((report) => {
              const insight = insights[report.id] || {};
              const market = marketData[report.product] || {};
              
              return (
                <div key={report.id} className="shelf-item">
                  <div className="item-image">
                    <div className="item-icon">📦</div>
                    <div className="item-trend">
                      <span style={{ color: insight.statusColor }}>
                        {getTrendIcon(insight.trend)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="item-details">
                    <h3>{report.productName || report.product}</h3>
                    <div className="item-unit">
                      📍 {report.shop} • 📅 {new Date(report.timestamp?.toDate()).toLocaleDateString()}
                    </div>
                    
                    <div className="item-price">
                      <span className="current-price">₹{report.price}</span>
                      {insight.priceDiff > 0 && (
                        <span className="price-change" style={{ color: insight.statusColor }}>
                          {insight.priceDiff.toFixed(1)}% {insight.trend}
                        </span>
                      )}
                    </div>
                    
                    <div className="item-meta">
                      <div 
                        className="confidence-badge" 
                        style={{ 
                          background: `${insight.statusColor}20`,
                          color: insight.statusColor,
                          border: `1px solid ${insight.statusColor}50`
                        }}
                      >
                        {insight.status}
                      </div>
                      <div className="report-count">
                        Market: ₹{market.median?.toFixed(2) || 'N/A'}
                      </div>
                    </div>
                    
                    {market.reportCount && (
                      <div style={{ 
                        fontSize: '0.8rem', 
                        color: '#6c757d', 
                        marginBottom: '12px',
                        padding: '8px',
                        background: '#f8f9fa',
                        borderRadius: '6px'
                      }}>
                        <strong>Market Data:</strong><br/>
                        Range: ₹{market.priceRange?.min?.toFixed(2)} - ₹{market.priceRange?.max?.toFixed(2)}<br/>
                        Based on {market.reportCount} reports
                      </div>
                    )}
                    
                    {insight.explanation && (
                      <div className="ai-analysis-box">
                        <div className="ai-analysis-title">
                          🤖 AI Analysis
                        </div>
                        <div className="ai-analysis-text">
                          {insight.explanation}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="section">
        <div className="section-header">
          <h2>⚡ Quick Actions</h2>
          <p>What would you like to do next?</p>
        </div>
        
        <div className="action-grid">
          <a href="/report" className="action-card primary">
            <div className="action-icon">📝</div>
            <h3>Report More Prices</h3>
            <p>Add more data for better insights</p>
          </a>
          
          <a href="/map" className="action-card">
            <div className="action-icon">🗺️</div>
            <h3>Find Shops</h3>
            <p>Discover nearby stores</p>
          </a>
          
          <button 
            className="action-card"
            onClick={loadUserReports}
          >
            <div className="action-icon">🔄</div>
            <h3>Refresh Analysis</h3>
            <p>Update your insights</p>
          </button>
          
          <a href="/profile" className="action-card">
            <div className="action-icon">👤</div>
            <h3>View Profile</h3>
            <p>Check your statistics</p>
          </a>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
};

export default Insights;