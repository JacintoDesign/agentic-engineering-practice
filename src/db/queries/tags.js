const { db } = require('../connection');

/**
 * @description Returns all tag rows sorted alphabetically by name.
 * @returns {object[]} Array of tag row objects.
 */
function listTags() {
  return db.prepare('SELECT * FROM tags ORDER BY name ASC').all();
}

/**
 * @description Retrieves a single tag row by its primary key.
 * @param {number} id - The tag's primary key.
 * @returns {object|undefined} The tag row, or undefined if not found.
 */
function findTagById(id) {
  return db.prepare('SELECT * FROM tags WHERE id = ?').get(id);
}

/**
 * @description Inserts a new tag row and returns the full inserted row.
 * @param {string} name - The tag name (should already be normalized).
 * @returns {object} The newly inserted tag row.
 */
function insertTag(name) {
  const result = db.prepare('INSERT INTO tags (name) VALUES (?)').run(name);
  return db.prepare('SELECT * FROM tags WHERE id = ?').get(result.lastInsertRowid);
}

/**
 * @description Creates a task-tag association record.
 * @param {number} taskId - The task's primary key.
 * @param {number} tagId - The tag's primary key.
 * @returns {{ changes: number }} SQLite run result.
 */
function insertTaskTag(taskId, tagId) {
  return db.prepare('INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)').run(taskId, tagId);
}

/**
 * @description Removes a task-tag association record and returns the SQLite run result.
 * @param {number} taskId - The task's primary key.
 * @param {number} tagId - The tag's primary key.
 * @returns {{ changes: number }} SQLite run result with the number of affected rows.
 */
function deleteTaskTag(taskId, tagId) {
  return db.prepare('DELETE FROM task_tags WHERE task_id = ? AND tag_id = ?').run(taskId, tagId);
}

module.exports = { listTags, findTagById, insertTag, insertTaskTag, deleteTaskTag };
