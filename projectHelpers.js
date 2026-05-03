const { db } = require('./DB');

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

function formatProjectSummary(project) {
  // This import creates a circular dependency: projectHelpers -> routes -> projectHelpers
  // Safe at runtime because this function is only called after both modules are loaded
  const { getTasksForProject } = require('./routes');
  const tasks = getTasksForProject(project.id);
  return {
    ...project,
    taskCount: tasks.length,
    recentTasks: tasks.slice(0, 3)
  };
}

function isProjectOwner(projectId, userId) {
  const project = db.prepare('SELECT owner_id FROM projects WHERE id = ?').get(projectId);
  return project && project.owner_id === userId;
}

module.exports = { getProjectStats, formatProjectSummary, isProjectOwner };
