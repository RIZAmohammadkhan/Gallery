#!/bin/bash

# Studio App Docker Runner with Custom Port Selection
# This script allows you to specify custom ports for the application

set -e

# Default ports
DEFAULT_APP_PORT=9002
DEFAULT_MONGO_PORT=27017

# Function to display usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -a, --app-port PORT      Set custom port for the application (default: $DEFAULT_APP_PORT)"
    echo "  -m, --mongo-port PORT    Set custom port for MongoDB (default: $DEFAULT_MONGO_PORT)"
    echo "  -h, --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                       # Use default ports with auto-detection"
    echo "  $0 -a 8080 -m 27018     # Use custom ports"
    echo "  $0 --app-port 3001      # Use custom app port, default MongoDB port"
}

# Function to check if a port is in use
check_port() {
    local port=$1
    if ss -tuln | grep -q ":$port "; then
        return 0  # Port is in use
    else
        return 1  # Port is available
    fi
}

# Function to validate port number
validate_port() {
    local port=$1
    if ! [[ "$port" =~ ^[0-9]+$ ]] || [ "$port" -lt 1024 ] || [ "$port" -gt 65535 ]; then
        echo "Error: Invalid port number '$port'. Port must be between 1024 and 65535." >&2
        exit 1
    fi
}

# Parse command line arguments
APP_PORT=""
MONGO_PORT=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -a|--app-port)
            APP_PORT="$2"
            validate_port "$APP_PORT"
            shift 2
            ;;
        -m|--mongo-port)
            MONGO_PORT="$2"
            validate_port "$MONGO_PORT"
            shift 2
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1" >&2
            usage
            exit 1
            ;;
    esac
done

echo "🐳 Starting Studio App with Docker..."

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

echo "🔍 Checking port configuration..."

# Use provided ports or defaults
if [ -z "$APP_PORT" ]; then
    APP_PORT=$DEFAULT_APP_PORT
fi

if [ -z "$MONGO_PORT" ]; then
    MONGO_PORT=$DEFAULT_MONGO_PORT
fi

# Check if ports are available
if check_port $APP_PORT; then
    echo "❌ Port $APP_PORT is already in use!"
    echo "   Please choose a different port using: $0 --app-port <port>"
    echo "   Or use the auto-detection script: ./docker-run.sh"
    exit 1
fi

if check_port $MONGO_PORT; then
    echo "❌ Port $MONGO_PORT is already in use!"
    echo "   Please choose a different port using: $0 --mongo-port <port>"
    echo "   Or use the auto-detection script: ./docker-run.sh"
    exit 1
fi

echo "✅ Port $APP_PORT is available for the app"
echo "✅ Port $MONGO_PORT is available for MongoDB"

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
