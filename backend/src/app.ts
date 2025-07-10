// import express from 'express';
// import cors from 'cors';
// import mongoose from 'mongoose';
// import dotenv from 'dotenv';

// // Load environment variables
// dotenv.config();

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Import your existing JavaScript routes (correct paths)
// const authRoutes = require('../routes/auth');
// const taskRoutes = require('../routes/tasks');

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/tasks', taskRoutes);

// // Health check
// app.get('/api/health', (req, res) => {
//   res.json({
//     success: true,
//     message: 'TypeScript Server is running',
//     timestamp: new Date().toISOString()
//   });
// });

// // Error handling
// app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
//   console.error('Error:', err);
//   res.status(500).json({
//     success: false,
//     message: 'Internal server error'
//   });
// });

// // 404 handler
// app.use('*', (req, res) => {
//   res.status(404).json({
//     success: false,
//     message: 'Route not found'
//   });
// });

// const PORT = process.env.PORT || 5000; // Different port from index.js
// const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskmanager';

// // Connect to MongoDB and start server
// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     console.log('✅ MongoDB connected successfully');
//     app.listen(PORT, () => {
//       console.log(`🚀 TypeScript Server running on port ${PORT}`);
//       console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
//       console.log(`🔐 Auth routes: http://localhost:${PORT}/api/auth`);
//       console.log(`📋 Task routes: http://localhost:${PORT}/api/tasks`);
//     });
//   })
//   .catch((error) => {
//     console.error('❌ MongoDB connection error:', error);
//     process.exit(1);
//   });

// export default app;
