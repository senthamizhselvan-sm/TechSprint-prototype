# API Configuration Guide

This document explains how each external service is configured and used in the Price Fixing Detector application.

## 🔥 Firebase Configuration

### Purpose
Firebase provides authentication, database storage, and hosting services for our application.

### Services Used
- **Firebase Auth**: User authentication (email/password + Google OAuth)
- **Firestore Database**: Real-time NoSQL database for storing price reports, user profiles, and shop data

### Configuration
```javascript
// Located in: src/services/firebase.js
const firebaseConfig = {
  apiKey: "AIzaSyCvLFrvhSUUetpnl0CdO8XqYsT10n_Jc4g",
  authDomain: "price-fixing-detector.firebaseapp.com", 
  projectId: "price-fixing-detector",
  storageBucket: "price-fixing-detector.firebasestorage.app",
  messagingSenderId: "535059206750",
  appId: "1:535059206750:web:2b47a58295dc848a471acf"
};
```

### Database Structure
```
📁 Firestore Collections:
├── 📁 users/
│   └── 📄 {userId}
│       ├── uid: string
│       ├── email: string  
│       ├── displayName: string
│       ├── photoURL: string
│       ├── createdAt: timestamp
│       └── trustScore: number
│
├── 📁 priceReports/
│   └── 📄 {reportId}
│       ├── userId: string
│       ├── userEmail: string
│       ├── product: string (product ID)
│       ├── productName: string (display name)
│       ├── shop: string (shop name)
│       ├── category: string (shop category)
│       ├── price: number
│       ├── imageUrl: string (Cloudinary URL)
│       ├── timestamp: timestamp
│       ├── location: object (lat, lng)
│       ├── verified: boolean
│       └── reportSource: string
│
└── 📁 shops/
    └── 📄 {shopId}
        ├── name: string
        ├── category: string
        ├── location: geopoint
        ├── address: string
        └── verified: boolean
```

### Security Rules
```javascript
// Configured in Firebase Console
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Price reports - users can create their own, everyone can read
    match /priceReports/{reportId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Shops data - read only for authenticated users  
    match /shops/{shopId} {
      allow read: if request.auth != null;
    }
  }
}
```

---

## ☁️ Cloudinary Configuration

### Purpose
Cloudinary handles image storage, optimization, and delivery for bill photos uploaded by users.

### Why Cloudinary?
- **Automatic Image Optimization**: Converts images to optimal formats (WebP, AVIF)
- **Responsive Images**: Serves different sizes based on device
- **CDN Delivery**: Fast global image delivery
- **Transformation API**: Resize, crop, enhance images on-the-fly
- **Security**: Upload presets prevent unauthorized uploads

### Configuration
```javascript
// Located in: src/services/cloudinary.js
const cloudinaryConfig = {
  cloudName: "347386436729432",           // Your Cloudinary account ID
  uploadPreset: "price_detector_uploads"  // Pre-configured upload settings
};
```

### Upload Preset Configuration
The upload preset `price_detector_uploads` should be configured in your Cloudinary dashboard with:

```json
{
  "folder": "price-reports",
  "resource_type": "image", 
  "allowed_formats": ["jpg", "png", "jpeg", "webp"],
  "max_file_size": 5242880,  // 5MB in bytes
  "quality": "auto",
  "fetch_format": "auto",
  "secure": true,
  "unique_filename": true,
  "overwrite": false
}
```

### Image Optimization
```javascript
// Automatic transformations applied:
const optimizedUrl = getOptimizedImageUrl(originalUrl, {
  width: 'auto',      // Responsive width
  height: 'auto',     // Maintain aspect ratio  
  quality: 'auto',    // Optimal quality
  format: 'auto'      // Best format (WebP/AVIF when supported)
});
```

### Upload Flow
1. User selects/drops image file
2. Client validates file type and size
3. Image uploaded to Cloudinary via REST API
4. Cloudinary returns secure HTTPS URL
5. URL stored in Firestore with price report
6. Images served via Cloudinary CDN

---

## 🤖 Google Gemini AI Configuration  

### Purpose
Gemini AI provides intelligent price analysis and explanations to help users understand pricing patterns.

### What Gemini Does
- **Price Pattern Analysis**: Compares user prices with market data
- **Market Insights**: Explains why prices might be higher/lower
- **Neutral Explanations**: Provides factual analysis without accusations
- **Market Factors**: Considers location, demand, and seasonal variations

### Configuration
```javascript
// Located in: src/services/gemini.js
const geminiConfig = {
  apiKey: "AIzaSyCaWUZ_f-cUsbUiZxz9BVnPXy6ITAOS0vs",
  model: "gemini-pro-latest",
  endpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent"
};
```

### API Usage
```javascript
const analysisPrompt = `
Explain this pricing pattern in simple terms:
User paid: ₹${userPrice}
Market median: ₹${medianPrice}  
Area average: ₹${areaAverage}

Provide a brief, neutral explanation without accusing any shops. 
Focus on market factors.
`;

// API Request Format
const requestBody = {
  contents: [{
    parts: [{
      text: analysisPrompt
    }]
  }]
};
```

### Sample AI Responses
```
✅ Good Response:
"Your price of ₹45 is close to the market median of ₹42. This suggests 
competitive pricing in your area. Small variations are normal due to 
factors like shop location, brand preferences, or seasonal demand."

❌ Bad Response (Avoided):
"Shop XYZ is overcharging customers! This is clearly price fixing!"
```

### AI Analysis Features
- **Price Comparison**: Shows how user's price compares to market
- **Trend Explanation**: Explains if prices are rising/falling
- **Market Context**: Considers geographic and temporal factors
- **Consumer Guidance**: Helps users understand if they got a fair deal
- **Neutral Tone**: Never accuses specific shops of wrongdoing

---

## 🔐 Environment Variables

### Security Configuration
All sensitive data is stored in environment variables:

```bash
# .env file (not committed to version control)
VITE_FIREBASE_API_KEY=AIzaSyCvLFrvhSUUetpnl0CdO8XqYsT10n_Jc4g
VITE_FIREBASE_AUTH_DOMAIN=price-fixing-detector.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=price-fixing-detector
VITE_FIREBASE_STORAGE_BUCKET=price-fixing-detector.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=535059206750
VITE_FIREBASE_APP_ID=1:535059206750:web:2b47a58295dc848a471acf

VITE_CLOUDINARY_CLOUD_NAME=347386436729432
VITE_CLOUDINARY_UPLOAD_PRESET=price_detector_uploads

VITE_GEMINI_API_KEY=AIzaSyCaWUZ_f-cUsbUiZxz9BVnPXy6ITAOS0vs
```

### Variable Usage
```javascript
// Accessing environment variables in code
const firebaseApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const cloudinaryName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
```

---

## 🏗️ Data Flow Architecture

### 1. User Registration/Login
```
User → Firebase Auth → User Profile Created in Firestore
```

### 2. Price Report Submission
```
User Input → Image Upload (Cloudinary) → Data Validation → 
Firestore Storage → Success Confirmation
```

### 3. Price Analysis
```
User Report → Aggregate Market Data → Gemini AI Analysis → 
Display Insights to User
```

### 4. Price Discovery
```
User Location → Nearby Shops Query → Price Aggregation → 
Display Price Comparisons
```

---

## 📊 Performance Optimizations

### Firebase Optimizations
- **Indexed Queries**: Compound indexes for efficient filtering
- **Pagination**: Load reports in batches to reduce data transfer
- **Real-time Updates**: Use Firestore listeners for live price updates

### Cloudinary Optimizations  
- **Lazy Loading**: Images load only when needed
- **Responsive Images**: Different sizes for different screens
- **Format Optimization**: Automatic WebP/AVIF conversion
- **CDN Caching**: Images cached globally for fast delivery

### Gemini AI Optimizations
- **Request Batching**: Analyze multiple prices in single request
- **Response Caching**: Cache common analysis patterns
- **Fallback Handling**: Graceful degradation when AI unavailable

---

## 🛠️ Development Setup

### 1. Firebase Setup
1. Create Firebase project at https://console.firebase.google.com
2. Enable Authentication (Email/Password + Google)
3. Create Firestore database
4. Configure security rules
5. Add API keys to `.env` file

### 2. Cloudinary Setup
1. Create account at https://cloudinary.com
2. Create upload preset with proper settings
3. Add cloud name and preset to `.env` file

### 3. Gemini AI Setup  
1. Get API key from Google AI Studio
2. Enable Gemini Pro model access
3. Add API key to `.env` file

### 4. Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 🔍 Troubleshooting

### Common Issues

**Firebase Connection Issues:**
- Check API keys in `.env` file
- Verify Firebase project settings
- Ensure authentication methods are enabled

**Cloudinary Upload Failures:**
- Verify upload preset exists and is configured correctly
- Check file size limits (5MB max)
- Ensure file type is supported (images only)

**Gemini AI Not Working:**
- Verify API key is valid and has quota remaining
- Check if Gemini Pro model is accessible in your region
- Review request format and prompt structure

**General Debugging:**
- Open browser DevTools to check console errors
- Verify environment variables are loaded
- Check network requests in Network tab
- Review Firebase console for database issues

---

## 🚀 Production Deployment

### Environment Setup
- Set production environment variables
- Configure Firebase hosting/security rules  
- Set up Cloudinary production settings
- Monitor Gemini AI usage and quotas

### Performance Monitoring
- Firebase Performance Monitoring
- Cloudinary analytics dashboard
- Google AI Studio usage tracking
- Application performance monitoring

---

This configuration provides a robust, scalable foundation for the Price Fixing Detector application with proper error handling, security, and performance optimizations.