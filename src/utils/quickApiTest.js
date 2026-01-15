// Quick API Verification Test
// Run this to test all APIs quickly - DISABLED by default to prevent quota issues
// To enable: import and call manually

import { getGeminiExplanation } from '../services/gemini.js';
import { uploadImageToCloudinary } from '../services/cloudinary.js';
import { auth, db } from '../services/firebase.js';

const runQuickTests = () => {
  console.log('🧪 Running Quick API Verification Tests...');

  // Test Firebase
  console.log('🔥 Firebase Test:');
  console.log('✅ Auth:', !!auth);
  console.log('✅ Firestore:', !!db);

  // Test Gemini API with a simple request - COMMENTED OUT to prevent quota issues
  // console.log('🤖 Testing Gemini API...');
  // getGeminiExplanation(100, 120, 110)
  //   .then(result => {
  //     console.log('✅ Gemini API Response:', result);
  //   })
  //   .catch(error => {
  //     console.error('❌ Gemini API Error:', error.message);
  //   });

  // Test Cloudinary configuration
  console.log('☁️ Cloudinary Configuration:');
  console.log('✅ Cloud Name:', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
  console.log('✅ API Key:', import.meta.env.VITE_CLOUDINARY_API_KEY ? 'Configured' : 'Missing');
  console.log('✅ Upload Preset:', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

  console.log('📋 Configuration tests completed (API calls disabled)...');
};

// Export the function instead of auto-executing
export { runQuickTests };