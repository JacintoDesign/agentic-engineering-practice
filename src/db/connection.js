const Database = require('better-sqlite3');

const dbPath = process.env.NODE_ENV === 'test' ? ':memory:' : (process.env.DB_PATH || 'taskr.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

module.exports = { db };
