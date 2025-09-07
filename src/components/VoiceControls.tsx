import React from 'react';

interface VoiceControlsProps {
  isStreaming: boolean;
  isProcessing: boolean;
  isRecordingAudio: boolean;
  lastCommand: string;
  onStartVoiceRecording: () => void;
}

const VoiceControls: React.FC<VoiceControlsProps> = ({
  isStreaming,
  isProcessing,
  isRecordingAudio,
  lastCommand,
  onStartVoiceRecording
}) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Voice Commands</h3>
      
      <button
        onClick={onStartVoiceRecording}
        disabled={!isStreaming || isProcessing || isRecordingAudio}
        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors mb-4"
      >
        {isProcessing ? 'Processing...' : 
         isRecordingAudio ? '🎤 Recording... (5s)' : 
         '🎤 AI Voice Recognition (5s)'}
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
  );
};

export default VoiceControls;
