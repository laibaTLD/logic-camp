const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const next = require('next');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import services
const databaseService = require('./src/services/database').default;
const logger = require('./src/utils/logger').default;

// Initialize Next.js
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'http://localhost:3000']
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  
  // Log request
  logger.request(req.method, req.url);
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - startTime;
    logger.request(req.method, req.url, duration, res.statusCode);
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
  });
});

// Database status endpoint
app.get('/health/db', async (req, res) => {
  try {
    const dbStatus = databaseService.getStatus();
    res.json({
      status: 'healthy',
      database: dbStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Database health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      database: { error: error.message },
      timestamp: new Date().toISOString(),
    });
  }
});

// API routes (these will be handled by Next.js API routes)
app.use('/api', (req, res, next) => {
  // API routes are handled by Next.js
  next();
});

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    code: error.code || 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
});

// 404 handler for non-API routes
app.use('*', (req, res) => {
  // Let Next.js handle all other routes
  return handle(req, res);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  
  try {
    await databaseService.close();
    logger.info('Database connection closed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  
  try {
    await databaseService.close();
    logger.info('Database connection closed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
});

// Unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start server
async function startServer() {
  try {
    // Initialize database
    await databaseService.initialize();
    logger.info('Database initialized successfully');
    
    // Seed database if needed
    if (process.env.NODE_ENV === 'development') {
      await databaseService.seedDatabase();
      logger.info('Database seeded successfully');
    }
    
    // Prepare Next.js
    await nextApp.prepare();
    logger.info('Next.js prepared successfully');
    
    // Start Express server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
      logger.info(`Database status: http://localhost:${PORT}/health/db`);
    });
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
