#!/bin/bash

# =============================================================================
# SECURE DOCKER DEPLOYMENT SCRIPT
# =============================================================show_deployment_info() {
    log_success "Deployment completed successfully!"
    echo ""
    log_info "Application is running at: http://localhost:${APP_PORT}"
    
    # Get the actual MongoDB port that was assigned
    local mongo_port
    mongo_port=$(docker compose --env-file "$ENV_FILE" port mongodb 27017 2>/dev/null | cut -d: -f2 || echo "auto-assigned")
    log_info "MongoDB is accessible at: localhost:$mongo_port"
    echo ""
    log_info "Useful commands:"
    echo "  View logs:    ./docker-stop.sh logs"
    echo "  Stop:         ./docker-stop.sh stop"
    echo "  Remove:       ./docker-stop.sh down"
    echo "  Status:       ./docker-stop.sh status"
    echo "  Restart:      ./docker-stop.sh restart"
    echo "  Shell access: docker compose --env-file $ENV_FILE exec app sh"
    echo ""
    log_warning "Remember to:"
    log_warning "1. Never commit .env.docker with real secrets"
    log_warning "2. Regularly rotate your secrets"
    log_warning "3. Use proper secrets management in production"
}# This script ensures secure deployment of the AI Gallery Studio application
# using Docker and Docker Compose with proper secrets management.

set -euo pipefail  # Exit on any error, undefined variable, or pipe failure

# Color codes for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Script configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly ENV_FILE="${SCRIPT_DIR}/.env.docker"
readonly COMPOSE_FILE="${SCRIPT_DIR}/docker-compose.yml"

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# =============================================================================
# PORT MANAGEMENT FUNCTIONS
# =============================================================================

find_available_port() {
    local start_port="$1"
    local port=$start_port
    
    while [[ $port -le 65535 ]]; do
        if ! lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo $port
            return 0
        fi
        ((port++))
    done
    
    log_error "No available ports found starting from $start_port"
    return 1
}

setup_ports() {
    log_info "Checking and setting up ports..."
    
    # Check if APP_PORT is available
    local app_port="${APP_PORT:-9002}"
    if lsof -Pi :$app_port -sTCP:LISTEN -t >/dev/null 2>&1; then
        local new_app_port
        new_app_port=$(find_available_port $((app_port + 1)))
        log_warning "Port $app_port is in use, using port $new_app_port instead"
        export APP_PORT=$new_app_port
        
        # Update the environment file
        sed -i "s/APP_PORT=.*/APP_PORT=$new_app_port/" "$ENV_FILE"
    fi
    
    log_info "Application will be available at: http://localhost:${APP_PORT}"
}

# =============================================================================
# SECURITY VALIDATION FUNCTIONS
# =============================================================================

check_environment_file() {
    log_info "Checking environment configuration..."
    
    if [[ ! -f "$ENV_FILE" ]]; then
        log_error "Environment file not found: $ENV_FILE"
        log_info "Please copy .env.docker.example to .env.docker and configure it."
        exit 1
    fi
    
    # Source the environment file
    set -a  # Automatically export all variables
    source "$ENV_FILE"
    set +a
    
    # Check for critical security issues
    local security_issues=0
    
    # Check NEXTAUTH_SECRET
    if [[ "${NEXTAUTH_SECRET:-}" == "CHANGE_ME_IMMEDIATELY_32_CHARS_MIN" || ${#NEXTAUTH_SECRET} -lt 32 ]]; then
        log_error "NEXTAUTH_SECRET is not properly configured (must be 32+ characters)"
        ((security_issues++))
    fi
    
    # Check MongoDB password
    if [[ "${MONGO_ROOT_PASSWORD:-}" == "CHANGE_ME_SECURE_PASSWORD_32_CHARS_MIN" || ${#MONGO_ROOT_PASSWORD} -lt 16 ]]; then
        log_error "MONGO_ROOT_PASSWORD is not properly configured (must be 16+ characters)"
        ((security_issues++))
    fi
    
    # Check Gemini API key
    if [[ "${GEMINI_API_KEY:-}" == "CHANGE_ME_YOUR_GEMINI_API_KEY" || -z "${GEMINI_API_KEY:-}" ]]; then
        log_error "GEMINI_API_KEY is not properly configured"
        ((security_issues++))
    fi
    
    if [[ $security_issues -gt 0 ]]; then
        log_error "Found $security_issues security issue(s). Please fix them before proceeding."
        log_info "Run 'openssl rand -base64 32' to generate secure secrets."
        exit 1
    fi
    
    log_success "Environment security validation passed"
}

check_docker_requirements() {
    log_info "Checking Docker requirements..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    if ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not installed or not available"
        log_info "Please install Docker Compose v2 or update Docker to a version that includes it"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker daemon is not running"
        exit 1
    fi
    
    log_success "Docker requirements satisfied"
}

# =============================================================================
# DEPLOYMENT FUNCTIONS
# =============================================================================

build_and_deploy() {
    log_info "Building and deploying the application..."
    
    # Use docker compose (v2) - the modern integrated version
    local compose_cmd="docker compose"
    
    # Build and start services
    log_info "Building Docker images..."
    $compose_cmd --env-file "$ENV_FILE" -f "$COMPOSE_FILE" build --no-cache
    
    log_info "Starting services..."
    $compose_cmd --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d
    
    # Wait for services to be healthy
    log_info "Waiting for services to be ready..."
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if $compose_cmd --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps | grep -q "healthy"; then
            log_success "Services are healthy and ready"
            break
        fi
        
        if [[ $attempt -eq $max_attempts ]]; then
            log_error "Services failed to become healthy within timeout"
            log_info "Check logs with: $compose_cmd --env-file $ENV_FILE -f $COMPOSE_FILE logs"
            exit 1
        fi
        
        log_info "Attempt $attempt/$max_attempts - waiting for services..."
        sleep 10
        ((attempt++))
    done
}

show_deployment_info() {
    log_success "Deployment completed successfully!"
    echo ""
    log_info "Application is running at: ${APP_URL:-http://localhost:9002}"
    log_info "MongoDB is accessible at: localhost:${MONGO_PORT:-27017}"
    echo ""
    log_info "Useful commands:"
    echo "  View logs:    docker compose --env-file $ENV_FILE logs -f"
    echo "  Stop:         docker compose --env-file $ENV_FILE down"
    echo "  Restart:      docker compose --env-file $ENV_FILE restart"
    echo "  Shell access: docker compose --env-file $ENV_FILE exec app sh"
    echo ""
    log_warning "Remember to:"
    log_warning "1. Never commit .env.docker with real secrets"
    log_warning "2. Regularly rotate your secrets"
    log_warning "3. Use proper secrets management in production"
}

# =============================================================================
# MAIN EXECUTION
# =============================================================================

main() {
    log_info "Starting secure Docker deployment for AI Gallery Studio"
    echo ""
    
    # Security and requirements checks
    check_docker_requirements
    check_environment_file
    setup_ports
    
    # Deploy the application
    build_and_deploy
    
    # Show deployment information
    show_deployment_info
}

# Handle script interruption
trap 'log_error "Deployment interrupted"; exit 1' INT TERM

# Run main function
main "$@"
