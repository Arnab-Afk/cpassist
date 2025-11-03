# Docker Deployment Guide

## Quick Start with Docker Compose

### 1. Build and start all services
```bash
docker-compose up -d
```

This will:
- Start MongoDB on port 27017
- Build and start the backend on port 8080

### 2. Check logs
```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# MongoDB only
docker-compose logs -f mongodb
```

### 3. Stop services
```bash
docker-compose down
```

### 4. Stop and remove all data
```bash
docker-compose down -v
```

## Using Docker Only (without Docker Compose)

### 1. Create a network
```bash
docker network create cpassist-network
```

### 2. Start MongoDB
```bash
docker run -d \
  --name cpassist-mongodb \
  --network cpassist-network \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  -e MONGO_INITDB_DATABASE=cpassist \
  -v mongodb_data:/data/db \
  mongo:7.0
```

### 3. Build the backend image
```bash
docker build -t cpassist-backend .
```

### 4. Run the backend
```bash
docker run -d \
  --name cpassist-backend \
  --network cpassist-network \
  -p 8080:8080 \
  -e MONGODB_URI=mongodb://admin:password@cpassist-mongodb:27017/cpassist?authSource=admin \
  -e JWT_SECRET=your-super-secret-key \
  -e CORS_ORIGINS=http://localhost:5173 \
  cpassist-backend
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
JWT_SECRET=your-super-secret-256-bit-key
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

Then use it with docker-compose:
```bash
docker-compose --env-file .env up -d
```

## Production Deployment

### 1. Update docker-compose.yml for production

```yaml
services:
  mongodb:
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USERNAME}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    volumes:
      - /path/to/persistent/storage:/data/db

  backend:
    environment:
      MONGODB_URI: mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@mongodb:27017/cpassist?authSource=admin
      JWT_SECRET: ${JWT_SECRET}
      CORS_ORIGINS: https://your-frontend-domain.com
```

### 2. Use secrets management
- Store sensitive data in Docker secrets or external secret managers
- Never commit secrets to version control

### 3. Enable SSL/TLS
- Use a reverse proxy (Nginx, Traefik) for HTTPS
- Configure SSL certificates

### 4. Resource limits
Add to docker-compose.yml:
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

## Useful Commands

### View container status
```bash
docker-compose ps
```

### Restart services
```bash
docker-compose restart backend
```

### Access MongoDB shell
```bash
docker exec -it cpassist-mongodb mongosh -u admin -p password
```

### View backend logs in real-time
```bash
docker logs -f cpassist-backend
```

### Execute commands in backend container
```bash
docker exec -it cpassist-backend sh
```

### Rebuild after code changes
```bash
docker-compose up -d --build backend
```

## Troubleshooting

### Backend can't connect to MongoDB
- Check if MongoDB is running: `docker-compose ps`
- Verify network: `docker network inspect cpassist-network`
- Check MongoDB logs: `docker-compose logs mongodb`

### Port already in use
Change ports in docker-compose.yml:
```yaml
ports:
  - "8081:8080"  # Host:Container
```

### Out of memory
Increase Java heap size:
```yaml
environment:
  JAVA_OPTS: "-Xmx1024m -Xms512m"
```

## Health Checks

Add to docker-compose.yml:
```yaml
services:
  backend:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/api/topics"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

## Backup MongoDB

```bash
# Backup
docker exec cpassist-mongodb mongodump \
  --username admin \
  --password password \
  --authenticationDatabase admin \
  --out /backup

# Restore
docker exec cpassist-mongodb mongorestore \
  --username admin \
  --password password \
  --authenticationDatabase admin \
  /backup
```
