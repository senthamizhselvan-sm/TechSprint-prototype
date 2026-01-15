// Manual API Testing Utility
// Use this to test APIs manually when needed (respects rate limits)

import { getGeminiExplanation } from '../services/gemini.js';
import { apiTester } from '../services/api-tester.js';
import { runQuickTests } from './quickApiTest.js';

// Test single Gemini API call with rate limiting
export const testGeminiAPI = async () => {
  console.log('🤖 Testing Gemini API manually...');
  try {
    const result = await getGeminiExplanation(100, 120, 110);
    console.log('✅ Gemini API Response:', result);
    return result;
  } catch (error) {
    console.error('❌ Gemini API Error:', error.message);
    return null;
  }
};

// Run comprehensive API tests
export const testAllAPIs = async () => {
  console.log('🧪 Running comprehensive API tests...');
  return await apiTester.testAllApis();
};

// Run quick configuration tests (no API calls)
export const testConfigurations = () => {
  console.log('⚙️ Testing API configurations...');
  runQuickTests();
};

// Add to global window for easy testing in console
if (typeof window !== 'undefined') {
  window.testAPIs = {
    gemini: testGeminiAPI,
    all: testAllAPIs,
    config: testConfigurations
  };
  console.log('🔧 Manual API testing available via window.testAPIs');
}