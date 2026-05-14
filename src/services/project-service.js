const projectQueries = require('../db/queries/projects');

/**
 * @description Returns all projects ordered by creation date descending.
 * @returns {object[]} Array of project records.
 */
function listProjects() {
  return projectQueries.listProjects();
}

/**
 * @description Creates and persists a new project.
 * @param {string} name - The project name.
 * @param {string|null} description - Optional project description.
 * @param {number|null} owner_id - Optional ID of the owning user.
 * @returns {object} The newly created project record.
 */
function createProject(name, description, owner_id) {
  return projectQueries.insertProject(name, description, owner_id);
}

/**
 * @description Retrieves a project by ID with embedded task statistics.
 * @param {number} id - The project's ID.
 * @returns {object|null} The project with a stats object, or null if not found.
 */
function getProject(id) {
  const project = projectQueries.findProjectById(id);
  if (!project) return null;
  const stats = projectQueries.getProjectStats(id);
  return { ...project, stats };
}

/**
 * @description Updates an existing project's fields; returns null if the project does not exist.
 * @param {number} id - The ID of the project to update.
 * @param {{ name?: string, description?: string, owner_id?: number }} data - Fields to update.
 * @returns {object|null} The updated project record, or null if not found.
 */
function updateProject(id, data) {
  const existing = projectQueries.findProjectById(id);
  if (!existing) return null;
  const name = data.name !== undefined ? data.name : existing.name;
  const description = data.description !== undefined ? data.description : existing.description;
  const owner_id = data.owner_id !== undefined ? data.owner_id : existing.owner_id;
  return projectQueries.updateProject(id, name, description, owner_id);
}

/**
 * @description Deletes a project by ID; returns null if the project does not exist.
 * @param {number} id - The ID of the project to delete.
 * @returns {{ deleted: boolean }|null} Confirmation object, or null if not found.
 */
function deleteProject(id) {
  const result = projectQueries.deleteProject(id);
  if (result.changes === 0) return null;
  return { deleted: true };
}

/**
 * @description Checks whether a user is the owner of a given project.
 * @param {number} projectId - The project's ID.
 * @param {number} userId - The user ID to check against the project owner.
 * @returns {boolean} True if the project exists and its owner_id matches userId.
 */
function isProjectOwner(projectId, userId) {
  const project = projectQueries.findProjectById(projectId);
  return project && project.owner_id === userId;
}

/**
 * @description Builds a project summary with a task count and the three most recent tasks.
 * @param {object} project - A project record object with at least an id property.
 * @returns {object} The project with taskCount and recentTasks fields appended.
 */
function formatProjectSummary(project) {
  const tasks = projectQueries.getTasksForProject(project.id);
  return { ...project, taskCount: tasks.length, recentTasks: tasks.slice(0, 3) };
}

module.exports = { listProjects, createProject, getProject, updateProject, deleteProject, isProjectOwner, formatProjectSummary };
