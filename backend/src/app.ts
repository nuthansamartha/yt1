import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import downloadRoutes from './routes/downloadRoutes';
import { errorHandler } from './middleware/errorHandler';
import { YtdlpService } from './services/ytdlpService';

dotenv.config();

const app = express();

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

// Security CORS configuration
app.use(
  cors({
    origin: process.env.NODE_ENV === 'production' ? frontendUrl : true,
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', downloadRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  const deps = YtdlpService.checkDependencies();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    dependencies: deps
  });
});

// Global error handler
app.use(errorHandler);

export default app;
