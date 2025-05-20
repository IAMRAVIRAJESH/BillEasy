# Secure File Upload Service

A Node.js service for secure file uploads with background processing features.

## Features included

- User authentication with JWT
- Secure file uploads with metadata
- Background processing of uploaded files using BullMQ
- File status tracking
- User-specific file access control
- Rate limiting and file size restrictions
- Docker deployment support

## Tech Stacks used

- Node.js (>=18)
- TypeScript
- Express.js
- PostgreSQL with Sequelize ORM
- JWT for authentication
- BullMQ for background jobs (Redis-based)
- Multer for file uploads

### Tools needed

- Node.js 18 or higher
- PostgreSQL
- Redis (for BullMQ)

### Installation

1. Clone the repository - git clone https://github.com/yourusername/BillEasy.git and move to main directory using the command "cd file-upload-service"

2. Install dependencies - run "npm install"

3. Set up environment variables - Edit .env with your configuration

4. Setup redis server using docker - run "docker run -d --name redis-stack-server -p 6379:6379 redis/redis-stack-server:latest" in terminal after running docker desktop

4. Build the TypeScript code - npm run build

5. Start the server - npm run dev


### Docker Setup

For running the app using docker deployment
1. Open Docker desktop
2. run this command in terminal "-docker-compose up -d"

This will start the app, PostgreSQL, and Redis services.


## API Endpoints

- Authentication APIs

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

- File Management APIs

- `POST /api/files/upload` - Upload a file (requires auth)
- `GET /api/files/:id` - Get file details by ID (requires auth)
- `GET /api/files` - Get all files for the logged-in user (requires auth)
- `DELETE /api/files/:id` - Delete a file by ID (requires auth)

- Health check

- `GET /api/health` - Health check endpoint


# API testing

- For testing the APIs you can use the postman collection I have added to this project with filename BillEasy


# Security

- Authentication required for all endpoints (except login/register and health)
- Users can only access their own files
- File uploads are size-limited
- JWT token validation on all protected routes


# Background Processing Flow

1. User uploads file → File saved to disk & metadata saved to DB
2. Job added to BullMQ queue
3. Worker processes file asynchronously
4. File status updated in DB (uploaded → processing → processed/failed)
5. Processing results (e.g., hash) saved to DB