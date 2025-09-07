import { useRef, useCallback, useState } from 'react';

export const useCameraStream = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const startCamera = useCallback(async (onError: (error: string) => void) => {
    try {
      // First try with environment camera (back camera on mobile)
      let stream: MediaStream;
      
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 }, 
            height: { ideal: 720 },
            facingMode: 'environment' 
          },
          audio: false // Remove audio to avoid permission conflicts
        });
      } catch (envError) {
        // Fallback to any available camera
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 }, 
            height: { ideal: 720 }
          },
          audio: false
        });
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for the video to be ready
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().then(() => {
              setIsStreaming(true);
            }).catch((playError) => {
              console.error('Error playing video:', playError);
              onError('Failed to start camera playback');
            });
          }
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      onError(`Camera access failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
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

  const getStream = useCallback((): MediaStream | null => {
    return videoRef.current?.srcObject as MediaStream || null;
  }, []);

  return {
    videoRef,
    canvasRef,
    isStreaming,
    startCamera,
    stopCamera,
    captureFrame,
    getStream
  };
};
