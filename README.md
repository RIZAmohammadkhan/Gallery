# Intelligent AI Photo Gallery

This is a modern, responsive photo gallery application built with Next.js and powered by Google's Gemini AI models through Genkit. It provides intelligent features to automatically organize, analyze, search, and edit your images.

## Key Features

- **AI-Powered Analysis**: When you upload an image, the app automatically generates a descriptive title, a detailed paragraph of metadata, and relevant tags.
- **Automatic Categorization**: The AI analyzes new uploads and intelligently moves them into the most relevant user-created folder.
- **Defective Image Detection**: The app can identify and flag potentially blurry, low-quality, or accidental photos, moving them to a separate 'Bin' for review.
- **Advanced Natural Language Search**: Go beyond simple tags. You can search your gallery using complex, natural language queries like "blurry photos of the city" or "best shots of nature."
- **AI-Powered Editing**: Edit images by simply describing the changes you want to make (e.g., "make the sky purple and add a cat on the bench").
- **Modern, Responsive UI**: The interface is built with Tailwind CSS and ShadCN UI components, featuring a clean, dark theme that looks great on any device.
- **Drag-and-Drop Organization**: Easily move images between folders, into the 'Uncategorized' section, or to the 'Bin' with a simple drag-and-drop interface.
- **Image Selection & Sharing**: Select multiple images and generate a temporary, shareable link to show them off to others.
- **Bulk Operations**: Select multiple images to move them to the Bin at once or export them as a ZIP file for easy downloading and sharing.
- **Keyboard Shortcuts**: Use keyboard shortcuts for efficient navigation and bulk operations (Ctrl/Cmd+A to toggle select all/none, Delete to move to bin, Ctrl/Cmd+E to export, Escape to exit selection mode).
- **🆕 Cloud Storage Integration**: Backup and sync your images with Google Drive, Dropbox, or OneDrive for cross-device access and data safety.
- **🆕 UI-Based API Configuration**: Configure your Gemini AI API key directly through the web interface - no environment variables needed!
- **🆕 Open Source Ready**: Easy deployment and setup for anyone - just enter your API key and start using!

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **UI Library**: [React](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [ShadCN UI](https://ui.shadcn.com/)
- **AI Integration**: [Genkit](https://firebase.google.com/docs/genkit) with Google's Gemini models.
- **Icons**: [Lucide React](https://lucide.dev/)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en) (v18 or later recommended)
- A Google AI API key. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation & Setup

1.  **Clone the repository (or download the source code).**

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **🆕 Quick Start (Recommended):**
    - Run the development server: `npm run dev`
    - Open [http://localhost:9002](http://localhost:9002)
    - Click the ⚙️ Settings button in the top header
    - Go to "API Keys" tab and enter your Google AI API key
    - Get your key from [Google AI Studio](https://aistudio.google.com/app/apikey)
    - Start using the app immediately!

4.  **Alternative: Environment Variables (Optional):**
    Create a file named `.env` in the root of the project and add your Google AI API key:
    ```
    GEMINI_API_KEY=YOUR_API_KEY_HERE
    ```
    Note: UI settings will override environment variables.

5.  **Run the development server:**
    ```bash
    npm run dev
    ```

The application will be available at [http://localhost:9002](http://localhost:9002).

## 🆕 New Features

### Cloud Storage Integration
Back up and sync your gallery images to the cloud:
- **Google Drive** - Seamless integration with Google Drive
- **Dropbox** - Backup to Dropbox cloud storage  
- **OneDrive** - Sync with Microsoft OneDrive

Access cloud sync through the ☁️ button in the header or configure providers in Settings → Cloud Storage.

### UI-Based Configuration
No more environment variable setup required:
- **API Key Management** - Enter your Gemini AI key directly in the app
- **Visual Interface** - Toggle password visibility, real-time validation
- **Persistent Settings** - Configuration saved automatically in browser
- **Open Source Ready** - Anyone can deploy and use with just their API keys

### Enhanced User Experience
- **Professional UI** - Redesigned interface with proper spacing and responsive design
- **Bulk Operations** - Delete multiple images to bin or export as ZIP files
- **Keyboard Shortcuts** - Efficient workflow with keyboard shortcuts
- **Settings Management** - Comprehensive settings panel for all configuration

For detailed documentation, see [Cloud Storage Guide](./docs/CLOUD_STORAGE_GUIDE.md).
