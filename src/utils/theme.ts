
function setItemWithTTL(key: any, value: any, ttl: any) {
    const now = new Date();
    const item = {
        value: value,
        expiry: now.getTime() + ttl,
    };
    localStorage.setItem(key, JSON.stringify(item));
}
  
function getItemWithTTL(key:any) {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) {
      return null;
    }
    let item;
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

export {setItemWithTTL, getItemWithTTL};
