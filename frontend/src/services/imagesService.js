import axios from 'axios';

const imagesService = {
  // Convert file to base64 for preview
  fileToBase64: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  },

  // Validate image file
  validateImage: (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    console.log('🔍 Validating image:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    if (!validTypes.includes(file.type)) {
      return { 
        isValid: false, 
        error: 'Please select a valid image format (JPEG, PNG, or WebP)' 
      };
    }

    if (file.size > maxSize) {
      return { 
        isValid: false, 
        error: 'Image size must be less than 5MB' 
      };
    }

    return { isValid: true, error: null };
  },

  // Upload single image to server
  uploadImage: async (file) => {
    try {
      console.log('📤 Uploading image:', file.name);
      
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ Image uploaded successfully:', response.data);
      return response.data.url;
    } catch (error) {
      console.error('❌ Image upload failed:', error);
      throw new Error(error.response?.data?.error || 'Failed to upload image');
    }
  },

  // Upload multiple images
  uploadMultipleImages: async (files) => {
    try {
      console.log('📤 Uploading multiple images:', files.length);
      
      const uploadPromises = files.map(file => imagesService.uploadImage(file));
      const urls = await Promise.all(uploadPromises);
      
      console.log('✅ All images uploaded successfully:', urls);
      return urls;
    } catch (error) {
      console.error('❌ Multiple image upload failed:', error);
      throw error;
    }
  },

  // Delete image from server
  deleteImage: async (imageUrl) => {
    try {
      console.log('🗑️ Deleting image:', imageUrl);
      
      // Extract filename from URL
      const filename = imageUrl.split('/').pop();
      const response = await axios.delete(`/api/upload/${filename}`);
      
      console.log('✅ Image deleted successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Image deletion failed:', error);
      throw new Error(error.response?.data?.error || 'Failed to delete image');
    }
  },

  // Get image dimensions (useful for validation)
  getImageDimensions: (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
        URL.revokeObjectURL(url);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
        URL.revokeObjectURL(url);
      };
      
      img.src = url;
    });
  },

  // Compress image (client-side compression)
  compressImage: (file, maxWidth = 800, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas to Blob conversion failed'));
              return;
            }
            
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            
            resolve(compressedFile);
            URL.revokeObjectURL(url);
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for compression'));
        URL.revokeObjectURL(url);
      };

      img.src = url;
    });
  },

  // Generate thumbnail from image
  generateThumbnail: (file, size = 200) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        // Calculate thumbnail dimensions
        let { width, height } = img;
        
        if (width > height) {
          height = (height * size) / width;
          width = size;
        } else {
          width = (width * size) / height;
          height = size;
        }

        canvas.width = size;
        canvas.height = size;

        // Draw centered thumbnail
        const x = (size - width) / 2;
        const y = (size - height) / 2;
        
        ctx.fillStyle = '#f3f4f6'; // Background color
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, x, y, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Thumbnail generation failed'));
              return;
            }
            
            const thumbnailFile = new File([blob], `thumb_${file.name}`, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            
            resolve(thumbnailFile);
            URL.revokeObjectURL(url);
          },
          'image/jpeg',
          0.7
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for thumbnail'));
        URL.revokeObjectURL(url);
      };

      img.src = url;
    });
  }
};

export default imagesService;