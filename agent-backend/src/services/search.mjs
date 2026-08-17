const DUCKDUCKGO_URL = 'https://api.duckduckgo.com/';
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

export async function searchWeb({ query }) {
  const normalizedQuery = cleanText(query, MAX_QUERY_LENGTH);
  if (!normalizedQuery) {
    throw new Error('Search query is required.');
  }

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
    throw new Error(`Search request failed with status ${response.status}`);
  }

  const data = await response.json();
  return {
    query: normalizedQuery,
    answer: cleanText(data.Answer || data.AbstractText),
    source: cleanText(data.AbstractSource, 120),
    sourceUrl: data.AbstractURL || '',
    results: normalizeResults(data)
  };
}
