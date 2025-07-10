# Task Management API

A professional, scalable task management API built with Node.js, Express, and MongoDB.

## 🏗️ Architecture

This API follows a clean, modular architecture with clear separation of concerns:

```
src/
├── controllers/          # Request handlers
│   └── tasks/
│       ├── taskController.js
│       └── assignmentController.js
├── models/              # Database models
│   └── Task.js
├── services/            # Business logic
│   └── taskService.js
├── routes/              # API routes
│   └── taskRoutes.js
├── middleware/          # Custom middleware
│   └── errorHandler.js
├── validators/          # Input validation
│   └── taskValidators.js
├── utils/               # Utility functions
│   ├── taskUtils.js
│   ├── responseUtils.js
│   └── logger.js
├── config/              # Configuration files
│   └── taskConfig.js
├── docs/                # API documentation
│   └── taskAPI.md
├── app.js               # Express app setup
└── server.js            # Server entry point
```

## 🚀 Features

- **Task Management**: Create, start, pause, resume, and end tasks
- **Task Assignment**: Admin users can assign tasks to other users
- **Time Tracking**: Automatic time tracking with activity logging
- **Task Types**: Support for different task types (task, meeting)
- **Comprehensive Logging**: Detailed logging for debugging and monitoring
- **Input Validation**: Robust input validation with detailed error messages
- **Error Handling**: Centralized error handling with consistent responses
- **Security**: Built-in security features with Helmet and rate limiting
- **Documentation**: Comprehensive API documentation

## 📋 API Endpoints

### Task Operations
- `POST /api/tasks` - Create a new task
- `POST /api/tasks/start` - Create and start a task
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/active` - Get active tasks
- `GET /api/tasks/:taskId` - Get task by ID
- `PUT /api/tasks/pause/:taskId` - Pause a task
- `PUT /api/tasks/resume/:taskId` - Resume a task
- `PUT /api/tasks/end/:taskId` - End a task

### Assignment Operations
- `POST /api/tasks/assign` - Assign task to user (Admin only)
- `GET /api/tasks/assigned` - Get assigned tasks
- `PUT /api/tasks/start-assigned/:taskId` - Start assigned task

### Query Operations
- `GET /api/tasks/date-range` - Get tasks by date range

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start the development server**
```bash
npm run dev
```

## 🔧 Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/taskmanagement

# Frontend Configuration
FRONTEND_URL=http://localhost:3000

# JWT Configuration (if using authentication)
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRE=7d
```

## 📝 Usage Examples

### Creating a Task
```javascript
const response = await fetch('/api/tasks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token'
  },
  body: JSON.stringify({
    taskId: 'task_123',
    taskName: 'Complete documentation',
    type: 'task',
    description: 'Write API documentation'
  })
});
```

### Starting a Task
```javascript
const response = await fetch('/api/tasks/start', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token'
  },
  body: JSON.stringify({
    taskId: 'task_123',
    taskName: 'Team meeting',
    type: 'meeting'
  })
});
```

### Assigning a Task (Admin only)
```javascript
const response = await fetch('/api/tasks/assign', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer admin-jwt-token'
  },
  body: JSON.stringify({
    taskName: 'Code review',
    type: 'task',
    assignedToEmail: 'developer@example.com',
    description: 'Review pull request #123'
  })
});
```

## 🧪 Testing

Run the test suite:
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🔍 Validation

The API includes comprehensive input validation:

- **Task Name**: Required, 1-100 characters
- **Task Type**: Must be 'task' or 'meeting'
- **Task ID**: Must be alphanumeric with underscores
- **Email**: Valid email format for assignments
- **Time Values**: Must be non-negative numbers

## 📊 Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Validation Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "taskName",
      "message": "Task name is required",
      "value": ""
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🔐 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Prevents injection attacks
- **Error Sanitization**: Prevents information leakage

## 📈 Monitoring and Logging

The API includes comprehensive logging:

- **Request Logging**: All incoming requests
- **Error Logging**: Detailed error information
- **Performance Logging**: Response times and performance metrics
- **Activity Logging**: Task activities and state changes

## 🚀 Deployment

### Production Setup

1. **Set production environment**
```bash
export NODE_ENV=production
```

2. **Install production dependencies**
```bash
npm ci --only=production
```

3. **Start the server**
```bash
npm start
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src/ ./src/

EXPOSE 5000

CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the [API documentation](src/docs/taskAPI.md)
- Review the code examples in this README

## 🔄 Version History

- **v1.0.0** - Initial release with core task management features
- **v1.1.0** - Added task assignment functionality
- **v1.2.0** - Enhanced validation and error handling
```

## 16. Create Server Entry Point

```javascript:backend/src/server.js
/**
 * Server entry point for Task Management API
 */

require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const logger = require('./utils/logger');

// Configuration
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskmanagement';

/**
 * Connect to MongoDB
 */
const connectDB = async () => {
  try {
    logger.info('Connecting to MongoDB...', { uri: MONGODB_URI });
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    logger.success('MongoDB connected successfully');
    
    // Log database connection details
    const db = mongoose.connection.db;
    const admin = db.admin();
    const info = await admin.serverStatus();
    
    logger.info('Database connection info', {
      host: info.host,
      version: info.version,
      uptime: info.uptime
    });
    
  } catch (error) {
    logger.error('MongoDB connection failed', { error: error.message });
    process.exit(1);
  }
};

/**
 * Handle MongoDB connection events
 */
mongoose.connection.on('connected', () => {
  logger.info('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  logger.error('Mongoose connection error', { error: err.message });
});

mongoose.connection.on('disconnected', () => {
  logger.warn('Mongoose disconnected from MongoDB');
});

/**
 * Graceful shutdown handling
 */
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  // Close server
  server.close(() => {
    logger.info('HTTP server closed');
    
    // Close database connection
    mongoose.connection.close(false, () => {
      logger.info('MongoDB connection closed');
      process.exit(0);
    });
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Handle process termination
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error('Unhandled Rejection', { error: err.message, promise });
  process.exit(1);
});

/**
 * Start the server
 */
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start HTTP server
    const server = app.listen(PORT, () => {
      logger.success(`🚀 Task Management API Server running on port ${PORT}`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        platform: process.platform
      });
      
      // Log available routes
      logger.info('Available routes:', {
        health: `http://localhost:${PORT}/health`,
        tasks: `http://localhost:${PORT}/api/tasks`,
        docs: 'See src/docs/taskAPI.md for full API documentation'
      });
    });
    
    // Set server timeout
    server.timeout = 30000; // 30 seconds
    
    return server;
    
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
};

// Start the server
const server = startServer();

module.exports = server;
