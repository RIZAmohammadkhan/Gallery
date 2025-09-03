#!/bin/bash

# =============================================================================
# DOCKER STOP SCRIPT - AI Gallery Studio
# =============================================================================
# This script safely stops and optionally removes Docker containers and volumes

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
# DOCKER FUNCTIONS
# =============================================================================

check_compose_availability() {
    local compose_cmd="docker-compose"
    if ! command -v docker-compose &> /dev/null; then
        if docker compose version &> /dev/null; then
            compose_cmd="docker compose"
        else
            log_error "Neither docker-compose nor docker compose is available"
            exit 1
        fi
    fi
    echo "$compose_cmd"
}

stop_services() {
    local action="$1"
    local compose_cmd
    compose_cmd=$(check_compose_availability)
    
    log_info "Stopping AI Gallery Studio services..."
    
    case "$action" in
        "stop")
            log_info "Stopping containers (data will be preserved)..."
            $compose_cmd --env-file "$ENV_FILE" -f "$COMPOSE_FILE" stop
            ;;
        "down")
            log_info "Stopping and removing containers (data will be preserved)..."
            $compose_cmd --env-file "$ENV_FILE" -f "$COMPOSE_FILE" down
            ;;
        "down-volumes")
            log_warning "Stopping containers and removing ALL DATA (including uploads and database)..."
            read -p "Are you sure you want to remove all data? (yes/no): " -r
            if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
                $compose_cmd --env-file "$ENV_FILE" -f "$COMPOSE_FILE" down -v
                log_warning "All data has been removed!"
            else
                log_info "Operation cancelled"
                exit 0
            fi
            ;;
        "restart")
            log_info "Restarting services..."
            $compose_cmd --env-file "$ENV_FILE" -f "$COMPOSE_FILE" restart
            ;;
        *)
            log_error "Unknown action: $action"
            show_usage
            exit 1
            ;;
    esac
}

show_status() {
    local compose_cmd
    compose_cmd=$(check_compose_availability)
    
    log_info "Current service status:"
    $compose_cmd --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps
    
    echo ""
    log_info "Docker resources usage:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
}

show_logs() {
    local service="$1"
    local compose_cmd
    compose_cmd=$(check_compose_availability)
    
    if [[ -n "$service" ]]; then
        log_info "Showing logs for service: $service"
        $compose_cmd --env-file "$ENV_FILE" -f "$COMPOSE_FILE" logs -f "$service"
    else
        log_info "Showing logs for all services:"
        $compose_cmd --env-file "$ENV_FILE" -f "$COMPOSE_FILE" logs -f
    fi
}

show_usage() {
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  stop              Stop containers (preserve data)"
    echo "  down              Stop and remove containers (preserve data)"
    echo "  down-volumes      Stop containers and remove ALL data"
    echo "  restart           Restart all services"
    echo "  status            Show service status and resource usage"
    echo "  logs [service]    Show logs (optionally for specific service)"
    echo "  help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 stop                    # Stop services"
    echo "  $0 down                    # Stop and remove containers"
    echo "  $0 down-volumes            # Remove everything including data"
    echo "  $0 logs app                # Show app logs"
    echo "  $0 status                  # Show current status"
}

# =============================================================================
# MAIN EXECUTION
# =============================================================================

main() {
    local command="${1:-help}"
    local service="${2:-}"
    
    # Check if environment file exists
    if [[ ! -f "$ENV_FILE" ]]; then
        log_error "Environment file not found: $ENV_FILE"
        log_info "Make sure you have run ./docker-run.sh first"
        exit 1
    fi
    
    case "$command" in
        "stop"|"down"|"down-volumes"|"restart")
            stop_services "$command"
            log_success "Operation completed successfully!"
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs "$service"
            ;;
        "help"|"--help"|"-h")
            show_usage
            ;;
        *)
            log_error "Unknown command: $command"
            show_usage
            exit 1
            ;;
    esac
}

# Handle script interruption
trap 'log_error "Operation interrupted"; exit 1' INT TERM

# Run main function
main "$@"
