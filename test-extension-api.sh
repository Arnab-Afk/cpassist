#!/bin/bash

# Test script for CPAssist Extension API
# This script tests if the backend endpoint is working

echo "🔍 Testing CPAssist Extension API..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check if backend is running
echo "1️⃣  Checking if backend is running..."
if lsof -i :8080 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running on port 8080${NC}"
else
    echo -e "${RED}❌ Backend is NOT running on port 8080${NC}"
    echo "   Start it with: cd backend && mvn spring-boot:run"
    exit 1
fi
echo ""

# Step 2: Get JWT token from user
echo "2️⃣  JWT Token Required"
echo "   Get your token from: http://localhost:5174/profile"
echo "   (Look for 'Browser Extension Setup' section)"
echo ""
read -p "   Paste your JWT token here: " JWT_TOKEN
echo ""

if [ -z "$JWT_TOKEN" ]; then
    echo -e "${RED}❌ No token provided${NC}"
    exit 1
fi

# Step 3: Test the endpoint
echo "3️⃣  Testing /api/submissions/external endpoint..."
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:8080/api/submissions/external \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "problemTitle": "Test Problem (API Test)",
    "problemUrl": "https://www.codechef.com/test",
    "difficulty": "EASY",
    "platform": "CODECHEF",
    "code": "// Test code from API test script",
    "language": "java",
    "status": "ACCEPTED",
    "runtime": 100,
    "memory": 512
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "   HTTP Status: $HTTP_CODE"
echo "   Response Body:"
echo "   $BODY"
echo ""

# Step 4: Check response
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ SUCCESS! Submission was synced to backend${NC}"
    echo ""
    echo "   Check your progress at: http://localhost:5174/progress"
    echo "   You should see 'Test Problem (API Test)' in your submissions"
elif [ "$HTTP_CODE" = "401" ]; then
    echo -e "${RED}❌ UNAUTHORIZED (401)${NC}"
    echo "   Your JWT token is invalid or expired"
    echo "   Get a new token from: http://localhost:5174/profile"
elif [ "$HTTP_CODE" = "404" ]; then
    echo -e "${RED}❌ NOT FOUND (404)${NC}"
    echo "   The endpoint doesn't exist. Backend issue?"
elif [ "$HTTP_CODE" = "500" ]; then
    echo -e "${RED}❌ INTERNAL SERVER ERROR (500)${NC}"
    echo "   Check backend logs for error details"
else
    echo -e "${RED}❌ UNEXPECTED ERROR (HTTP $HTTP_CODE)${NC}"
fi
echo ""

# Step 5: Additional checks
echo "4️⃣  Additional Checks"
echo ""

# Check CORS configuration
echo "   Checking CORS..."
CORS_RESPONSE=$(curl -s -X OPTIONS http://localhost:8080/api/submissions/external \
  -H "Origin: chrome-extension://abcdefgh" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: authorization,content-type")

if echo "$CORS_RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
    echo -e "   ${GREEN}✅ CORS is configured${NC}"
else
    echo -e "   ${YELLOW}⚠️  CORS might not be configured for extensions${NC}"
fi
echo ""

# Final summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Backend API is working correctly!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Install browser extension: chrome://extensions → Load unpacked"
    echo "2. Select folder: /Users/ishikabhoyar/Desktop/me/cpassist/browser-extension"
    echo "3. Click extension icon → paste JWT token → Save"
    echo "4. Go to CodeChef and submit a problem"
    echo "5. Check console (F12) for 'CPAssist: CodeChef accepted submission detected!'"
    echo "6. Verify at: http://localhost:5174/progress"
else
    echo -e "${RED}❌ Backend API is not working${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "1. Make sure backend is running: cd backend && mvn spring-boot:run"
    echo "2. Get a fresh JWT token from: http://localhost:5174/profile"
    echo "3. Check backend logs for errors"
    echo "4. Verify you're logged in to the frontend"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
