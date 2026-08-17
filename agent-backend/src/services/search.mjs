import { config } from '../config.mjs';

const DUCKDUCKGO_URL = 'https://api.duckduckgo.com/';
const WIKIPEDIA_API_URL = 'https://en.wikipedia.org/w/api.php';
const WIKIPEDIA_SUMMARY_URL = 'https://en.wikipedia.org/api/rest_v1/page/summary/';
const MAX_QUERY_LENGTH = 300;
const MAX_RESULTS = 5;

function cleanText(value, maxLength = 600) {
  if (typeof value !== 'string') return '';
  const text = value.replace(/\s+/g, ' ').trim();
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

function flattenRelatedTopics(topics = []) {
  return topics.flatMap(topic => {
    if (Array.isArray(topic.Topics)) return flattenRelatedTopics(topic.Topics);
    if (!topic.Text && !topic.FirstURL) return [];
    return [{
      title: cleanText(topic.Text, 180),
      snippet: cleanText(topic.Text),
      url: topic.FirstURL || ''
    }];
  });
}

function normalizeResults(data) {
  const directResults = Array.isArray(data.Results)
    ? data.Results.map(result => ({
      title: cleanText(result.Text, 180),
      snippet: cleanText(result.Text),
      url: result.FirstURL || ''
    }))
    : [];

  const relatedResults = flattenRelatedTopics(data.RelatedTopics);
  const seen = new Set();

  return [...directResults, ...relatedResults]
    .filter(result => result.title || result.snippet || result.url)
    .filter(result => {
      const key = result.url || result.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, MAX_RESULTS);
}

async function fetchJson(url, { errorPrefix, headers = {} }) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'BotfolioAgent/0.1 (portfolio chatbot)',
      ...headers
    }
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    const detail = errorBody ? `: ${errorBody.slice(0, 500)}` : '';
    throw new Error(`${errorPrefix} failed with status ${response.status}${detail}`);
  }

  return response.json();
}

async function searchDuckDuckGo(normalizedQuery) {
  const url = new URL(DUCKDUCKGO_URL);
  url.searchParams.set('q', normalizedQuery);
  url.searchParams.set('format', 'json');
  url.searchParams.set('no_html', '1');
  url.searchParams.set('skip_disambig', '1');

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'BotfolioAgent/0.1'
    }
  });

  if (!response.ok) {
    throw new Error(`DuckDuckGo search request failed with status ${response.status}`);
  }

  const data = await response.json();
  const answer = cleanText(data.Answer || data.AbstractText);
  const results = normalizeResults(data);

  return {
    provider: 'duckduckgo',
    query: normalizedQuery,
    found: Boolean(answer || results.length),
    answer,
    source: cleanText(data.AbstractSource, 120),
    sourceUrl: data.AbstractURL || '',
    results
  };
}

async function getWikipediaSummary(title) {
  if (!title) return null;
  try {
    const url = `${WIKIPEDIA_SUMMARY_URL}${encodeURIComponent(title)}`;
    return await fetchJson(url, { errorPrefix: 'Wikipedia summary request' });
  } catch {
    return null;
  }
}

async function searchWikimedia(normalizedQuery) {
  const url = new URL(WIKIPEDIA_API_URL);
  url.searchParams.set('action', 'query');
  url.searchParams.set('format', 'json');
  url.searchParams.set('origin', '*');
  url.searchParams.set('list', 'search');
  url.searchParams.set('srsearch', normalizedQuery);
  url.searchParams.set('srlimit', String(MAX_RESULTS));

  const data = await fetchJson(url, { errorPrefix: 'Wikimedia search request' });
  const searchResults = Array.isArray(data.query?.search) ? data.query.search : [];
  const summary = await getWikipediaSummary(searchResults[0]?.title);

  const results = searchResults
    .map(result => ({
      title: cleanText(result.title, 180),
      snippet: cleanText(result.snippet?.replace(/<[^>]*>/g, '')),
      url: result.title
        ? `https://en.wikipedia.org/wiki/${encodeURIComponent(result.title.replace(/\s+/g, '_'))}`
        : ''
    }))
    .filter(result => result.title || result.snippet || result.url)
    .slice(0, MAX_RESULTS);

  const answer = cleanText(summary?.extract);

  return {
    provider: 'wikimedia',
    query: normalizedQuery,
    found: Boolean(answer || results.length),
    answer,
    source: summary?.title ? 'Wikipedia' : 'Wikimedia',
    sourceUrl: summary?.content_urls?.desktop?.page || results[0]?.url || '',
    results
  };
}

export async function searchWeb({ query }) {
  const normalizedQuery = cleanText(query, MAX_QUERY_LENGTH);
  if (!normalizedQuery) {
    throw new Error('Search query is required.');
  }

  if (config.searchProvider === 'wikimedia') {
    const wikimediaResult = await searchWikimedia(normalizedQuery);
    if (wikimediaResult.found) return wikimediaResult;
    return searchDuckDuckGo(normalizedQuery);
  }
  if (config.searchProvider === 'duckduckgo') return searchDuckDuckGo(normalizedQuery);

  throw new Error(`Unsupported SEARCH_PROVIDER: ${config.searchProvider}`);
}
