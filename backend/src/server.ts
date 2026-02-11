import express, { Application } from 'express';
import type { Request, Response } from "express";
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import authRoutes from './routes/auth.routes';
import documentRoutes from './routes/document.routes';
import signatureRoutes from './routes/signature.routes';
import notaryRoutes from './routes/notary.routes';
import userRoutes from './routes/user.routes';
import { errorHandler } from './middleware/errorHandler';

const app: Application = express();

// Security middleware
app.use(helmet());
app.use(cors(config.cors));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint

app.get("/health", (_req: Request, res: Response) => {
  return res.json({ ok: true });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/signatures', signatureRoutes);
app.use('/api/notary', notaryRoutes);
app.use('/api/users', userRoutes);

// Static file serving for uploads
app.use('/uploads', express.static(config.upload.uploadDir));

// 404 handler
app.use((_req: Request, res: Response) => {
  return res.status(404).json({ message: "Not found" });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🏛️  Legal Document Signing System API                  ║
║                                                           ║
║   Server running on: http://localhost:${PORT}              ║
║   Environment: ${config.nodeEnv}                         ║
║   Frontend URL: ${config.frontendUrl}      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;
