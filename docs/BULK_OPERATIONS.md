# Bulk Operations Documentation

## Overview

The gallery now supports bulk operations for efficiently managing multiple images at once. Users can select multiple images and perform batch actions like deletion and export.

## Features

### 1. Selection Mode
- **Activation**: Click the "Select" button in the header or use Ctrl/Cmd+A
- **Visual Feedback**: Selected images show a blue checkmark overlay
- **Counter**: Header shows the number of selected images in real-time

### 2. Selection Methods
- **Individual Selection**: Click on images while in selection mode
- **Select/Unselect All**: Click the "All" or "None" button to toggle selection of all visible images
- **Keyboard Shortcut**: Ctrl/Cmd+A to toggle between select all and unselect all

### 3. Bulk Delete (Move to Bin)
- **Access**: Click the "Move to Bin" button in selection mode
- **Confirmation**: Shows a confirmation dialog with the number of images to be moved
- **Safety**: Images are moved to the Bin folder instead of being permanently deleted
- **Recovery**: Images can be restored from the Bin folder later
- **Keyboard Shortcut**: Delete or Backspace key while images are selected

### 4. Bulk Export
- **Format**: Exports selected images as a ZIP file
- **Progress**: Shows a progress dialog during ZIP creation
- **Naming**: Uses original image names with proper file extensions
- **Download**: Automatically starts download when complete
- **Keyboard Shortcut**: Ctrl/Cmd+E while images are selected

### 5. User Experience Features
- **Progress Feedback**: Visual progress bar during export operations
- **Auto-completion**: Dialogs auto-close after successful operations
- **Toast Notifications**: Confirmation messages for all operations
- **Escape Handling**: Escape key exits selection mode
- **Responsive Design**: Works seamlessly on mobile and desktop

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + A` | Toggle select all/unselect all visible images |
| `Delete` or `Backspace` | Move selected images to Bin |
| `Ctrl/Cmd + E` | Export selected images as ZIP |
| `Escape` | Exit selection mode |

## Technical Implementation

### Dependencies
- **JSZip**: For creating ZIP files containing multiple images
- **Progress Tracking**: Real-time progress updates during ZIP creation
- **Error Handling**: Graceful fallbacks for unsupported file types or errors

### File Handling
- **Data URI Processing**: Converts data URIs to proper file blobs
- **MIME Type Detection**: Automatically determines correct file extensions
- **Filename Sanitization**: Ensures safe filenames for download
- **Compression**: Applies optimal compression settings for ZIP files

### Performance Considerations
- **Memory Management**: Efficient handling of large image sets
- **Progress Updates**: Non-blocking progress reporting
- **Error Recovery**: Continues operation even if individual images fail

## Usage Instructions

### Selecting Images
1. Click the "Select" button in the header
2. Click on individual images to select/deselect them
3. Use "All"/"None" button to toggle selection of all visible images
4. Use Ctrl/Cmd+A keyboard shortcut to toggle between select all and unselect all

### Bulk Delete (Move to Bin)
1. Select one or more images
2. Click the "Move to Bin" button or press Delete/Backspace
3. Confirm the action in the dialog
4. Images are moved to the Bin folder and can be restored later

### Bulk Export
1. Select one or more images
2. Click the "Export" button or press Ctrl/Cmd+E
3. Wait for the ZIP file to be created (progress shown)
4. ZIP file will automatically download when complete

## Benefits

1. **Efficiency**: Manage multiple images simultaneously
2. **Time Saving**: Bulk operations reduce repetitive tasks
3. **User Friendly**: Intuitive interface with clear visual feedback
4. **Keyboard Support**: Power users can use shortcuts for faster workflows
5. **Safe Operations**: Confirmation dialogs prevent accidental data loss
6. **Cross-Platform**: Works consistently across different devices and browsers
