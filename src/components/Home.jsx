import { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { calculateMedianPrice, removeOutliers, getConfidenceLevel, formatPrice } from '../utils/priceLogic';
import BottomNav from './BottomNav';

const Home = () => {
  const [priceData, setPriceData] = useState({});
  const [loading, setLoading] = useState(true);

  const products = useMemo(() => [
    { id: 'milk', name: 'Milk (1L)', icon: 'MILK' },
    { id: 'rice', name: 'Rice (1kg)', icon: 'RICE' },
    { id: 'petrol', name: 'Petrol (1L)', icon: 'FUEL' },
    { id: 'grocery', name: 'Grocery Basket', icon: 'SHOP' }
  ], []);

  const fetchPriceData = useCallback(async () => {
    try {
      const data = {};
      
      for (const product of products) {
        const q = query(
          collection(db, 'priceReports'),
          where('product', '==', product.id)
        );
        
        const querySnapshot = await getDocs(q);
        const prices = [];
        
        querySnapshot.forEach((doc) => {
          const report = doc.data();
          // Only include reports from last 30 days
          const reportDate = report.timestamp?.toDate();
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          
          if (reportDate && reportDate > thirtyDaysAgo) {
            prices.push(report.price);
          }
        });
        
        const cleanPrices = removeOutliers(prices);
        const median = calculateMedianPrice(cleanPrices);
        const confidence = getConfidenceLevel(cleanPrices.length);
        
        data[product.id] = {
          median,
          reportCount: cleanPrices.length,
          confidence
        };
      }
      
      setPriceData(data);
    } catch (error) {
      console.error('Error fetching price data:', error);
    } finally {
      setLoading(false);
    }
  }, [products]);

  useEffect(() => {
    fetchPriceData();
  }, [fetchPriceData]);

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading price data...</div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Welcome back!</h1>
        <p>Current market prices in your area</p>
      </div>
      
      <div className="product-grid">
        {products.map((product) => {
          const data = priceData[product.id] || {};
          const { median = 0, reportCount = 0, confidence = 'Low' } = data;
          
          return (
            <div key={product.id} className="product-card">
              <div className="product-icon">
                {product.icon}
              </div>
              <h3>{product.name}</h3>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1976d2', marginBottom: '8px' }}>
                {median > 0 ? formatPrice(median) : 'No data'}
              </div>
              <p>
                {reportCount > 0 ? (
                  <>
                    {reportCount} reports • {confidence} confidence
                  </>
                ) : (
                  'Be the first to report!'
                )}
              </p>
            </div>
          );
        })}
      </div>
      
      <div className="card" style={{ marginTop: '30px' }}>
        <h3 style={{ marginBottom: '16px', color: '#333' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a href="/report" className="btn btn-primary">
            Report Price
          </a>
          <a href="/map" className="btn btn-secondary">
            Find Shops
          </a>
          <a href="/insights" className="btn btn-secondary">
            View Insights
          </a>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
};

export default Home;