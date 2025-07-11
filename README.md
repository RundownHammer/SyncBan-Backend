# PlanHive Backend 🚀

The backend server for PlanHive - a real-time collaborative Kanban board API built with Node.js, Express, Socket.IO, and MongoDB.ollabTask Backend 🚀

The backend server for CollabTask - a real-time collaborative Kanban board API built with Node.js, Express, Socket.IO, and MongoDB.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables (see below)
cp .env.example .env

# Start development server
npm run dev

# Server runs on http://localhost:5000
```

## 🏗️ Built With

### Core Technologies
- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast, minimalist web framework
- **TypeScript** - Type-safe JavaScript development
- **MongoDB** - NoSQL database for flexible data storage

### Key Libraries
- **Socket.IO** - Real-time bidirectional event-based communication
- **Mongoose** - MongoDB object modeling for Node.js
- **JWT** - JSON Web Tokens for secure authentication
- **bcryptjs** - Password hashing and validation
- **CORS** - Cross-Origin Resource Sharing middleware

### Development Tools
- **Nodemon** - Auto-restart server during development
- **TypeScript Compiler** - Type checking and compilation
- **Dotenv** - Environment variable management

## 📁 Project Structure

```
backend/
├── src/
│   ├── Controllers/         # API route handlers
│   │   ├── auth.controller.ts    # Authentication logic
│   │   ├── task.controller.ts    # Task management
│   │   └── team.controller.ts    # Team operations
│   ├── models/              # MongoDB data models
│   │   ├── user.ts         # User schema and model
│   │   ├── team.ts         # Team schema and model
│   │   ├── task.ts         # Task schema and model
│   │   └── actionLog.ts    # Activity logging model
│   ├── routes/              # Express route definitions
│   │   ├── auth.routes.ts  # Authentication endpoints
│   │   ├── task.routes.ts  # Task CRUD operations
│   │   └── team.routes.ts  # Team management
│   ├── middlewares/         # Custom middleware
│   │   └── authMiddleware.ts # JWT token validation
│   ├── sockets/             # Socket.IO event handlers
│   │   └── index.ts        # Real-time event management
│   ├── config/              # Configuration files
│   │   ├── config.ts       # Application configuration
│   │   ├── db.ts           # Database connection
│   │   └── db.js           # JavaScript DB config
│   ├── server.ts            # Main server application
│   └── server.js            # Compiled JavaScript entry
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── nodemon.json             # Nodemon configuration
└── .env.example             # Environment variables template
```

## 🔧 Environment Setup

Create a `.env` file in the backend root:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/planhive
# For MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/planhive

# Authentication
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173
# For production:
# CLIENT_URL=https://your-frontend-domain.com
```

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` or `production` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/planhive` |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | `your-super-secret-jwt-key` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |

## 📊 Database Schema

### User Model
```typescript
interface User {
  _id: ObjectId
  username: string      // Unique username
  email: string         // Unique email address
  password: string      // Hashed password
  teams: ObjectId[]     // Array of team IDs user belongs to
  createdAt: Date
  updatedAt: Date
}
```

### Team Model
```typescript
interface Team {
  _id: ObjectId
  name: string          // Team display name
  code: string          // Unique 6-character team code
  members: ObjectId[]   // Array of user IDs in team
  createdBy: ObjectId   // User who created the team
  createdAt: Date
  updatedAt: Date
}
```

### Task Model
```typescript
interface Task {
  _id: ObjectId
  title: string         // Task title/description
  status: 'todo' | 'inprogress' | 'done'
  teamId: ObjectId      // Team this task belongs to
  assignedTo?: ObjectId // Optional user assignment
  createdBy: ObjectId   // User who created the task
  order: number         // Position within column
  createdAt: Date
  updatedAt: Date
}
```

### Activity Log Model
```typescript
interface ActionLog {
  _id: ObjectId
  action: string        // Description of action performed
  userId: ObjectId      // User who performed action
  teamId: ObjectId      // Team where action occurred
  taskId?: ObjectId     // Task involved (if applicable)
  timestamp: Date
}
```

## 🌐 API Endpoints

### Authentication Routes (`/api/auth`)

#### POST `/api/auth/register`
Create a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com", 
  "password": "securepassword"
}
```

**Response:**
```json
{
  "token": "jwt-token-here",
  "user": {
    "_id": "user-id",
    "username": "johndoe",
    "email": "john@example.com",
    "teams": []
  }
}
```

#### POST `/api/auth/login`
Authenticate existing user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:** Same as register

#### GET `/api/auth/me`
Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer jwt-token-here
```

**Response:**
```json
{
  "user": {
    "_id": "user-id",
    "username": "johndoe", 
    "email": "john@example.com",
    "teams": ["team-id-1", "team-id-2"]
  }
}
```

### Team Routes (`/api/teams`)

#### POST `/api/teams/create`
Create a new team (requires authentication).

**Request Body:**
```json
{
  "name": "Development Team"
}
```

**Response:**
```json
{
  "team": {
    "_id": "team-id",
    "name": "Development Team",
    "code": "ABC123",
    "members": ["creator-user-id"],
    "createdBy": "creator-user-id"
  }
}
```

#### POST `/api/teams/join`
Join an existing team using team code.

**Request Body:**
```json
{
  "code": "ABC123"
}
```

**Response:**
```json
{
  "team": {
    "_id": "team-id",
    "name": "Development Team",
    "code": "ABC123",
    "members": ["user-1", "user-2", "new-user"],
    "createdBy": "creator-user-id"
  }
}
```

#### GET `/api/teams/:teamId`
Get team details and member information.

**Response:**
```json
{
  "team": {
    "_id": "team-id",
    "name": "Development Team",
    "code": "ABC123",
    "members": [
      {
        "_id": "user-1",
        "username": "johndoe",
        "email": "john@example.com"
      }
    ],
    "createdBy": "creator-user-id"
  }
}
```

#### POST `/api/teams/:teamId/leave`
Leave a team (requires authentication).

### Task Routes (`/api/tasks`)

#### GET `/api/tasks/:teamId`
Get all tasks for a specific team.

**Response:**
```json
{
  "tasks": [
    {
      "_id": "task-id",
      "title": "Implement user authentication",
      "status": "inprogress",
      "teamId": "team-id",
      "assignedTo": "user-id",
      "createdBy": "creator-id",
      "order": 0,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST `/api/tasks`
Create a new task.

**Request Body:**
```json
{
  "title": "Fix authentication bug",
  "teamId": "team-id",
  "status": "todo",
  "assignedTo": "user-id" // Optional
}
```

#### PATCH `/api/tasks/:taskId`
Update an existing task.

**Request Body:**
```json
{
  "title": "Updated task title",
  "status": "done",
  "assignedTo": "different-user-id"
}
```

#### DELETE `/api/tasks/:taskId`
Delete a task.

## 🔄 Real-Time Events (Socket.IO)

### Client → Server Events

#### `join-team`
Join a team room for real-time updates.
```javascript
socket.emit('join-team', { teamId: 'team-id', userId: 'user-id' })
```

#### `leave-team`
Leave a team room.
```javascript
socket.emit('leave-team', { teamId: 'team-id', userId: 'user-id' })
```

#### `task-update`
Broadcast task changes to team members.
```javascript
socket.emit('task-update', {
  teamId: 'team-id',
  task: updatedTaskObject,
  action: 'move' | 'create' | 'update' | 'delete'
})
```

### Server → Client Events

#### `task-updated`
Receive real-time task updates.
```javascript
socket.on('task-updated', (data) => {
  // data.task - updated task object
  // data.action - type of update
  // data.userId - who made the change
})
```

#### `user-joined-team`
User joined the team.
```javascript
socket.on('user-joined-team', (data) => {
  // data.user - user who joined
  // data.teamId - team ID
})
```

#### `user-left-team` 
User left the team.
```javascript
socket.on('user-left-team', (data) => {
  // data.userId - user who left
  // data.teamId - team ID
})
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start with nodemon (auto-restart)
npm run start        # Start compiled JavaScript

# Building
npm run build        # Compile TypeScript to JavaScript
npm run compile      # Alternative build command

# Database
npm run db:seed      # Seed database with sample data (if implemented)
npm run db:reset     # Reset database (if implemented)
```

### Development Workflow

1. **Start MongoDB**
   ```bash
   # Local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud)
   # Just set MONGO_URI in .env
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **API Testing**
   - Use Postman, Insomnia, or Thunder Client
   - Test endpoints at `http://localhost:5000/api/`
   - Include JWT token in Authorization header for protected routes

4. **Real-Time Testing**
   - Use Socket.IO client or browser WebSocket tools
   - Connect to `http://localhost:5000`
   - Test events in multiple browser tabs

## 🛡️ Security Features

### Authentication
- **JWT Tokens**: Secure stateless authentication
- **Password Hashing**: bcryptjs with salt rounds
- **Token Expiration**: Configurable token lifetime
- **Protected Routes**: Middleware validation for all secured endpoints

### Data Validation
- **Input Sanitization**: Clean user inputs
- **Schema Validation**: Mongoose schema enforcement
- **Error Handling**: Centralized error responses
- **Rate Limiting**: Prevent API abuse (recommended to add)

### CORS Configuration
```typescript
const allowedOrigins = [
  'http://localhost:5173',      // Development frontend
  'http://localhost:3000',      // Alternative dev port
  'https://planhive.netlify.app'  // Production frontend
]
```

## 📈 Performance Optimization

### Database
- **Indexing**: Strategic indexes on frequently queried fields
- **Connection Pooling**: Mongoose connection management
- **Query Optimization**: Efficient aggregation pipelines
- **Data Pagination**: Limit large result sets

### Socket.IO
- **Room Management**: Efficient team-based event broadcasting
- **Connection Handling**: Graceful connect/disconnect management
- **Event Throttling**: Prevent event spam
- **Memory Management**: Clean up inactive connections

## 🚀 Deployment

### Environment Variables (Production)
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/planhive
JWT_SECRET=your-super-long-production-secret-key
CLIENT_URL=https://your-frontend-domain.com
```

### Deployment Platforms

#### Render (Recommended)
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set start command: `npm start`
4. Add environment variables
5. Enable auto-deploy from main branch

#### Railway
1. Connect GitHub repo
2. Set environment variables
3. Deploy automatically

#### Heroku
1. Create Heroku app
2. Set buildpack to Node.js
3. Configure environment variables
4. Deploy via Git or GitHub integration

#### Manual VPS Deployment
```bash
# On your server
git clone your-repo
cd planhive/backend
npm install
npm run build
pm2 start dist/server.js --name planhive-backend
```

### Database Deployment
- **MongoDB Atlas**: Recommended cloud database
- **Local MongoDB**: For development only
- **DocumentDB**: AWS-managed MongoDB alternative

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check MongoDB is running
   mongod --version
   
   # Test connection string
   mongo "your-connection-string"
   ```

2. **JWT Token Issues**
   ```bash
   # Ensure JWT_SECRET is set and long enough
   echo $JWT_SECRET
   ```

3. **CORS Errors**
   - Verify CLIENT_URL matches frontend domain
   - Check allowed origins in server configuration
   - Ensure proper headers are set

4. **Socket.IO Connection Issues**
   - Check WebSocket support
   - Verify client/server Socket.IO versions match
   - Test connection in browser developer tools

### Debugging Tools
- **Morgan**: HTTP request logging
- **Debug Module**: Detailed debugging output
- **MongoDB Compass**: Database visualization
- **Socket.IO Admin UI**: Real-time connection monitoring

### Health Monitoring
```bash
# Health check endpoints
GET /health           # Basic health check
GET /api/health       # API health check
GET /                 # Server status
```

## 📊 Monitoring & Logging

### Application Metrics
- API response times
- Database query performance
- Socket.IO connection counts
- Error rates and types

### Recommended Tools
- **New Relic**: Application performance monitoring
- **MongoDB Atlas Monitoring**: Database metrics
- **LogRocket**: Frontend error tracking
- **Sentry**: Error tracking and performance

---

For frontend documentation, see `/frontend/README.md`

**PlanHive Backend** - Robust, scalable, and real-time! 🚀
