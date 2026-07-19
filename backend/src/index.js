import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cron from 'node-cron';

import { config } from './config.js';
import { connectDB } from './db/connect.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import schemesRoutes from './routes/schemes.routes.js';
import eligibilityRoutes from './routes/eligibility.routes.js';
import careerRoutes from './routes/career.routes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { getSchemes, refreshSchemes } from './services/schemeSource.service.js';
import chatRoutes from './routes/chat.routes.js';
import { solveStudentDoubt } from './controllers/user.controller.js';
import jwt from 'jsonwebtoken';

const app = express();

app.use(helmet());
app.use(cors({ origin: config.clientOrigin, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

app.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.use('/api/chat', chatRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// Dedicated standalone endpoint for Student Doubt Solver (POST /api/student/doubt-solver)
app.post('/api/student/doubt-solver', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, config.jwtSecret);
        req.userId = decoded.id;
      } catch (_) {}
    }
    await solveStudentDoubt(req, res);
  } catch (err) {
    next(err);
  }
});

app.use('/api/schemes', schemesRoutes);
app.use('/api/eligibility', eligibilityRoutes);
app.use('/api/career', careerRoutes);

// Debug route to verify AWS environment variables
app.get('/api/debug', async (req, res) => {
  const mongoose = await import('mongoose');
  let maskedUri = process.env.MONGODB_URI || 'undefined';
  if (maskedUri !== 'undefined') {
    maskedUri = maskedUri.replace(/:([^:@]+)@/, ':***@'); // hide password
  }
  res.json({
    mongodbUriSet: !!process.env.MONGODB_URI,
    maskedUri,
    mongooseState: mongoose.default.connection.readyState,
    nodeEnv: process.env.NODE_ENV,
    primaryDbError: global.primaryDbError || null,
    dbError: global.dbError || null
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

// Connect to MongoDB then start server
connectDB().then(() => {
  app.listen(config.port, async () => {
    console.log(`Sarthi API listening on http://localhost:${config.port}`);
    console.log('Warming up government scheme cache (first fetch may take a few seconds)...');
    try {
      const { meta } = await getSchemes();
      console.log(
        `Scheme data ready: ${meta.totalSchemes} schemes ` +
          `(seed=${meta.sources.seed?.count ?? 0}, myscheme=${meta.sources.myscheme?.count ?? 0}, dataGovIn=${meta.sources.dataGovIn?.count ?? 0})`
      );
    } catch (err) {
      console.error('Initial scheme warm-up failed, will retry on first request:', err.message);
    }

    if (config.schemesRefreshCron) {
      cron.schedule(config.schemesRefreshCron, async () => {
        console.log('Running scheduled Government scheme data refresh...');
        try {
          const { meta } = await refreshSchemes();
          console.log(`Scheduled refresh complete: ${meta.totalSchemes} schemes.`);
        } catch (err) {
          console.error('Scheduled refresh failed:', err.message);
        }
      });
    }
  });
});
