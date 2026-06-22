import React, { useState, useRef, useEffect } from 'react';
import imagesService from '../services/imagesService';

const ImageUpload = ({ 
  onImagesChange, 
  existingImages = [], 
  maxImages = 5,
  multiple = true,
  disabled = false,
  showPreview = true,
  className = ''
}) => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Initialize with existing images - FIXED VERSION
  useEffect(() => {
  if (!existingImages) return;

  let processedImages = [];

  if (Array.isArray(existingImages)) {
    processedImages = existingImages.map(url => ({
      id: `existing-${url}-${Date.now()}`,
      url,
      isExisting: true,
      isNew: false
    }));
  } else if (typeof existingImages === 'string') {
    try {
      const parsedImages = JSON.parse(existingImages);
      if (Array.isArray(parsedImages)) {
        processedImages = parsedImages.map(url => ({
          id: `existing-${url}-${Date.now()}`,
          url,
          isExisting: true,
          isNew: false
        }));
      } else {
        processedImages = [{
          id: `existing-${existingImages}-${Date.now()}`,
          url: existingImages,
          isExisting: true,
          isNew: false
        }];
      }
    } catch {
      processedImages = [{
        id: `existing-${existingImages}-${Date.now()}`,
        url: existingImages,
        isExisting: true,
        isNew: false
      }];
    }
  } else if (existingImages.imageUrls && Array.isArray(existingImages.imageUrls)) {
    processedImages = existingImages.imageUrls.map(url => ({
      id: `existing-${url}-${Date.now()}`,
      url,
      isExisting: true,
      isNew: false
    }));
  }

  // Only update state if images are different
  setImages(prevImages => {
    const prevUrls = prevImages.map(img => img.url).sort().join(',');
    const newUrls = processedImages.map(img => img.url).sort().join(',');
    if (prevUrls !== newUrls) {
      return processedImages;
    }
    return prevImages;
  });
}, [existingImages]);


  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    await processFiles(files);
    event.target.value = ''; // Reset file input
  };

  const processFiles = async (files) => {
    if (files.length === 0) return;

    // Check if adding these files would exceed max limit
    if (images.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed. You can add ${maxImages - images.length} more.`);
      return;
    }

    setError('');
    setUploading(true);

    try {
      const newImageObjects = [];

      for (const file of files) {
        // Validate image
        const validation = imagesService.validateImage(file);
        if (!validation.isValid) {
          setError(validation.error);
          continue;
        }

        try {
          // Create preview (client-side)
          const previewUrl = await imagesService.fileToBase64(file);
          
          const newImage = {
            id: `new-${Date.now()}-${Math.random()}`,
            url: previewUrl,
            file: file,
            isNew: true,
            isExisting: false,
            name: file.name,
            size: file.size,
            type: file.type
          };

          newImageObjects.push(newImage);
        } catch (err) {
          console.error('Error processing file:', file.name, err);
          setError(`Failed to process ${file.name}`);
        }
      }

      if (newImageObjects.length > 0) {
        const updatedImages = [...images, ...newImageObjects];
        setImages(updatedImages);
        onImagesChange(updatedImages);
      }

    } catch (err) {
      console.error('Error in file processing:', err);
      setError('Failed to process images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      onImagesChange(newImages);
      return newImages;
    });
  };

  const triggerFileInput = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      processFiles(files);
    }
  };

  // Calculate remaining slots
  const remainingSlots = maxImages - images.length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
          <div className="flex items-center">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {error}
          </div>
        </div>
      )}

      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          onClick={triggerFileInput}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
            ${dragOver 
              ? 'border-amber-500 bg-amber-50' 
              : 'border-gray-300 hover:border-amber-400 hover:bg-gray-50'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {uploading ? (
            <div className="flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-gray-600 text-sm">Uploading images...</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center justify-center">
                <i className={`fas fa-cloud-upload-alt text-3xl mb-3 ${
                  dragOver ? 'text-amber-500' : 'text-gray-400'
                }`}></i>
                <p className="text-gray-700 font-medium mb-1">
                  {dragOver ? 'Drop images here' : 'Upload Images'}
                </p>
                <p className="text-gray-500 text-sm">
                  Drag & drop or click to browse
                </p>
                <p className="text-gray-400 text-xs mt-2">
                  Supports JPG, PNG, WebP • Max 5MB each
                </p>
                {remainingSlots > 0 && (
                  <p className="text-amber-600 text-xs mt-1">
                    {remainingSlots} of {maxImages} slots remaining
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Image Preview Grid */}
      {showPreview && images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-700">
              Images ({images.length}/{maxImages})
            </h4>
            {images.length >= maxImages && (
              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                Maximum reached
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {images.map((image, index) => (
              <div 
                key={image.id} 
                className="relative group bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm"
              >
                {/* Image */}
                <img
                  src={image.url}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-24 object-cover"
                />

                {/* Image Info Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-end">
                  <div className="w-full p-2 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs truncate">
                      {image.name || `Image ${index + 1}`}
                    </p>
                    {image.size && (
                      <p className="text-gray-300 text-xs">
                        {(image.size / 1024 / 1024).toFixed(1)}MB
                      </p>
                    )}
                  </div>
                </div>

                {/* Remove Button */}
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                    title="Remove image"
                  >
                    <i className="fas fa-times text-xs"></i>
                  </button>
                )}

                {/* Status Badge */}
                <div className="absolute top-1 left-1">
                  {image.isNew && !image.isExisting && (
                    <span className="bg-green-500 text-white text-xs px-1 py-0.5 rounded">
                      New
                    </span>
                  )}
                  {image.isExisting && (
                    <span className="bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
                      Existing
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      {/* Help Text */}
      {images.length === 0 && !uploading && (
        <div className="text-center text-gray-500 text-sm">
          <p>No images selected. Upload up to {maxImages} images.</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;