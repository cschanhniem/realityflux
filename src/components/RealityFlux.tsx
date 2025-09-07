import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useGeminiImage } from '../hooks/useGeminiImage';

interface RealityFluxProps {
  apiKey: string;
  onBack: () => void;
}

const RealityFlux: React.FC<RealityFluxProps> = ({ apiKey, onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [processedFrame, setProcessedFrame] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { editImage } = useGeminiImage(apiKey);
  
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          facingMode: 'environment' 
        },
        audio: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        setError(null);
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera permissions.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;
    
    canvas.width = 512;
    canvas.height = 288;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    return canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
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
      setError(err instanceof Error ? err.message : 'Failed to process command');
    } finally {
      setIsProcessing(false);
    }
  }, [captureFrame, processedFrame, editImage, isStreaming]);

  const playAmbientSound = useCallback((command: string) => {
    // Placeholder for ElevenLabs integration
    // In real implementation, this would call ElevenLabs API to generate ambient sounds
    console.log(`Playing ambient sound for: ${command}`);
  }, []);

  const startVoiceRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const lastResult = event.results[event.results.length - 1];
      if (lastResult.isFinal) {
        const command = lastResult[0].transcript;
        processVoiceCommand(command);
      }
    };

    recognition.onerror = () => {
      setError('Voice recognition error. Please try again.');
    };

    recognition.start();
    
    setTimeout(() => {
      recognition.stop();
    }, 5000);
  }, [processVoiceCommand]);

  const startRecording = useCallback(() => {
    if (!videoRef.current?.srcObject) return;
    
    const stream = videoRef.current.srcObject as MediaStream;
    const options = { mimeType: 'video/webm' };
    
    try {
      const mediaRecorder = new MediaRecorder(stream, options);
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `realityflux-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
      };
      
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      
      // Auto-stop after 30 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          stopRecording();
        }
      }, 30000);
      
    } catch (err) {
      setError('Recording not supported in this browser');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      setIsRecording(false);
    }
  }, []);

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
          <div className="space-y-4">
            <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {processedFrame && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <img
                    src={`data:image/png;base64,${processedFrame}`}
                    alt="AI-processed view"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}
              {isProcessing && (
                <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p>Processing: "{lastCommand}"</p>
                  </div>
                </div>
              )}
            </div>
            
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="flex gap-2">
              {!isStreaming ? (
                <button
                  onClick={startCamera}
                  disabled={!apiKey}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                >
                  Start Camera
                </button>
              ) : (
                <button
                  onClick={stopCamera}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                >
                  Stop Camera
                </button>
              )}
              
              {isStreaming && !isRecording && (
                <button
                  onClick={startRecording}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                >
                  Record
                </button>
              )}
              
              {isRecording && (
                <button
                  onClick={stopRecording}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg animate-pulse"
                >
                  Stop Recording
                </button>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Voice Commands</h3>
              
              <button
                onClick={startVoiceRecognition}
                disabled={!isStreaming || isProcessing}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors mb-4"
              >
                {isProcessing ? 'Processing...' : '🎤 Hold to Speak (5s)'}
              </button>
              
              {lastCommand && (
                <div className="bg-gray-700 rounded p-3 mb-4">
                  <p className="text-sm text-gray-300">Last command:</p>
                  <p className="text-white">"{lastCommand}"</p>
                </div>
              )}
              
              <div className="space-y-2 text-sm text-gray-400">
                <p><strong>Try saying:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>"Convert my room to art-deco teal and gold"</li>
                  <li>"Add a chrome panther on the floor"</li>
                  <li>"Make it look like a tropical jungle"</li>
                  <li>"Change to dusk lighting with neon signs"</li>
                  <li>"Transform into a cyberpunk scene"</li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">How It Works</h3>
              <div className="text-sm text-gray-400 space-y-2">
                <p>1. <strong>Camera Capture:</strong> Live video stream at 512×288</p>
                <p>2. <strong>Voice Recognition:</strong> Browser speech-to-text</p>
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
              onClick={() => setError(null)}
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
