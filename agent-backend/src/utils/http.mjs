import { config } from '../config.mjs';

export function corsHeaders(origin) {
  const allowOrigin = !origin || config.allowedOrigins.includes(origin)
    ? origin
    : config.allowedOrigins[0];

  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (allowOrigin) {
    headers['Access-Control-Allow-Origin'] = allowOrigin;
  }

  return headers;
}

export function isAllowedOrigin(origin) {
  return !origin || config.allowedOrigins.includes(origin);
}

export function sendJson(res, statusCode, body, origin) {
  res.writeHead(statusCode, corsHeaders(origin));
  res.end(JSON.stringify(body));
}

export async function readJson(req, maxBytes = config.maxRequestBytes) {
  const chunks = [];
  let bytes = 0;

  for await (const chunk of req) {
    bytes += chunk.length;
    if (bytes > maxBytes) {
      const error = new Error('Request body is too large.');
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    const error = new Error('Request body must be valid JSON.');
    error.statusCode = 400;
    throw error;
  }
}

export function methodNotAllowed(res, origin) {
  sendJson(res, 405, { error: 'Method not allowed.' }, origin);
}
