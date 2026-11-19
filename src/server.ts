import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { env } from './config/env.js';
import { registerAuthErrorHandler } from './plugins/admin-auth.js';
import { loanProductRoutes } from './routes/loan-products.js';
import { customerAccountRoutes } from './routes/customer-accounts.js';

const app = Fastify({ logger: true, trustProxy: false, bodyLimit: 1_048_576 });
await app.register(helmet);
await app.register(cors, { origin: env.CORS_ORIGIN, credentials: true });
await app.register(rateLimit, { max: 100, timeWindow: '1 minute' });
registerAuthErrorHandler(app);
app.get('/health', async () => ({ status: 'ok', service: 'loan-platform-api' }));
await app.register(loanProductRoutes);
await app.register(customerAccountRoutes);

try {
  await app.listen({ port: env.PORT, host: env.HOST });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
