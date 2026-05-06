const express = require('express');
const router = express.Router();
const taskService = require('../services/task-service');
const { isNonEmptyString } = require('../utils');

router.get('/tasks', (req, res) => {
  try {
    res.json(taskService.listTasks(req.query));
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.post('/tasks', (req, res) => {
  const { title } = req.body;
  if (!title || !isNonEmptyString(title)) {
    return res.status(400).json({ error: 'title is required' });
  }
  try {
    const task = taskService.createTask(req.body);
    res.status(201).json(task);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.get('/tasks/:id', (req, res) => {
  const task = taskService.getTask(parseInt(req.params.id));
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

router.put('/tasks/:id', (req, res) => {
  try {
    const task = taskService.updateTask(parseInt(req.params.id), req.body);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.delete('/tasks/:id', (req, res) => {
  const result = taskService.deleteTask(parseInt(req.params.id));
  if (!result) return res.status(404).json({ error: 'Task not found' });
  res.json(result);
});

module.exports = router;
