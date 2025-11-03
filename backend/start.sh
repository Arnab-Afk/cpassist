#!/bin/bash

# CPAssist Backend Startup Script

echo "🚀 Starting CPAssist Backend..."

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first."
    echo "   You can start MongoDB with: brew services start mongodb-community"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file. Please update it with your configuration."
fi

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Build and run the application
echo "📦 Building application..."
mvn clean install -DskipTests

echo "🏃 Running application..."
mvn spring-boot:run
