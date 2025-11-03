# CPAssist API Documentation

## Base URL
```
http://localhost:8080/api
```

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Authentication Endpoints

### 1. User Registration
```http
POST /auth/signup
```

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "fullName": "John Doe"
}
```

**Response:** (200 OK)
```json
{
  "message": "User registered successfully!"
}
```

---

### 2. User Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "password123"
}
```

**Response:** (200 OK)
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "username": "johndoe",
  "email": "john@example.com"
}
```

---

### 3. Refresh Token
```http
POST /auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** (200 OK)
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "username": "johndoe",
  "email": "john@example.com"
}
```

---

## User Endpoints

### 1. Get Current User Profile
```http
GET /users/profile
Authorization: Bearer <token>
```

**Response:** (200 OK)
```json
{
  "id": "507f1f77bcf86cd799439011",
  "username": "johndoe",
  "email": "john@example.com",
  "fullName": "John Doe",
  "roles": ["ROLE_USER"],
  "profile": {
    "bio": "Competitive programmer",
    "avatar": "https://example.com/avatar.jpg",
    "preferredLanguage": "java",
    "badges": ["100-days-streak", "algorithm-master"],
    "currentStreak": 15,
    "longestStreak": 45,
    "lastSolvedDate": "2025-10-28T10:30:00"
  },
  "solvedProblems": ["prob1", "prob2", "prob3"],
  "attemptedProblems": ["prob1", "prob2", "prob3", "prob4"],
  "bookmarkedProblems": ["prob5", "prob6"],
  "platformStats": {
    "leetcodeSolved": 250,
    "codeforcesRating": 1450,
    "codechefRating": 1680,
    "hackerrankScore": 2500
  },
  "createdAt": "2025-01-15T08:00:00",
  "updatedAt": "2025-10-28T10:30:00"
}
```

---

### 2. Update User Profile
```http
PUT /users/profile
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "bio": "Aspiring software engineer",
  "avatar": "https://example.com/new-avatar.jpg",
  "preferredLanguage": "python",
  "badges": ["100-days-streak"],
  "currentStreak": 16,
  "longestStreak": 45
}
```

---

### 3. Mark Problem as Solved
```http
POST /users/problems/{problemId}/solve
Authorization: Bearer <token>
```

---

### 4. Toggle Bookmark
```http
POST /users/problems/{problemId}/bookmark
Authorization: Bearer <token>
```

---

## Problem Endpoints

### 1. Get All Problems (Paginated)
```http
GET /problems?page=0&size=20&sortBy=createdAt&sortDir=DESC
```

**Query Parameters:**
- `page` (default: 0) - Page number
- `size` (default: 20) - Items per page
- `sortBy` (default: createdAt) - Sort field
- `sortDir` (default: DESC) - Sort direction (ASC/DESC)

**Response:** (200 OK)
```json
{
  "content": [
    {
      "id": "prob1",
      "title": "Two Sum",
      "description": "Given an array of integers...",
      "difficulty": "EASY",
      "topic": "ARRAY",
      "tags": ["hash-table", "array"],
      "platform": "LEETCODE",
      "platformUrl": "https://leetcode.com/problems/two-sum/",
      "problemNumber": "1",
      "testCases": [
        {
          "input": "[2,7,11,15], target = 9",
          "expectedOutput": "[0,1]",
          "explanation": "nums[0] + nums[1] = 9"
        }
      ],
      "constraints": {
        "timeLimit": "1 second",
        "memoryLimit": "256 MB",
        "inputConstraints": ["2 <= nums.length <= 10^4"]
      },
      "acceptanceRate": 45,
      "totalSubmissions": 1000000,
      "totalAccepted": 450000
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20
  },
  "totalPages": 50,
  "totalElements": 1000
}
```

---

### 2. Filter Problems
```http
GET /problems/filter?topic=ARRAY&difficulty=EASY&page=0&size=20
```

**Query Parameters:**
- `topic` - Filter by topic (ARRAY, LINKED_LIST, TREE, GRAPH, DP, etc.)
- `difficulty` - Filter by difficulty (EASY, MEDIUM, HARD)
- `platform` - Filter by platform (LEETCODE, CODEFORCES, CODECHEF, HACKERRANK)
- `page` - Page number
- `size` - Items per page

---

### 3. Get Problem by ID
```http
GET /problems/{id}
```

---

### 4. Get Multiple Problems by IDs
```http
POST /problems/batch
```

**Request Body:**
```json
["prob1", "prob2", "prob3"]
```

---

## Topic Endpoints

### 1. Get All Topics
```http
GET /topics
```

**Response:** (200 OK)
```json
[
  {
    "id": "topic1",
    "name": "ARRAY",
    "displayName": "Arrays",
    "description": "Master array manipulation and algorithms",
    "icon": "array-icon",
    "orderIndex": 1,
    "difficultyCount": {
      "EASY": 50,
      "MEDIUM": 75,
      "HARD": 25
    },
    "totalProblems": 150
  }
]
```

---

### 2. Get Topic by Name
```http
GET /topics/name/{name}
```

---

## Progress Endpoints

### 1. Get All User Progress
```http
GET /progress
Authorization: Bearer <token>
```

**Response:** (200 OK)
```json
[
  {
    "id": "progress1",
    "userId": "user1",
    "topicId": "topic1",
    "topicName": "Arrays",
    "easySolved": 30,
    "mediumSolved": 20,
    "hardSolved": 5,
    "totalSolved": 55,
    "totalProblems": 150,
    "completionPercentage": 36.67,
    "problemSolvedDates": {
      "prob1": "2025-10-01T10:00:00",
      "prob2": "2025-10-02T14:30:00"
    }
  }
]
```

---

### 2. Get Progress for Specific Topic
```http
GET /progress/topic/{topicId}
Authorization: Bearer <token>
```

---

### 3. Update Progress
```http
PUT /progress/topic/{topicId}
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "topicName": "Arrays",
  "easySolved": 31,
  "mediumSolved": 20,
  "hardSolved": 5,
  "totalSolved": 56,
  "totalProblems": 150
}
```

---

## Submission Endpoints

### 1. Create Submission
```http
POST /submissions
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "problemId": "prob1",
  "code": "class Solution { ... }",
  "language": "java",
  "status": "ACCEPTED",
  "runtime": 45,
  "memory": 38.5,
  "notes": "Optimized using hash map"
}
```

---

### 2. Get User Submissions
```http
GET /submissions/user?page=0&size=20
Authorization: Bearer <token>
```

---

### 3. Get User's Accepted Submissions Count
```http
GET /submissions/user/accepted/count
Authorization: Bearer <token>
```

**Response:** (200 OK)
```json
125
```

---

## Error Responses

### Validation Error (400 Bad Request)
```json
{
  "username": "Username must be between 3 and 20 characters",
  "email": "Email should be valid"
}
```

### Unauthorized (401)
```json
{
  "message": "Invalid username or password"
}
```

### Not Found (404)
```json
{
  "message": "User not found"
}
```

### Internal Server Error (500)
```json
{
  "message": "An error occurred: ..."
}
```

---

## Status Codes

- `200 OK` - Success
- `400 Bad Request` - Validation error or bad request
- `401 Unauthorized` - Authentication failed
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error
