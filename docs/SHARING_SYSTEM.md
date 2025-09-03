# Image Sharing System

## Overview

The gallery application now includes a robust image sharing system that allows users to create and manage shareable galleries with advanced features like expiration dates, access tracking, and persistent storage.

## Features

### 1. Enhanced Share Dialog
- **Custom Gallery Titles**: Users can set custom titles for shared galleries
- **Expiration Options**: Optional expiration dates (1 day, 3 days, 1 week, 1 month, 3 months)
- **URL Generation**: Creates clean, shareable URLs that persist across sessions
- **Copy to Clipboard**: Automatic copying of share links for easy distribution
- **Progress Feedback**: Visual feedback during link generation

### 2. Persistent Storage
- **LocalStorage Persistence**: Shared galleries are stored locally and persist across browser sessions
- **Fallback Support**: Graceful degradation when localStorage is unavailable
- **Data Structure**: Organized storage with metadata including creation date, access count, and expiration

### 3. Shared Gallery Viewer
- **Responsive Layout**: Masonry-style grid layout optimized for different screen sizes
- **Gallery Information**: Displays creation date, expiration status, and view count
- **Image Actions**: Download individual images or open in new tabs
- **Hover Interactions**: Clean overlay with action buttons on image hover
- **Error Handling**: Proper error states for missing or expired galleries

### 4. Shared Galleries Manager
- **Gallery Overview**: View all created shared galleries in one place
- **Quick Actions**: Copy links, open galleries, or delete unwanted shares
- **Status Indicators**: Visual badges showing expiration status
- **Automatic Cleanup**: Removes expired galleries automatically
- **Access Analytics**: Track how many times each gallery has been viewed

### 5. Security & Privacy
- **No URL Parameter Data**: Images are stored securely, not exposed in URLs
- **Expiration Controls**: Automatic cleanup of expired galleries
- **Access Tracking**: Monitor gallery usage without collecting personal data
- **Graceful Degradation**: Fallback handling when features are unavailable

## Technical Implementation

### Storage Architecture
```typescript
interface SharedGallery {
  id: string;           // Unique identifier
  title: string;        // User-defined title
  images: Array<{       // Image data
    id: string;
    name: string;
    dataUri: string;
  }>;
  createdAt: Date;      // Creation timestamp
  expiresAt?: Date;     // Optional expiration
  accessCount: number;  // View tracking
}
```

### Key Components

1. **ShareDialog**: Enhanced sharing interface with expiration options
2. **SharedGalleriesManager**: Management interface for all shared galleries
3. **SharedGalleryPage**: Viewer page for individual shared galleries
4. **sharing.ts**: Core utility functions for gallery management

### URL Structure
- Clean URLs: `/share/{shareId}`
- No sensitive data in URLs
- Persistent across sessions

## Usage Instructions

### Creating a Shared Gallery
1. Select images using the "Select" button
2. Click "Share" to open the sharing dialog
3. Enter a custom title for your gallery
4. Optionally set an expiration date
5. Click "Generate Link" to create the shareable URL
6. The link is automatically copied to your clipboard

### Managing Shared Galleries
1. Click the "Shared" button in the header
2. View all your created galleries
3. Copy links, open galleries, or delete them as needed
4. Monitor access counts and expiration status

### Viewing Shared Galleries
1. Open a shared gallery link
2. View images in a responsive grid layout
3. Download images or open them in new tabs
4. Access remains tracked automatically

## Benefits

1. **Improved Security**: No image data exposed in URLs
2. **Better Performance**: Efficient storage and retrieval
3. **User Control**: Expiration dates and access management
4. **Enhanced UX**: Clean interfaces and smooth interactions
5. **Analytics**: Basic usage tracking for shared content
6. **Reliability**: Persistent storage with fallback handling
