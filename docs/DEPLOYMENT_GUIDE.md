# Deployment Guide

## Overview

The AI Photo Gallery Studio is designed to be easily deployable by anyone, with no complex environment variable setup required. All configuration is done through the web interface.

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Fork the Repository**
   - Fork this repository to your GitHub account

2. **Deploy to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your forked repository
   - Click "Deploy"

3. **Configure the App**
   - Visit your deployed app URL
   - Click the ⚙️ Settings button
   - Enter your Gemini AI API key
   - Optionally configure cloud storage

### Option 2: Netlify

1. **Fork the Repository**
   - Fork this repository to your GitHub account

2. **Deploy to Netlify**
   - Visit [netlify.com](https://netlify.com)
   - Sign in with GitHub
   - Click "New site from Git"
   - Choose your forked repository
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Click "Deploy site"

3. **Configure the App**
   - Visit your deployed app URL
   - Click the ⚙️ Settings button
   - Enter your Gemini AI API key

### Option 3: Self-Hosted (VPS/Server)

1. **Clone Repository**
   ```bash
   git clone https://github.com/RIZAmohammadkhan/studio.git
   cd studio
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

4. **Start Production Server**
   ```bash
   npm start
   ```

5. **Configure Reverse Proxy (Optional)**
   Set up nginx or Apache to proxy to your Node.js server

6. **Configure the App**
   - Visit your server's URL
   - Click the ⚙️ Settings button
   - Enter your Gemini AI API key

## Required API Keys

### Google Gemini AI (Required)
- **Purpose**: Powers all AI features (analysis, search, editing, categorization)
- **Get Key**: [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Cost**: Free tier available with rate limits
- **Setup**: Enter in Settings → API Keys tab

### Cloud Storage (Optional)

#### Google Drive
- **Purpose**: Backup and sync images
- **Get Credentials**: [Google Cloud Console](https://console.cloud.google.com/)
- **Setup**: Configure OAuth2 credentials, enter in Settings → Cloud Storage

#### Dropbox
- **Purpose**: Cloud backup
- **Get Key**: [Dropbox App Console](https://www.dropbox.com/developers/apps)
- **Setup**: Create app, get access token, enter in Settings → Cloud Storage

#### OneDrive
- **Purpose**: Microsoft cloud integration
- **Get Credentials**: [Microsoft Azure Portal](https://portal.azure.com/)
- **Setup**: Register app, configure permissions, enter in Settings → Cloud Storage

## Environment Variables (Optional)

While the app supports UI-based configuration, you can optionally set environment variables:

```bash
# Optional - UI settings will override these
GEMINI_API_KEY=your_gemini_api_key_here
```

## Post-Deployment Setup

1. **Visit Your App**
   - Navigate to your deployed app URL

2. **Configure API Keys**
   - Click Settings (⚙️) in the top header
   - Go to "API Keys" tab
   - Enter your Gemini AI API key
   - Key is validated and saved automatically

3. **Test AI Features**
   - Upload a test image
   - Verify AI analysis works
   - Try natural language search

4. **Configure Cloud Storage (Optional)**
   - Go to Settings → Cloud Storage
   - Enable cloud storage
   - Choose provider and authenticate
   - Test connection

## Troubleshooting

### Common Issues

**App loads but AI features don't work**
- Check if Gemini API key is entered correctly
- Verify API key has proper permissions
- Check browser console for errors

**Cloud storage not connecting**
- Verify OAuth credentials are correct
- Check if required permissions are granted
- Test connection in Settings → Cloud Storage

**Build fails during deployment**
- Ensure Node.js version is 18+ 
- Check if all dependencies install correctly
- Verify build command is `npm run build`

**App is slow or unresponsive**
- Check if images are too large (consider resizing)
- Monitor API rate limits
- Clear browser cache

### Getting Help

1. **Check Documentation**
   - [Cloud Storage Guide](./CLOUD_STORAGE_GUIDE.md)
   - [README.md](../README.md)

2. **Common Solutions**
   - Refresh the page
   - Clear browser localStorage
   - Check browser console for errors
   - Verify API keys are valid

3. **Support Channels**
   - GitHub Issues
   - Documentation
   - Community forums

## Security Best Practices

### API Key Security
- Never commit API keys to version control
- Use UI configuration instead of environment variables
- API keys are stored locally in browser only
- Keys are not transmitted to third parties

### Cloud Storage Security
- Use OAuth2 flow for authentication
- Grant minimum required permissions
- Regularly review connected applications
- Monitor cloud storage usage

### General Security
- Keep dependencies updated
- Use HTTPS in production
- Regular security audits
- Monitor for unusual activity

## Performance Optimization

### Image Optimization
- Compress images before upload
- Use appropriate image formats
- Consider image resizing for thumbnails

### API Usage
- Monitor API rate limits
- Implement caching where possible
- Batch operations when available

### Deployment Optimization
- Use CDN for static assets
- Enable gzip compression
- Optimize build output
- Monitor performance metrics

---

This deployment guide ensures anyone can easily deploy and configure the AI Photo Gallery Studio with minimal technical knowledge required.
