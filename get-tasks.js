const { db } = require('./DB');

function getTasks({ status, projectId, assigneeId, limit = 20, offset = 0 } = {}) {
  let query = 'SELECT * FROM tasks';
  const conditions = [];
  const params = [];

  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }
  if (projectId) {
    conditions.push('project_id = ?');
    params.push(projectId);
  }
  if (assigneeId) {
    conditions.push('assignee_id = ?');
    params.push(assigneeId);
  }
  if (conditions.length) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  return db.prepare(query).all(params);
}

function getTaskById(id) {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!task) return null;
  task.tags = db.prepare(
    'SELECT t.* FROM tags t JOIN task_tags tt ON tt.tag_id = t.id WHERE tt.task_id = ?'
  ).all(id);
  task.comments = db.prepare(
    'SELECT c.*, u.name as user_name FROM comments c JOIN users u ON u.id = c.user_id WHERE c.task_id = ? ORDER BY c.created_at ASC'
  ).all(id);
  return task;
}

module.exports = { getTasks, getTaskById };
