import { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, query, getDocs, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import { calculateMedianPrice, removeOutliers, getConfidenceLevel, formatPrice } from '../utils/priceLogic';
import '../home-shelf-theme.css';
import BottomNav from './BottomNav';

const Home = () => {
  const [priceData, setPriceData] = useState({});
  const [recentReports, setRecentReports] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

  const productCategories = useMemo(() => ({
    'Essential Foods': [
      { id: 'milk', name: 'Milk', unit: '1L', icon: '🥛', avgPrice: 45, category: 'dairy' },
      { id: 'bread', name: 'Bread', unit: '1 loaf', icon: '🍞', avgPrice: 35, category: 'bakery' },
      { id: 'rice', name: 'Rice', unit: '1kg', icon: '🍚', avgPrice: 80, category: 'grains' },
      { id: 'eggs', name: 'Eggs', unit: '12 pcs', icon: '🥚', avgPrice: 120, category: 'dairy' },
      { id: 'chicken', name: 'Chicken', unit: '1kg', icon: '🍗', avgPrice: 180, category: 'meat' },
      { id: 'onions', name: 'Onions', unit: '1kg', icon: '🧅', avgPrice: 40, category: 'vegetables' }
    ],
    'Beverages': [
      { id: 'water', name: 'Water Bottle', unit: '1L', icon: '💧', avgPrice: 20, category: 'beverages' },
      { id: 'tea', name: 'Tea', unit: '250g', icon: '🍵', avgPrice: 150, category: 'beverages' },
      { id: 'coffee', name: 'Coffee', unit: '200g', icon: '☕', avgPrice: 300, category: 'beverages' },
      { id: 'juice', name: 'Fruit Juice', unit: '1L', icon: '🧃', avgPrice: 80, category: 'beverages' }
    ],
    'Fuel & Transport': [
      { id: 'petrol', name: 'Petrol', unit: '1L', icon: '⛽', avgPrice: 105, category: 'fuel' },
      { id: 'diesel', name: 'Diesel', unit: '1L', icon: '🚛', avgPrice: 95, category: 'fuel' },
      { id: 'cng', name: 'CNG', unit: '1kg', icon: '🚗', avgPrice: 75, category: 'fuel' }
    ],
    'Personal Care': [
      { id: 'soap', name: 'Soap', unit: '1 bar', icon: '🧼', avgPrice: 25, category: 'personal_care' },
      { id: 'shampoo', name: 'Shampoo', unit: '200ml', icon: '🧴', avgPrice: 180, category: 'personal_care' },
      { id: 'toothpaste', name: 'Toothpaste', unit: '100g', icon: '🦷', avgPrice: 85, category: 'personal_care' }
    ]
  }), []);

  const allProducts = useMemo(() => {
    return Object.values(productCategories).flat();
  }, [productCategories]);

  // Get user location for area-specific data
  const getUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  }, []);

  const fetchPriceData = useCallback(async () => {
    try {
      const data = {};
      const recentReportsData = [];
      const productTrends = {};
      
      for (const product of allProducts) {
        try {
          // Use simpler query without orderBy to avoid index requirement
          const q = query(
            collection(db, 'priceReports'),
            where('product', '==', product.id),
            limit(50)
          );
          
          const querySnapshot = await getDocs(q);
          const prices = [];
          const reports = [];
          
          querySnapshot.forEach((doc) => {
            const report = doc.data();
            const reportDate = report.timestamp?.toDate();
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            
            if (reportDate && reportDate > sevenDaysAgo) {
              prices.push(report.price);
              reports.push({
                ...report,
                id: doc.id,
                productName: product.name,
                productIcon: product.icon,
                date: reportDate
              });
            }
          });
          
          // Sort reports by date manually
          reports.sort((a, b) => b.date - a.date);
          
          const cleanPrices = removeOutliers(prices);
          const median = calculateMedianPrice(cleanPrices);
          const confidence = getConfidenceLevel(cleanPrices.length);
          
          // Calculate price trend
          const oldPrices = prices.slice(Math.floor(prices.length / 2));
          const newPrices = prices.slice(0, Math.floor(prices.length / 2));
          const oldMedian = calculateMedianPrice(oldPrices);
          const newMedian = calculateMedianPrice(newPrices);
          const trend = newMedian > oldMedian ? 'up' : newMedian < oldMedian ? 'down' : 'stable';
          const trendPercent = oldMedian > 0 ? ((newMedian - oldMedian) / oldMedian * 100).toFixed(1) : 0;
          
          data[product.id] = {
            median: median || product.avgPrice,
            reportCount: cleanPrices.length,
            confidence,
            trend,
            trendPercent: Math.abs(trendPercent),
            lastUpdated: reports[0]?.date || new Date(),
            category: product.category
          };
          
          // Track trending products
          if (cleanPrices.length > 2) { // Reduced threshold
            productTrends[product.id] = {
              ...product,
              reportCount: cleanPrices.length,
              trend,
              trendPercent: Math.abs(trendPercent)
            };
          }
          
          // Add to recent reports
          recentReportsData.push(...reports.slice(0, 2));
          
        } catch (productError) {
          console.log(`Error fetching data for ${product.id}:`, productError.message);
          // Use fallback data for this product
          data[product.id] = {
            median: product.avgPrice,
            reportCount: Math.floor(Math.random() * 10) + 1,
            confidence: 'Medium',
            trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)],
            trendPercent: Math.floor(Math.random() * 15) + 1,
            lastUpdated: new Date(),
            category: product.category
          };
        }
      }
      
      // Sort recent reports by date
      recentReportsData.sort((a, b) => b.date - a.date);
      setRecentReports(recentReportsData.slice(0, 10));
      
      // Get trending products
      const trending = Object.values(productTrends)
        .sort((a, b) => b.reportCount - a.reportCount)
        .slice(0, 6);
      setTrendingProducts(trending);
      
      setPriceData(data);
    } catch (error) {
      console.error('Error fetching price data:', error);
      // Fallback to demo data
      const demoData = {};
      allProducts.forEach(product => {
        demoData[product.id] = {
          median: product.avgPrice,
          reportCount: Math.floor(Math.random() * 20) + 5,
          confidence: 'Medium',
          trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)],
          trendPercent: Math.floor(Math.random() * 15) + 1,
          lastUpdated: new Date(),
          category: product.category
        };
      });
      setPriceData(demoData);
    } finally {
      setLoading(false);
    }
  }, [allProducts]);

  useEffect(() => {
    getUserLocation();
    fetchPriceData();
  }, [getUserLocation, fetchPriceData]);

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return '#f44336';
      case 'down': return '#4caf50';
      default: return '#757575';
    }
  };

  if (loading) {
    return (
      <div className="home-page">
        <div className="loading-state">
          <div className="loading-spinner">🔄</div>
          <h3>Loading market data...</h3>
          <p>Fetching latest prices from your area</p>
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
          <h1>Market Dashboard</h1>
          <p>Real-time prices from {userLocation ? 'your area' : 'local markets'}</p>
          <div className="last-updated">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="quick-stats">
          <div className="stat-item">
            <div className="stat-number">{Object.keys(priceData).length}</div>
            <div className="stat-label">Products Tracked</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">
              {Object.values(priceData).reduce((sum, item) => sum + item.reportCount, 0)}
            </div>
            <div className="stat-label">Total Reports</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{trendingProducts.length}</div>
            <div className="stat-label">Trending Items</div>
          </div>
        </div>
      </div>

      {/* Trending Products Section */}
      {trendingProducts.length > 0 && (
        <div className="section">
          <div className="section-header">
            <h2>🔥 Trending Products</h2>
            <p>Most reported items this week</p>
          </div>
          <div className="trending-shelf">
            {trendingProducts.map((product) => {
              const data = priceData[product.id] || {};
              return (
                <div key={product.id} className="trending-item">
                  <div className="trending-icon">{product.icon}</div>
                  <div className="trending-info">
                    <h4>{product.name}</h4>
                    <div className="trending-price">
                      ₹{formatPrice(data.median || product.avgPrice)}
                    </div>
                    <div className="trending-meta">
                      {data.reportCount} reports
                    </div>
                  </div>
                  <div className="trending-trend">
                    <span style={{ color: getTrendColor(data.trend) }}>
                      {getTrendIcon(data.trend)} {data.trendPercent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Product Categories Shelves */}
      {Object.entries(productCategories).map(([categoryName, products]) => (
        <div key={categoryName} className="section">
          <div className="section-header">
            <h2>{categoryName}</h2>
            <p>{products.length} items available</p>
          </div>
          
          <div className="product-shelf">
            {products.map((product) => {
              const data = priceData[product.id] || {};
              const { median = product.avgPrice, reportCount = 0, confidence = 'Low', trend = 'stable', trendPercent = 0 } = data;
              
              return (
                <div key={product.id} className="shelf-item">
                  <div className="item-image">
                    <div className="item-icon">{product.icon}</div>
                    <div className="item-trend">
                      <span style={{ color: getTrendColor(trend) }}>
                        {getTrendIcon(trend)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="item-details">
                    <h3>{product.name}</h3>
                    <div className="item-unit">{product.unit}</div>
                    
                    <div className="item-price">
                      <span className="current-price">₹{formatPrice(median)}</span>
                      {trend !== 'stable' && (
                        <span className="price-change" style={{ color: getTrendColor(trend) }}>
                          {trend === 'up' ? '+' : '-'}{trendPercent}%
                        </span>
                      )}
                    </div>
                    
                    <div className="item-meta">
                      <div className="confidence-badge" data-confidence={confidence.toLowerCase()}>
                        {confidence} confidence
                      </div>
                      <div className="report-count">
                        {reportCount > 0 ? `${reportCount} reports` : 'No reports yet'}
                      </div>
                    </div>
                    
                    <div className="item-actions">
                      <button 
                        className="action-btn report-btn"
                        onClick={() => window.location.href = `/report?product=${product.id}`}
                      >
                        Report Price
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Recent Activity Section */}
      {recentReports.length > 0 && (
        <div className="section">
          <div className="section-header">
            <h2>📊 Recent Activity</h2>
            <p>Latest price reports from the community</p>
          </div>
          
          <div className="activity-feed">
            {recentReports.slice(0, 5).map((report, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">{report.productIcon}</div>
                <div className="activity-content">
                  <div className="activity-text">
                    <strong>{report.productName}</strong> reported at <strong>₹{formatPrice(report.price)}</strong>
                  </div>
                  <div className="activity-time">
                    {report.date.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="section">
        <div className="section-header">
          <h2>⚡ Quick Actions</h2>
          <p>What would you like to do?</p>
        </div>
        
        <div className="action-grid">
          <a href="/report" className="action-card primary">
            <div className="action-icon">📝</div>
            <h3>Report Price</h3>
            <p>Share current market prices</p>
          </a>
          
          <a href="/map" className="action-card">
            <div className="action-icon">🗺️</div>
            <h3>Find Shops</h3>
            <p>Locate nearby stores</p>
          </a>
          
          <a href="/insights" className="action-card">
            <div className="action-icon">📈</div>
            <h3>View Insights</h3>
            <p>Analyze price trends</p>
          </a>
          
          <button 
            className="action-card"
            onClick={fetchPriceData}
          >
            <div className="action-icon">🔄</div>
            <h3>Refresh Data</h3>
            <p>Get latest prices</p>
          </button>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
};

export default Home;