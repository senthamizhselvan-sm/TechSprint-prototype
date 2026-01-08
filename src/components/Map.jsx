import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import BottomNav from './BottomNav';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Map = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('list');
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Mock shop data - will be filtered by distance from user location
  const allShops = [
    { 
      id: 1, 
      name: 'Metro Cash & Carry', 
      category: 'Supermarket', 
      lat: 28.4595, 
      lng: 77.0266 
    },
    { 
      id: 2, 
      name: 'Big Bazaar', 
      category: 'Hypermarket', 
      lat: 28.4601, 
      lng: 77.0282 
    },
    { 
      id: 3, 
      name: 'Reliance Fresh', 
      category: 'Grocery', 
      lat: 28.4588, 
      lng: 77.0275 
    },
    { 
      id: 4, 
      name: 'Spencer\'s', 
      category: 'Supermarket', 
      lat: 28.4612, 
      lng: 77.0298 
    },
    { 
      id: 5, 
      name: 'Local Kirana Store', 
      category: 'Local', 
      lat: 28.4580, 
      lng: 77.0260 
    },
    { 
      id: 6, 
      name: 'HP Petrol Pump', 
      category: 'Fuel', 
      lat: 28.4605, 
      lng: 77.0270 
    },
    { 
      id: 7, 
      name: 'Indian Oil Station', 
      category: 'Fuel', 
      lat: 28.4590, 
      lng: 77.0290 
    },
    { 
      id: 8, 
      name: 'More Megastore', 
      category: 'Supermarket', 
      lat: 28.5355, 
      lng: 77.3910 
    }
  ];

  const categories = ['all', 'Supermarket', 'Hypermarket', 'Grocery', 'Local', 'Fuel'];

  // Calculate distance between two coordinates
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Get user's current location
  const getCurrentLocation = () => {
    setLoadingLocation(true);
    setLocationError('');
    
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLoadingLocation(false);
      },
      (error) => {
        let errorMessage = 'Unable to get your location';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location services.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        setLocationError(errorMessage);
        setLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  // Get shops with distance from user location
  const getShopsWithDistance = () => {
    if (!userLocation) return allShops.map(shop => ({ ...shop, distance: 'Unknown' }));
    
    return allShops.map(shop => {
      const distance = calculateDistance(
        userLocation.lat, 
        userLocation.lng, 
        shop.lat, 
        shop.lng
      );
      return {
        ...shop,
        distance: `${distance.toFixed(1)} km`,
        distanceValue: distance
      };
    }).sort((a, b) => a.distanceValue - b.distanceValue);
  };

  const filteredShops = getShopsWithDistance().filter(shop => {
    const categoryMatch = selectedCategory === 'all' || shop.category === selectedCategory;
    return categoryMatch;
  });

  const handleShopSelect = (shop) => {
    navigate('/report', { state: { selectedShop: shop } });
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Supermarket': 'SHOP',
      'Hypermarket': 'MALL',
      'Grocery': 'FOOD',
      'Local': 'STORE',
      'Fuel': 'FUEL'
    };
    return icons[category] || 'SHOP';
  };

  // Auto-get location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Nearby Shops</h1>
        <p>Find shops to report prices</p>
      </div>

      {/* Location Status */}
      <div className="card">
        <div className="location-status">
          {loadingLocation && (
            <div className="location-loading">
              <span>•</span> Getting your location...
            </div>
          )}
          
          {locationError && (
            <div className="location-error">
              <span>!</span> {locationError}
              <button 
                className="btn btn-secondary btn-small"
                onClick={getCurrentLocation}
                style={{ marginLeft: '12px' }}
              >
                Try Again
              </button>
            </div>
          )}
          
          {userLocation && !loadingLocation && (
            <div className="location-success">
              <span>✓</span> Location found - showing nearby shops
              <button 
                className="btn btn-secondary btn-small"
                onClick={getCurrentLocation}
                style={{ marginLeft: '12px' }}
              >
                Refresh Location
              </button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="filters-container">
          <div className="filter-group">
            <label>Category</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View Toggle */}
        <div className="view-toggle">
          <button 
            className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('list')}
          >
            List View
          </button>
          <button 
            className={`btn ${viewMode === 'map' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('map')}
          >
            Map View
          </button>
        </div>
      </div>

      <div className="results-info">
        Found {filteredShops.length} shops
        {userLocation && ' sorted by distance'}
      </div>

      {/* Map View */}
      {viewMode === 'map' && userLocation && (
        <div className="map-container">
          <MapContainer 
            center={[userLocation.lat, userLocation.lng]} 
            zoom={13} 
            style={{ height: '400px', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* User location marker */}
            <Marker position={[userLocation.lat, userLocation.lng]}>
              <Popup>
                <div className="map-popup">
                  <h3>• Your Location</h3>
                  <p>You are here</p>
                </div>
              </Popup>
            </Marker>
            
            {/* Shop markers */}
            {filteredShops.map((shop) => (
              <Marker key={shop.id} position={[shop.lat, shop.lng]}>
                <Popup>
                  <div className="map-popup">
                    <h3>{shop.name}</h3>
                    <p>{getCategoryIcon(shop.category)} {shop.category}</p>
                    <p>Distance: {shop.distance}</p>
                    <button 
                      className="btn btn-primary btn-small"
                      onClick={() => handleShopSelect(shop)}
                    >
                      Report Price
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      {/* Map View - No Location */}
      {viewMode === 'map' && !userLocation && (
        <div className="map-placeholder">
          <div className="empty-state">
            <p>Location access required to show map view</p>
            <button 
              className="btn btn-primary"
              onClick={getCurrentLocation}
            >
              Enable Location
            </button>
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <ul className="shop-list">
          {filteredShops.map((shop) => (
            <li 
              key={shop.id} 
              className="shop-item"
              onClick={() => handleShopSelect(shop)}
            >
              <div className="shop-item-content">
                <div className="shop-info">
                  <div className="shop-icon">{getCategoryIcon(shop.category)}</div>
                  <div className="shop-details">
                    <h3>{shop.name}</h3>
                    <p>{shop.category}</p>
                  </div>
                </div>
                <div className="shop-distance">
                  <div className="distance">{shop.distance}</div>
                  <div className="tap-hint">Tap to report</div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      
      {filteredShops.length === 0 && (
        <div className="empty-state">
          <p>No shops found matching your filters.</p>
        </div>
      )}
      
      <BottomNav />
    </div>
  );
};

export default Map;