# PanelFlash + RealityFlux Live

**PanelFlash** is a dual-mode React/TypeScript web application combining AI-powered image generation with real-time AR reality transformation using Google's Gemini AI.

## Dual Mode Features

### PanelFlash (Static Image Mode)
- **Text-to-Image Generation**: Create stunning images from text prompts
- **Image Editing**: Modify existing images with natural language instructions
- **Image Fusion**: Combine two uploaded images with custom prompts
- **Real-time Processing**: Instant image display with base64 encoding
- **Drag & Drop Upload**: Intuitive file upload interface

### RealityFlux Live (AR Camera Mode)
- **Real-time Camera Stream**: Live video capture at 640×480 resolution
- **Voice Commands**: Browser-based speech recognition for natural interaction
- **Live Reality Transformation**: AI-powered real-time scene modification
- **Frame Processing**: 512×288 optimized frames for Gemini AI processing
- **Video Recording**: 30-second clip recording and download
- **Ambient Sound Integration**: ElevenLabs placeholder for immersive audio

### Shared Features
- **Rate Limiting**: Built-in throttling (≤20 images/min, 3s delays)
- **Error Handling**: Comprehensive error management with toast notifications
- **Runtime API Key**: No hardcoded secrets - paste key at runtime

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **AI Integration**: Google Gemini AI SDK (@google/genai v1.17.0)
- **Target Model**: gemini-2.5-flash-image-preview

## Setup Instructions

1. **Clone and Install Dependencies**
   ```bash
   git clone <repository-url>
   cd panelflash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Add your Gemini API key to .env (optional - can be entered at runtime)
   ```

3. **Get API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Either add to `.env` file or enter at runtime in the app

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Build for Production**
   ```bash
   npm run build
   npm run preview
   ```

## How It Works

PanelFlash leverages Google's Gemini AI through direct browser-based API calls using the corrected SDK format. The application converts images to base64 format for seamless processing and display, implementing a queue system to respect API rate limits while maintaining smooth user experience.

## Usage

1. **Enter API Key**: Paste your Gemini API key in the configuration section
2. **Generate Images**: Write descriptive prompts to create new images
3. **Edit Images**: Select generated images and provide editing instructions
4. **Fuse Images**: Upload two images and describe how to combine them
5. **Download Results**: Click any generated image to download as PNG

## Testing Network Requests

To verify API integration:

1. Open browser DevTools (F12)
2. Navigate to Network tab
3. Generate an image
4. Look for requests to `generativelanguage.googleapis.com`
5. Check request payload matches SDK documentation format

## Project Structure

```
src/
├── components/          # React components
│   ├── ApiKeyInput.tsx  # API key configuration
│   ├── PromptForm.tsx   # Text input and action buttons
│   ├── ImageCanvas.tsx  # Image display and download
│   ├── ImageUpload.tsx  # Drag & drop file upload
│   ├── RealityFlux.tsx  # Real-time AR camera component
│   └── Toast.tsx        # Notification system
├── hooks/
│   └── useGeminiImage.ts # Gemini AI integration
├── App.tsx              # Main app with dual-mode navigation
├── main.tsx             # Application entry point
└── index.css            # Global styles and Tailwind
```

## API Integration

The `useGeminiImage` hook provides three main functions:

- `generateImage(prompt: string)`: Creates new images from text
- `editImage(base64Image: string, prompt: string)`: Modifies existing images
- `fuseImages(img1: string, img2: string, prompt: string)`: Combines two images

All functions include automatic throttling and error handling.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## License

MIT License - feel free to use this project for learning and development.
# banana-hackathon
