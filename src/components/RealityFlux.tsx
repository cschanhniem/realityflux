import React, { useState, useCallback, useEffect } from 'react';
import { useGeminiImage } from '../hooks/useGeminiImage';
import { useCameraStream } from '../hooks/useCameraStream';

interface RealityFluxProps {
  apiKey: string;
}

const RealityFlux: React.FC<RealityFluxProps> = ({ apiKey }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [currentInput, setCurrentInput] = useState('');
  const [processedFrame, setProcessedFrame] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { editImage } = useGeminiImage(apiKey);
  const { 
    videoRef, 
    canvasRef, 
    isStreaming, 
    startCamera, 
    stopCamera, 
    captureFrame
  } = useCameraStream();

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const processTextCommand = useCallback(async (command: string) => {
    if (!command.trim() || !isStreaming) return;
    
    setIsProcessing(true);
    setLastCommand(command);
    setCurrentInput(''); // Clear input after processing
    
    try {
      const frameBase64 = captureFrame();
      if (!frameBase64) {
        throw new Error('Could not capture camera frame');
      }

      let result: string;
      
      if (processedFrame) {
        // Edit existing processed frame
        result = await editImage(processedFrame, `Apply this transformation to the camera view: ${command}. Keep the scene realistic but transform it according to the instruction.`);
      } else {
        // Generate initial transformation
        result = await editImage(frameBase64, `Transform this camera view: ${command}. Make it look realistic and maintain the original perspective and lighting.`);
      }
      
      setProcessedFrame(result);
      
    } catch (err) {
      handleError(err instanceof Error ? err.message : 'Failed to process command');
    } finally {
      setIsProcessing(false);
    }
  }, [captureFrame, processedFrame, editImage, isStreaming, handleError]);

  const handleSubmitCommand = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (currentInput.trim()) {
      processTextCommand(currentInput.trim());
    }
  }, [currentInput, processTextCommand]);

  const handleStartCamera = useCallback(() => {
    startCamera(handleError);
    clearError();
  }, [startCamera, handleError, clearError]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="h-screen bg-black text-white relative overflow-hidden">
      {/* Full Screen Video Background */}
      <div className="absolute inset-0">
        <video 
          ref={videoRef}
          autoPlay
          playsInline
          muted
          controls={false}
          className="w-full h-full object-cover"
          style={{ backgroundColor: '#000' }}
          onError={(e) => {
            console.error('Video element error:', e);
            handleError('Video playback failed');
          }}
          onLoadedData={() => {
            console.log('Video data loaded successfully');
          }}
        />
        <canvas ref={canvasRef} className="hidden" width="512" height="288" />
        
        {/* AI Processed Frame Overlay */}
        {processedFrame && (
          <div className="absolute inset-0 bg-black bg-opacity-40">
            <img
              src={`data:image/jpeg;base64,${processedFrame}`}
              alt="AI Transformed Reality"
              className="w-full h-full object-cover opacity-80"
            />
          </div>
        )}
      </div>

      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/60 to-transparent p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            RealityFlux Live
          </h1>
          <p className="text-gray-300 text-sm">Transform reality with AI</p>
        </div>
      </div>

      {/* Bottom Controls Panel - Fixed at bottom with higher z-index */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-t border-white/20 p-4">
        {/* Camera Controls */}
        <div className="flex justify-center mb-4">
          {!isStreaming ? (
            <button
              onClick={handleStartCamera}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full shadow-lg transition-colors font-semibold text-lg flex items-center gap-3 border-2 border-white/30"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Start Camera
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full shadow-lg transition-colors font-semibold text-lg flex items-center gap-3 border-2 border-white/30"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Stop Camera
            </button>
          )}
        </div>

        {/* Transform Input - Only show when camera is streaming */}
        {isStreaming && (
          <div className="mb-3">
            <form onSubmit={handleSubmitCommand} className="flex gap-2">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder="Transform reality..."
                className="flex-1 px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white placeholder-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={isProcessing}
              />
              <button
                type="submit"
                disabled={isProcessing || !currentInput.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-full transition-colors flex items-center justify-center"
              >
                {isProcessing ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Sample Prompts - Only show when camera is streaming */}
        {isStreaming && (
          <div className="mb-3">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {[
                "Cyberpunk city",
                "Underwater world",
                "Winter wonderland", 
                "Outer space",
                "Medieval castle",
                "Storm clouds",
                "Tropical beach",
                "Sci-fi future"
              ].map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentInput(`Make it look like a ${prompt.toLowerCase()}`)}
                  className="whitespace-nowrap px-3 py-2 bg-white/20 backdrop-blur-sm border border-white/30 text-sm text-white rounded-full hover:bg-white/30 transition-colors"
                  disabled={isProcessing}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Status Display */}
        {lastCommand && isStreaming && (
          <div className="text-center mb-2">
            <p className="text-xs text-gray-300">
              <strong>Active:</strong> {lastCommand}
            </p>
          </div>
        )}

        {/* Clear Effects Button */}
        {processedFrame && isStreaming && (
          <div className="text-center">
            <button
              onClick={() => setProcessedFrame(null)}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-full text-sm font-semibold transition-colors border border-white/30"
            >
              Clear Effects
            </button>
          </div>
        )}
      </div>

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg">Transforming Reality...</p>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="absolute top-20 left-4 right-4 z-30">
          <div className="bg-red-600/90 backdrop-blur-sm text-white px-4 py-3 rounded-lg flex justify-between items-center">
            <span className="text-sm">{error}</span>
            <button
              onClick={clearError}
              className="text-white hover:text-gray-300 font-bold text-lg ml-2"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* API Key Required Modal */}
      {!apiKey && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-40 p-4">
          <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg p-6 max-w-sm w-full text-center">
            <h3 className="text-xl font-bold mb-4">API Key Required</h3>
            <p className="text-gray-300 mb-4 text-sm">
              Please set your Gemini API key to use RealityFlux Live.
            </p>
            <p className="text-gray-400 text-xs">
              Go to your browser settings and enter your API key.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealityFlux;
