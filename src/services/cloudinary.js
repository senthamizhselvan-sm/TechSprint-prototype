// Enhanced Cloudinary Upload Service with Better Error Handling
// Cloudinary Configuration:
// - Cloud Name: ddiakulkp (Your cloudinary account identifier)
// - API Key: 347386436729432
// - API Secret: t2FtQp_ov5lhu6NuuvG3uqmi4fw
// - Upload Preset: price_detector_uploads (Pre-configured upload settings)
// - This preset should be configured in Cloudinary dashboard with:
//   * Folder: price-reports
//   * Image transformations: auto quality, auto format
//   * Max file size: 5MB
//   * Allowed formats: jpg, png, jpeg, webp

// Validate Cloudinary configuration
const validateCloudinaryConfig = () => {
  const requiredEnvVars = [
    'VITE_CLOUDINARY_CLOUD_NAME',
    'VITE_CLOUDINARY_UPLOAD_PRESET'
  ];

  const missing = requiredEnvVars.filter(envVar => !import.meta.env[envVar]);
  
  if (missing.length > 0) {
    throw new Error(`Missing Cloudinary configuration: ${missing.join(', ')}`);
  }

  if (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME !== 'ddiakulkp') {
    console.warn('⚠️ Cloudinary cloud name does not match expected value');
  }
};

// Validate configuration on module load
try {
  validateCloudinaryConfig();
  console.log('✅ Cloudinary configuration validated');
} catch (error) {
  console.error('❌ Cloudinary configuration error:', error.message);
}

export const uploadImageToCloudinary = async (file, onProgress = null) => {
  if (!file) {
    throw new Error('No file provided');
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  // Validate file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File size must be less than 5MB');
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'price-reports'); // Organize uploads in folder
    formData.append('resource_type', 'image');
    
    // Add timestamp to filename to avoid conflicts
    const timestamp = new Date().getTime();
    formData.append('public_id', `price-report-${timestamp}`);
    
    console.log('Uploading to Cloudinary with config:', {
      cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
      uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary API Error Response:', errorText);
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('Cloudinary Upload Success:', {
      public_id: data.public_id,
      secure_url: data.secure_url,
      format: data.format,
      bytes: data.bytes
    });
    
    if (!data.secure_url) {
      throw new Error('Upload completed but no secure URL returned');
    }
    
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    
    // Provide more specific error messages
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      throw new Error('Authentication failed. Please check Cloudinary configuration.');
    } else if (error.message.includes('400')) {
      throw new Error('Invalid upload request. Please check file format and size.');
    } else if (error.message.includes('413')) {
      throw new Error('File too large. Please choose a smaller image.');
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      throw new Error('Network error. Please check your internet connection.');
    }
    
    throw error;
  }
};

// Function to get optimized image URL from Cloudinary
export const getOptimizedImageUrl = (originalUrl, options = {}) => {
  if (!originalUrl || !originalUrl.includes('cloudinary.com')) {
    return originalUrl;
  }
  
  const {
    width = 'auto',
    height = 'auto',
    quality = 'auto',
    format = 'auto'
  } = options;
  
  // Insert transformation parameters into the URL
  const transformations = `w_${width},h_${height},q_${quality},f_${format}`;
  return originalUrl.replace('/upload/', `/upload/${transformations}/`);
};