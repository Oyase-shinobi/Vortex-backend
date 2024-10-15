import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { pino } from 'pino';

import gameRouter from './api/game';
import healthCheckRouter from './api/healthCheck';
import playerRouter from './api/player';

import errorHandler from './utils/middleware/errorHandler';
// import rateLimiter from "@/common/middleware/rateLimiter";
import requestLogger from './utils/middleware/requestLogger';
// import env from '@/utils/env/envConfig';

const logger = pino({ name: 'server start' });
const app: Express = express();

// Set the application to trust the reverse proxy
// app.set('trust proxy', true);

// Middlewares
app.use(cors());
// app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet());
// app.use(rateLimiter);

// Request logging
// app.use(requestLogger);

// Routes
app.use('/api', [gameRouter, healthCheckRouter, playerRouter]);

// Swagger UI
// app.use(openAPIRouter);

// Error handlers
app.use(errorHandler());

export { app, logger };
