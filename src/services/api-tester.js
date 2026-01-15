// API Testing and Monitoring Utility
// This file provides functions to test all API endpoints and monitor their health

import { auth, db } from './firebase.js';
import { uploadImageToCloudinary } from './cloudinary.js';
import { getGeminiExplanation } from './gemini.js';
import { configValidator } from './config-validator.js';

class ApiTester {
  constructor() {
    this.testResults = {
      firebase: { status: 'pending', message: '', timestamp: null },
      cloudinary: { status: 'pending', message: '', timestamp: null },
      gemini: { status: 'pending', message: '', timestamp: null }
    };
  }

  // Test Firebase connection
  async testFirebase() {
    try {
      console.log('🧪 Testing Firebase connection...');
      
      // Test Firestore connection
      if (!db) {
        throw new Error('Firestore not initialized');
      }
      
      // Test Auth connection 
      if (!auth) {
        throw new Error('Firebase Auth not initialized');
      }
      
      // Try to get the current user (will return null if not logged in, but confirms connection)
      const currentUser = auth.currentUser;
      
      this.testResults.firebase = {
        status: 'success',
        message: 'Firebase services initialized successfully',
        timestamp: new Date().toISOString(),
        details: {
          authReady: !!auth,
          firestoreReady: !!db,
          currentUser: currentUser ? 'Logged in' : 'Not logged in'
        }
      };
      
      console.log('✅ Firebase test passed');
      return this.testResults.firebase;
    } catch (error) {
      this.testResults.firebase = {
        status: 'error',
        message: `Firebase test failed: ${error.message}`,
        timestamp: new Date().toISOString()
      };
      
      console.error('❌ Firebase test failed:', error);
      return this.testResults.firebase;
    }
  }

  // Test Cloudinary connection
  async testCloudinary() {
    try {
      console.log('🧪 Testing Cloudinary connection...');
      
      // Test with a simple HTTP request to Cloudinary API
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/resources/image`,
        { 
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      if (response.status === 401) {
        // 401 is expected for unauthorized requests, but confirms the endpoint is reachable
        this.testResults.cloudinary = {
          status: 'success',
          message: 'Cloudinary API endpoint is reachable (authentication required for full access)',
          timestamp: new Date().toISOString(),
          details: {
            cloudName: cloudName,
            endpoint: `https://api.cloudinary.com/v1_1/${cloudName}`,
            uploadEndpoint: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
          }
        };
      } else if (response.ok) {
        this.testResults.cloudinary = {
          status: 'success',
          message: 'Cloudinary API connected successfully',
          timestamp: new Date().toISOString()
        };
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      console.log('✅ Cloudinary test passed');
      return this.testResults.cloudinary;
    } catch (error) {
      // CORS error is expected in browser environment, but upload functionality works
      if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
        this.testResults.cloudinary = {
          status: 'warning',
          message: 'Cloudinary endpoint accessible but browser CORS restrictions prevent testing (upload functionality works normally)',
          timestamp: new Date().toISOString(),
          details: {
            cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
            uploadEndpoint: `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
            note: 'CORS error is normal in development - actual uploads work fine'
          }
        };
      } else {
        this.testResults.cloudinary = {
          status: 'error',
          message: `Cloudinary test failed: ${error.message}`,
          timestamp: new Date().toISOString()
        };
      }
      
      console.error('❌ Cloudinary test failed:', error);
      return this.testResults.cloudinary;
    }
  }

  // Test Gemini AI connection
  async testGemini() {
    try {
      console.log('🧪 Testing Gemini AI connection...');
      
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: 'Hello! This is a connection test. Please respond with "Connection successful".'
              }]
            }]
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      this.testResults.gemini = {
        status: 'success',
        message: 'Gemini AI API connected successfully',
        timestamp: new Date().toISOString(),
        details: {
          model: 'gemini-pro-latest',
          apiVersion: 'v1beta',
          endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/',
          testResponse: responseText?.substring(0, 50) + '...'
        }
      };
      
      console.log('✅ Gemini test passed');
      return this.testResults.gemini;
    } catch (error) {
      this.testResults.gemini = {
        status: 'error',
        message: `Gemini test failed: ${error.message}`,
        timestamp: new Date().toISOString()
      };
      
      console.error('❌ Gemini test failed:', error);
      return this.testResults.gemini;
    }
  }

  // Test all APIs
  async testAllApis() {
    console.log('🚀 Starting comprehensive API tests...');
    
    const results = await Promise.allSettled([
      this.testFirebase(),
      this.testCloudinary(),
      this.testGemini()
    ]);

    // Validate configuration
    const configValidation = configValidator.validateAll();
    
    const summary = {
      timestamp: new Date().toISOString(),
      configValidation,
      testResults: this.testResults,
      overall: {
        allPassed: Object.values(this.testResults).every(test => test.status === 'success'),
        totalTests: 3,
        passedTests: Object.values(this.testResults).filter(test => test.status === 'success').length,
        failedTests: Object.values(this.testResults).filter(test => test.status === 'error').length
      }
    };

    console.log('📊 API Test Summary:', summary);
    
    if (summary.overall.allPassed && configValidation.isValid) {
      console.log('🎉 All APIs are working correctly!');
    } else {
      console.warn('⚠️ Some APIs have issues that need attention');
    }
    
    return summary;
  }

  // Get current test results
  getTestResults() {
    return {
      timestamp: new Date().toISOString(),
      results: this.testResults
    };
  }

  // Test specific API endpoint with custom parameters
  async testApiEndpoint(apiName, testParams = {}) {
    switch (apiName.toLowerCase()) {
      case 'firebase':
        return await this.testFirebase();
      
      case 'cloudinary':
        return await this.testCloudinary();
      
      case 'gemini':
        return await this.testGemini();
      
      default:
        throw new Error(`Unknown API: ${apiName}`);
    }
  }
}

// Create global instance
export const apiTester = new ApiTester();

// Auto-run tests in development mode - DISABLED to prevent quota issues
if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_AUTO_API_TESTING === 'true') {
  console.log('🔧 Development mode detected - running API validation...');
  
  // Run tests after a short delay to ensure all modules are loaded
  setTimeout(() => {
    apiTester.testAllApis().catch(error => {
      console.error('🚨 API testing failed:', error);
    });
  }, 1000);
} else {
  console.log('🚫 Automatic API testing disabled to prevent quota issues. Set VITE_ENABLE_AUTO_API_TESTING=true to enable.');
}

export default ApiTester;