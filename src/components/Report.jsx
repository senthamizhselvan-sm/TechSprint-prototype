import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, addDoc, query, where, getDocs, Timestamp, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { uploadImageToCloudinary } from '../services/cloudinary';
import '../home-shelf-theme.css';
import BottomNav from './BottomNav';

const Report = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [selectedShop, setSelectedShop] = useState(location.state?.selectedShop || null);
  const [product, setProduct] = useState('');
  const [customProduct, setCustomProduct] = useState('');
  const [productUnit, setProductUnit] = useState('');
  const [isCustomProduct, setIsCustomProduct] = useState(false);
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [recentReports, setRecentReports] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);

  const productCategories = useMemo(() => ({
    'Essential Foods': [
      { id: 'milk', name: 'Milk', unit: '1L', icon: '🥛', avgPrice: 45 },
      { id: 'bread', name: 'Bread', unit: '1 loaf', icon: '🍞', avgPrice: 35 },
      { id: 'rice', name: 'Rice', unit: '1kg', icon: '🍚', avgPrice: 80 },
      { id: 'eggs', name: 'Eggs', unit: '12 pcs', icon: '🥚', avgPrice: 120 },
      { id: 'chicken', name: 'Chicken', unit: '1kg', icon: '🍗', avgPrice: 180 },
      { id: 'onions', name: 'Onions', unit: '1kg', icon: '🧅', avgPrice: 40 }
    ],
    'Beverages': [
      { id: 'water', name: 'Water Bottle', unit: '1L', icon: '💧', avgPrice: 20 },
      { id: 'tea', name: 'Tea', unit: '250g', icon: '🍵', avgPrice: 150 },
      { id: 'coffee', name: 'Coffee', unit: '200g', icon: '☕', avgPrice: 300 },
      { id: 'juice', name: 'Fruit Juice', unit: '1L', icon: '🧃', avgPrice: 80 }
    ],
    'Fuel & Transport': [
      { id: 'petrol', name: 'Petrol', unit: '1L', icon: '⛽', avgPrice: 105 },
      { id: 'diesel', name: 'Diesel', unit: '1L', icon: '🚛', avgPrice: 95 },
      { id: 'cng', name: 'CNG', unit: '1kg', icon: '🚗', avgPrice: 75 }
    ],
    'Personal Care': [
      { id: 'soap', name: 'Soap', unit: '1 bar', icon: '🧼', avgPrice: 25 },
      { id: 'shampoo', name: 'Shampoo', unit: '200ml', icon: '🧴', avgPrice: 180 },
      { id: 'toothpaste', name: 'Toothpaste', unit: '100g', icon: '🦷', avgPrice: 85 }
    ]
  }), []);

  const allProducts = useMemo(() => {
    return Object.values(productCategories).flat();
  }, [productCategories]);
  
  // Enhanced shop options
  const defaultShops = [
    { id: 1, name: 'SuperMarket Plus', category: 'Supermarket', icon: '🏪', distance: '0.5 km' },
    { id: 2, name: 'Corner Store', category: 'Convenience', icon: '🏬', distance: '0.3 km' },
    { id: 3, name: 'Fresh Market', category: 'Grocery', icon: '🛒', distance: '0.8 km' },
    { id: 4, name: 'Local Bazaar', category: 'Market', icon: '🏛️', distance: '1.2 km' },
    { id: 5, name: 'Quick Shop', category: 'Convenience', icon: '🏬', distance: '0.7 km' },
    { id: 6, name: 'Mega Store', category: 'Supermarket', icon: '🏪', distance: '1.5 km' }
  ];
  // Load recent reports and popular products
  useEffect(() => {
    loadRecentActivity();
  }, []);

  const loadRecentActivity = async () => {
    try {
      // Get recent reports using simpler query
      const recentQuery = query(
        collection(db, 'priceReports'),
        limit(20)
      );
      const recentSnapshot = await getDocs(recentQuery);
      const recent = [];
      recentSnapshot.forEach(doc => {
        const data = doc.data();
        recent.push({
          id: doc.id,
          ...data,
          date: data.timestamp?.toDate()
        });
      });
      
      // Sort by date manually
      recent.sort((a, b) => (b.date || new Date()) - (a.date || new Date()));
      setRecentReports(recent.slice(0, 10));

      // Calculate popular products from recent reports
      const productCounts = {};
      recent.forEach(report => {
        if (report.product) {
          productCounts[report.product] = (productCounts[report.product] || 0) + 1;
        }
      });
      
      const popular = Object.entries(productCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 6)
        .map(([productId, count]) => {
          const productInfo = allProducts.find(p => p.id === productId);
          return productInfo ? {
            ...productInfo,
            reportCount: count
          } : null;
        })
        .filter(Boolean);
      
      setPopularProducts(popular);
    } catch (error) {
      console.error('Error loading recent activity:', error);
      // Use fallback data
      const fallbackPopular = allProducts.slice(0, 6).map(product => ({
        ...product,
        reportCount: Math.floor(Math.random() * 10) + 1
      }));
      setPopularProducts(fallbackPopular);
    }
  };

  // Enhanced file handling with drag & drop
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleFile = (file) => {
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, etc.)');
      return;
    }
    
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }
    
    setImage(file);
    setError('');
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    setUploadProgress(0);
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
    setSuccess('');
    
    if (!user) {
      setError('Please login to submit reports');
      return;
    }
    
    if (!selectedShop || (!product && !customProduct) || !price) {
      setError('Please fill all required fields');
      return;
    }
    
    if (isCustomProduct && (!customProduct.trim() || !productUnit.trim())) {
      setError('Please enter product name and unit for custom product');
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
          setUploadProgress(25);
          imageUrl = await uploadImageToCloudinary(image);
          setUploadProgress(50);
          
          if (!imageUrl) {
            setError('Image upload failed, but report will be submitted without image');
          }
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          setError('Image upload failed, but report will be submitted without image');
        }
      }
      
      setUploadProgress(75);
      
      const finalProduct = isCustomProduct ? customProduct.toLowerCase().replace(/\s+/g, '_') : product;
      const finalProductName = isCustomProduct ? customProduct : (selectedProduct?.name || product);
      const finalProductUnit = isCustomProduct ? productUnit : (selectedProduct?.unit || '');
      
      const reportData = {
        userId: user.uid,
        userEmail: user.email,
        product: finalProduct,
        productName: finalProductName,
        productUnit: finalProductUnit,
        isCustomProduct,
        shop: selectedShop.name,
        category: selectedShop.category || 'Unknown',
        price: parseFloat(price),
        imageUrl,
        timestamp: Timestamp.now(),
        location: selectedShop.location || null,
        verified: false,
        reportSource: 'web'
      };
      
      await addDoc(collection(db, 'priceReports'), reportData);
      setUploadProgress(100);
      setSuccess('Price report submitted successfully!');
      
      // Reset form
      setProduct('');
      setCustomProduct('');
      setProductUnit('');
      setIsCustomProduct(false);
      setPrice('');
      setImage(null);
      setImagePreview(null);
      setUploadProgress(0);
      
      // Refresh recent activity
      loadRecentActivity();
      
      setTimeout(() => {
        navigate('/insights', { 
          state: { message: 'Price report submitted successfully!' }
        });
      }, 2000);
    } catch (error) {
      console.error('Error submitting report:', error);
      setError('Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !success) {
    return (
      <div className="home-page">
        <div className="loading-state">
          <div className="loading-spinner">📝</div>
          <h3>Submitting your report...</h3>
          <p>Please wait while we process your price report</p>
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
          <h1>📝 Report Price</h1>
          <p>Help build price transparency in your community</p>
          <div className="last-updated">
            {recentReports.length} recent reports • {popularProducts.length} trending products
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="quick-stats">
          <div className="stat-item">
            <div className="stat-number">{allProducts.length}</div>
            <div className="stat-label">Products Available</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{defaultShops.length}</div>
            <div className="stat-label">Nearby Shops</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{recentReports.length}</div>
            <div className="stat-label">Recent Reports</div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="section">
          <div className="activity-feed" style={{ background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)', border: '2px solid #28a745' }}>
            <div className="activity-item">
              <div className="activity-icon" style={{ background: '#28a745', color: 'white' }}>✅</div>
              <div className="activity-content">
                <div className="activity-text" style={{ color: '#155724', fontWeight: 'bold' }}>
                  {success}
                </div>
                <div className="activity-time" style={{ color: '#155724' }}>
                  Redirecting to insights...
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="section">
          <div className="activity-feed" style={{ background: 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)', border: '2px solid #dc3545' }}>
            <div className="activity-item">
              <div className="activity-icon" style={{ background: '#dc3545', color: 'white' }}>⚠️</div>
              <div className="activity-content">
                <div className="activity-text" style={{ color: '#721c24', fontWeight: 'bold' }}>
                  {error}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Popular Products Section */}
      {popularProducts.length > 0 && (
        <div className="section">
          <div className="section-header">
            <h2>🔥 Popular Products</h2>
            <p>Most reported items recently</p>
          </div>
          <div className="trending-shelf">
            {popularProducts.map((product) => (
              <div 
                key={product.id} 
                className="trending-item"
                onClick={() => setProduct(product.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="trending-icon">{product.icon}</div>
                <div className="trending-info">
                  <h4>{product.name}</h4>
                  <div className="trending-price">
                    ~₹{product.avgPrice}
                  </div>
                  <div className="trending-meta">
                    {product.reportCount} reports
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report Form Section */}
      <div className="section">
        <div className="section-header">
          <h2>📋 Submit Price Report</h2>
          <p>Fill in the details below</p>
        </div>
        
        <form onSubmit={handleSubmit} className="product-shelf" style={{ display: 'block', padding: '24px' }}>
          {/* Shop Selection */}
          <div className="shelf-item" style={{ marginBottom: '20px' }}>
            <div className="item-details">
              <h3>🏪 Select Shop</h3>
              {selectedShop ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#212529' }}>
                      {selectedShop.icon} {selectedShop.name}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                      {selectedShop.category} • {selectedShop.distance}
                    </div>
                  </div>
                  <button 
                    type="button"
                    className="action-btn report-btn"
                    onClick={() => navigate('/map')}
                  >
                    Change Shop
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <p style={{ color: '#6c757d', marginBottom: '16px' }}>
                    No shop selected. Choose from nearby shops or find on map.
                  </p>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button 
                      type="button"
                      className="action-btn report-btn"
                      onClick={() => navigate('/map')}
                    >
                      Find on Map
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Shop Selection Dropdown */}
          {!selectedShop && (
            <div className="shelf-item" style={{ marginBottom: '20px' }}>
              <div className="item-details">
                <h3>🏬 Choose Nearby Shop</h3>
                <select 
                  value={selectedShop?.id || ''} 
                  onChange={(e) => {
                    const shop = defaultShops.find(s => s.id === parseInt(e.target.value));
                    setSelectedShop(shop);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '2px solid #e9ecef',
                    fontSize: '1rem',
                    marginTop: '12px'
                  }}
                >
                  <option value="">Choose a shop</option>
                  {defaultShops.map(shop => (
                    <option key={shop.id} value={shop.id}>
                      {shop.icon} {shop.name} - {shop.category} ({shop.distance})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Product Selection Options */}
          <div className="shelf-item" style={{ marginBottom: '20px' }}>
            <div className="item-details">
              <h3>🛍️ Product Selection</h3>
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomProduct(false);
                    setCustomProduct('');
                    setProductUnit('');
                  }}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '12px',
                    border: isCustomProduct ? '2px solid #e9ecef' : '2px solid #007bff',
                    background: isCustomProduct ? '#f8f9fa' : 'linear-gradient(135deg, #007bff, #0056b3)',
                    color: isCustomProduct ? '#6c757d' : 'white',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  📦 Choose from List
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomProduct(true);
                    setProduct('');
                  }}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '12px',
                    border: !isCustomProduct ? '2px solid #e9ecef' : '2px solid #28a745',
                    background: !isCustomProduct ? '#f8f9fa' : 'linear-gradient(135deg, #28a745, #1e7e34)',
                    color: !isCustomProduct ? '#6c757d' : 'white',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  ✏️ Enter Custom Product
                </button>
              </div>
            </div>
          </div>

          {/* Custom Product Input */}
          {isCustomProduct && (
            <div className="shelf-item" style={{ marginBottom: '20px' }}>
              <div className="item-details">
                <h3>✏️ Custom Product Details</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: '600',
                      color: '#495057'
                    }}>
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={customProduct}
                      onChange={(e) => setCustomProduct(e.target.value)}
                      placeholder="e.g., Apple iPhone, Basmati Rice, etc."
                      required={isCustomProduct}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '2px solid #e9ecef',
                        fontSize: '1rem',
                        transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#007bff'}
                      onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                    />
                  </div>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: '600',
                      color: '#495057'
                    }}>
                      Unit/Size *
                    </label>
                    <input
                      type="text"
                      value={productUnit}
                      onChange={(e) => setProductUnit(e.target.value)}
                      placeholder="e.g., 1kg, 500ml, 1 piece, per liter"
                      required={isCustomProduct}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '2px solid #e9ecef',
                        fontSize: '1rem',
                        transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#007bff'}
                      onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Product Selection by Category */}
          {!isCustomProduct && Object.entries(productCategories).map(([categoryName, products]) => (
            <div key={categoryName} className="shelf-item" style={{ marginBottom: '20px' }}>
              <div className="item-details">
                <h3>📦 {categoryName}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '12px' }}>
                  {products.map((prod) => (
                    <div 
                      key={prod.id}
                      className={`trending-item ${product === prod.id ? 'selected' : ''}`}
                      onClick={() => setProduct(prod.id)}
                      style={{ 
                        cursor: 'pointer',
                        border: product === prod.id ? '2px solid #0066cc' : '2px solid transparent',
                        background: product === prod.id ? 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' : undefined
                      }}
                    >
                      <div className="trending-icon">{prod.icon}</div>
                      <div className="trending-info">
                        <h4>{prod.name}</h4>
                        <div className="trending-meta">{prod.unit}</div>
                        <div className="trending-price">~₹{prod.avgPrice}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Price Input */}
          {(product || (isCustomProduct && customProduct && productUnit)) && (
            <div className="shelf-item" style={{ marginBottom: '20px' }}>
              <div className="item-details">
                <h3>💰 Enter Price</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: '600' }}>₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Enter price"
                    required
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '2px solid #e9ecef',
                      fontSize: '1.2rem',
                      fontWeight: '600'
                    }}
                  />
                  <span style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                    {isCustomProduct ? productUnit : allProducts.find(p => p.id === product)?.unit}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Image Upload */}
          {(product || (isCustomProduct && customProduct)) && price && (
            <div className="shelf-item" style={{ marginBottom: '20px' }}>
              <div className="item-details">
                <h3>📷 Upload Bill or Product Photo</h3>
                <p style={{ 
                  fontSize: '0.9rem', 
                  color: '#6c757d', 
                  marginBottom: '16px',
                  lineHeight: '1.4'
                }}>
                  📋 Upload bill receipt or product photo to help verify pricing and build community trust
                </p>
                <div 
                  className={`file-upload-area ${dragActive ? 'dragover' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-input').click()}
                  style={{
                    marginTop: '12px',
                    padding: '32px 24px',
                    border: dragActive ? '2px dashed #007bff' : '2px dashed #e9ecef',
                    borderRadius: '16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: dragActive ? 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' : 'rgba(255, 255, 255, 0.8)',
                    transition: 'all 0.3s ease',
                    boxShadow: dragActive ? '0 4px 20px rgba(0, 123, 255, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  {imagePreview ? (
                    <div>
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        style={{ 
                          maxWidth: '250px', 
                          maxHeight: '250px', 
                          borderRadius: '12px',
                          marginBottom: '16px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                        }} 
                      />
                      <div>
                        <button 
                          type="button" 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage();
                          }}
                          style={{ 
                            background: 'linear-gradient(135deg, #dc3545, #c82333)', 
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 16px',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          🗑️ Remove Image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ 
                        fontSize: '3.5rem', 
                        marginBottom: '16px',
                        background: 'linear-gradient(135deg, #007bff, #0056b3)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}>
                        📷
                      </div>
                      <div style={{ 
                        fontSize: '1.2rem', 
                        fontWeight: '600', 
                        marginBottom: '8px',
                        color: '#495057'
                      }}>
                        {dragActive ? '📥 Drop your photo here' : '📤 Upload Bill or Product Photo'}
                      </div>
                      <div style={{ 
                        fontSize: '0.95rem', 
                        color: '#6c757d',
                        marginBottom: '4px'
                      }}>
                        Click here or drag & drop your image
                      </div>
                      <div style={{ 
                        fontSize: '0.85rem', 
                        color: '#adb5bd'
                      }}>
                        📋 Supports JPG, PNG • Max size: 5MB
                      </div>
                    </div>
                  )}
                  <input
                    id="file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </div>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ 
                      width: '100%', 
                      height: '8px', 
                      background: '#e9ecef', 
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div 
                        style={{ 
                          width: `${uploadProgress}%`, 
                          height: '100%', 
                          background: '#0066cc',
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '4px', fontSize: '0.9rem', color: '#6c757d' }}>
                      {uploadProgress}% uploaded
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          {selectedShop && (product || (isCustomProduct && customProduct && productUnit)) && price && (
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <button 
                type="submit" 
                className="action-btn report-btn"
                disabled={loading}
                style={{ 
                  fontSize: '1.1rem', 
                  padding: '16px 32px',
                  minWidth: '200px'
                }}
              >
                {loading ? '📤 Submitting...' : '📝 Submit Report'}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Recent Activity */}
      {recentReports.length > 0 && (
        <div className="section">
          <div className="section-header">
            <h2>📊 Recent Reports</h2>
            <p>Latest price reports from the community</p>
          </div>
          
          <div className="activity-feed">
            {recentReports.slice(0, 5).map((report, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">
                  {allProducts.find(p => p.id === report.product)?.icon || '📦'}
                </div>
                <div className="activity-content">
                  <div className="activity-text">
                    <strong>{report.productName || report.product}</strong> at <strong>{report.shop}</strong> - <strong>₹{report.price}</strong>
                  </div>
                  <div className="activity-time">
                    {report.date?.toLocaleString() || 'Recently'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <BottomNav />
    </div>
  );
};

export default Report;