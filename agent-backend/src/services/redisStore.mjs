import net from 'node:net';
import tls from 'node:tls';
import { config } from '../config.mjs';

function encodeCommand(parts) {
  return `*${parts.length}\r\n${parts.map(part => {
    const value = String(part);
    return `$${Buffer.byteLength(value)}\r\n${value}\r\n`;
  }).join('')}`;
}

function parseResp(buffer, offset = 0) {
  const type = String.fromCharCode(buffer[offset]);
  const lineEnd = buffer.indexOf('\r\n', offset);
  const line = buffer.toString('utf8', offset + 1, lineEnd);
  const next = lineEnd + 2;

  if (type === '+') return { value: line, offset: next };
  if (type === ':') return { value: Number(line), offset: next };
  if (type === '-') throw new Error(line);
  if (type === '$') {
    const length = Number(line);
    if (length === -1) return { value: null, offset: next };
    const start = next;
    const end = start + length;
    return {
      value: buffer.toString('utf8', start, end),
      offset: end + 2
    };
  }
  if (type === '*') {
    const count = Number(line);
    if (count === -1) return { value: null, offset: next };
    const items = [];
    let cursor = next;
    for (let i = 0; i < count; i += 1) {
      const parsed = parseResp(buffer, cursor);
      items.push(parsed.value);
      cursor = parsed.offset;
    }
    return { value: items, offset: cursor };
  }

  throw new Error(`Unsupported Redis response type: ${type}`);
}

class RedisStore {
  constructor(redisUrl) {
    this.url = new URL(redisUrl);
  }

  command(parts) {
    return new Promise((resolve, reject) => {
      const socketFactory = this.url.protocol === 'rediss:' ? tls.connect : net.connect;
      const socket = socketFactory({
        host: this.url.hostname,
        port: Number(this.url.port || 6379),
        servername: this.url.hostname
      });
      const chunks = [];
      let expectedResponses = 1;
      let settled = false;
      const timer = setTimeout(() => {
        settled = true;
        socket.destroy();
        reject(new Error('Redis command timed out.'));
      }, 5000);

      const settle = (callback, value) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        socket.end();
        callback(value);
      };

      socket.on('connect', () => {
        const commands = [];
        if (this.url.password) {
          commands.push(this.url.username
            ? ['AUTH', this.url.username, this.url.password]
            : ['AUTH', this.url.password]);
        }
        commands.push(parts);
        expectedResponses = commands.length;
        socket.write(commands.map(encodeCommand).join(''));
      });

      socket.on('data', chunk => {
        chunks.push(chunk);
        try {
          let offset = 0;
          let value;
          let responseCount = 0;
          const buffer = Buffer.concat(chunks);
          while (offset < buffer.length) {
            const parsed = parseResp(buffer, offset);
            value = parsed.value;
            offset = parsed.offset;
            responseCount += 1;
          }
          if (responseCount >= expectedResponses) {
            settle(resolve, value);
          }
        } catch (error) {
          settle(reject, error);
        }
      });
      socket.on('error', error => {
        settle(reject, error);
      });
    });
  }

  async get(key) {
    return this.command(['GET', key]);
  }

  async setJson(key, value, ttlSeconds) {
    return this.command(['SET', key, JSON.stringify(value), 'EX', ttlSeconds]);
  }

  async setIfAbsent(key, value, ttlSeconds) {
    const result = await this.command(['SET', key, value, 'NX', 'EX', ttlSeconds]);
    return result === 'OK';
  }

  async incrementWithTtl(key, ttlSeconds) {
    const value = await this.command(['INCR', key]);
    if (value === 1) {
      await this.command(['EXPIRE', key, ttlSeconds]);
    }
    return value;
  }

  async delete(key) {
    return this.command(['DEL', key]);
  }
}

class MemoryStore {
  constructor() {
    this.items = new Map();
  }

  get(key) {
    const item = this.items.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.items.delete(key);
      return null;
    }
    return item.value;
  }

  setJson(key, value, ttlSeconds) {
    this.items.set(key, {
      value: JSON.stringify(value),
      expiresAt: Date.now() + ttlSeconds * 1000
    });
    return 'OK';
  }

  setIfAbsent(key, value, ttlSeconds) {
    const existing = this.get(key);
    if (existing !== null) return false;

    this.items.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000
    });
    return true;
  }

  incrementWithTtl(key, ttlSeconds) {
    const current = Number(this.get(key) || 0) + 1;
    this.items.set(key, {
      value: String(current),
      expiresAt: Date.now() + ttlSeconds * 1000
    });
    return current;
  }

  delete(key) {
    return this.items.delete(key) ? 1 : 0;
  }
}

export const store = config.redisUrl ? new RedisStore(config.redisUrl) : new MemoryStore();
