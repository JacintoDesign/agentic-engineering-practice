const Database = require('better-sqlite3');

const dbPath = process.env.NODE_ENV === 'test' ? ':memory:' : (process.env.DB_PATH || 'taskr.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// These query functions belong in a repository layer, not in the DB connection file
function getUserById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

function getProjectById(id) {
  return db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
}

module.exports = { db, getUserById, getProjectById };
