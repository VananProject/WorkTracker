import express from 'express';
import cors from 'cors';

import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import authRoutes from '@routes/auth.routes';
import taskRoutes from '@routes/task.routes';

export class AppModule {
  private app: express.Application;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true
    }));
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  }

  private setupRoutes(): void {
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/tasks', taskRoutes);
    
    // Health check route
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
      });
    });
  }

  private setupErrorHandling(): void {
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
  }

  public getApp(): express.Application {
    return this.app;
  }
}
