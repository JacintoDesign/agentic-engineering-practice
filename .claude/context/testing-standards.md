# Testing Standards

Follow these conventions when writing tests for the Taskr API.

## File naming and location

Test files go in `tests/` and must follow the naming convention `resource.test.js` in lowercase (e.g. `tests/tasks.test.js`, `tests/users.test.js`). Jest is configured to pick these up automatically — no changes to `package.json` are needed.

## Stack and database

Tests use Jest and supertest against an in-memory SQLite database. No external database or environment setup is required beyond `npm install`.

Set `NODE_ENV` to `test` at the top of every test file so `DB.js` uses `:memory:`:

```js
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../index');
const { db } = require('../DB');
const { createSchema } = require('./schema');
```

Build the schema once before all tests and reset state before each test:

```js
beforeAll(() => {
  createSchema(db);
});

beforeEach(() => {
  db.exec('DELETE FROM task_tags; DELETE FROM comments; DELETE FROM tasks; DELETE FROM projects; DELETE FROM users; DELETE FROM tags;');
  // insert the minimum fixture data your tests need
  db.prepare('INSERT INTO users (id, name, email) VALUES (1, ?, ?)').run('Test User', 'test@example.com');
  db.prepare('INSERT INTO projects (id, name) VALUES (1, ?)').run('Test Project');
});
```

## Coverage requirements

Every endpoint must have at minimum:

- **One happy path test** — valid input, expected 2xx response and correct response body
- **Two error case tests** — e.g. missing required field (400), resource not found (404), duplicate (409)

## Test descriptions

Write descriptions in plain English that describe the behavior from a user or API consumer perspective, not the implementation. Describe what the endpoint does, not how.

```js
// good
test('returns 404 when the task does not exist', ...)
test('creates a task and returns it with a generated id', ...)

// avoid
test('db.prepare returns null so handler sends 404', ...)
test('calls insertTask and maps lastInsertRowid', ...)
```

Group tests by endpoint using `describe`:

```js
describe('POST /tasks', () => {
  test('creates a task with a title and returns 201', async () => { ... });
  test('returns 400 when title is missing', async () => { ... });
  test('returns 400 when the assigned project does not exist', async () => { ... });
});
```

## Running tests

The full suite runs with no setup beyond `npm install`:

```bash
npm test
```

Run a single file during development:

```bash
npx jest tests/tasks.test.js
```
