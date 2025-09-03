# 🎨 AI Gallery Studio

**A Next.js-powered intelligent image gallery with AI-driven features, secure authentication, and advanced sharing capabilities.**

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.12-green?logo=mongodb)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://www.docker.com/)
[![Security](https://img.shields.io/badge/Security-Enterprise_Grade-red?logo=security)](./SECURITY.md)

## ✨ Features

### 🤖 **AI-Powered Intelligence**
- **Smart Metadata Generation** - Automatically generate titles, descriptions, and tags using Google Gemini AI
- **Defective Image Detection** - AI-powered analysis to identify and quarantine problematic images
- **Advanced Search** - Natural language search across your entire image collection
- **Smart Categorization** - Automatic folder organization based on image content
- **Image Enhancement** - AI-driven image editing and optimization

### 🖼️ **Gallery Management**
- **Drag & Drop Upload** - Seamless image uploading with progress tracking
- **Folder Organization** - Create custom folders and organize images efficiently
- **Bulk Operations** - Select multiple images for batch processing, deletion, or export
- **Image Preview** - High-quality image viewing with zoom and navigation
- **ZIP Export** - Download selected images as compressed archives

### 🔐 **Security & Authentication**
- **NextAuth.js Integration** - Secure user authentication and session management
- **User Registration** - Custom signup with encrypted password storage
- **Protected Routes** - Role-based access control throughout the application
- **Secure File Handling** - Validated uploads with size and type restrictions

### 🔗 **Sharing & Collaboration**
- **Persistent Shared Galleries** - Create shareable links for image collections
- **Expiration Control** - Set custom expiration dates for shared galleries
- **Access Tracking** - Monitor view counts and access patterns
- **Public Gallery Views** - Beautiful, responsive shared gallery interface

### 📱 **Modern UI/UX**
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Dark/Light Mode** - Automatic theme switching based on user preference
- **Radix UI Components** - Accessible, high-quality UI components
- **Tailwind CSS** - Modern styling with customizable design system
- **Loading States** - Smooth animations and feedback during operations

### 🐳 **Enterprise-Ready Deployment**
- **Docker Support** - Containerized deployment with security best practices
- **Multi-Stage Builds** - Optimized production images with minimal attack surface
- **Health Monitoring** - Built-in health checks and status endpoints
- **Environment Management** - Secure configuration with runtime secret injection

## 🚀 Quick Start

### **Development Setup**

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/ai-gallery-studio.git
   cd ai-gallery-studio
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   ```
   http://localhost:9002
   ```

### **Docker Deployment (Recommended)**

1. **Setup secure environment:**
   ```bash
   cp .env.docker.example .env.docker
   # Edit .env.docker with secure secrets
   ```

2. **Deploy with security validation:**
   ```bash
   ./docker-run.sh
   ```

3. **Access your application:**
   ```
   http://localhost:9002
   ```

📖 **[Complete Docker Guide](./DOCKER.md)** | 🔒 **[Security Documentation](./SECURITY.md)**

## 🛠️ Technology Stack

### **Frontend**
- **Next.js 15.5** - React framework with App Router
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library

### **Backend**
- **Next.js API Routes** - Serverless API endpoints
- **NextAuth.js** - Authentication and session management
- **MongoDB** - Document database for data persistence
- **bcryptjs** - Password hashing and security

### **AI Integration**
- **Google Genkit** - AI development framework
- **Google Gemini AI** - Large language model for image analysis
- **Image Processing** - Sharp for image optimization

### **Development Tools**
- **TypeScript** - Static type checking
- **ESLint** - Code linting and quality
- **Prettier** - Code formatting
- **Turbopack** - Fast development bundler

## 📁 Project Structure

```
src/
├── ai/                     # AI flows and configuration
│   ├── flows/             # Individual AI processing flows
│   ├── genkit.ts         # AI framework configuration
│   └── dev.ts            # AI development environment
├── app/                   # Next.js App Router
│   ├── api/              # API endpoints
│   ├── auth/             # Authentication pages
│   ├── share/            # Public sharing pages
│   └── page.tsx          # Main gallery page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── *.tsx            # Feature-specific components
├── lib/                   # Utility libraries
│   ├── auth.ts           # Authentication configuration
│   ├── database.ts       # Database operations
│   ├── types.ts          # TypeScript type definitions
│   └── *.ts             # Other utilities
└── hooks/                 # Custom React hooks
```

## ⚙️ Configuration

### **Environment Variables**

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXTAUTH_URL` | Application URL | ✅ |
| `NEXTAUTH_SECRET` | NextAuth.js secret (32+ chars) | ✅ |
| `GEMINI_API_KEY` | Google Gemini AI API key | ✅ |
| `MONGODB_URI` | MongoDB connection string | ✅ |
| `MAX_FILE_SIZE` | Maximum upload size in bytes | ❌ |
| `APP_NAME` | Application display name | ❌ |

### **AI Features Setup**

1. **Get Gemini API Key:**
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a new API key
   - Add to your environment configuration

2. **Configure AI Flows:**
   - Metadata generation for automatic tagging
   - Defective image detection for quality control
   - Advanced search for content discovery
   - Smart categorization for organization

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build production application |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint code analysis |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run genkit:dev` | Start AI development environment |
| `npm run genkit:watch` | Start AI development with hot reload |

## 🔗 API Endpoints

### **Authentication**
- `POST /api/auth/register` - User registration
- `GET/POST /api/auth/[...nextauth]` - NextAuth.js handlers

### **Images**
- `GET /api/images` - List user images
- `POST /api/images` - Upload new images
- `DELETE /api/images/[id]` - Delete specific image

### **Folders**
- `GET /api/folders` - List user folders
- `POST /api/folders` - Create new folder

### **Sharing**
- `GET /api/shared-galleries` - List shared galleries
- `POST /api/shared-galleries` - Create shared gallery
- `GET /api/share/[shareId]` - Access shared gallery

### **System**
- `GET /api/health` - Health check endpoint

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes:**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch:**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

## 🔒 Security

This application implements **enterprise-grade security practices**:

- ✅ **Secure Docker containers** with non-root execution
- ✅ **Runtime secret injection** (no secrets in images)
- ✅ **Input validation** and sanitization
- ✅ **Authentication** and authorization
- ✅ **HTTPS support** for production deployments

📖 **[Complete Security Guide](./SECURITY.md)**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** - The React framework for production
- **Google Genkit** - AI development framework
- **Radix UI** - Accessible component library
- **Tailwind CSS** - Utility-first CSS framework
- **MongoDB** - Document database platform

## 📞 Support

- **Documentation:** Check the `/docs` folder
- **Issues:** Open a GitHub issue for bugs or feature requests
- **Security:** See [SECURITY.md](./SECURITY.md) for security-related concerns

---

**Built with ❤️ using Next.js, TypeScript, and AI**
