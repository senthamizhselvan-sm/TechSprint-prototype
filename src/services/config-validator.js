// API Configuration Validator
// This file validates all API configurations and provides helpful error messages

class ConfigValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  // Validate Firebase Configuration
  validateFirebase() {
    const requiredFields = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID',
      'VITE_FIREBASE_STORAGE_BUCKET',
      'VITE_FIREBASE_MESSAGING_SENDER_ID',
      'VITE_FIREBASE_APP_ID'
    ];

    requiredFields.forEach(field => {
      if (!import.meta.env[field]) {
        this.errors.push(`Missing Firebase config: ${field}`);
      }
    });

    // Validate Firebase API key format
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    if (apiKey && !apiKey.startsWith('AIza')) {
      this.warnings.push('Firebase API key format looks incorrect');
    }

    // Validate Firebase project ID format
    const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (projectId && projectId !== 'price-fixing-detector') {
      this.warnings.push('Firebase project ID does not match expected value');
    }
  }

  // Validate Cloudinary Configuration
  validateCloudinary() {
    const requiredFields = [
      'VITE_CLOUDINARY_CLOUD_NAME',
      'VITE_CLOUDINARY_API_KEY',
      'VITE_CLOUDINARY_UPLOAD_PRESET'
    ];

    requiredFields.forEach(field => {
      if (!import.meta.env[field]) {
        this.errors.push(`Missing Cloudinary config: ${field}`);
      }
    });

    // Validate cloud name
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    if (cloudName && cloudName !== 'ddiakulkp') {
      this.warnings.push('Cloudinary cloud name does not match expected value');
    }

    // Validate API key format (should be numeric)
    const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
    if (apiKey && !/^\d+$/.test(apiKey)) {
      this.warnings.push('Cloudinary API key should be numeric');
    }
  }

  // Validate Gemini Configuration
  validateGemini() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      this.errors.push('Missing Gemini API key: VITE_GEMINI_API_KEY');
    } else if (!apiKey.startsWith('AIza')) {
      this.warnings.push('Gemini API key format looks incorrect');
    }
  }

  // Run all validations
  validateAll() {
    this.errors = [];
    this.warnings = [];
    
    this.validateFirebase();
    this.validateCloudinary();
    this.validateGemini();

    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings
    };
  }

  // Test API endpoints
  async testEndpoints() {
    const results = {
      firebase: { status: 'unknown', message: '' },
      cloudinary: { status: 'unknown', message: '' },
      gemini: { status: 'unknown', message: '' }
    };

    // Test Gemini API with correct endpoint
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Test connection' }] }]
          })
        }
      );
      
      if (response.ok) {
        results.gemini = { status: 'success', message: 'Gemini API connected successfully' };
      } else {
        results.gemini = { status: 'error', message: `Gemini API error: ${response.status}` };
      }
    } catch (error) {
      results.gemini = { status: 'error', message: `Gemini API connection failed: ${error.message}` };
    }

    // Test Cloudinary API (CORS error is expected in browser)
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/list`,
        { method: 'GET' }
      );
      
      if (response.status === 401) {
        results.cloudinary = { status: 'warning', message: 'Cloudinary endpoint accessible (authentication would be needed for uploads)' };
      } else if (response.ok) {
        results.cloudinary = { status: 'success', message: 'Cloudinary API connected successfully' };
      } else {
        results.cloudinary = { status: 'error', message: `Cloudinary API error: ${response.status}` };
      }
    } catch (error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
        results.cloudinary = { status: 'warning', message: 'Cloudinary endpoint accessible but CORS restricted (normal in browser)' };
      } else {
        results.cloudinary = { status: 'error', message: `Cloudinary API connection failed: ${error.message}` };
      }
    }

    // Firebase test would require more complex setup
    results.firebase = { status: 'info', message: 'Firebase validation requires app initialization' };

    return results;
  }
}

export const configValidator = new ConfigValidator();

// Auto-validate on import in development
if (import.meta.env.DEV) {
  const validation = configValidator.validateAll();
  
  if (!validation.isValid) {
    console.error('❌ API Configuration Errors:', validation.errors);
  }
  
  if (validation.warnings.length > 0) {
    console.warn('⚠️ API Configuration Warnings:', validation.warnings);
  }
  
  if (validation.isValid && validation.warnings.length === 0) {
    console.log('✅ All API configurations are valid');
  }
}

export default ConfigValidator;