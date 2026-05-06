const taskQueries = require('../db/queries/tasks');
const projectQueries = require('../db/queries/projects');
const userQueries = require('../db/queries/users');
const { VALID_TASK_STATUSES } = require('../utils/constants');

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

function getTask(id) {
  return taskQueries.getTaskById(id);
}

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

function deleteTask(id) {
  const result = taskQueries.deleteTask(id);
  if (result.changes === 0) return null;
  return { deleted: true };
}

module.exports = { listTasks, createTask, getTask, updateTask, deleteTask };
