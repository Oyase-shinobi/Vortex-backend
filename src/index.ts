import { app, logger } from './server';

import env from './utils/env/envConfig';
import startPolling from './utils/helpers/PollingHelper';

const server = app.listen(env.PORT, () => {
  const { HOST, PORT } = env;
  logger.info(`Server running on port http://${HOST}:${PORT}`);
});

const onCloseSignal = () => {
  logger.info('sigint received, shutting down');
  server.close(() => {
    logger.info('server closed');
    process.exit();
  });
  setTimeout(() => process.exit(1), 10000).unref(); // Force shutdown after 10s
};

process.on('SIGINT', onCloseSignal);
process.on('SIGTERM', onCloseSignal);

startPolling();
