const express = require('express');
const { PORT } = require('./misc/constants');
const router = require('./routes');
const { requestLogger, errorHandler } = require('./middleware');

const app = express();

app.use(express.json());
app.use(requestLogger);

// These routes were defined here directly and never moved to routes.js
app.get('/', (req, res) => {
  res.json({ name: 'Taskr API', version: '1.0.0', docs: '/health' });
});

app.post('/webhooks/task-update', (req, res) => {
  // TODO: process webhook payload
  console.log('[WEBHOOK] Received:', req.body);
  res.json({ received: true });
});

app.use(router);
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Taskr API running on port ${PORT}`);
  });
}

module.exports = app;
