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
      const audioRecorder = new MediaRecorder(audioStream, { 
        mimeType: 'audio/webm' 
      });
      
      const audioChunks: Blob[] = [];
      
      audioRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };
      
      audioRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          
          // Convert to base64
          const reader = new FileReader();
          reader.onload = async () => {
            try {
              const base64Audio = (reader.result as string).split(',')[1];
              
              // Transcribe using Gemini
              const transcript = await transcribeAudio(base64Audio, 'audio/webm');
              
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
