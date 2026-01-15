// Enhanced Gemini AI Service with Rate Limiting and Caching
// Gemini API Configuration:
// - API Key: AIzaSyDOniiRw-n33175yjuCankaREwsGiOQFEU
// - Endpoint: https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent
// - Model: gemini-pro-latest (Latest stable model)

// Rate limiting and caching
const cache = new Map();
const rateLimiter = {
  lastCall: 0,
  minInterval: 2000, // 2 seconds between calls
  isRateLimited: false,
  rateLimitUntil: 0
};

// Create cache key from price data
const createCacheKey = (userPrice, medianPrice, areaAverage) => {
  return `${userPrice}-${medianPrice}-${areaAverage}`;
};

// Check if we're currently rate limited
const checkRateLimit = () => {
  const now = Date.now();
  
  // Check if we're in a rate limit period
  if (rateLimiter.isRateLimited && now < rateLimiter.rateLimitUntil) {
    const waitTime = Math.ceil((rateLimiter.rateLimitUntil - now) / 1000);
    throw new Error(`Rate limited. Please wait ${waitTime} seconds before trying again.`);
  }
  
  // Check if enough time has passed since last call
  const timeSinceLastCall = now - rateLimiter.lastCall;
  if (timeSinceLastCall < rateLimiter.minInterval) {
    const waitTime = Math.ceil((rateLimiter.minInterval - timeSinceLastCall) / 1000);
    throw new Error(`Rate limiting active. Please wait ${waitTime} seconds.`);
  }
  
  return true;
};

// Handle rate limit response
const handleRateLimit = (retryAfter = 30) => {
  rateLimiter.isRateLimited = true;
  rateLimiter.rateLimitUntil = Date.now() + (retryAfter * 1000);
  console.warn(`⏰ Rate limit hit. Blocking API calls for ${retryAfter} seconds.`);
};

// Validate Gemini configuration
const validateGeminiConfig = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Missing Gemini API key: VITE_GEMINI_API_KEY');
  }
  
  if (!apiKey.startsWith('AIza')) {
    console.warn('⚠️ Gemini API key format looks incorrect');
  }
  
  return true;
};

// Validate configuration on module load
try {
  validateGeminiConfig();
  console.log('✅ Gemini configuration validated');
} catch (error) {
  console.error('❌ Gemini configuration error:', error.message);
}

export const getGeminiExplanation = async (userPrice, medianPrice, areaAverage) => {
  // Validate inputs
  if (!userPrice || !medianPrice || !areaAverage) {
    throw new Error('Missing required price data for analysis');
  }

  // Create cache key
  const cacheKey = createCacheKey(userPrice, medianPrice, areaAverage);
  
  // Check cache first
  if (cache.has(cacheKey)) {
    console.log('🎯 Returning cached Gemini response');
    return cache.get(cacheKey);
  }

  try {
    // Check rate limits
    checkRateLimit();
    
    // Validate configuration before making request
    validateGeminiConfig();

    const prompt = `Explain this pricing pattern in simple terms:
    User paid: ₹${userPrice}
    Market median: ₹${medianPrice}
    Area average: ₹${areaAverage}
    
    Provide a brief, neutral explanation without accusing any shops. Focus on market factors and provide actionable insights for the consumer.`;

    console.log('🤖 Requesting Gemini analysis for price data:', {
      userPrice,
      medianPrice, 
      areaAverage
    });

    // Update rate limiter
    rateLimiter.lastCall = Date.now();

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      
      if (response.status === 401) {
        throw new Error('Gemini API authentication failed. Please check your API key.');
      } else if (response.status === 403) {
        throw new Error('Gemini API access forbidden. Please check your API permissions.');
      } else if (response.status === 429) {
        // Handle rate limiting
        const retryAfter = response.headers.get('Retry-After') || 30;
        handleRateLimit(parseInt(retryAfter));
        throw new Error('Gemini API rate limit exceeded. Please try again later.');
      } else {
        throw new Error(`Gemini API request failed: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    console.log('✅ Gemini analysis completed successfully');
    
    const explanation = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!explanation) {
      console.warn('⚠️ Gemini response did not contain expected content structure');
      const fallbackResponse = 'Price analysis completed but explanation could not be generated. Please try again.';
      return fallbackResponse;
    }
    
    // Cache the successful response
    cache.set(cacheKey, explanation);
    
    // Clean up old cache entries (keep last 50)
    if (cache.size > 50) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return explanation;
  } catch (error) {
    console.error('❌ Gemini API error:', error);
    
    // Provide specific error messages based on error type
    if (error.message.includes('Rate limit') || error.message.includes('wait')) {
      return 'AI service is temporarily busy due to high demand. Price analysis will be available shortly.';
    } else if (error.message.includes('fetch')) {
      return 'Network error connecting to AI service. Please check your internet connection and try again.';
    } else if (error.message.includes('authentication') || error.message.includes('API key')) {
      return 'AI service authentication error. Please contact support.';
    } else if (error.message.includes('Missing required')) {
      return 'Insufficient price data for analysis. Please ensure all price information is available.';
    }
    
    return 'Price analysis is temporarily unavailable. Please try again later.';
  }
};