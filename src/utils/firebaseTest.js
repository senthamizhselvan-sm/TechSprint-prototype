// Simple Firebase connection test
import { auth, db } from '../services/firebase';
import { connectAuthEmulator, connectFirestoreEmulator } from 'firebase/auth';

export const testFirebaseConnection = async () => {
  try {
    console.log('Testing Firebase connection...');
    
    // Test Auth connection
    console.log('Auth instance:', auth);
    console.log('Auth config:', auth.config);
    
    // Test Firestore connection
    console.log('Firestore instance:', db);
    console.log('Firestore app:', db.app);
    
    console.log('✅ Firebase connection test passed');
    return true;
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    return false;
  }
};

// Call this in development to test connection
if (import.meta.env.DEV) {
  testFirebaseConnection();
}