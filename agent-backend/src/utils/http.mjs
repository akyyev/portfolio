import { config } from '../config.mjs';

export function corsHeaders(origin) {
  const allowOrigin = config.allowedOrigins.includes(origin)
    ? origin
    : config.allowedOrigins[0];

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };
}

export function sendJson(res, statusCode, body, origin) {
  res.writeHead(statusCode, corsHeaders(origin));
  res.end(JSON.stringify(body));
}

export async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  return JSON.parse(raw);
}

export function methodNotAllowed(res, origin) {
  sendJson(res, 405, { error: 'Method not allowed.' }, origin);
}
