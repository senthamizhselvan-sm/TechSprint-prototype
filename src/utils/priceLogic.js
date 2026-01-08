// Price aggregation and analysis utilities
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';

export const calculateMedianPrice = (prices) => {
  if (!prices || prices.length === 0) return 0;
  
  const sortedPrices = [...prices].sort((a, b) => a - b);
  const mid = Math.floor(sortedPrices.length / 2);
  
  return sortedPrices.length % 2 !== 0
    ? sortedPrices[mid]
    : (sortedPrices[mid - 1] + sortedPrices[mid]) / 2;
};

export const removeOutliers = (prices, threshold = 0.4) => {
  if (!prices || prices.length < 3) return prices;
  
  const median = calculateMedianPrice(prices);
  return prices.filter(price => {
    const deviation = Math.abs(price - median) / median;
    return deviation <= threshold;
  });
};

export const getConfidenceLevel = (reportCount) => {
  if (reportCount >= 10) return 'High';
  if (reportCount >= 5) return 'Medium';
  return 'Low';
};

export const getPriceStatus = (userPrice, medianPrice) => {
  if (!medianPrice || medianPrice === 0) return 'Unknown';
  
  const deviation = (userPrice - medianPrice) / medianPrice;
  
  if (deviation > 0.15) return 'Above Average';
  if (deviation < -0.15) return 'Below Average';
  return 'Around Average';
};

export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(price);
};

export const getUserPriceReports = async (userId) => {
  try {
    const q = query(
      collection(db, 'priceReports'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching user reports:', error);
    return [];
  }
};

export const getProductPrices = async (product, area = null) => {
  try {
    let q = query(
      collection(db, 'priceReports'),
      where('product', '==', product)
    );
    
    if (area) {
      q = query(q, where('area', '==', area));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data().price);
  } catch (error) {
    console.error('Error fetching product prices:', error);
    return [];
  }
};