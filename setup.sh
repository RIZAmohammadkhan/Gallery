#!/bin/bash

# AI Gallery Setup Script
echo "🎨 Setting up AI Gallery..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "⚙️ Creating environment file..."
    cp .env.example .env
    echo "✅ Created .env file. Please edit it with your configuration:"
    echo "   - Set your MongoDB URI"
    echo "   - Set your NextAuth secret"
    echo "   - Set your Google AI API key"
    echo ""
fi

# Create uploads directory
echo "📁 Setting up uploads directory..."
mkdir -p uploads
chmod 755 uploads

# Generate a random NextAuth secret if not set
if ! grep -q "NEXTAUTH_SECRET=your-super-secret-key" .env; then
    echo "🔑 NextAuth secret already configured"
else
    SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)
    sed -i "s/NEXTAUTH_SECRET=your-super-secret-key-change-this/NEXTAUTH_SECRET=$SECRET/" .env
    echo "🔑 Generated NextAuth secret"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your configuration:"
echo "   - MongoDB URI (required)"
echo "   - Google AI API key (required)"
echo "   - Update NEXTAUTH_URL for production"
echo ""
echo "2. Start the development server:"
echo "   npm run dev"
echo ""
echo "3. Visit http://localhost:9002 and create an account"
echo ""
echo "📖 For deployment instructions, see DEPLOYMENT.md"
