import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../map-dark-theme.css';
import L from 'leaflet';
import BottomNav from './BottomNav';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom user location icon (blue pulsing)
const userLocationIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
      <circle cx="12" cy="12" r="8" fill="#2196F3" stroke="#fff" stroke-width="2"/>
      <circle cx="12" cy="12" r="4" fill="#fff"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

// Custom shop icons by category
const getShopIcon = (category) => {
  const colors = {
    supermarket: '#4CAF50',
    convenience: '#FF9800', 
    grocery: '#8BC34A',
    shop: '#9C27B0',
    default: '#757575'
  };
  
  const color = colors[category] || colors.default;
  
  return new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
        <circle cx="12" cy="12" r="10" fill="${color}" stroke="#fff" stroke-width="2"/>
        <text x="12" y="16" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">S</text>
      </svg>
    `),
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });
};

// Component to handle map updates
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [map, center, zoom]);
  
  return null;
};

const Map = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('both');
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [nearbyShops, setNearbyShops] = useState([]);
  const [loadingShops, setLoadingShops] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [mapZoom, setMapZoom] = useState(13);
  const mapRef = useRef(null);

  const categories = ['all', 'supermarket', 'convenience', 'grocery', 'shop'];

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

  // Generate demo shops near user location as fallback
  const generateDemoShops = useCallback((lat, lng) => {
    const demoShops = [
      { name: 'SuperMarket Plus', category: 'supermarket', offsetLat: 0.005, offsetLng: 0.003 },
      { name: 'Corner Store', category: 'convenience', offsetLat: -0.003, offsetLng: 0.007 },
      { name: 'Fresh Groceries', category: 'grocery', offsetLat: 0.008, offsetLng: -0.002 },
      { name: 'Quick Shop', category: 'convenience', offsetLat: -0.006, offsetLng: -0.005 },
      { name: 'Local Market', category: 'supermarket', offsetLat: 0.002, offsetLng: 0.009 },
      { name: 'Mini Mart', category: 'convenience', offsetLat: 0.007, offsetLng: 0.001 },
      { name: 'Food Bazaar', category: 'grocery', offsetLat: -0.004, offsetLng: 0.006 },
      { name: 'Express Store', category: 'convenience', offsetLat: 0.001, offsetLng: -0.008 }
    ];

    return demoShops.map((shop, index) => {
      const shopLat = lat + shop.offsetLat;
      const shopLng = lng + shop.offsetLng;
      const distance = calculateDistance(lat, lng, shopLat, shopLng);
      
      return {
        id: `demo-${index}`,
        name: shop.name,
        category: shop.category,
        lat: shopLat,
        lng: shopLng,
        distance: distance.toFixed(1),
        distanceValue: distance,
        address: `${Math.floor(Math.random() * 999) + 1} Main Street`,
        phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        opening_hours: '9:00 AM - 9:00 PM'
      };
    }).sort((a, b) => a.distanceValue - b.distanceValue);
  }, []);

  // Fetch nearby shops using Overpass API with fallback servers
  const fetchNearbyShops = useCallback(async (lat, lng) => {
    if (!lat || !lng) return;
    
    setLoadingShops(true);
    
    // Multiple Overpass API servers for fallback
    const overpassServers = [
      'https://overpass.kumi.systems/api/interpreter',
      'https://overpass-api.de/api/interpreter',
      'https://overpass.openstreetmap.ru/api/interpreter'
    ];
    
    try {
      const radius = 1500; // Reduced to 1.5km for faster queries
      // Simplified query for better performance
      const overpassQuery = `
        [out:json][timeout:15];
        (
          node["shop"~"^(supermarket|convenience|grocery)$"](around:${radius},${lat},${lng});
          node["amenity"="marketplace"](around:${radius},${lat},${lng});
        );
        out;
      `;
      
      // Try each server until one works
      for (const server of overpassServers) {
        try {
          console.log(`🔄 Trying server: ${server}`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
          
          const response = await fetch(server, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `data=${encodeURIComponent(overpassQuery)}`,
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (!data.elements || data.elements.length === 0) {
            console.log(`⚠️ No shops found from ${server}, trying fallback data...`);
            // Create some demo shops near the user location for demonstration
            const demoShops = generateDemoShops(lat, lng);
            setNearbyShops(demoShops);
            return;
          }
          
          const shops = data.elements.map((element, index) => {
            const shopLat = element.lat;
            const shopLng = element.lon;
            
            if (!shopLat || !shopLng) return null;
            
            const distance = calculateDistance(lat, lng, shopLat, shopLng);
            const name = element.tags?.name || element.tags?.brand || `${element.tags?.shop || 'Shop'} ${index + 1}`;
            const category = element.tags?.shop || element.tags?.amenity || 'shop';
            
            return {
              id: element.id || `shop-${index}`,
              name,
              category,
              lat: shopLat,
              lng: shopLng,
              distance: distance.toFixed(1),
              distanceValue: distance,
              address: element.tags?.['addr:street'] || element.tags?.['addr:housenumber'] || 'Address not available',
              phone: element.tags?.phone || 'Phone not available',
              opening_hours: element.tags?.opening_hours || 'Hours not available'
            };
          }).filter(Boolean);
          
          // Sort by distance and limit to 20 closest shops
          shops.sort((a, b) => a.distanceValue - b.distanceValue);
          const limitedShops = shops.slice(0, 20);
          
          console.log(`✅ Found ${limitedShops.length} nearby shops from ${server}`);
          setNearbyShops(limitedShops);
          return; // Success, exit the loop
          
        } catch (error) {
          console.log(`❌ Server ${server} failed:`, error.message);
          continue; // Try next server
        }
      }
      
      // If all servers failed, use demo data
      console.log('⚠️ All Overpass servers failed, using demo data');
      const demoShops = generateDemoShops(lat, lng);
      setNearbyShops(demoShops);
      
    } catch (error) {
      console.error('❌ Error fetching nearby shops:', error);
      // Fallback to demo data
      const demoShops = generateDemoShops(lat, lng);
      setNearbyShops(demoShops);
    } finally {
      setLoadingShops(false);
    }
  }, [generateDemoShops]);

  // Get user's current location
  const getCurrentLocation = useCallback(() => {
    setLoadingLocation(true);
    setLocationError('');
    
    console.log('Requesting GPS location...');
    
    if (!navigator.geolocation) {
      const error = 'Geolocation is not supported by this browser';
      setLocationError(error);
      setLoadingLocation(false);
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 300000
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        
        console.log('✅ Location acquired:', location);
        setUserLocation(location);
        setMapCenter([location.lat, location.lng]);
        setLoadingLocation(false);
        
        // Fetch nearby shops
        fetchNearbyShops(location.lat, location.lng);
      },
      (error) => {
        let errorMessage = 'Unable to get your location';
        console.error('❌ Geolocation error:', error);
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please allow location access and refresh the page.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable. Please check your GPS settings.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage = 'An unknown error occurred while getting your location.';
            break;
        }
        
        setLocationError(errorMessage);
        setLoadingLocation(false);
      },
      options
    );
  }, [fetchNearbyShops]);

  // Filter shops by category
  const filteredShops = nearbyShops.filter(shop => {
    return selectedCategory === 'all' || shop.category === selectedCategory;
  });

  // Handle shop selection from list
  const handleShopSelect = (shop) => {
    setSelectedShop(shop);
    setMapCenter([shop.lat, shop.lng]);
    setMapZoom(16);
    
    // Navigate to report page
    navigate('/report', { state: { selectedShop: shop } });
  };

  // Handle shop click from map
  const handleMapShopClick = (shop) => {
    setSelectedShop(shop);
    // Scroll to shop in list
    const shopElement = document.getElementById(`shop-${shop.id}`);
    if (shopElement) {
      shopElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'supermarket': '🏪',
      'convenience': '🏬', 
      'grocery': '🛒',
      'shop': '🏪',
      'marketplace': '🏛️',
      'food_court': '🍽️'
    };
    return icons[category] || '🏪';
  };

  // Auto-get location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  return (
    <div className="map-page">
      <div className="map-header">
        <h1>Nearby Shops</h1>
        <p>Real shops near your location</p>
      </div>

      {/* Location Status */}
      <div className="location-status-card">
        {loadingLocation && (
          <div className="status-item loading">
            <div className="status-icon pulsing">📍</div>
            <div className="status-content">
              <div className="status-title">Getting your location...</div>
              <div className="status-subtitle">Please allow location access when prompted</div>
            </div>
          </div>
        )}
        
        {locationError && (
          <div className="status-item error">
            <div className="status-icon">⚠️</div>
            <div className="status-content">
              <div className="status-title">Location Error</div>
              <div className="status-subtitle">{locationError}</div>
              <button 
                className="btn btn-primary btn-small"
                onClick={getCurrentLocation}
              >
                Try Again
              </button>
            </div>
          </div>
        )}
        
        {userLocation && !loadingLocation && (
          <div className="status-item success">
            <div className="status-icon">✅</div>
            <div className="status-content">
              <div className="status-title">Location found!</div>
              <div className="status-subtitle">
                Accuracy: ±{userLocation.accuracy ? Math.round(userLocation.accuracy) : '?'}m
              </div>
              <button 
                className="btn btn-secondary btn-small"
                onClick={getCurrentLocation}
              >
                Refresh Location
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="filters-card">
        <div className="filter-group">
          <label>Category</label>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="view-toggle">
          <button 
            className={`btn ${viewMode === 'map' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('map')}
          >
            Map Only
          </button>
          <button 
            className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('list')}
          >
            List Only
          </button>
          <button 
            className={`btn ${viewMode === 'both' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('both')}
          >
            Both
          </button>
        </div>
      </div>

      {/* Loading shops indicator */}
      {loadingShops && (
        <div className="loading-shops">
          <div className="loading-icon">🔄</div>
          <span>Finding nearby shops...</span>
        </div>
      )}

      {/* Shop fetch error with retry */}
      {!loadingShops && nearbyShops.length === 0 && userLocation && (
        <div className="shop-fetch-error">
          <div className="error-content">
            <div className="error-icon">⚠️</div>
            <div className="error-text">
              <h4>Having trouble finding shops</h4>
              <p>We're showing demo shops near your location. Real shop data may be temporarily unavailable.</p>
            </div>
            <button 
              className="btn btn-primary btn-small"
              onClick={() => fetchNearbyShops(userLocation.lat, userLocation.lng)}
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      <div className="results-info">
        {nearbyShops.length > 0 && (
          <>
            Found {filteredShops.length} shops
            {selectedCategory !== 'all' && ` in ${selectedCategory} category`}
            {userLocation && ' sorted by distance'}
            {nearbyShops.some(shop => String(shop.id).startsWith('demo-')) && (
              <span className="demo-notice"> (includes demo data)</span>
            )}
          </>
        )}
      </div>

      {/* Map and List Container */}
      <div className={`map-content ${viewMode}`}>
        {/* Map View */}
        {(viewMode === 'map' || viewMode === 'both') && userLocation && (
          <div className="map-container">
            <MapContainer 
              ref={mapRef}
              center={mapCenter || [userLocation.lat, userLocation.lng]} 
              zoom={mapZoom} 
              style={{ height: '100%', width: '100%' }}
            >
              <MapUpdater center={mapCenter} zoom={mapZoom} />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {/* User location marker */}
              <Marker 
                position={[userLocation.lat, userLocation.lng]}
                icon={userLocationIcon}
              >
                <Popup>
                  <div className="map-popup user-popup">
                    <h3>📍 You are here</h3>
                    <p>Your current location</p>
                    <p>Accuracy: ±{Math.round(userLocation.accuracy || 0)}m</p>
                  </div>
                </Popup>
              </Marker>
              
              {/* Shop markers */}
              {filteredShops.map((shop) => (
                <Marker 
                  key={shop.id} 
                  position={[shop.lat, shop.lng]}
                  icon={getShopIcon(shop.category)}
                  eventHandlers={{
                    click: () => handleMapShopClick(shop)
                  }}
                >
                  <Popup>
                    <div className="map-popup shop-popup">
                      <h3>{shop.name}</h3>
                      <p><strong>{getCategoryIcon(shop.category)}</strong> {shop.category}</p>
                      <p><strong>Distance:</strong> {shop.distance} km</p>
                      <p><strong>Address:</strong> {shop.address}</p>
                      {shop.opening_hours !== 'Hours not available' && (
                        <p><strong>Hours:</strong> {shop.opening_hours}</p>
                      )}
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

        {/* List View */}
        {(viewMode === 'list' || viewMode === 'both') && (
          <div className="shops-list-container">
            {filteredShops.length > 0 ? (
              <div className="shops-list">
                {filteredShops.map((shop) => (
                  <div 
                    key={shop.id}
                    id={`shop-${shop.id}`}
                    className={`shop-card ${selectedShop?.id === shop.id ? 'selected' : ''}`}
                    onClick={() => handleShopSelect(shop)}
                  >
                    <div className="shop-content">
                      <div className="shop-info">
                        <div className="shop-icon">{getCategoryIcon(shop.category)}</div>
                        <div className="shop-details">
                          <h3>{shop.name}</h3>
                          <p className="shop-category">{shop.category}</p>
                          <p className="shop-address">{shop.address}</p>
                          {shop.opening_hours !== 'Hours not available' && (
                            <p className="shop-hours">{shop.opening_hours}</p>
                          )}
                        </div>
                      </div>
                      <div className="shop-distance">
                        <div className="distance">{shop.distance} km</div>
                        <div className="tap-hint">Tap to report</div>
                        {(viewMode === 'both') && (
                          <button 
                            className="btn btn-secondary btn-small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMapCenter([shop.lat, shop.lng]);
                              setMapZoom(16);
                              setSelectedShop(shop);
                            }}
                          >
                            Show on Map
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : nearbyShops.length === 0 && !loadingShops && userLocation ? (
              <div className="empty-state">
                <p>No shops found in this area.</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => fetchNearbyShops(userLocation.lat, userLocation.lng)}
                >
                  Search Again
                </button>
              </div>
            ) : !userLocation ? (
              <div className="empty-state">
                <p>Location access required to find nearby shops</p>
                <button 
                  className="btn btn-primary"
                  onClick={getCurrentLocation}
                >
                  Enable Location
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
};

export default Map;