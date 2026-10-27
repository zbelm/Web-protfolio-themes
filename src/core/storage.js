// localStorage can throw (private mode, blocked storage); never let that break the page.
export const store = {
  get(key) {
    try {
      return localStorage.getItem(`zd:${key}`);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(`zd:${key}`, value);
    } catch {
      /* ignore */
    }
  },
};

export const wait = (ms) => new Promise((r) => setTimeout(r, ms));
