#!/bin/bash

# Studio App Docker Stop Script
# This script stops and optionally removes the Docker containers

set -e

echo "🛑 Stopping Studio App Docker containers..."

# Function to display usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --remove, -r    Remove containers and volumes after stopping"
    echo "  --help, -h      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0              # Stop containers but keep data"
    echo "  $0 --remove     # Stop and remove everything"
}

REMOVE_CONTAINERS=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -r|--remove)
            REMOVE_CONTAINERS=true
            shift
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

if [ "$REMOVE_CONTAINERS" = true ]; then
    echo "🗑️  Stopping and removing containers and volumes..."
    docker compose down -v
    echo "✅ Containers and volumes removed"
else
    echo "⏸️  Stopping containers (data will be preserved)..."
    docker compose down
    echo "✅ Containers stopped"
fi

echo ""
echo "🛠️  Useful commands:"
echo "   Restart:       ./docker-run.sh"
echo "   Custom ports:  ./docker-run-custom.sh --help"
echo "   View logs:     docker compose logs"
echo "   Remove all:    $0 --remove"
