interface TTLItem {
  value: string;
  expiry: number;
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
  let item: TTLItem;
  try {
    item = JSON.parse(itemStr);
  } catch (e) {
    console.error('Error parsing JSON from localStorage', e);
    localStorage.removeItem(key);
    return null;
  }
  if (new Date().getTime() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }
  return item.value;
}

export { setItemWithTTL, getItemWithTTL };
