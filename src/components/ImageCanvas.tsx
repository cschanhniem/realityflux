import React from 'react';

interface GeneratedImage {
  id: string;
  base64: string;
  prompt: string;
  timestamp: Date;
}

interface ImageCanvasProps {
  image: GeneratedImage | null;
}

const ImageCanvas: React.FC<ImageCanvasProps> = ({ image }) => {
  const downloadImage = () => {
    if (!image) return;
    
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${image.base64}`;
    link.download = `panelflash-${image.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!image) {
    return (
      <div className="bg-gray-800 rounded-lg p-8">
        <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed border-gray-600 rounded-lg">
          <div className="text-6xl text-gray-600 mb-4">🎨</div>
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No Image Generated</h3>
          <p className="text-gray-500 text-center">
            Generate, edit, or fuse images using the prompts on the left
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Generated Image</h3>
        <button
          onClick={downloadImage}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Download
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="relative group">
          <img
            src={`data:image/png;base64,${image.base64}`}
            alt="Generated image"
            className="w-full h-auto rounded-lg border border-gray-600"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <button
              onClick={downloadImage}
              className="px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm text-white font-medium rounded-lg"
            >
              Click to Download
            </button>
          </div>
        </div>
        
        <div className="text-sm space-y-2">
          <div>
            <span className="text-gray-400">Prompt:</span>
            <p className="text-white mt-1">{image.prompt}</p>
          </div>
          <div>
            <span className="text-gray-400">Generated:</span>
            <p className="text-white">{image.timestamp.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCanvas;
