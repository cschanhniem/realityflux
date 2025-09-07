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
    <div className="h-screen bg-black text-white relative overflow-y-auto overflow-x-hidden">
      {/* Scrollable Container */}
      <div className="min-h-[200vh]">
        
        {/* Camera View Section - Takes full viewport height */}
        <div className="h-screen relative">
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

          {/* Header Overlay on Camera View */}
          <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/60 to-transparent p-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                RealityFlux Live
              </h1>
              <p className="text-gray-300 text-sm">Transform reality with AI</p>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>

        {/* Controls Section - Scrollable area below camera */}
        <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black p-6">
          {/* Section Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Reality Controls</h2>
            <p className="text-gray-400">Transform your world with AI</p>
          </div>

          {/* Camera Controls */}
          <div className="flex justify-center mb-8">
            {!isStreaming ? (
              <button
                onClick={handleStartCamera}
                className="bg-green-600 hover:bg-green-700 text-white px-12 py-6 rounded-full shadow-lg transition-colors font-semibold text-xl flex items-center gap-4 border-2 border-white/30"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Start Camera
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="bg-red-600 hover:bg-red-700 text-white px-12 py-6 rounded-full shadow-lg transition-colors font-semibold text-xl flex items-center gap-4 border-2 border-white/30"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Stop Camera
              </button>
            )}
          </div>

          {/* Transform Input - Only show when camera is streaming */}
          {isStreaming && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-center">Transform Reality</h3>
              <form onSubmit={handleSubmitCommand} className="flex gap-3">
                <input
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  placeholder="Describe the transformation..."
                  className="flex-1 px-6 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-full text-white placeholder-gray-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 text-lg"
                  disabled={isProcessing}
                />
                <button
                  type="submit"
                  disabled={isProcessing || !currentInput.trim()}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-4 rounded-full transition-colors flex items-center justify-center min-w-[100px]"
                >
                  {isProcessing ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Sample Prompts - Only show when camera is streaming */}
          {isStreaming && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-center">Quick Transforms</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: "Cyberpunk City", icon: "🌆" },
                  { name: "Underwater World", icon: "🌊" },
                  { name: "Winter Wonderland", icon: "❄️" },
                  { name: "Outer Space", icon: "🚀" },
                  { name: "Medieval Castle", icon: "🏰" },
                  { name: "Storm Clouds", icon: "⛈️" },
                  { name: "Tropical Beach", icon: "🏝️" },
                  { name: "Sci-fi Future", icon: "🤖" }
                ].map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentInput(`Make it look like a ${prompt.name.toLowerCase()}`)}
                    className="flex items-center gap-3 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl hover:bg-white/20 transition-colors text-left"
                    disabled={isProcessing}
                  >
                    <span className="text-2xl">{prompt.icon}</span>
                    <span className="font-medium">{prompt.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Status Display */}
          {lastCommand && isStreaming && (
            <div className="text-center mb-8">
              <div className="bg-blue-600/20 backdrop-blur-sm border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-300 font-semibold">Active Transformation:</p>
                <p className="text-white text-lg">{lastCommand}</p>
              </div>
            </div>
          )}

          {/* Clear Effects Button */}
          {processedFrame && isStreaming && (
            <div className="text-center mb-8">
              <button
                onClick={() => setProcessedFrame(null)}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-colors border-2 border-yellow-400/30"
              >
                ✨ Clear All Effects
              </button>
            </div>
          )}

          {/* Instructions */}
          <div className="text-center text-gray-400 max-w-md mx-auto">
            <p className="mb-2">📱 <strong>Scroll up</strong> to view full camera</p>
            <p>🎬 <strong>Scroll down</strong> to access controls</p>
          </div>

        </div>

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
