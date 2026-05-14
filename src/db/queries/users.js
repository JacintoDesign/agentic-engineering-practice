const { db } = require('../connection');

/**
 * @description Returns all users from the database ordered by creation date descending.
 * @returns {object[]} Array of user row objects.
 */
function listUsers() {
  return db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
}

/**
 * @description Retrieves a single user row by its primary key.
 * @param {number} id - The user's primary key.
 * @returns {object|undefined} The user row, or undefined if not found.
 */
function findUserById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

/**
 * @description Inserts a new user row and returns the full inserted row.
 * @param {string} name - The user's display name.
 * @param {string} email - The user's email address.
 * @returns {object} The newly inserted user row.
 */
function insertUser(name, email) {
  const result = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)').run(name, email);
  return db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
}

/**
 * @description Updates a user's name and email and returns the updated row.
 * @param {number} id - The user's primary key.
 * @param {string} name - New display name.
 * @param {string} email - New email address.
 * @returns {object} The updated user row.
 */
function updateUser(id, name, email) {
  db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?').run(name, email, id);
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

/**
 * @description Deletes a user row by ID and returns the SQLite run result.
 * @param {number} id - The user's primary key.
 * @returns {{ changes: number }} SQLite run result with the number of affected rows.
 */
function deleteUser(id) {
  return db.prepare('DELETE FROM users WHERE id = ?').run(id);
}

module.exports = { listUsers, findUserById, insertUser, updateUser, deleteUser };
