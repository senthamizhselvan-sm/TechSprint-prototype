# Firebase Authentication Setup Guide

## Current Status
✅ Firebase project configured: `price-fixing-detector`
✅ Email/Password authentication implemented
✅ Google Sign-in authentication implemented
✅ User profile creation in Firestore
✅ Error handling and user feedback

## Required Firebase Console Configuration

### 1. Enable Authentication Methods

Go to [Firebase Console](https://console.firebase.google.com/project/price-fixing-detector/authentication/providers):

1. **Email/Password Provider**:
   - Should already be enabled
   - If not, click "Email/Password" → Toggle "Enable" → Save

2. **Google Provider** (IMPORTANT):
   - Click "Google" provider
   - Toggle "Enable" 
   - Select your Google account as the project support email
   - Add authorized domains:
     - `localhost` (for development)
     - Your production domain (when deployed)
   - Click "Save"

### 2. Firestore Security Rules

Go to [Firestore Rules](https://console.firebase.google.com/project/price-fixing-detector/firestore/rules):

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

### 3. Test Authentication

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open browser**: http://localhost:5173

3. **Test Email/Password**:
   - Click "Get Started" → Create account with email/password
   - Should redirect to dashboard on success

4. **Test Google Sign-in**:
   - Click "Continue with Google" button
   - Should open Google OAuth popup
   - Select Google account
   - Should redirect to dashboard on success

### 4. Common Issues & Solutions

**Issue**: "Pop-up blocked" error
**Solution**: Allow pop-ups for localhost in browser settings

**Issue**: "Unauthorized domain" error  
**Solution**: Add `localhost` to authorized domains in Firebase Console

**Issue**: "Configuration not found" error
**Solution**: Check that all environment variables in `.env` are correct

**Issue**: Google sign-in button not working
**Solution**: Ensure Google provider is enabled in Firebase Console

### 5. Environment Variables

All required environment variables are already configured in `.env`:

```
VITE_FIREBASE_API_KEY=AIzaSyCvLFrvhSUUetpnl0CdO8XqYsT10n_Jc4g
VITE_FIREBASE_AUTH_DOMAIN=price-fixing-detector.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=price-fixing-detector
VITE_FIREBASE_STORAGE_BUCKET=price-fixing-detector.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=535059206750
VITE_FIREBASE_APP_ID=1:535059206750:web:2b47a58295dc848a471acf
```

### 6. Verification Checklist

- [ ] Firebase project exists and is accessible
- [ ] Email/Password provider is enabled
- [ ] Google provider is enabled with correct configuration
- [ ] Authorized domains include `localhost`
- [ ] Firestore security rules are configured
- [ ] Environment variables are correct
- [ ] Development server is running
- [ ] Both authentication methods work in browser

## Support

If you encounter issues:
1. Check browser console for detailed error messages
2. Verify Firebase Console settings match this guide
3. Ensure all environment variables are loaded correctly
4. Test with different browsers if needed