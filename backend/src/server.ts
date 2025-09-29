import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import connectDB from './config/database';
import authRoutes from './routes/auth';
import noteRoutes from './routes/notes';
import { errorHandler } from './middleware/error';

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration - temporarily allow all origins for debugging
app.use(cors({
  origin: true, // Allow all origins temporarily
  credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Note-taking API is running successfully'
  });
});

// Serve static files from frontend build
const frontendBuildPath = path.join(__dirname, 'frontend/build');
app.use(express.static(frontendBuildPath));

// Handle React client-side routing - serve index.html for non-API routes
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ message: 'API route not found' });
    return;
  }
  
  // Serve index.html for all other routes (React routing)
  res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Server bound to 0.0.0.0:${PORT}`);
});