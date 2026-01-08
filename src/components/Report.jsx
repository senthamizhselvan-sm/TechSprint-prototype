import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { uploadImageToCloudinary } from '../services/cloudinary';
import BottomNav from './BottomNav';

const Report = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [selectedShop, setSelectedShop] = useState(location.state?.selectedShop || null);
  const [product, setProduct] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const products = ['Milk (1L)', 'Rice (1kg)', 'Petrol (1L)', 'Grocery Basket'];
  
  // If no shop is selected from map, show a message
  const defaultShops = [
    { id: 1, name: 'Local Shop', category: 'Local' },
    { id: 2, name: 'Nearby Store', category: 'Grocery' },
    { id: 3, name: 'Corner Shop', category: 'Local' },
    { id: 4, name: 'Mini Market', category: 'Grocery' }
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size < 5 * 1024 * 1024) { // 5MB limit
      setImage(file);
    } else {
      setError('Image must be less than 5MB');
    }
  };

  const checkExistingReport = async () => {
    if (!user || !selectedShop || !product) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const q = query(
      collection(db, 'priceReports'),
      where('userId', '==', user.uid),
      where('shop', '==', selectedShop.name),
      where('product', '==', product),
      where('timestamp', '>=', Timestamp.fromDate(today))
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!user) {
      setError('Please login to submit reports');
      return;
    }
    
    if (!selectedShop || !product || !price) {
      setError('Please fill all required fields');
      return;
    }
    
    if (isNaN(price) || parseFloat(price) <= 0) {
      setError('Please enter a valid price');
      return;
    }
    
    setLoading(true);
    
    try {
      // Check for existing report
      const hasExistingReport = await checkExistingReport();
      if (hasExistingReport) {
        setError('You have already reported this product for this shop today');
        setLoading(false);
        return;
      }
      
      let imageUrl = null;
      if (image) {
        try {
          imageUrl = await uploadImageToCloudinary(image);
        } catch (uploadError) {
          console.warn('Image upload failed, continuing without image:', uploadError);
        }
      }
      
      await addDoc(collection(db, 'priceReports'), {
        userId: user.uid,
        product,
        shop: selectedShop.name,
        category: selectedShop.category || 'Unknown',
        price: parseFloat(price),
        imageUrl,
        timestamp: Timestamp.now()
      });
      
      navigate('/insights', { 
        state: { message: 'Price report submitted successfully!' }
      });
    } catch (error) {
      console.error('Error submitting report:', error);
      setError('Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Report Price</h1>
        <p>Help build price transparency</p>
      </div>

      <form onSubmit={handleSubmit} className="report-form">
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label>Select Shop *</label>
          {selectedShop ? (
            <div className="selected-shop">
              <div className="shop-info">
                <span className="shop-name">{selectedShop.name}</span>
                <span className="shop-category">{selectedShop.category}</span>
                {selectedShop.distance && (
                  <span className="shop-distance">{selectedShop.distance}</span>
                )}
              </div>
              <button 
                type="button"
                className="btn btn-secondary btn-small"
                onClick={() => navigate('/map')}
              >
                Change Shop
              </button>
            </div>
          ) : (
            <div className="no-shop-selected">
              <p>No shop selected. Please select a shop from the map first.</p>
              <button 
                type="button"
                className="btn btn-primary"
                onClick={() => navigate('/map')}
              >
                Select Shop
              </button>
            </div>
          )}
        </div>

        {!selectedShop && (
          <div className="form-group">
            <label>Or choose from nearby shops</label>
            <select 
              value={selectedShop?.id || ''} 
              onChange={(e) => {
                const shop = defaultShops.find(s => s.id === parseInt(e.target.value));
                setSelectedShop(shop);
              }}
            >
              <option value="">Choose a shop</option>
              {defaultShops.map(shop => (
                <option key={shop.id} value={shop.id}>
                  {shop.name} - {shop.category}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="form-group">
          <label>Product *</label>
          <select 
            value={product} 
            onChange={(e) => setProduct(e.target.value)}
            required
          >
            <option value="">Choose a product</option>
            {products.map(prod => (
              <option key={prod} value={prod}>{prod}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Price (₹) *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter price"
            required
          />
        </div>

        <div className="form-group">
          <label>Bill Photo (Optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
          <small>Upload a photo of your bill for verification (max 5MB)</small>
        </div>

        <button 
          type="submit" 
          className="btn-primary"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
      <BottomNav />
    </div>
  );
};

export default Report; 