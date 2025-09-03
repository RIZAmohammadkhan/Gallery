# Production Deployment Guide

## Environment Setup

1. **Create a `.env` file** based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

2. **Configure your environment variables**:

   ### Database (MongoDB)
   - For local development: `MONGODB_URI=mongodb://localhost:27017/ai-gallery`
   - For production, use MongoDB Atlas: `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-gallery`

   ### Authentication
   - Generate a secure secret: `NEXTAUTH_SECRET=your-very-secure-random-string`
   - Set your domain: `NEXTAUTH_URL=https://yourdomain.com`

   ### Google AI API
   - Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Set: `GEMINI_API_KEY=your-google-ai-api-key`

## Database Setup (MongoDB)

### Option 1: MongoDB Atlas (Recommended for Production)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Create a database user with read/write permissions
4. Get your connection string and add it to your `.env` file

### Option 2: Self-hosted MongoDB

1. Install MongoDB on your server
2. Create a database named `ai-gallery`
3. Ensure MongoDB is running and accessible
4. Update your `MONGODB_URI` in `.env`

## Deployment Options

### Option 1: Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

### Option 2: Docker

```bash
# Build the Docker image
docker build -t ai-gallery .

# Run the container
docker run -p 3000:3000 --env-file .env ai-gallery
```

### Option 3: Traditional VPS/Server

1. Install Node.js 18+ on your server
2. Clone your repository
3. Install dependencies: `npm install`
4. Build the application: `npm run build`
5. Start the production server: `npm start`

## File Storage

By default, files are stored locally in the `uploads` directory. For production:

1. **Ensure the uploads directory is writable**:
   ```bash
   mkdir -p uploads
   chmod 755 uploads
   ```

2. **For multiple servers, consider using cloud storage**:
   - AWS S3
   - Google Cloud Storage
   - Azure Blob Storage

## Security Considerations

1. **Use HTTPS in production**
2. **Set strong passwords and secrets**
3. **Regular database backups**
4. **Monitor file upload limits**
5. **Implement rate limiting**

## Environment Variables Reference

```env
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ai-gallery

# Authentication
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-super-secret-key-change-this

# Google AI
GEMINI_API_KEY=your-google-ai-api-key

# File Upload
MAX_FILE_SIZE=10485760

# Cloud Storage (Optional)
GOOGLE_DRIVE_CLIENT_ID=your-client-id
GOOGLE_DRIVE_CLIENT_SECRET=your-client-secret

# App Configuration
APP_NAME=AI Gallery
APP_URL=https://yourdomain.com
```

## Monitoring and Maintenance

1. **Monitor disk usage** for uploaded files
2. **Set up database backups**
3. **Monitor API usage** for Google AI
4. **Implement logging** for debugging
5. **Regular security updates**

## Scaling Considerations

- Use a CDN for uploaded images
- Implement image optimization
- Use database indexing for better performance
- Consider horizontal scaling for high traffic
