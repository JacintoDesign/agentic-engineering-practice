const express = require('express');
const router = express.Router();
const commentService = require('../services/comment-service');
const { isNonEmptyString } = require('../utils');

router.get('/tasks/:id/comments', (req, res) => {
  const taskId = parseInt(req.params.id);
  const comments = commentService.listComments(taskId);
  if (comments === null) return res.status(404).json({ error: 'Task not found' });
  res.json(comments);
});

router.post('/tasks/:id/comments', (req, res) => {
  const taskId = parseInt(req.params.id);
  const { user_id, body } = req.body;

  if (!body || !isNonEmptyString(body)) {
    return res.status(400).json({ error: 'body is required' });
  }
  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' });
  }

  try {
    const comment = commentService.createComment(taskId, user_id, body);
    if (comment === null) return res.status(404).json({ error: 'Task not found' });
    res.status(201).json(comment);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;
