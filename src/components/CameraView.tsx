import React from 'react';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isStreaming: boolean;
  isRecording: boolean;
  isProcessing: boolean;
  processedFrame: string | null;
  lastCommand: string;
  apiKey: string;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({
  videoRef,
  canvasRef,
  isStreaming,
  isRecording,
  isProcessing,
  processedFrame,
  lastCommand,
  apiKey,
  onStartCamera,
  onStopCamera,
  onStartRecording,
  onStopRecording
}) => {
  return (
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
            onClick={onStartCamera}
            disabled={!apiKey}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            Start Camera
          </button>
        ) : (
          <button
            onClick={onStopCamera}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            Stop Camera
          </button>
        )}
        
        {isStreaming && !isRecording && (
          <button
            onClick={onStartRecording}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
          >
            Record
          </button>
        )}
        
        {isRecording && (
          <button
            onClick={onStopRecording}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg animate-pulse"
          >
            Stop Recording
          </button>
        )}
      </div>
    </div>
  );
};

export default CameraView;
