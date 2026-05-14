const { db } = require('../connection');

/**
 * @description Queries tasks with optional filters for status, project, and assignee, plus pagination.
 * @param {{ status?: string, projectId?: number, assigneeId?: number, limit?: number, offset?: number }} [options={}] - Filter and pagination parameters.
 * @returns {object[]} Array of matching task row objects.
 */
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

/**
 * @description Retrieves a task by ID with embedded tags and comments arrays.
 * @param {number} id - The task's primary key.
 * @returns {object|null} The task row with tags and comments, or null if not found.
 */
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

/**
 * @description Retrieves a bare task row by ID without embedded associations.
 * @param {number} id - The task's primary key.
 * @returns {object|undefined} The task row, or undefined if not found.
 */
function findTaskById(id) {
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
}

/**
 * @description Inserts a new task row and returns the full inserted row.
 * @param {string} title - The task title.
 * @param {string|null} description - Optional task description.
 * @param {number|null} project_id - Optional project ID.
 * @param {number|null} assignee_id - Optional assignee user ID.
 * @param {string|null} due_date - Optional due date string.
 * @returns {object} The newly inserted task row.
 */
function insertTask(title, description, project_id, assignee_id, due_date) {
  const result = db.prepare(
    'INSERT INTO tasks (title, description, project_id, assignee_id, due_date) VALUES (?, ?, ?, ?, ?)'
  ).run(title, description || null, project_id || null, assignee_id || null, due_date || null);
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
}

/**
 * @description Updates all mutable fields of a task row and returns the updated row.
 * @param {number} id - The task's primary key.
 * @param {string} title - Updated title.
 * @param {string|null} description - Updated description.
 * @param {string} status - Updated status.
 * @param {number|null} project_id - Updated project ID.
 * @param {number|null} assignee_id - Updated assignee user ID.
 * @param {string|null} due_date - Updated due date.
 * @param {string|null} completed_at - Timestamp when the task was completed, or null.
 * @returns {object} The updated task row.
 */
function updateTask(id, title, description, status, project_id, assignee_id, due_date, completed_at) {
  db.prepare(
    'UPDATE tasks SET title=?, description=?, status=?, project_id=?, assignee_id=?, due_date=?, completed_at=? WHERE id=?'
  ).run(title, description, status, project_id, assignee_id, due_date, completed_at, id);
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
}

/**
 * @description Deletes a task row by ID and returns the SQLite run result.
 * @param {number} id - The task's primary key.
 * @returns {{ changes: number }} SQLite run result with the number of affected rows.
 */
function deleteTask(id) {
  return db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
}

module.exports = { getTasks, getTaskById, findTaskById, insertTask, updateTask, deleteTask };
