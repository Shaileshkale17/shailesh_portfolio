// Reads/writes auth data to either localStorage (persists across browser
// restarts — "Remember me" checked) or sessionStorage (cleared when the tab
// closes — "Remember me" unchecked). Reads check both so an existing
// session keeps working regardless of which one it was written to.

export const getStored = (key) => localStorage.getItem(key) || sessionStorage.getItem(key);

export const setStored = (key, value, persist) => {
  clearStored(key);
  (persist ? localStorage : sessionStorage).setItem(key, value);
};

export const clearStored = (key) => {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
};
