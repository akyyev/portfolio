import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(dirname, '..');

export const config = {
  port: Number(process.env.PORT || 3001),
  allowedOrigins: (process.env.ALLOW_ORIGINS || process.env.ALLOW_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean),
  modelProvider: process.env.MODEL_PROVIDER?.toLowerCase() || 'openai',
  openAiApiKey: process.env.OPENAI_API_KEY,
  hfToken: process.env.HF_TOKEN,
  emailFormsEndpoint: process.env.EMAIL_FORMS_ENDPOINT,
  googleServiceAccountKey: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
  redisUrl: process.env.REDIS_URL,
  knowledgeDir: path.resolve(rootDir, process.env.KNOWLEDGE_DIR || 'data'),
  sessionTtlSeconds: Number(process.env.SESSION_TTL_SECONDS || 6 * 60 * 60),
  pendingActionTtlSeconds: Number(process.env.PENDING_ACTION_TTL_SECONDS || 15 * 60),
  maxStoredMessages: Number(process.env.MAX_STORED_MESSAGES || 10),
  maxMessageLength: Number(process.env.MAX_MESSAGE_LENGTH || 4000),
  maxRequestBytes: Number(process.env.MAX_REQUEST_BYTES || 32 * 1024),
  ipRateLimitWindowSeconds: Number(process.env.IP_RATE_LIMIT_WINDOW_SECONDS || 60),
  ipRateLimitMax: Number(process.env.IP_RATE_LIMIT_MAX || 25),
  sessionRateLimitWindowSeconds: Number(process.env.SESSION_RATE_LIMIT_WINDOW_SECONDS || 60),
  sessionRateLimitMax: Number(process.env.SESSION_RATE_LIMIT_MAX || 12)
};

export const modelConfig = {
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    token: config.openAiApiKey,
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini'
  },
  huggingface: {
    url: 'https://router.huggingface.co/v1/chat/completions',
    token: config.hfToken,
    model: process.env.HF_MODEL || 'openai/gpt-oss-20b'
  }
};

export const embeddingConfig = {
  openai: {
    url: 'https://api.openai.com/v1/embeddings',
    token: config.openAiApiKey,
    model: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small'
  },
  huggingface: {
    url: `https://router.huggingface.co/hf-inference/models/${process.env.HF_EMBEDDING_MODEL || 'BAAI/bge-small-en-v1.5'}/pipeline/feature-extraction`,
    token: config.hfToken
  }
};
