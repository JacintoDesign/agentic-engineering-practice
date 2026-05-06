const express = require('express');
const router = express.Router();
const tagService = require('../services/tag-service');
const { isNonEmptyString } = require('../utils');

router.get('/tags', (req, res) => {
  res.json(tagService.listTags());
});

router.post('/tags', (req, res) => {
  const { name } = req.body;
  if (!name || !isNonEmptyString(name)) {
    return res.status(400).json({ error: 'name is required' });
  }
  try {
    const tag = tagService.createTag(name);
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

  if (!tag_id) return res.status(400).json({ error: 'tag_id is required' });

  try {
    const result = tagService.addTagToTask(taskId, tag_id);
    if (result === null) return res.status(404).json({ error: 'Task not found' });
    res.status(201).json(result);
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'tag already applied to this task' });
    }
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.delete('/tasks/:id/tags/:tagId', (req, res) => {
  const taskId = parseInt(req.params.id);
  const tagId = parseInt(req.params.tagId);
  const result = tagService.removeTagFromTask(taskId, tagId);
  if (!result) return res.status(404).json({ error: 'Tag not applied to this task' });
  res.json(result);
});

module.exports = router;
