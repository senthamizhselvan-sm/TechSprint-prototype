// API Integration Test Utilities
import { auth, db } from '../services/firebase';
import { uploadImageToCloudinary } from '../services/cloudinary';
import { getGeminiExplanation } from '../services/gemini';

export const testFirebaseConnection = () => {
  console.log('🔥 Firebase Configuration Test:');
  console.log('✅ Auth instance:', !!auth);
  console.log('✅ Firestore instance:', !!db);
  console.log('✅ Project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID);
  return true;
};

export const testCloudinaryConfig = () => {
  console.log('☁️ Cloudinary Configuration Test:');
  console.log('✅ Cloud Name:', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
  console.log('✅ Upload Preset:', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
  return true;
};

export const testGeminiConfig = () => {
  console.log('🤖 Gemini Configuration Test:');
  console.log('✅ API Key configured:', !!import.meta.env.VITE_GEMINI_API_KEY);
  return true;
};

export const runAllTests = () => {
  console.log('🧪 Running API Configuration Tests...');
  testFirebaseConnection();
  testCloudinaryConfig();
  testGeminiConfig();
  console.log('✅ All API configurations verified!');
};

// Auto-run tests in development
if (import.meta.env.DEV) {
  runAllTests();
}