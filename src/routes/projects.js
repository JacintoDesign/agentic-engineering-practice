const express = require('express');
const router = express.Router();
const projectService = require('../services/project-service');
const { authenticate } = require('../middleware/auth');
const { isNonEmptyString } = require('../utils');

router.get('/projects', (req, res) => {
  res.json(projectService.listProjects());
});

router.post('/projects', (req, res) => {
  const { name, description, owner_id } = req.body;
  if (!name || !isNonEmptyString(name)) {
    return res.status(400).json({ error: 'name is required' });
  }
  const project = projectService.createProject(name, description, owner_id);
  res.status(201).json(project);
});

router.get('/projects/:id', (req, res) => {
  const project = projectService.getProject(parseInt(req.params.id));
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

router.put('/projects/:id', (req, res) => {
  const project = projectService.updateProject(parseInt(req.params.id), req.body);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

router.delete('/projects/:id', authenticate, (req, res) => {
  const result = projectService.deleteProject(parseInt(req.params.id));
  if (!result) return res.status(404).json({ error: 'Project not found' });
  res.json(result);
});

module.exports = router;
