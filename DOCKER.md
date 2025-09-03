# 🐳 Docker Deployment Guide

## Quick Start (Secure)

1. **Copy the environment template:**
   ```bash
   cp .env.docker.example .env.docker
   ```

2. **Generate secure secrets:**
   ```bash
   # Generate NEXTAUTH_SECRET (32+ characters)
   openssl rand -base64 32

   # Generate MongoDB password (16+ characters)  
   openssl rand -base64 24
   ```

3. **Configure `.env.docker`** with your generated secrets

4. **Deploy securely:**
   ```bash
   ./docker-run.sh
   ```

5. **Access your application:**
   ```
   http://localhost:9002 (or auto-assigned port)
   ```

## ⚠️ Security Notice

This Docker setup implements **enterprise-grade security**:

- ✅ **No secrets in Docker images**
- ✅ **Runtime secret injection**
- ✅ **Non-root container execution**
- ✅ **Multi-stage secure builds**
- ✅ **Environment isolation**
- ✅ **Health monitoring**
- ✅ **Automatic port conflict resolution**

## 📁 Docker Files Overview

| File | Purpose | Security Level |
|------|---------|----------------|
| `Dockerfile` | Multi-stage secure build | 🔒 High |
| `docker-compose.yml` | Service orchestration with auto-ports | 🔒 High |
| `.env.docker` | Production secrets | 🚨 **Keep Secret** |
| `docker-run.sh` | Secure deployment script with port detection | 🔒 High |
| `docker-stop.sh` | Service management and monitoring | 🔒 High |

## 🚀 What Gets Deployed

- **Next.js App:** Standalone production build on auto-assigned port
- **MongoDB:** Secure database with authentication on auto-assigned port
- **Health Checks:** Automated service monitoring and readiness checks
- **Network Isolation:** Containers communicate via internal network
- **Port Management:** Automatic port conflict resolution

## 🔧 Management Commands

### **Using docker-stop.sh (Recommended)**

```bash
# View application status and resource usage
./docker-stop.sh status

# View application logs (real-time)
./docker-stop.sh logs

# View specific service logs
./docker-stop.sh logs app
./docker-stop.sh logs mongodb

# Stop services (preserve data)
./docker-stop.sh stop

# Stop and remove containers (preserve data)
./docker-stop.sh down

# Restart all services
./docker-stop.sh restart

# Remove everything including data (DESTRUCTIVE!)
./docker-stop.sh down-volumes
```

### **Manual Docker Compose Commands**

```bash
# View application logs
docker compose --env-file .env.docker logs -f app

# View database logs  
docker compose --env-file .env.docker logs -f mongodb

# Access application shell
docker compose --env-file .env.docker exec app sh

# Access database shell
docker compose --env-file .env.docker exec mongodb mongosh

# Stop all services
docker compose --env-file .env.docker down

# Rebuild and restart
docker compose --env-file .env.docker up --build -d

# View service status
docker compose --env-file .env.docker ps
```

## 🏥 Health Monitoring

- **Application Health:** http://localhost:9002/api/health (or your assigned port)
- **Service Status:** `./docker-stop.sh status`
- **Resource Usage:** `docker stats`
- **Container Logs:** `./docker-stop.sh logs`

## 🔧 Port Management

The deployment automatically handles port conflicts:

- **App Port:** Starts at 9002, auto-increments if busy
- **MongoDB Port:** Automatically assigned by Docker
- **Port Detection:** Built into deployment script
- **Status Check:** Shows actual assigned ports

```bash
# Check which ports are actually being used
./docker-stop.sh status

# Get specific port assignments
docker compose --env-file .env.docker port app 3000
docker compose --env-file .env.docker port mongodb 27017
```

## 🔒 Security Best Practices

1. **Never commit** `.env.docker` to version control
2. **Rotate secrets** regularly (monthly recommended)
3. **Use strong passwords** (16+ characters)
4. **Monitor logs** for security events
5. **Update base images** regularly
6. **Use HTTPS** in production
7. **Backup database** regularly
8. **Firewall unused ports** in production

## 🆘 Troubleshooting

### **Application Won't Start**
```bash
# Check comprehensive status
./docker-stop.sh status

# Check application logs
./docker-stop.sh logs app

# Verify environment configuration
docker compose --env-file .env.docker config
```

### **Database Connection Issues**
```bash
# Check MongoDB logs
./docker-stop.sh logs mongodb

# Test database connectivity
docker compose --env-file .env.docker exec mongodb mongosh --eval "db.adminCommand('ping')"

# Check database port assignment
docker compose --env-file .env.docker port mongodb 27017
```

### **Port Conflicts**
```bash
# Check what ports are in use
./docker-stop.sh status

# The deployment script automatically resolves port conflicts
# If needed, manually specify different ports in .env.docker:
# APP_PORT=9003
# MONGO_PORT=27018
```

### **Permission Issues**
```bash
# Check container user
docker compose --env-file .env.docker exec app id

# Check file permissions
docker compose --env-file .env.docker exec app ls -la

# Reset container permissions
./docker-stop.sh down
./docker-run.sh
```

### **Performance Issues**
```bash
# Check resource usage
docker stats

# Check container health
docker compose --env-file .env.docker ps

# View detailed service status
./docker-stop.sh status
```

## 🔄 Maintenance Tasks

### **Regular Updates**
```bash
# Stop services
./docker-stop.sh down

# Pull latest images
docker compose --env-file .env.docker pull

# Rebuild and restart
./docker-run.sh
```

### **Database Backup**
```bash
# Create backup
docker compose --env-file .env.docker exec mongodb mongodump --out /tmp/backup

# Copy backup to host
docker cp studio-mongodb:/tmp/backup ./backup-$(date +%Y%m%d)
```

### **Log Management**
```bash
# View log sizes
docker system df

# Clean up old logs
docker system prune

# Rotate logs (if needed)
docker compose --env-file .env.docker logs --since 24h > app-logs-$(date +%Y%m%d).log
```

## 📖 Additional Documentation

- [README.md](./README.md) - Complete application overview
- [SECURITY.md](./SECURITY.md) - Complete security guide
- [.env.docker.example](./.env.docker.example) - Environment configuration template

## 🎯 Production Deployment

For production environments:

1. **Use external secret management** (AWS Secrets Manager, HashiCorp Vault)
2. **Configure HTTPS** with proper SSL certificates
3. **Set up monitoring** and alerting
4. **Implement backup strategy**
5. **Configure firewall rules**
6. **Use container orchestration** (Kubernetes, Docker Swarm)
7. **Set up log aggregation** (ELK stack, Grafana)

---

🔐 **Remember:** Security and monitoring are not optional—they're essential!
