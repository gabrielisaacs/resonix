import { CACHE_DEFAULTS } from "../constants/config";

export class Cache {
  constructor(options = {}) {
    this.cache = new Map();
    this.ttl = options.ttl || CACHE_DEFAULTS.ttl;
    this.maxSize = options.maxSize || CACHE_DEFAULTS.maxSize;
    this.cleanupInterval =
      options.cleanupInterval || CACHE_DEFAULTS.cleanupInterval;
    this.debug = options.debug || CACHE_DEFAULTS.debug;

    // Start automatic cleanup
    this.startCleanup();
  }

  set(key, value) {
    this.log(`Setting cache for key: ${key}`);

    // Implement LRU by removing oldest entry if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
      this.log(`Cache full, removed oldest entry: ${oldestKey}`);
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      accessCount: 0,
      lastAccessed: null,
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) {
      this.log(`Cache miss for key: ${key}`);
      return null;
    }

    // Check if item has expired
    if (this.isExpired(item)) {
      this.log(`Cache entry expired for key: ${key}`);
      this.cache.delete(key);
      return null;
    }

    // Update access statistics
    item.accessCount++;
    item.lastAccessed = Date.now();
    this.log(`Cache hit for key: ${key} (accessed ${item.accessCount} times)`);

    return item.value;
  }

  isStale(key) {
    const item = this.cache.get(key);
    if (!item) return true;
    return this.isExpired(item);
  }

  isExpired(item) {
    return Date.now() - item.timestamp > this.ttl;
  }

  clear() {
    this.log("Clearing entire cache");
    this.cache.clear();
  }

  remove(key) {
    this.log(`Removing cache entry for key: ${key}`);
    return this.cache.delete(key);
  }

  size() {
    return this.cache.size;
  }

  getStats() {
    const stats = {
      size: this.cache.size,
      maxSize: this.maxSize,
      ttl: this.ttl,
      entries: {},
    };

    for (const [key, item] of this.cache.entries()) {
      stats.entries[key] = {
        age: Date.now() - item.timestamp,
        accessCount: item.accessCount,
        isExpired: this.isExpired(item),
        lastAccessed: item.lastAccessed,
      };
    }

    return stats;
  }

  startCleanup() {
    setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  cleanup() {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, item] of this.cache.entries()) {
      if (this.isExpired(item)) {
        this.cache.delete(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      this.log(`Cleanup removed ${removedCount} expired entries`);
    }
  }

  log(message) {
    const date = new Date().toLocaleDateString();
    if (this.debug) {
      console.log(`[Cache ${date}] ${message}`);
    }
  }
}

export const dataCache = new Cache();
