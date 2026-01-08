export const getGeminiExplanation = async (userPrice, medianPrice, areaAverage) => {
  try {
    const prompt = `Explain this pricing pattern in simple terms:
    User paid: ₹${userPrice}
    Market median: ₹${medianPrice}
    Area average: ₹${areaAverage}
    
    Provide a brief, neutral explanation without accusing any shops. Focus on market factors.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
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
      throw new Error('Gemini API request failed');
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Analysis not available at the moment.';
  } catch (error) {
    console.error('Gemini API error:', error);
    return 'Price analysis is temporarily unavailable. Please try again later.';
  }
};