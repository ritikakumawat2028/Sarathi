import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../data');

/**
 * Tiny file-backed JSON "collection" store.
 *
 * This project intentionally avoids a native-binary database (e.g. better-sqlite3)
 * so that `npm install` never fails due to missing build tools on the user's machine.
 * Each collection is a single JSON file: data/<name>.json = { "<id>": {...record}, ... }
 *
 * Swap this out for Postgres/Mongo/etc. in production — the controllers only talk to
 * the small async API below, so the storage engine can be replaced without touching them.
 */
export function createStore(name) {
  const filePath = path.join(DATA_DIR, `${name}.json`);

  function readAll() {
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, '{}', 'utf-8');
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    try {
      return JSON.parse(raw || '{}');
    } catch {
      return {};
    }
  }

  function writeAll(obj) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(obj, null, 2), 'utf-8');
  }

  return {
    all() {
      return Object.values(readAll());
    },
    get(id) {
      return readAll()[id] || null;
    },
    findOne(predicate) {
      return Object.values(readAll()).find(predicate) || null;
    },
    find(predicate) {
      return Object.values(readAll()).filter(predicate);
    },
    upsert(id, record) {
      const all = readAll();
      all[id] = { ...(all[id] || {}), ...record, id };
      writeAll(all);
      return all[id];
    },
    remove(id) {
      const all = readAll();
      delete all[id];
      writeAll(all);
    },
  };
}
