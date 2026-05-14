---
name: api-endpoints
description: Use when adding a new API endpoint to this project — specifies file locations, naming conventions, required exports, error handling, authentication, request validation, and response shaping.
---

# Skill: Add a New API Endpoint

Follow these steps exactly when adding any new endpoint to this project. Do not skip steps or reorder them.

---

## 1. Write the test first

Create `tests/<resource>.test.js` before touching any implementation file. Every new endpoint requires at minimum:

- One happy-path test (valid input → correct 2xx status and response body)
- Two error-case tests (e.g. missing required field → 400, resource not found → 404)

Set `NODE_ENV=test` at the top of the file and wire up the in-memory database:

```js
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../index');
const { db } = require('../src/db/connection');
const { createSchema } = require('./schema');

beforeAll(() => { createSchema(db); });

beforeEach(() => {
  db.exec('DELETE FROM task_tags; DELETE FROM comments; DELETE FROM tasks; DELETE FROM projects; DELETE FROM users; DELETE FROM tags;');
  db.prepare('INSERT INTO users (id, name, email) VALUES (1, ?, ?)').run('Test User', 'test@example.com');
  db.prepare('INSERT INTO projects (id, name) VALUES (1, ?)').run('Test Project');
});
```

Group tests by endpoint using `describe`. Write descriptions from the API consumer's perspective — what the endpoint does, not how:

```js
describe('POST /tasks', () => {
  test('creates a task with a title and returns 201', async () => { ... });
  test('returns 400 when title is missing', async () => { ... });
  test('returns 404 when the assigned project does not exist', async () => { ... });
});
```

---

## 2. Create the query file

Add `src/db/queries/<resource>.js`. This file contains raw SQL only — no business logic, no validation, no side effects. Query functions return plain objects.

```js
const { db } = require('../connection');

function insertTask({ title, projectId }) {
  return db.prepare('INSERT INTO tasks (title, project_id) VALUES (?, ?)').run(title, projectId);
}

module.exports = { insertTask };
```

---

## 3. Create the service file

Add `src/services/<resource>-service.js`. Services contain business logic, input validation, and existence checks. They call query functions — never the database directly.

```js
const taskQueries = require('../db/queries/tasks');
const projectQueries = require('../db/queries/projects');

function createTask({ title, projectId }) {
  if (!title) {
    const err = new Error('title is required');
    err.status = 400;
    throw err;
  }
  const project = projectQueries.findProjectById(projectId);
  if (!project) {
    const err = new Error('Project not found');
    err.status = 404;
    throw err;
  }
  return taskQueries.insertTask({ title, projectId });
}

module.exports = { createTask };
```

---

## 4. Create the route file

Add `src/routes/<resource>.js`. Route handlers parse the request, call one service function, and send the response. No SQL, no business logic, no validation logic.

**File location:** `src/routes/<resource>.js` — lowercase plural resource name, kebab-case.

**Required export:** a named `router` export.

```js
const { Router } = require('express');
const taskService = require('../services/task-service');

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const task = await taskService.createTask(req.body);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

module.exports = { router };
```

**Error handling pattern:** always wrap the handler body in `try/catch` and call `next(err)`. Never send the error response directly from the handler. The global error handler in `src/middleware/index.js` reads `err.status` and `err.message` to shape the client response.

**Authentication:** apply the `authenticate` middleware only to routes that require it (currently `DELETE /users/:id` and `DELETE /projects/:id`). Import it from `src/middleware/auth.js` — not from the barrel file `src/middleware/index.js`:

```js
const { authenticate } = require('../middleware/auth');
router.delete('/:id', authenticate, async (req, res, next) => { ... });
```

---

## 5. Register the router in index.js

Mount the new router in `index.js` at the plural resource path:

```js
const { router: tasksRouter } = require('./src/routes/tasks');
app.use('/tasks', tasksRouter);
```

The path in `app.use` must match the plural resource name used in the route file.

---

## 6. Request validation and response shaping

- Validate all required fields in the **service layer**, not the route handler.
- Return a plain JavaScript object from the service. The route handler passes it directly to `res.json()` — no reshaping in the handler.
- Use `isNonEmptyString` and other helpers from `src/utils/index.js` for field validation — import from the specific file, not a barrel.
- For list endpoints, apply pagination using `VALID_TASK_STATUSES`, `PAGE_DEFAULT`, and `PAGE_SIZE_MAX` from `src/utils/constants.js`.

---

## 7. Verify before committing

Run the full test suite and confirm it passes before committing:

```bash
npm test
```

Do not commit if any tests are failing.
