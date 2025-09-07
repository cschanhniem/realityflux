import React, { useState, useCallback, useEffect } from 'react';
import { useGeminiImage } from '../hooks/useGeminiImage';
import { useCameraStream } from '../hooks/useCameraStream';
import { useVideoRecording } from '../hooks/useVideoRecording';
import CameraView from './CameraView';

interface RealityFluxProps {
  apiKey: string;
  onBack: () => void;
}

const RealityFlux: React.FC<RealityFluxProps> = ({ apiKey, onBack }) => {
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
    captureFrame, 
    getStream 
  } = useCameraStream();
  const { isRecording, startRecording, stopRecording } = useVideoRecording();

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

  const handleStartRecording = useCallback(() => {
    const stream = getStream();
    if (stream) {
      startRecording(stream, handleError);
    }
  }, [getStream, startRecording, handleError]);

  useEffect(() => {
    return () => {
      stopCamera();
      if (isRecording) stopRecording();
    };
  }, [stopCamera, stopRecording, isRecording]);

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              RealityFlux Live
            </h1>
            <p className="text-gray-400">Transform reality with text commands</p>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            ← Back to PanelFlash
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Camera View */}
          <CameraView
            videoRef={videoRef}
            canvasRef={canvasRef}
            isStreaming={isStreaming}
            isRecording={isRecording}
            isProcessing={isProcessing}
            processedFrame={processedFrame}
            lastCommand={lastCommand}
            apiKey={apiKey}
            onStartCamera={handleStartCamera}
            onStopCamera={stopCamera}
            onStartRecording={handleStartRecording}
            onStopRecording={stopRecording}
          />

          {/* Controls */}
          <div className="space-y-6">
            {/* Text Command Input */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Transform Reality</h3>
              <form onSubmit={handleSubmitCommand} className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    placeholder="Type what you want to transform... (e.g., 'make it look like a cyberpunk city')"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    disabled={!isStreaming || isProcessing}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!isStreaming || isProcessing || !currentInput.trim()}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Transform Reality</span>
                  )}
                </button>
              </form>
              
              {lastCommand && (
                <div className="mt-4 p-3 bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-300">
                    <strong>Last Command:</strong> {lastCommand}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">How It Works</h3>
              <div className="text-sm text-gray-400 space-y-2">
                <p>1. <strong>Camera Capture:</strong> Live video stream at 512×288</p>
                <p>2. <strong>Text Input:</strong> Type transformation commands</p>
                <p>3. <strong>AI Processing:</strong> Gemini 2.5 Flash Image editing</p>
                <p>4. <strong>Real-time Overlay:</strong> Processed frames over camera</p>
                <p>5. <strong>Recording:</strong> 30-second clips for sharing</p>
              </div>
            </div>

            {processedFrame && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Reset Transformation</h3>
                <button
                  onClick={() => setProcessedFrame(null)}
                  className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors"
                >
                  Clear Effects
                </button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg max-w-md">
            {error}
            <button
              onClick={clearError}
              className="ml-2 text-white hover:text-gray-300 font-bold"
            >
              ×
            </button>
          </div>
        )}

        {!apiKey && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md">
              <h3 className="text-xl font-bold mb-4">API Key Required</h3>
              <p className="text-gray-400 mb-4">
                Please set your Gemini API key in PanelFlash to use RealityFlux Live.
              </p>
              <button
                onClick={onBack}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Go Back to Setup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealityFlux;
