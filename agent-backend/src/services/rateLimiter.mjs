import { config } from '../config.mjs';
import { store } from './redisStore.mjs';

function normalizeIdentifier(value) {
  return String(value || 'unknown').replace(/[^a-zA-Z0-9:._-]/g, '_').slice(0, 160);
}

async function checkLimit({ key, max, windowSeconds }) {
  const count = await store.incrementWithTtl(key, windowSeconds);
  if (count > max) {
    const error = new Error('Too many requests. Please wait a minute and try again.');
    error.statusCode = 429;
    throw error;
  }
}

export async function assertRateLimit({ ip, sessionId, scope }) {
  const normalizedScope = normalizeIdentifier(scope);
  await checkLimit({
    key: `botfolio:rate:${normalizedScope}:ip:${normalizeIdentifier(ip)}`,
    max: config.ipRateLimitMax,
    windowSeconds: config.ipRateLimitWindowSeconds
  });

  if (sessionId) {
    await checkLimit({
      key: `botfolio:rate:${normalizedScope}:session:${normalizeIdentifier(sessionId)}`,
      max: config.sessionRateLimitMax,
      windowSeconds: config.sessionRateLimitWindowSeconds
    });
  }
}
