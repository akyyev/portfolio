import http from 'node:http';
import { config } from './config.mjs';
import { cancelAction, chat, confirmAction } from './services/agent.mjs';
import { assertRateLimit } from './services/rateLimiter.mjs';
import { corsHeaders, isAllowedOrigin, methodNotAllowed, readJson, sendJson } from './utils/http.mjs';

function actionIdFromPath(pathname, suffix) {
  const match = pathname.match(new RegExp(`^/actions/([^/]+)/${suffix}/?$`));
  return match?.[1] || null;
}

function getClientIp(req) {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
    return forwardedFor.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

async function route(req, res) {
  const origin = req.headers.origin;
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders(origin));
    res.end();
    return;
  }

  if (!isAllowedOrigin(origin)) {
    return sendJson(res, 403, { error: 'Origin is not allowed.' }, origin);
  }

  if (url.pathname === '/health' || url.pathname === '/health/') {
    if (req.method !== 'GET') return methodNotAllowed(res, origin);
    res.writeHead(204, corsHeaders(origin));
    res.end();
    return;
  }

  if (url.pathname === '/chat' || url.pathname === '/chat/') {
    if (req.method !== 'POST') return methodNotAllowed(res, origin);
    const body = await readJson(req);
    await assertRateLimit({
      ip: getClientIp(req),
      sessionId: body.sessionId,
      scope: 'chat'
    });
    const result = await chat({
      sessionId: body.sessionId,
      message: body.message || body.messages?.at?.(-1)?.content,
      timezone: body.timezone,
      user: body.user
    });
    return sendJson(res, 200, result, origin);
  }

  const confirmActionId = actionIdFromPath(url.pathname, 'confirm');
  if (confirmActionId) {
    if (req.method !== 'POST') return methodNotAllowed(res, origin);
    const body = await readJson(req);
    await assertRateLimit({
      ip: getClientIp(req),
      sessionId: body.sessionId,
      scope: 'action'
    });
    const result = await confirmAction({
      sessionId: body.sessionId,
      actionId: confirmActionId
    });
    return sendJson(res, 200, result, origin);
  }

  const cancelActionId = actionIdFromPath(url.pathname, 'cancel');
  if (cancelActionId) {
    if (req.method !== 'POST') return methodNotAllowed(res, origin);
    const body = await readJson(req);
    await assertRateLimit({
      ip: getClientIp(req),
      sessionId: body.sessionId,
      scope: 'action'
    });
    const result = await cancelAction({
      sessionId: body.sessionId,
      actionId: cancelActionId
    });
    return sendJson(res, 200, result, origin);
  }

  return sendJson(res, 404, { error: 'Not found.' }, origin);
}

const server = http.createServer(async (req, res) => {
  try {
    await route(req, res);
  } catch (error) {
    console.error('Request failed:', error.message);
    sendJson(res, error.statusCode || 500, { error: error.message }, req.headers.origin);
  }
});

server.listen(config.port, () => {
  console.log(`Botfolio agent backend listening on ${config.port}`);
});
