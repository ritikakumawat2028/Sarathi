import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import NodeCache from 'node-cache';
import { config } from '../config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_FILE = path.resolve(__dirname, '../data/cache/schemes-cache.json');

// In-memory cache for hot reads within a running process...
const memCache = new NodeCache({ stdTTL: config.schemesCacheTtlSeconds, checkperiod: 120 });

// ...backed by a JSON file so the cache survives restarts (and so the API keeps serving
// the last good data if the process restarts right after a live source outage).
export function readDiskCache() {
  try {
    if (!fs.existsSync(CACHE_FILE)) return null;
    const raw = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    return raw;
  } catch {
    return null;
  }
}

export function writeDiskCache(payload) {
  fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
  fs.writeFileSync(
    CACHE_FILE,
    JSON.stringify({ ...payload, cachedAt: new Date().toISOString() }, null, 2),
    'utf-8'
  );
}

export function getMem(key) {
  return memCache.get(key);
}

export function setMem(key, value) {
  memCache.set(key, value);
}
