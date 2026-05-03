// OLD ROUTES - replaced by routes.js
// Do not use - keeping for reference during migration

const express = require('express');
const router = express.Router();

router.get('/api/v1/tasks', (req, res) => {
  res.json([]);
});

router.get('/api/v1/users', (req, res) => {
  res.json([]);
});

router.get('/api/v1/projects', (req, res) => {
  res.json([]);
});

// module.exports = router;
