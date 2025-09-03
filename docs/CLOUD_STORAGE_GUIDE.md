# Cloud Storage Integration & API Configuration Guide

## Overview

The AI Photo Gallery Studio now supports cloud storage integration and user-configurable API keys, making it easy for anyone to deploy and use the application without technical setup requirements.

## Features

### ✨ Cloud Storage Integration
- **Google Drive** - Store and sync images with Google Drive
- **Dropbox** - Backup images to Dropbox cloud storage
- **OneDrive** - Integrate with Microsoft OneDrive

### 🔧 API Key Configuration
- **Gemini AI API** - Configure through UI instead of environment variables
- **Visual Interface** - Toggle password visibility for easy setup
- **Real-time Updates** - Changes apply immediately without restart

### 🚀 Open Source Ready
- **No Environment Variables** - All configuration through the web interface
- **Easy Deployment** - Anyone can run the app with just their API keys
- **Persistent Settings** - Configuration saved in browser localStorage

## How to Use

### Setting Up API Keys

1. **Open Settings**
   - Click the ⚙️ Settings button in the top header
   - Navigate to the "API Keys" tab

2. **Configure Gemini AI**
   - Enter your Google Gemini API key
   - Toggle the eye icon to show/hide the key
   - The key is automatically saved and applied

3. **Get Your API Key**
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a new API key
   - Copy and paste it into the settings

### Setting Up Cloud Storage

1. **Open Cloud Storage Tab**
   - In Settings, click the "Cloud Storage" tab
   - Enable cloud storage with the toggle

2. **Choose Provider**
   - Select from Google Drive, Dropbox, or OneDrive
   - Each provider requires different setup steps

3. **Authentication**
   - Follow the provider-specific authentication flow
   - Grant necessary permissions for file access

### Using Cloud Sync

1. **Access Cloud Sync**
   - Click the ☁️ Cloud Sync button in the header
   - Or use it from the bulk actions menu

2. **Test Connection**
   - Verify your cloud storage connection
   - Ensure proper authentication

3. **Sync Images**
   - Upload all gallery images to cloud storage
   - Monitor progress with the progress bar
   - View upload results and any errors

## Technical Implementation

### Architecture

```
├── Settings Management
│   ├── settings-manager.ts     # Core settings logic
│   ├── settings.ts            # Settings types & defaults
│   └── settings-dialog.tsx    # UI component
│
├── Cloud Storage
│   ├── cloud-storage.ts       # Provider implementations
│   └── cloud-sync-dialog.tsx  # Sync interface
│
└── AI Integration
    └── genkit.ts              # Dynamic API key support
```

### Settings Persistence
- **Local Storage** - Settings saved in browser localStorage
- **Automatic Sync** - Changes applied immediately
- **Type Safety** - Full TypeScript support

### Cloud Storage Providers

#### Google Drive
```typescript
class GoogleDriveProvider {
  async authenticate(credentials: any): Promise<boolean>
  async upload(file: File, path: string): Promise<CloudFile>
  async download(fileId: string): Promise<Blob>
  async list(path?: string): Promise<CloudFile[]>
}
```

#### Dropbox
```typescript
class DropboxProvider {
  async authenticate(config: any): Promise<boolean>
  async upload(file: File, path: string): Promise<CloudFile>
  async download(path: string): Promise<Blob>
  async list(path?: string): Promise<CloudFile[]>
}
```

#### OneDrive
```typescript
class OneDriveProvider {
  async authenticate(config: any): Promise<boolean>
  async upload(file: File, path: string): Promise<CloudFile>
  async download(fileId: string): Promise<Blob>
  async list(path?: string): Promise<CloudFile[]>
}
```

## Security Considerations

### API Key Storage
- **Client-Side Only** - Keys stored in browser localStorage
- **No Server Storage** - Never transmitted to external servers
- **User Control** - Users manage their own keys

### Cloud Storage Security
- **OAuth Flow** - Secure authentication with cloud providers
- **Limited Scope** - Request only necessary permissions
- **Token Management** - Automatic token refresh where supported

## Deployment Guide

### For Developers
1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Open http://localhost:9002

### For End Users
1. Access the deployed application
2. Click Settings in the top header
3. Enter your Gemini API key in the API Keys tab
4. Optionally configure cloud storage
5. Start using the AI photo gallery features

## Environment Variables (Optional)

While the app supports UI-based configuration, you can still use environment variables:

```bash
# Optional - will be overridden by UI settings
GEMINI_API_KEY=your_gemini_api_key_here
```

## API Key Sources

### Google Gemini AI
- **Get Key**: [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Free Tier**: Available with rate limits
- **Usage**: Image analysis, categorization, search, editing

### Cloud Storage APIs
- **Google Drive**: [Google Cloud Console](https://console.cloud.google.com/)
- **Dropbox**: [Dropbox App Console](https://www.dropbox.com/developers/apps)
- **OneDrive**: [Microsoft Azure Portal](https://portal.azure.com/)

## Troubleshooting

### API Key Issues
- **Invalid Key**: Check key format and validity
- **Rate Limits**: Upgrade to paid tier if needed
- **Network Issues**: Check internet connection

### Cloud Storage Issues
- **Authentication Failed**: Re-authenticate with provider
- **Upload Errors**: Check file size limits
- **Permission Denied**: Grant necessary permissions

### General Issues
- **Settings Not Saving**: Check browser localStorage support
- **UI Not Updating**: Refresh the page
- **Performance Issues**: Clear browser cache

## Contributing

The cloud storage and settings system is designed to be extensible:

1. **Adding New Providers**: Implement the `CloudStorageProvider` interface
2. **New Settings**: Add to the settings schema in `settings.ts`
3. **UI Improvements**: Enhance the settings dialog components

## Future Enhancements

- **Automatic Sync** - Background synchronization
- **Conflict Resolution** - Handle file conflicts intelligently
- **Selective Sync** - Choose which images to sync
- **Bandwidth Management** - Upload/download throttling
- **Offline Support** - Queue operations for when online

---

This comprehensive cloud storage and API configuration system makes the AI Photo Gallery Studio truly open source and user-friendly, allowing anyone to deploy and use the application with minimal technical knowledge.
