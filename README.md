# PriceFixingDetector Web App

A consumer-facing web platform that provides price transparency for essential goods by crowdsourcing prices, aggregating them safely, and explaining pricing patterns using AI.

## Features

- **User Authentication**: Firebase Auth with email/password
- **Price Reporting**: Submit prices for essential goods with optional bill photos
- **Price Analysis**: AI-powered insights using Gemini API
- **Shop Discovery**: Find nearby shops and compare prices
- **Mobile Responsive**: Mobile-first design with bottom navigation
- **Anti-Abuse**: Single user reports, outlier detection, trust scoring

## Tech Stack

- **Frontend**: React + Vite, React Router, CSS Modules
- **Backend**: Firebase Firestore, Firebase Auth
- **Image Upload**: Cloudinary
- **AI Analysis**: Google Gemini API
- **State Management**: React Context + LocalStorage

## Firebase Configuration

The app is pre-configured with Firebase, but you may need to enable authentication methods:

### Enable Google Authentication (Important!)

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select Project**: `price-fixing-detector`
3. **Navigate to Authentication** → **Sign-in method**
4. **Enable Email/Password**: Should already be enabled
5. **Enable Google Sign-in**:
   - Click on "Google" provider
   - Toggle "Enable"
   - Add your project's domain to authorized domains
   - Save changes

### Firestore Security Rules

The following rules should be configured in Firestore:

```javascript
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
      allow create: if request.auth != null && request.auth.uid == resource.data.userId;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Shops data - read only for authenticated users
    match /shops/{shopId} {
      allow read: if request.auth != null;
    }
  }
}
```

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   - Copy `.env` file (already configured with API keys)
   - All API keys are pre-configured for demo

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Open Browser**
   - Navigate to `http://localhost:5173`
   - App will open on landing page

## User Flow

1. **Landing Page** → Sign up or login
2. **Authentication** → Create account or sign in
3. **Home Dashboard** → View product price cards
4. **Shop Discovery** → Browse nearby shops
5. **Price Reporting** → Submit prices with optional photos
6. **Insights** → View AI analysis of your reports
7. **Profile** → Check stats and trust score

## Project Structure

```
src/
├── components/          # React components
│   ├── Landing.jsx     # Landing page
│   ├── Login.jsx       # Login form
│   ├── Register.jsx    # Registration form
│   ├── Home.jsx        # Dashboard with product cards
│   ├── Map.jsx         # Shop discovery
│   ├── Report.jsx      # Price reporting form
│   ├── Insights.jsx    # AI-powered price analysis
│   ├── Profile.jsx     # User profile and stats
│   └── BottomNav.jsx   # Mobile navigation
├── contexts/           # React contexts
│   └── AuthContext.jsx # Authentication state
├── services/           # External services
│   ├── firebase.js     # Firebase configuration
│   ├── cloudinary.js   # Image upload service
│   └── gemini.js       # AI analysis service
├── utils/              # Utility functions
│   └── priceLogic.js   # Price aggregation logic
└── App.jsx             # Main app component
```

## API Keys (Pre-configured)

- **Firebase**: Connected to `price-fixing-detector` project
- **Gemini AI**: Configured for price analysis
- **Cloudinary**: Set up for image uploads with `price_detector_uploads` preset

## Build for Production

```bash
npm run build
```

## Demo Features

- **Responsive Design**: Works on mobile and desktop
- **Real Firebase**: Actual database and authentication
- **AI Analysis**: Real Gemini API integration
- **Image Upload**: Functional Cloudinary integration
- **Price Logic**: Median calculation with outlier detection

## Security Features

- Environment variables for all API keys
- Firebase security rules (configured)
- Input validation and sanitization
- Anti-abuse mechanisms built-in

The app is fully functional and demo-ready!