import { app } from './app.js';
import { env } from './config/env.js';

const server = app.listen(env.PORT, () => {
  console.log(`[CineScope API] Server is running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  console.log(`[CineScope API] Health endpoint available at: http://localhost:${env.PORT}/api/health`);
});

const handleShutdown = (signal: string) => {
  console.log(`\nReceived ${signal}. Gracefully closing server...`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
