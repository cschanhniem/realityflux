import React, { useState, useCallback, useEffect } from 'react';
import { useGeminiImage } from '../hooks/useGeminiImage';
import { useCameraStream } from '../hooks/useCameraStream';
import { useVideoRecording } from '../hooks/useVideoRecording';
import { useAudioRecording } from '../hooks/useAudioRecording';
import CameraView from './CameraView';
import VoiceControls from './VoiceControls';

interface RealityFluxProps {
  apiKey: string;
  onBack: () => void;
}

const RealityFlux: React.FC<RealityFluxProps> = ({ apiKey, onBack }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [processedFrame, setProcessedFrame] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { editImage, transcribeAudio } = useGeminiImage(apiKey);
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
  const { isRecordingAudio, startAudioRecording, stopAudioRecording } = useAudioRecording();

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const processVoiceCommand = useCallback(async (command: string) => {
    if (!command.trim() || !isStreaming) return;
    
    setIsProcessing(true);
    setLastCommand(command);
    
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
      
      // Simulate ElevenLabs audio (placeholder for now)
      playAmbientSound(command);
      
    } catch (err) {
      handleError(err instanceof Error ? err.message : 'Failed to process command');
    } finally {
      setIsProcessing(false);
    }
  }, [captureFrame, processedFrame, editImage, isStreaming, handleError]);

  const playAmbientSound = useCallback((command: string) => {
    // Placeholder for ElevenLabs integration
    // In real implementation, this would call ElevenLabs API to generate ambient sounds
    console.log(`Playing ambient sound for: ${command}`);
  }, []);

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

  const handleStartVoiceRecording = useCallback(() => {
    const stream = getStream();
    if (stream) {
      startAudioRecording(
        stream,
        transcribeAudio,
        processVoiceCommand,
        handleError
      );
    }
  }, [getStream, startAudioRecording, transcribeAudio, processVoiceCommand, handleError]);

  useEffect(() => {
    return () => {
      stopCamera();
      if (isRecording) stopRecording();
      if (isRecordingAudio) stopAudioRecording();
    };
  }, [stopCamera, stopRecording, stopAudioRecording, isRecording, isRecordingAudio]);

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              RealityFlux Live
            </h1>
            <p className="text-gray-400">Verbally rewrite reality in real-time</p>
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
            <VoiceControls
              isStreaming={isStreaming}
              isProcessing={isProcessing}
              isRecordingAudio={isRecordingAudio}
              lastCommand={lastCommand}
              onStartVoiceRecording={handleStartVoiceRecording}
            />

            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">How It Works</h3>
              <div className="text-sm text-gray-400 space-y-2">
                <p>1. <strong>Camera Capture:</strong> Live video stream at 512×288</p>
                <p>2. <strong>Voice Recognition:</strong> Gemini AI speech-to-text</p>
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
