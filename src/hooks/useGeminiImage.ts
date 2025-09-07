import { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';

interface QueueItem {
  id: string;
  execute: () => Promise<void>;
}

let requestQueue: QueueItem[] = [];
let isProcessing = false;
let lastRequestTime = 0;

const processQueue = async () => {
  if (isProcessing || requestQueue.length === 0) return;
  
  isProcessing = true;
  
  while (requestQueue.length > 0) {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < 3000) {
      await new Promise(resolve => setTimeout(resolve, 3000 - timeSinceLastRequest));
    }
    
    const item = requestQueue.shift();
    if (item) {
      await item.execute();
      lastRequestTime = Date.now();
    }
  }
  
  isProcessing = false;
};

export const useGeminiImage = (apiKey: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeWithQueue = useCallback((operation: () => Promise<string>): Promise<string> => {
    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36).substr(2, 9);
      
      requestQueue.push({
        id,
        execute: async () => {
          try {
            setIsLoading(true);
            setError(null);
            const result = await operation();
            resolve(result);
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            reject(new Error(errorMessage));
          } finally {
            setIsLoading(false);
          }
        }
      });
      
      processQueue();
    });
  }, []);

  const generateImage = useCallback(async (prompt: string): Promise<string> => {
    if (!apiKey) throw new Error('API key is required');
    
    return executeWithQueue(async () => {
      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: [`Generate an image based on this prompt: ${prompt}`]
      });
      
      if (!response.candidates?.[0]?.content?.parts) {
        throw new Error('No response received from API');
      }
      
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          return part.inlineData.data;
        }
      }
      
      throw new Error('No image data received from API');
    });
  }, [apiKey, executeWithQueue]);

  const editImage = useCallback(async (base64Image: string, prompt: string): Promise<string> => {
    if (!apiKey) throw new Error('API key is required');
    
    return executeWithQueue(async () => {
      const ai = new GoogleGenAI({ apiKey });
      
      const contents = [
        { text: `Edit this image based on the following instruction: ${prompt}` },
        {
          inlineData: {
            mimeType: 'image/png',
            data: base64Image,
          },
        },
      ];
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents
      });
      
      if (!response.candidates?.[0]?.content?.parts) {
        throw new Error('No response received from API');
      }
      
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          return part.inlineData.data;
        }
      }
      
      throw new Error('No edited image data received from API');
    });
  }, [apiKey, executeWithQueue]);

  const fuseImages = useCallback(async (img1: string, img2: string, prompt: string): Promise<string> => {
    if (!apiKey) throw new Error('API key is required');
    
    return executeWithQueue(async () => {
      const ai = new GoogleGenAI({ apiKey });
      
      const contents = [
        { text: `Fuse these two images together based on this instruction: ${prompt}` },
        {
          inlineData: {
            mimeType: 'image/png',
            data: img1,
          },
        },
        {
          inlineData: {
            mimeType: 'image/png',
            data: img2,
          },
        },
      ];
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents
      });
      
      if (!response.candidates?.[0]?.content?.parts) {
        throw new Error('No response received from API');
      }
      
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          return part.inlineData.data;
        }
      }
      
      throw new Error('No fused image data received from API');
    });
  }, [apiKey, executeWithQueue]);

  return {
    generateImage,
    editImage,
    fuseImages,
    isLoading,
    error,
    clearError: () => setError(null)
  };
};
