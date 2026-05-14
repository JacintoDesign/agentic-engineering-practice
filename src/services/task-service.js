const taskQueries = require('../db/queries/tasks');
const projectQueries = require('../db/queries/projects');
const userQueries = require('../db/queries/users');
const { VALID_TASK_STATUSES } = require('../utils/constants');

/**
 * @description Returns a paginated list of tasks, optionally filtered by status, project, or assignee.
 * @param {{ status?: string, project_id?: string|number, assignee_id?: string|number, page?: string|number, page_size?: string|number }} [options={}] - Query and pagination options.
 * @returns {object[]} Array of task records matching the filters.
 */
function listTasks({ status, project_id, assignee_id, page, page_size } = {}) {
  if (status && !VALID_TASK_STATUSES.includes(status)) {
    const err = new Error(`status must be one of: ${VALID_TASK_STATUSES.join(', ')}`);
    err.status = 400;
    throw err;
  }
  const limit = Math.min(100, parseInt(page_size) || 20);
  const offset = ((parseInt(page) || 1) - 1) * limit;
  return taskQueries.getTasks({
    status: status || undefined,
    projectId: project_id ? parseInt(project_id) : undefined,
    assigneeId: assignee_id ? parseInt(assignee_id) : undefined,
    limit,
    offset
  });
}

/**
 * @description Creates a new task after validating that the referenced project and assignee exist.
 * @param {{ title: string, description?: string, project_id?: number|string, assignee_id?: number|string, due_date?: string }} taskData - Task fields.
 * @returns {object} The newly created task record.
 */
function createTask({ title, description, project_id, assignee_id, due_date }) {
  if (project_id) {
    const project = projectQueries.findProjectById(parseInt(project_id));
    if (!project) {
      const err = new Error('project not found');
      err.status = 400;
      throw err;
    }
  }
  if (assignee_id) {
    const user = userQueries.findUserById(parseInt(assignee_id));
    if (!user) {
      const err = new Error('assignee not found');
      err.status = 400;
      throw err;
    }
  }
  return taskQueries.insertTask(
    title,
    description,
    project_id ? parseInt(project_id) : null,
    assignee_id ? parseInt(assignee_id) : null,
    due_date || null
  );
}

/**
 * @description Retrieves a single task by ID with embedded tags and comments.
 * @param {number} id - The task's ID.
 * @returns {object|null} The task record with tags and comments arrays, or null if not found.
 */
function getTask(id) {
  return taskQueries.getTaskById(id);
}

/**
 * @description Updates an existing task's fields; returns null if the task does not exist.
 * @param {number} id - The ID of the task to update.
 * @param {{ title?: string, description?: string, status?: string, project_id?: number, assignee_id?: number, due_date?: string }} data - Fields to update.
 * @returns {object|null} The updated task record, or null if not found.
 */
function updateTask(id, data) {
  const existing = taskQueries.findTaskById(id);
  if (!existing) return null;

  const { title, description, status, project_id, assignee_id, due_date } = data;

  if (status && !VALID_TASK_STATUSES.includes(status)) {
    const err = new Error(`status must be one of: ${VALID_TASK_STATUSES.join(', ')}`);
    err.status = 400;
    throw err;
  }

  const updatedTitle = title !== undefined ? title : existing.title;
  const updatedDesc = description !== undefined ? description : existing.description;
  const updatedStatus = status !== undefined ? status : existing.status;
  const updatedProject = project_id !== undefined ? project_id : existing.project_id;
  const updatedAssignee = assignee_id !== undefined ? assignee_id : existing.assignee_id;
  const updatedDue = due_date !== undefined ? due_date : existing.due_date;
  const completedAt = updatedStatus === 'completed' && existing.status !== 'completed'
    ? new Date().toISOString()
    : (updatedStatus !== 'completed' ? null : existing.completed_at);

  return taskQueries.updateTask(id, updatedTitle, updatedDesc, updatedStatus, updatedProject, updatedAssignee, updatedDue, completedAt);
}

/**
 * @description Deletes a task by ID; returns null if the task does not exist.
 * @param {number} id - The ID of the task to delete.
 * @returns {{ deleted: boolean }|null} Confirmation object, or null if not found.
 */
function deleteTask(id) {
  const result = taskQueries.deleteTask(id);
  if (result.changes === 0) return null;
  return { deleted: true };
}

module.exports = { listTasks, createTask, getTask, updateTask, deleteTask };
