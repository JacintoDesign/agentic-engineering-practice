/*
 * routes.js
 *
 * All API routes for Taskr. This file handles users, projects, tasks, comments,
 * and tags. Route handlers query the database directly — there is no service
 * layer. Validation is inline in each handler. This file is long by design.
 *
 * TODO: split into separate route files per resource
 * TODO: extract database queries into a repository layer
 * TODO: extract validation into shared middleware
 */

const express = require('express');
const router = express.Router();
const { db } = require('./DB');
const { authenticate } = require('./auth');
const UserController = require('./UserController');
const { getTasks, getTaskById } = require('./get-tasks');
const { validateEmail, isNonEmptyString } = require('./utils');
const { VALID_TASK_STATUSES } = require('./misc/constants');

// ─── Health ──────────────────────────────────────────────────────────────────

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Users ───────────────────────────────────────────────────────────────────
//
// User routes delegate to UserController, which is inconsistent with every
// other resource that uses inline DB queries. This was added later when someone
// started extracting logic but only did it for users.

router.get('/users', (req, res) => {
  try {
    const users = UserController.listUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/users', async (req, res) => {
  const { name, email } = req.body;
  if (!name || !isNonEmptyString(name)) {
    return res.status(400).json({ error: 'name is required' });
  }
  if (!email || !isNonEmptyString(email)) {
    return res.status(400).json({ error: 'email is required' });
  }
  try {
    const user = await UserController.createUser(name, email);
    res.status(201).json(user);
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'email already exists' });
    }
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.get('/users/:id', (req, res) => {
  const user = UserController.getUserById(parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

router.put('/users/:id', async (req, res) => {
  try {
    const user = await UserController.updateUser(parseInt(req.params.id), req.body);
    res.json(user);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.delete('/users/:id', authenticate, async (req, res) => {
  try {
    const result = await UserController.deleteUser(parseInt(req.params.id));
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// ─── Projects ────────────────────────────────────────────────────────────────

router.get('/projects', (req, res) => {
  const projects = db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
  res.json(projects);
});

router.post('/projects', (req, res) => {
  const { name, description, owner_id } = req.body;
  if (!name || !isNonEmptyString(name)) {
    return res.status(400).json({ error: 'name is required' });
  }
  const result = db.prepare(
    'INSERT INTO projects (name, description, owner_id) VALUES (?, ?, ?)'
  ).run(name, description || null, owner_id || null);
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(project);
});

router.get('/projects/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  // Lazy require to avoid circular dependency at module load time
  const { getProjectStats } = require('./projectHelpers');
  const stats = getProjectStats(id);
  res.json({ ...project, stats });
});

router.put('/projects/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Project not found' });

  const name = req.body.name !== undefined ? req.body.name : existing.name;
  const description = req.body.description !== undefined ? req.body.description : existing.description;
  const owner_id = req.body.owner_id !== undefined ? req.body.owner_id : existing.owner_id;

  db.prepare(
    'UPDATE projects SET name = ?, description = ?, owner_id = ? WHERE id = ?'
  ).run(name, description, owner_id, id);
  const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  res.json(updated);
});

router.delete('/projects/:id', authenticate, (req, res) => {
  const id = parseInt(req.params.id);
  const result = db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  if (result.changes === 0) return res.status(404).json({ error: 'Project not found' });
  res.json({ deleted: true });
});

// ─── Tasks ────────────────────────────────────────────────────────────────────

router.get('/tasks', (req, res) => {
  const { status, project_id, assignee_id, page, page_size } = req.query;

  if (status && !VALID_TASK_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_TASK_STATUSES.join(', ')}` });
  }

  const limit = Math.min(100, parseInt(page_size) || 20);
  const offset = ((parseInt(page) || 1) - 1) * limit;

  const tasks = getTasks({
    status: status || undefined,
    projectId: project_id ? parseInt(project_id) : undefined,
    assigneeId: assignee_id ? parseInt(assignee_id) : undefined,
    limit,
    offset
  });
  res.json(tasks);
});

router.post('/tasks', (req, res) => {
  const { title, description, project_id, assignee_id, due_date } = req.body;
  if (!title || !isNonEmptyString(title)) {
    return res.status(400).json({ error: 'title is required' });
  }
  if (project_id) {
    const project = db.prepare('SELECT id FROM projects WHERE id = ?').get(parseInt(project_id));
    if (!project) return res.status(400).json({ error: 'project not found' });
  }
  if (assignee_id) {
    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(parseInt(assignee_id));
    if (!user) return res.status(400).json({ error: 'assignee not found' });
  }
  const result = db.prepare(
    'INSERT INTO tasks (title, description, project_id, assignee_id, due_date) VALUES (?, ?, ?, ?, ?)'
  ).run(
    title,
    description || null,
    project_id ? parseInt(project_id) : null,
    assignee_id ? parseInt(assignee_id) : null,
    due_date || null
  );
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(task);
});

router.get('/tasks/:id', (req, res) => {
  const task = getTaskById(parseInt(req.params.id));
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

router.put('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Task not found' });

  const { title, description, status, project_id, assignee_id, due_date } = req.body;

  if (status && !VALID_TASK_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_TASK_STATUSES.join(', ')}` });
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

  db.prepare(
    'UPDATE tasks SET title=?, description=?, status=?, project_id=?, assignee_id=?, due_date=?, completed_at=? WHERE id=?'
  ).run(updatedTitle, updatedDesc, updatedStatus, updatedProject, updatedAssignee, updatedDue, completedAt, id);

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  res.json(task);
});

router.delete('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  if (result.changes === 0) return res.status(404).json({ error: 'Task not found' });
  res.json({ deleted: true });
});

// ─── Comments ────────────────────────────────────────────────────────────────

router.get('/tasks/:id/comments', (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = db.prepare('SELECT id FROM tasks WHERE id = ?').get(taskId);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const comments = db.prepare(
    'SELECT c.*, u.name as user_name FROM comments c JOIN users u ON u.id = c.user_id WHERE c.task_id = ? ORDER BY c.created_at ASC'
  ).all(taskId);
  res.json(comments);
});

router.post('/tasks/:id/comments', (req, res) => {
  const taskId = parseInt(req.params.id);
  const { user_id, body } = req.body;

  const task = db.prepare('SELECT id FROM tasks WHERE id = ?').get(taskId);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  if (!body || !isNonEmptyString(body)) {
    return res.status(400).json({ error: 'body is required' });
  }
  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' });
  }
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(parseInt(user_id));
  if (!user) return res.status(400).json({ error: 'user not found' });

  const result = db.prepare(
    'INSERT INTO comments (task_id, user_id, body) VALUES (?, ?, ?)'
  ).run(taskId, parseInt(user_id), body);
  const comment = db.prepare(
    'SELECT c.*, u.name as user_name FROM comments c JOIN users u ON u.id = c.user_id WHERE c.id = ?'
  ).get(result.lastInsertRowid);
  res.status(201).json(comment);
});

// ─── Tags ─────────────────────────────────────────────────────────────────────

router.get('/tags', (req, res) => {
  const tags = db.prepare('SELECT * FROM tags ORDER BY name ASC').all();
  res.json(tags);
});

router.post('/tags', (req, res) => {
  const { name } = req.body;
  if (!name || !isNonEmptyString(name)) {
    return res.status(400).json({ error: 'name is required' });
  }
  try {
    const result = db.prepare('INSERT INTO tags (name) VALUES (?)').run(name.toLowerCase().trim());
    const tag = db.prepare('SELECT * FROM tags WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(tag);
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'tag already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

router.post('/tasks/:id/tags', (req, res) => {
  const taskId = parseInt(req.params.id);
  const { tag_id } = req.body;

  const task = db.prepare('SELECT id FROM tasks WHERE id = ?').get(taskId);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  if (!tag_id) return res.status(400).json({ error: 'tag_id is required' });
  const tag = db.prepare('SELECT * FROM tags WHERE id = ?').get(parseInt(tag_id));
  if (!tag) return res.status(404).json({ error: 'Tag not found' });

  try {
    db.prepare('INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)').run(taskId, parseInt(tag_id));
    res.status(201).json({ task_id: taskId, tag_id: parseInt(tag_id) });
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'tag already applied to this task' });
    }
    res.status(500).json({ error: err.message });
  }
});

router.delete('/tasks/:id/tags/:tagId', (req, res) => {
  const taskId = parseInt(req.params.id);
  const tagId = parseInt(req.params.tagId);
  const result = db.prepare(
    'DELETE FROM task_tags WHERE task_id = ? AND tag_id = ?'
  ).run(taskId, tagId);
  if (result.changes === 0) return res.status(404).json({ error: 'Tag not applied to this task' });
  res.json({ deleted: true });
});

// ─── Helper exported for projectHelpers.js (creates circular dep risk) ────────

function getTasksForProject(projectId) {
  return db.prepare('SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC').all(projectId);
}

module.exports = router;
module.exports.getTasksForProject = getTasksForProject;
