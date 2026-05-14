const commentQueries = require('../db/queries/comments');
const taskQueries = require('../db/queries/tasks');
const userQueries = require('../db/queries/users');

/**
 * @description Returns all comments for a task; returns null if the task does not exist.
 * @param {number} taskId - The ID of the task whose comments to retrieve.
 * @returns {object[]|null} Array of comment records, or null if the task was not found.
 */
function listComments(taskId) {
  const task = taskQueries.findTaskById(taskId);
  if (!task) return null;
  return commentQueries.getCommentsByTaskId(taskId);
}

/**
 * @description Creates a comment on a task for a given user; throws 400 if the user is not found.
 * @param {number} taskId - The ID of the task to comment on.
 * @param {number|string} userId - The ID of the commenting user.
 * @param {string} body - The comment text.
 * @returns {object|null} The newly created comment record, or null if the task was not found.
 */
function createComment(taskId, userId, body) {
  const task = taskQueries.findTaskById(taskId);
  if (!task) return null;
  const user = userQueries.findUserById(parseInt(userId));
  if (!user) {
    const err = new Error('user not found');
    err.status = 400;
    throw err;
  }
  return commentQueries.insertComment(taskId, parseInt(userId), body);
}

module.exports = { listComments, createComment };
