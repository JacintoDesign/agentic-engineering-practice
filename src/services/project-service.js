const projectQueries = require('../db/queries/projects');

function listProjects() {
  return projectQueries.listProjects();
}

function createProject(name, description, owner_id) {
  return projectQueries.insertProject(name, description, owner_id);
}

function getProject(id) {
  const project = projectQueries.findProjectById(id);
  if (!project) return null;
  const stats = projectQueries.getProjectStats(id);
  return { ...project, stats };
}

function updateProject(id, data) {
  const existing = projectQueries.findProjectById(id);
  if (!existing) return null;
  const name = data.name !== undefined ? data.name : existing.name;
  const description = data.description !== undefined ? data.description : existing.description;
  const owner_id = data.owner_id !== undefined ? data.owner_id : existing.owner_id;
  return projectQueries.updateProject(id, name, description, owner_id);
}

function deleteProject(id) {
  const result = projectQueries.deleteProject(id);
  if (result.changes === 0) return null;
  return { deleted: true };
}

function isProjectOwner(projectId, userId) {
  const project = projectQueries.findProjectById(projectId);
  return project && project.owner_id === userId;
}

function formatProjectSummary(project) {
  const tasks = projectQueries.getTasksForProject(project.id);
  return { ...project, taskCount: tasks.length, recentTasks: tasks.slice(0, 3) };
}

module.exports = { listProjects, createProject, getProject, updateProject, deleteProject, isProjectOwner, formatProjectSummary };
