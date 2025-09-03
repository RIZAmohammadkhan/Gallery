# AI Gallery - Production Ready

A production-ready, open-source AI-powered photo gallery application built with Next.js. Features intelligent photo organization, advanced search capabilities, and secure user authentication.

## 🚀 Features

### Core Features
- **🔐 User Authentication** - Secure signup/signin with NextAuth.js
- **☁️ Database Storage** - MongoDB integration for scalable data storage
- **📁 File Management** - Secure file upload and storage with optimization
- **🤖 AI-Powered Analysis** - Automatic image metadata and tagging with Google Gemini
- **🔍 Smart Search** - Natural language search across your photo collection
- **📂 Folder Organization** - Create and manage custom folders
- **🗂️ Auto-Categorization** - AI automatically sorts photos into relevant folders
- **🚫 Defect Detection** - Identify and separate blurry or low-quality images
- **✏️ AI Image Editing** - Edit photos using natural language descriptions
- **🔗 Photo Sharing** - Generate temporary shareable links for galleries
- **📦 Bulk Operations** - Select, delete, and export multiple photos as ZIP files

### Production Features
- **🔒 Security** - JWT-based authentication, secure file handling
- **📈 Scalability** - MongoDB Atlas support, Docker deployment
- **� Multi-deployment** - Vercel, Docker, or traditional server deployment
- **⚡ Performance** - Image optimization, caching, and efficient data loading
- **🛠️ Monitoring** - Error handling and logging for production environments

## 📋 Prerequisites

- **Node.js** 18+ 
- **MongoDB** (local installation or MongoDB Atlas account)
- **Google AI API Key** - Get one from [Google AI Studio](https://aistudio.google.com/app/apikey)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd ai-gallery
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database (use MongoDB Atlas for production)
MONGODB_URI=mongodb://localhost:27017/ai-gallery

# Authentication
NEXTAUTH_URL=http://localhost:9002
NEXTAUTH_SECRET=your-super-secret-key-change-this

# Google AI API Key
GEMINI_API_KEY=your-google-ai-api-key

# File Upload (10MB default)
MAX_FILE_SIZE=10485760
```

### 3. Database Setup

**Option A: Local MongoDB**
```bash
# Install and start MongoDB locally
mongod --dbpath ./data/db
```

**Option B: MongoDB Atlas (Recommended)**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create cluster and get connection string
3. Update `MONGODB_URI` in `.env`

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:9002](http://localhost:9002) and:
1. Sign up for a new account
2. Sign in to access your gallery
3. Upload photos and explore AI features!

## 🐳 Production Deployment

### Docker (Recommended)

```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Traditional Server

```bash
npm run build
npm start
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 🏗️ Architecture

```
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   ├── auth/           # Authentication pages
│   │   └── share/          # Public sharing pages
│   ├── components/         # React components
│   ├── lib/               # Utilities and services
│   │   ├── auth.ts        # NextAuth configuration
│   │   ├── database.ts    # Database service
│   │   └── mongodb.ts     # MongoDB connection
│   └── ai/                # AI integration
├── uploads/               # File storage (create automatically)
├── docs/                  # Documentation
└── deployment files      # Docker, env examples
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | ✅ |
| `NEXTAUTH_SECRET` | Secret for JWT tokens | ✅ |
| `NEXTAUTH_URL` | Your app's URL | ✅ |
| `GEMINI_API_KEY` | Google AI API key | ✅ |
| `MAX_FILE_SIZE` | Max upload size in bytes | ❌ |

### Security Features

- 🔐 Password hashing with bcrypt
- 🛡️ JWT-based session management
- 🚫 File type validation
- 📏 File size limits
- 🔒 User data isolation
- 🛡️ SQL injection prevention

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | User registration |
| `/api/auth/[...nextauth]` | GET/POST | Authentication |
| `/api/upload` | POST | File upload |
| `/api/images` | GET/PUT/DELETE | Image management |
| `/api/folders` | GET/POST/DELETE | Folder management |
| `/api/uploads/[filename]` | GET | File serving |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

- 📖 Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment help
- 🐛 Report issues on GitHub
- 💡 Feature requests welcome!