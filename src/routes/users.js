const express = require('express');
const router = express.Router();
const userService = require('../services/user-service');
const { authenticate } = require('../middleware/auth');
const { isNonEmptyString } = require('../utils');

router.get('/users', (req, res) => {
  try {
    res.json(userService.listUsers());
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
    const user = await userService.createUser(name, email);
    res.status(201).json(user);
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'email already exists' });
    }
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.get('/users/:id', (req, res) => {
  const user = userService.getUser(parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

router.put('/users/:id', async (req, res) => {
  try {
    const user = await userService.updateUser(parseInt(req.params.id), req.body);
    res.json(user);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.delete('/users/:id', authenticate, async (req, res) => {
  try {
    const result = await userService.deleteUser(parseInt(req.params.id));
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;
