const commentQueries = require('../db/queries/comments');
const taskQueries = require('../db/queries/tasks');
const userQueries = require('../db/queries/users');

function listComments(taskId) {
  const task = taskQueries.findTaskById(taskId);
  if (!task) return null;
  return commentQueries.getCommentsByTaskId(taskId);
}

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
