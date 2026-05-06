# API Conventions — Adding a New Endpoint

Follow these conventions when adding any new route to the Taskr API.

## Route file

Create a dedicated file at `src/routes/<resource>.js` where `<resource>` is the lowercase plural name of the resource (e.g. `src/routes/tasks.js`, `src/routes/comments.js`).

Each route file must export a named Express router:

```js
const { Router } = require('express');
const router = Router();

// route definitions...

module.exports = { router };
```

## Handler structure

Route handlers must not contain business logic. Each handler should call a corresponding function from `src/services/<resource>.js` and return the result:

```js
const tasksService = require('../services/tasks');

router.get('/', async (req, res, next) => {
  try {
    const tasks = await tasksService.listTasks(req.query);
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});
```

All logic — DB queries, validation, side effects — belongs in the service function, not the handler.

## Error handling

Pass errors to Express's `next` with a `status` property and a `message` string. The global error handler in `middleware.js` will forward these to the client:

```js
const err = new Error('Task not found');
err.status = 404;
next(err);
```

## Registering the router

Import the router in `src/index.js` and mount it with `app.use` at the resource path:

```js
const { router: tasksRouter } = require('./routes/tasks');
app.use('/tasks', tasksRouter);
```

The resource path in `app.use` must match the plural resource name used in the route file.
