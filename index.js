const express = require('express');
const { PORT } = require('./src/utils/constants');
const { requestLogger, errorHandler } = require('./src/middleware');
const healthRouter = require('./src/routes/health');
const usersRouter = require('./src/routes/users');
const projectsRouter = require('./src/routes/projects');
const tasksRouter = require('./src/routes/tasks');
const commentsRouter = require('./src/routes/comments');
const tagsRouter = require('./src/routes/tags');

const app = express();

app.use(express.json());
app.use(requestLogger);

app.get('/', (req, res) => {
  res.json({ name: 'Taskr API', version: '1.0.0', docs: '/health' });
});

app.post('/webhooks/task-update', (req, res) => {
  console.log('[WEBHOOK] Received:', req.body);
  res.json({ received: true });
});

app.use(healthRouter);
app.use(usersRouter);
app.use(projectsRouter);
app.use(tasksRouter);
app.use(commentsRouter);
app.use(tagsRouter);
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Taskr API running on port ${PORT}`);
  });
}

module.exports = app;
