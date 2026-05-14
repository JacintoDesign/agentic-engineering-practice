const { db } = require('../connection');

/**
 * @description Returns all project rows ordered by creation date descending.
 * @returns {object[]} Array of project row objects.
 */
function listProjects() {
  return db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
}

/**
 * @description Retrieves a single project row by its primary key.
 * @param {number} id - The project's primary key.
 * @returns {object|undefined} The project row, or undefined if not found.
 */
function findProjectById(id) {
  return db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
}

/**
 * @description Inserts a new project row and returns the full inserted row.
 * @param {string} name - The project name.
 * @param {string|null} description - Optional project description.
 * @param {number|null} owner_id - Optional owner user ID.
 * @returns {object} The newly inserted project row.
 */
function insertProject(name, description, owner_id) {
  const result = db.prepare(
    'INSERT INTO projects (name, description, owner_id) VALUES (?, ?, ?)'
  ).run(name, description || null, owner_id || null);
  return db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid);
}

/**
 * @description Updates a project row's fields and returns the updated row.
 * @param {number} id - The project's primary key.
 * @param {string} name - Updated project name.
 * @param {string|null} description - Updated project description.
 * @param {number|null} owner_id - Updated owner user ID.
 * @returns {object} The updated project row.
 */
function updateProject(id, name, description, owner_id) {
  db.prepare(
    'UPDATE projects SET name = ?, description = ?, owner_id = ? WHERE id = ?'
  ).run(name, description, owner_id, id);
  return db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
}

/**
 * @description Deletes a project row by ID and returns the SQLite run result.
 * @param {number} id - The project's primary key.
 * @returns {{ changes: number }} SQLite run result with the number of affected rows.
 */
function deleteProject(id) {
  return db.prepare('DELETE FROM projects WHERE id = ?').run(id);
}

/**
 * @description Aggregates task counts by status for a given project.
 * @param {number} projectId - The project's primary key.
 * @returns {{ total: number, active: number, completed: number, archived: number }} Task count breakdown.
 */
function getProjectStats(projectId) {
  const rows = db.prepare(
    'SELECT status, COUNT(*) as count FROM tasks WHERE project_id = ? GROUP BY status'
  ).all(projectId);
  const stats = { total: 0, active: 0, completed: 0, archived: 0 };
  for (const row of rows) {
    stats[row.status] = row.count;
    stats.total += row.count;
  }
  return stats;
}

/**
 * @description Returns all task rows belonging to a project ordered by creation date descending.
 * @param {number} projectId - The project's primary key.
 * @returns {object[]} Array of task row objects.
 */
function getTasksForProject(projectId) {
  return db.prepare(
    'SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC'
  ).all(projectId);
}

module.exports = { listProjects, findProjectById, insertProject, updateProject, deleteProject, getProjectStats, getTasksForProject };
