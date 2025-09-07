import React, { useCallback } from 'react';

interface ImageUploadProps {
  label: string;
  onImageUpload: (base64: string) => void;
  currentImage: string | null;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ label, onImageUpload, currentImage }) => {
  const convertToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    try {
      const base64 = await convertToBase64(file);
      onImageUpload(base64);
    } catch (error) {
      console.error('Error converting file to base64:', error);
      alert('Error processing image file');
    }
  }, [convertToBase64, onImageUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (!imageFile) {
      alert('Please drop a valid image file');
      return;
    }

    try {
      const base64 = await convertToBase64(imageFile);
      onImageUpload(base64);
    } catch (error) {
      console.error('Error converting dropped file to base64:', error);
      alert('Error processing dropped image');
    }
  }, [convertToBase64, onImageUpload]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">{label}</label>
      
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="relative border-2 border-dashed border-gray-600 rounded-lg p-4 hover:border-gray-500 transition-colors"
      >
        {currentImage ? (
          <div className="relative">
            <img
              src={`data:image/png;base64,${currentImage}`}
              alt={`Uploaded ${label}`}
              className="w-full h-32 object-cover rounded"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity rounded flex items-center justify-center">
              <span className="text-white text-sm">Click to change</span>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-3xl text-gray-500 mb-2">📷</div>
            <p className="text-sm text-gray-400">Drop image here or click to browse</p>
          </div>
        )}
        
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
};

export default ImageUpload;
