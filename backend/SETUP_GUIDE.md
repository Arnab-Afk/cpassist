# Quick Setup Guide for CPAssist Backend

## Prerequisites Installation

### 1. Install Java 17
**macOS (using Homebrew):**
```bash
brew install openjdk@17
```

**Verify installation:**
```bash
java -version
```

### 2. Install MongoDB
**macOS (using Homebrew):**
```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Verify MongoDB is running
mongosh
```

### 3. Install Maven (Optional - project includes Maven wrapper)
```bash
brew install maven
```

## Project Setup

### 1. Navigate to backend directory
```bash
cd /Users/ishikabhoyar/Desktop/me/cpassist/backend
```

### 2. Copy environment variables
```bash
cp .env.example .env
```

### 3. Edit .env file (optional)
```bash
# Update these values if needed:
# - MONGODB_URI (if using remote MongoDB)
# - JWT_SECRET (MUST change in production!)
# - PORT (if 8080 is already in use)
# - CORS_ORIGINS (add your frontend URL)
```

### 4. Build the project
```bash
./mvnw clean install
```

### 5. Run the application

**Option A: Using the start script (recommended)**
```bash
./start.sh
```

**Option B: Using Maven directly**
```bash
./mvnw spring-boot:run
```

**Option C: Using the JAR file**
```bash
java -jar target/cpassist-backend-1.0.0.jar
```

## Verify Installation

### 1. Check if the server is running
Open your browser and navigate to:
```
http://localhost:8080/api/topics
```

You should see an empty array `[]` (since no data is added yet)

### 2. Test Authentication

**Register a new user:**
```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

You should receive a JWT token in the response.

## Common Issues

### MongoDB Connection Error
**Error:** `MongoSocketOpenException: Exception opening socket`

**Solution:** Make sure MongoDB is running:
```bash
brew services start mongodb-community
```

### Port Already in Use
**Error:** `Port 8080 is already in use`

**Solution:** Change the port in `.env`:
```
PORT=8081
```

### JWT Secret Warning
**Warning:** Using default JWT secret

**Solution:** Generate a strong secret and update `.env`:
```bash
# Generate a random secret
openssl rand -base64 64
```

Copy the output and update `JWT_SECRET` in `.env`

## Development Tips

### Hot Reload
The application uses Spring Boot DevTools for automatic restarts during development. Any changes to Java files will trigger a restart.

### View Logs
Logs are configured in `application.yml`. To see detailed logs:
```bash
./mvnw spring-boot:run -Dlogging.level.com.cpassist=DEBUG
```

### MongoDB GUI (Optional)
Install MongoDB Compass for a graphical interface:
```bash
brew install --cask mongodb-compass
```

Connect to: `mongodb://localhost:27017`

## Testing

Run tests:
```bash
./mvnw test
```

## Next Steps

1. ✅ Backend is now running!
2. Configure your frontend to connect to `http://localhost:8080/api`
3. Check `API_DOCUMENTATION.md` for all available endpoints
4. Create some sample data using the API endpoints
5. Integrate with your React frontend

## Support

For issues or questions:
- Check the logs in the terminal
- Review `API_DOCUMENTATION.md`
- Check MongoDB connection status
- Verify environment variables in `.env`
