# CPAssist Backend

Spring Boot backend API for CPAssist - Competitive Programming Assistant

## Tech Stack

- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Security** with JWT Authentication
- **MongoDB** for data persistence
- **Maven** for dependency management

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- MongoDB 4.4+ (running locally or remote)

## Installation

1. Clone the repository:
```bash
cd backend
```

2. Configure MongoDB connection in `src/main/resources/application.yml`:
```yaml
spring:
  data:
    mongodb:
      uri: mongodb://localhost:27017/cpassist
```

3. Configure JWT secret (use a strong secret in production):
```yaml
jwt:
  secret: your-256-bit-secret-key-change-this-in-production
```

## Running the Application

### Using Maven:
```bash
mvn spring-boot:run
```

### Using Maven Wrapper:
```bash
./mvnw spring-boot:run
```

The application will start on `http://localhost:8080/api`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token

### Users
- `GET /api/users/profile` - Get current user profile
- `GET /api/users/{username}` - Get user profile by username
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/platform-stats` - Update platform statistics
- `POST /api/users/problems/{problemId}/solve` - Mark problem as solved
- `POST /api/users/problems/{problemId}/bookmark` - Toggle bookmark

### Problems
- `GET /api/problems` - Get all problems (paginated)
- `GET /api/problems/{id}` - Get problem by ID
- `GET /api/problems/filter` - Filter problems by topic, difficulty, platform
- `POST /api/problems/batch` - Get multiple problems by IDs
- `POST /api/problems` - Create problem (Admin only)
- `PUT /api/problems/{id}` - Update problem (Admin only)
- `DELETE /api/problems/{id}` - Delete problem (Admin only)

### Topics
- `GET /api/topics` - Get all topics
- `GET /api/topics/{id}` - Get topic by ID
- `GET /api/topics/name/{name}` - Get topic by name
- `POST /api/topics` - Create topic (Admin only)
- `PUT /api/topics/{id}` - Update topic (Admin only)
- `DELETE /api/topics/{id}` - Delete topic (Admin only)

### User Progress
- `GET /api/progress` - Get user progress for all topics
- `GET /api/progress/topic/{topicId}` - Get user progress for specific topic
- `PUT /api/progress/topic/{topicId}` - Update progress for specific topic

### Submissions
- `POST /api/submissions` - Create submission
- `GET /api/submissions/{id}` - Get submission by ID
- `GET /api/submissions/user` - Get current user's submissions
- `GET /api/submissions/problem/{problemId}` - Get submissions for a problem
- `GET /api/submissions/user/problem/{problemId}` - Get user's submissions for a problem
- `GET /api/submissions/user/accepted` - Get user's accepted submissions
- `GET /api/submissions/user/accepted/count` - Get count of accepted submissions
- `PUT /api/submissions/{id}` - Update submission
- `DELETE /api/submissions/{id}` - Delete submission

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. 

### Login Flow:
1. Register a new user: `POST /api/auth/signup`
2. Login: `POST /api/auth/login`
3. Use the returned `accessToken` in the Authorization header:
   ```
   Authorization: Bearer <accessToken>
   ```
4. Refresh token when expired: `POST /api/auth/refresh`

## Environment Variables

You can override the default configuration using environment variables:

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT signing
- `PORT` - Server port (default: 8080)
- `CORS_ORIGINS` - Allowed CORS origins

Example:
```bash
export MONGODB_URI=mongodb://localhost:27017/cpassist
export JWT_SECRET=your-super-secret-key
export PORT=8080
export CORS_ORIGINS=http://localhost:5173
```

## Building for Production

```bash
mvn clean package
```

The JAR file will be created in `target/cpassist-backend-1.0.0.jar`

Run the JAR:
```bash
java -jar target/cpassist-backend-1.0.0.jar
```

## Security Considerations

1. **Change the JWT secret** in production to a strong, random key
2. **Use HTTPS** in production
3. **Configure CORS** properly for your frontend domain
4. **Use environment variables** for sensitive configuration
5. **Enable MongoDB authentication** in production

## Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/cpassist/
│   │   │   ├── config/           # Configuration classes
│   │   │   ├── controller/       # REST controllers
│   │   │   ├── dto/              # Data Transfer Objects
│   │   │   ├── exception/        # Exception handling
│   │   │   ├── model/            # Domain models
│   │   │   ├── repository/       # MongoDB repositories
│   │   │   ├── security/         # Security & JWT
│   │   │   ├── service/          # Business logic
│   │   │   └── CpassistApplication.java
│   │   └── resources/
│   │       └── application.yml   # Application configuration
│   └── test/                     # Test files
├── pom.xml                       # Maven dependencies
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License
