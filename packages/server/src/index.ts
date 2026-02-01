import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { initializeSocket } from './socket';
import { GSIStateManager } from './state';
import { createGSIRouter } from './routes/gsi';

const PORT = parseInt(process.env.PORT || '3001', 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
const GSI_AUTH_TOKEN = process.env.GSI_AUTH_TOKEN || null;

const app = express();

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GSI State Manager
const gsiState = new GSIStateManager();
if (GSI_AUTH_TOKEN) {
  gsiState.setAuthToken(GSI_AUTH_TOKEN);
  console.log('[Server] GSI auth token configured');
}

const httpServer = createServer(app);
const io = initializeSocket(httpServer, CORS_ORIGIN, gsiState);

// Mount GSI route
app.use(createGSIRouter(gsiState, io));

httpServer.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
  console.log(`[Server] CORS origin: ${CORS_ORIGIN}`);
  console.log(`[Server] Socket.io ready`);
  console.log(`[Server] GSI endpoint: POST /gsi`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received, shutting down...');
  io.close();
  httpServer.close(() => {
    console.log('[Server] HTTP server closed');
    process.exit(0);
  });
});
