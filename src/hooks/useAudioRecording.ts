import { useRef, useCallback, useState } from 'react';

export const useAudioRecording = () => {
  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);

  const startAudioRecording = useCallback(async (
    videoStream: MediaStream,
    transcribeAudio: (base64Audio: string, mimeType: string) => Promise<string>,
    onTranscript: (transcript: string) => void,
    onError: (error: string) => void
  ) => {
    try {
      // Create audio-only stream for recording
      const audioTracks = videoStream.getAudioTracks();
      if (audioTracks.length === 0) {
        throw new Error('No audio track available. Please allow microphone access.');
      }
      
      const audioStream = new MediaStream(audioTracks);
      
      // Try different audio formats for better compatibility
      let options = {};
      if (MediaRecorder.isTypeSupported('audio/wav')) {
        options = { mimeType: 'audio/wav' };
      } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options = { mimeType: 'audio/webm;codecs=opus' };
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/webm' };
      } else {
        console.warn('No supported audio format found, using default');
      }
      
      const audioRecorder = new MediaRecorder(audioStream, options);
      
      const audioChunks: Blob[] = [];
      let recordedMimeType = 'audio/webm'; // default fallback
      
      // Store the actual mime type that will be used
      if (options && 'mimeType' in options) {
        recordedMimeType = options.mimeType as string;
      }
      
      audioRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };
      
      audioRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunks, { type: recordedMimeType });
          
          // Convert to base64
          const reader = new FileReader();
          reader.onload = async () => {
            try {
              const base64Audio = (reader.result as string).split(',')[1];
              
              // Transcribe using Gemini with the correct MIME type
              const transcript = await transcribeAudio(base64Audio, recordedMimeType);
              
              if (transcript.trim()) {
                onTranscript(transcript);
              } else {
                onError('No speech detected. Please try speaking louder.');
              }
            } catch (err) {
              onError(err instanceof Error ? err.message : 'Transcription failed');
            } finally {
              setIsRecordingAudio(false);
            }
          };
          reader.readAsDataURL(audioBlob);
        } catch (err) {
          onError('Audio processing failed');
          setIsRecordingAudio(false);
        }
      };
      
      audioRecorder.onerror = () => {
        onError('Audio recording failed');
        setIsRecordingAudio(false);
      };
      
      audioRecorderRef.current = audioRecorder;
      audioRecorder.start();
      setIsRecordingAudio(true);
      
      // Auto-stop after 5 seconds
      setTimeout(() => {
        if (audioRecorderRef.current?.state === 'recording') {
          audioRecorderRef.current.stop();
        }
      }, 5000);
      
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Could not start audio recording');
    }
  }, []);

  const stopAudioRecording = useCallback(() => {
    if (audioRecorderRef.current?.state === 'recording') {
      audioRecorderRef.current.stop();
    }
  }, []);

  return {
    isRecordingAudio,
    startAudioRecording,
    stopAudioRecording
  };
};
