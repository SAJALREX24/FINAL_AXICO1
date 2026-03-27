import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import api from '../utils/api';

const ImageUpload = ({ 
  onUploadComplete, 
  multiple = false, 
  folder = "alaxico/products",
  existingImages = [],
  onRemoveImage,
  maxFiles = 5,
  className = ""
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const uploadToCloudinary = async (file) => {
    try {
      // Get signature from backend
      const signatureRes = await api.get(`/cloudinary/signature?resource_type=image&folder=${folder}`);
      const sig = signatureRes.data;

      // Create form data for Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", sig.api_key);
      formData.append("timestamp", sig.timestamp);
      formData.append("signature", sig.signature);
      formData.append("folder", sig.folder);

      // Upload to Cloudinary
      const cloudinaryRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`,
        { method: "POST", body: formData }
      );

      if (!cloudinaryRes.ok) {
        throw new Error("Upload failed");
      }

      const result = await cloudinaryRes.json();
      return {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height
      };
    } catch (err) {
      console.error("Upload error:", err);
      throw err;
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Check max files limit
    const totalFiles = existingImages.length + files.length;
    if (totalFiles > maxFiles) {
      setError(`Maximum ${maxFiles} images allowed`);
      return;
    }

    setError(null);
    setUploading(true);
    const uploadedUrls = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          setError(`${file.name} is not an image`);
          continue;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          setError(`${file.name} is too large (max 10MB)`);
          continue;
        }

        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

        const result = await uploadToCloudinary(file);
        uploadedUrls.push(result.url);

        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
      }

      if (uploadedUrls.length > 0) {
        onUploadComplete(multiple ? uploadedUrls : uploadedUrls[0]);
      }
    } catch (err) {
      setError("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress({});
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Upload Area */}
      <div
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
          ${uploading 
            ? 'border-purple-300 bg-purple-50 cursor-wait' 
            : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
        
        {uploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-2" />
            <p className="text-sm text-purple-600 font-medium">Uploading...</p>
            {Object.entries(uploadProgress).map(([name, progress]) => (
              <div key={name} className="w-full max-w-xs mt-2">
                <p className="text-xs text-gray-500 truncate">{name}</p>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div 
                    className="bg-purple-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="w-10 h-10 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 font-medium">
              Click to upload {multiple ? 'images' : 'image'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PNG, JPG, WEBP up to 10MB {multiple && `(max ${maxFiles} files)`}
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Preview existing images */}
      {existingImages.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 font-medium">Uploaded Images:</p>
          <div className="flex flex-wrap gap-2">
            {existingImages.map((img, index) => (
              <div 
                key={index} 
                className="relative group w-20 h-20 rounded-lg overflow-hidden border border-gray-200"
              >
                <img 
                  src={img} 
                  alt={`Upload ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
                {onRemoveImage && (
                  <button
                    type="button"
                    onClick={() => onRemoveImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                <div className="absolute bottom-1 right-1 bg-green-500 text-white rounded-full p-0.5">
                  <CheckCircle className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
