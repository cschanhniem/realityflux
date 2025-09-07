import React, { useState } from 'react';

interface PromptFormProps {
  onGenerate: (prompt: string) => void;
  onEdit: (prompt: string) => void;
  onFuse: (prompt: string) => void;
  isLoading: boolean;
  hasImage: boolean;
  hasUploadedImages: boolean;
}

const PromptForm: React.FC<PromptFormProps> = ({
  onGenerate,
  onEdit,
  onFuse,
  isLoading,
  hasImage,
  hasUploadedImages
}) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (action: 'generate' | 'edit' | 'fuse') => {
    if (!prompt.trim()) return;
    
    switch (action) {
      case 'generate':
        onGenerate(prompt);
        break;
      case 'edit':
        onEdit(prompt);
        break;
      case 'fuse':
        onFuse(prompt);
        break;
    }
    
    setPrompt('');
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Prompt Input</h3>
      <div className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want to generate, edit, or fusion instruction..."
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 resize-none"
          rows={3}
          disabled={isLoading}
        />
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleSubmit('generate')}
            disabled={isLoading || !prompt.trim()}
            className="flex-1 min-w-[120px] px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {isLoading ? 'Generating...' : 'Generate'}
          </button>
          
          <button
            onClick={() => handleSubmit('edit')}
            disabled={isLoading || !prompt.trim() || !hasImage}
            className="flex-1 min-w-[120px] px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {isLoading ? 'Editing...' : 'Edit Image'}
          </button>
          
          <button
            onClick={() => handleSubmit('fuse')}
            disabled={isLoading || !prompt.trim() || !hasUploadedImages}
            className="flex-1 min-w-[120px] px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {isLoading ? 'Fusing...' : 'Fuse Images'}
          </button>
        </div>
        
        <div className="text-sm text-gray-400 space-y-1">
          <p>• <strong>Generate:</strong> Create a new image from your prompt</p>
          <p>• <strong>Edit:</strong> Modify the current image {!hasImage && '(generate an image first)'}</p>
          <p>• <strong>Fuse:</strong> Combine uploaded images {!hasUploadedImages && '(upload two images first)'}</p>
        </div>
      </div>
    </div>
  );
};

export default PromptForm;
