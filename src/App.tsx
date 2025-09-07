import React, { useState } from 'react';
import { useGeminiImage } from './hooks/useGeminiImage';
import ApiKeyInput from './components/ApiKeyInput';
import PromptForm from './components/PromptForm';
import ImageCanvas from './components/ImageCanvas';
import ImageUpload from './components/ImageUpload';
import Toast from './components/Toast';
import RealityFlux from './components/RealityFlux';

interface GeneratedImage {
  id: string;
  base64: string;
  prompt: string;
  timestamp: Date;
}

function App() {
  const [apiKey, setApiKey] = useState<string>('');
  const [currentView, setCurrentView] = useState<'panelflash' | 'realityflux'>('panelflash');
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [uploadedImages, setUploadedImages] = useState<{ img1: string | null; img2: string | null }>({
    img1: null,
    img2: null
  });
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const { generateImage, editImage, fuseImages, isLoading, error, clearError } = useGeminiImage(apiKey);

  const showToast = (message: string, type: 'error' | 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleGenerate = async (prompt: string) => {
    try {
      const base64 = await generateImage(prompt);
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        base64,
        prompt,
        timestamp: new Date()
      };
      setCurrentImage(newImage);
      showToast('Image generated successfully!', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to generate image', 'error');
    }
  };

  const handleEdit = async (prompt: string) => {
    if (!currentImage) {
      showToast('No image to edit. Generate an image first.', 'error');
      return;
    }

    try {
      const base64 = await editImage(currentImage.base64, prompt);
      const editedImage: GeneratedImage = {
        id: Date.now().toString(),
        base64,
        prompt: `${currentImage.prompt} → ${prompt}`,
        timestamp: new Date()
      };
      setCurrentImage(editedImage);
      showToast('Image edited successfully!', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to edit image', 'error');
    }
  };

  const handleFuse = async (prompt: string) => {
    if (!uploadedImages.img1 || !uploadedImages.img2) {
      showToast('Please upload two images to fuse.', 'error');
      return;
    }

    try {
      const base64 = await fuseImages(uploadedImages.img1, uploadedImages.img2, prompt);
      const fusedImage: GeneratedImage = {
        id: Date.now().toString(),
        base64,
        prompt: `Fused: ${prompt}`,
        timestamp: new Date()
      };
      setCurrentImage(fusedImage);
      showToast('Images fused successfully!', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to fuse images', 'error');
    }
  };

  const handleImageUpload = (base64: string, slot: 'img1' | 'img2') => {
    setUploadedImages(prev => ({ ...prev, [slot]: base64 }));
  };

  React.useEffect(() => {
    if (error) {
      showToast(error, 'error');
      clearError();
    }
  }, [error, clearError]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            PanelFlash
          </h1>
          <p className="text-gray-400 mt-2">AI-Powered Image Generation, Editing & Fusion</p>
        </header>

        <ApiKeyInput apiKey={apiKey} onApiKeyChange={setApiKey} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <div className="space-y-6">
            <PromptForm
              onGenerate={handleGenerate}
              onEdit={handleEdit}
              onFuse={handleFuse}
              isLoading={isLoading}
              hasImage={!!currentImage}
              hasUploadedImages={!!(uploadedImages.img1 && uploadedImages.img2)}
            />

            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Image Fusion</h3>
              <div className="grid grid-cols-2 gap-4">
                <ImageUpload
                  label="Image 1"
                  onImageUpload={(base64) => handleImageUpload(base64, 'img1')}
                  currentImage={uploadedImages.img1}
                />
                <ImageUpload
                  label="Image 2"
                  onImageUpload={(base64) => handleImageUpload(base64, 'img2')}
                  currentImage={uploadedImages.img2}
                />
              </div>
            </div>
          </div>

          <div>
            <ImageCanvas image={currentImage} />
          </div>
        </div>

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
