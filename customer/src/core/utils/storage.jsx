const memoryStore = new Map();

const storage = {
  set: (key, value) => {
    memoryStore.set(key, value);
  },

  get: (key) => {
    return memoryStore.get(key) ?? null;
  },

  remove: (key) => {
    memoryStore.delete(key);
  },

  clear: () => {
    memoryStore.clear();
  },
};

export default storage;
