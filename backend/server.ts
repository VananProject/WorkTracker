
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import TypeScript routes
import authRoutes from '../backend/src/routes/auth.routes';
import taskRoutes from '../backend/src/routes/task.routes';

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'https://bp.vananpicture.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use TypeScript routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

console.log('✅ TypeScript routes loaded successfully');

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'TypeScript Server is running',
    timestamp: new Date().toISOString(),
    routes: 'TypeScript routes loaded'
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

// MongoDB Compass (Local) connection
const localUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskDB';

mongoose.connect(localUri)
  .then(() => {
    console.log('✅ MongoDB Compass connected successfully');
    console.log('🗄️  Connected to database: taskDB');
    console.log('🌐 Connection Type: Local MongoDB');
    console.log('📍 URI: mongodb://localhost:27017/taskDB');
    app.listen(PORT, () => {
      console.log(`🚀 TypeScript Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🌐 CORS enabled for: localhost:3000, localhost:5173`);
      console.log(`📋 Routes: /api/auth, /api/tasks`);
    });
  })
  .catch((error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ MongoDB Compass connection error:', errorMessage);
    console.error('💡 Make sure MongoDB is running locally:');
    console.error('   - Windows: Start MongoDB service or run mongod');
    console.error('   - macOS: brew services start mongodb-community');
    console.error('   - Linux: sudo systemctl start mongod');
    console.error('   - Or start MongoDB Compass and ensure local connection is available');
    process.exit(1);
  });

export default app;
