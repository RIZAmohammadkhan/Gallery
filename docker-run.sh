#!/bin/bash

# Studio App Docker Runner
# This script builds and runs the dockerized application with automatic port management

set -e

echo "🐳 Starting Studio App with Docker..."

# Function to check if a port is in use
check_port() {
    local port=$1
    if ss -tuln | grep -q ":$port "; then
        return 0  # Port is in use
    else
        return 1  # Port is available
    fi
}

# Function to find an available port starting from a given port
find_available_port() {
    local start_port=$1
    local port=$start_port
    while check_port $port; do
        port=$((port + 1))
        if [ $port -gt 65535 ]; then
            echo "Error: No available ports found" >&2
            exit 1
        fi
    done
    echo $port
}

# Check if .env file exists, if not copy from .env.docker
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.docker template..."
    cp .env.docker .env
    echo "⚠️  Please edit .env file and add your GEMINI_API_KEY"
    echo "⚠️  You can continue without it, but AI features won't work"
fi

# Check if GEMINI_API_KEY is set
if ! grep -q "GEMINI_API_KEY=your-google-ai-api-key-here" .env; then
    echo "✅ GEMINI_API_KEY appears to be configured"
else
    echo "⚠️  GEMINI_API_KEY is not configured. AI features will not work."
    echo "   Edit .env file and set your Google AI API key"
fi

# Check for port conflicts and find available ports
echo "🔍 Checking port availability..."

# Default ports
DEFAULT_APP_PORT=9002
DEFAULT_MONGO_PORT=27017

# Find available ports
if check_port $DEFAULT_APP_PORT; then
    APP_PORT=$(find_available_port $((DEFAULT_APP_PORT + 1)))
    echo "⚠️  Port $DEFAULT_APP_PORT is in use, using port $APP_PORT for the app instead"
else
    APP_PORT=$DEFAULT_APP_PORT
    echo "✅ Port $APP_PORT is available for the app"
fi

if check_port $DEFAULT_MONGO_PORT; then
    MONGO_PORT=$(find_available_port $((DEFAULT_MONGO_PORT + 1)))
    echo "⚠️  Port $DEFAULT_MONGO_PORT is in use, using port $MONGO_PORT for MongoDB instead"
else
    MONGO_PORT=$DEFAULT_MONGO_PORT
    echo "✅ Port $MONGO_PORT is available for MongoDB"
fi

# Export ports for docker-compose
export APP_PORT
export MONGO_PORT
export APP_URL="http://localhost:$APP_PORT"

echo "🔨 Building Docker images..."
docker compose build --build-arg NEXTAUTH_URL="$APP_URL" --build-arg APP_URL="$APP_URL"

echo "🚀 Starting services..."
docker compose up -d

echo "⏳ Waiting for services to be ready..."
sleep 10

echo "🎉 Studio App is running!"
echo ""
echo "📍 Application: http://localhost:$APP_PORT"
echo "📍 MongoDB: localhost:$MONGO_PORT"
echo ""
echo "🛠️  Useful commands:"
echo "   View logs: docker compose logs -f"
echo "   Stop app:  docker compose down"
echo "   Rebuild:   docker compose build --no-cache"
echo ""
echo "📊 Service status:"
docker compose ps
