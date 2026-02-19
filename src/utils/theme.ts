interface TTLItem {
  value: string;
  expiry: number;
}

function isValidTTLItem(item: unknown): item is TTLItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    'value' in item &&
    'expiry' in item &&
    typeof (item as TTLItem).value === 'string' &&
    typeof (item as TTLItem).expiry === 'number'
  );
}

function setItemWithTTL(key: string, value: string, ttl: number): void {
  const now = new Date();
  const item: TTLItem = {
    value,
    expiry: now.getTime() + ttl,
  };
  localStorage.setItem(key, JSON.stringify(item));
}

function getItemWithTTL(key: string): string | null {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(itemStr);
  } catch (e) {
    console.error('Error parsing JSON from localStorage', e);
    localStorage.removeItem(key);
    return null;
  }

  // Validate the item has the expected structure
  if (!isValidTTLItem(parsed)) {
    console.warn('Invalid TTL item structure, removing:', key);
    localStorage.removeItem(key);
    return null;
  }

  // Check if expired
  if (Date.now() > parsed.expiry) {
    localStorage.removeItem(key);
    return null;
  }

  return parsed.value;
}

export { setItemWithTTL, getItemWithTTL };
