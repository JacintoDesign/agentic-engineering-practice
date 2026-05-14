const { db } = require('../connection');

/**
 * @description Returns all comments for a task joined with the commenter's name, ordered by creation date ascending.
 * @param {number} taskId - The task's primary key.
 * @returns {object[]} Array of comment rows with a user_name field.
 */
function getCommentsByTaskId(taskId) {
  return db.prepare(
    'SELECT c.*, u.name as user_name FROM comments c JOIN users u ON u.id = c.user_id WHERE c.task_id = ? ORDER BY c.created_at ASC'
  ).all(taskId);
}

/**
 * @description Inserts a new comment and returns the full inserted row joined with the commenter's name.
 * @param {number} taskId - The task's primary key.
 * @param {number} userId - The commenting user's primary key.
 * @param {string} body - The comment text.
 * @returns {object} The newly inserted comment row with a user_name field.
 */
function insertComment(taskId, userId, body) {
  const result = db.prepare(
    'INSERT INTO comments (task_id, user_id, body) VALUES (?, ?, ?)'
  ).run(taskId, userId, body);
  return db.prepare(
    'SELECT c.*, u.name as user_name FROM comments c JOIN users u ON u.id = c.user_id WHERE c.id = ?'
  ).get(result.lastInsertRowid);
}

module.exports = { getCommentsByTaskId, insertComment };
