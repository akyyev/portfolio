import fs from 'node:fs/promises';
import path from 'node:path';
import { config, embeddingConfig } from '../config.mjs';

function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  if (!magA || !magB) return 0;
  return dot / (magA * magB);
}

function findRelevantChunks(queryEmbedding, embeddedChunks, { topK = 5, minScore = 0.15 } = {}) {
  return embeddedChunks
    .map(chunk => ({
      text: chunk.text,
      score: cosineSimilarity(queryEmbedding, chunk.embedding)
    }))
    .filter(chunk => chunk.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

async function getEmbedding(text) {
  const provider = config.modelProvider;
  const providerConfig = embeddingConfig[provider];
  if (!providerConfig?.token) {
    throw new Error(`Missing embedding token for provider: ${provider}`);
  }

  const body = provider === 'openai'
    ? { input: text, model: providerConfig.model }
    : { inputs: text };

  const response = await fetch(providerConfig.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${providerConfig.token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`Embedding request failed with status ${response.status}`);
  }

  const result = await response.json();
  return provider === 'openai' ? result.data[0].embedding : result;
}

export async function getPortfolioContext({ latestMessage, summary = '' }) {
  try {
    const query = [summary, latestMessage].filter(Boolean).join('\n\n');
    const embedding = await getEmbedding(query);
    const embeddingsPath = path.join(config.knowledgeDir, `tm_embeddings_${config.modelProvider}.json`);
    const embeddedChunks = JSON.parse(await fs.readFile(embeddingsPath, 'utf8'));
    const chunks = findRelevantChunks(embedding, embeddedChunks);

    if (!chunks.length) {
      return '';
    }

    return chunks
      .map((chunk, index) => `[portfolio-${index + 1}]\n${chunk.text}`)
      .join('\n\n');
  } catch (error) {
    console.warn('RAG failed, using full profile fallback:', error.message);
    return fs.readFile(path.join(config.knowledgeDir, 'tm.txt'), 'utf8');
  }
}
