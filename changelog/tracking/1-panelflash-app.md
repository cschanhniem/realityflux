# PanelFlash React App Implementation Plan

## Task Overview
Build a single-page React (Vite + TS) web app for AI image generation, editing, and fusion using Google Gemini AI.

## Implementation Checklist

### Setup & Configuration
- [x] Create package.json with required dependencies
- [x] Set up .env.example file
- [x] Configure vite.config.ts
- [x] Set up main.tsx entry point

### Core Components
- [x] Implement App.tsx with main layout
- [x] Create PromptForm component for text input
- [x] Build ImageCanvas component for displaying images
- [x] Add ImageUpload component for file handling
- [x] Implement ApiKeyInput component
- [x] Create Toast notification system

### Custom Hooks & Utils
- [x] Build useGeminiImage hook with:
  - [x] generateImage function
  - [x] editImage function  
  - [x] fuseImages function
- [x] Implement throttling queue system
- [x] Add base64 conversion utilities

### Features Implementation
- [x] Text-to-image generation
- [x] Image editing with text prompts
- [x] Image fusion functionality
- [x] File upload with drag-and-drop
- [x] Error handling and user feedback
- [x] API key management

### Styling & UX
- [x] Add minimal Tailwind CSS styling
- [x] Implement responsive layout
- [x] Add loading states
- [x] Style error messages

### Documentation & Testing
- [x] Create comprehensive README.md
- [x] Add setup instructions
- [x] Include testing guidelines
- [x] Document API usage examples

## Technical Requirements
- React 18 + TypeScript
- Vite build tool
- Google GenAI SDK v1.17.0
- Model: gemini-2.5-flash-image-preview
- Throttling: ≤20 images/min, 3s delays
- Pure frontend implementation
- Runtime API key input
