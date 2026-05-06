# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Context files

Read these before starting the relevant work:

- `.claude/context/api-conventions.md` — for any task involving API routes or endpoints
- `.claude/context/testing-standards.md` — for any task involving tests or test coverage

## Important context

This codebase contains intentional structural problems — inline DB queries in route handlers, a single monolithic `routes.js`, inconsistent patterns (e.g. `UserController` vs. inline handlers), misplaced helpers, and stub auth. These will be addressed in a future refactor. Understand the current state but do not add new code that follows these bad patterns. New code should point toward the correct architecture (extracted controllers, repository layer, proper middleware) even if the surrounding code does not.

## Never do these things

- **Never add new route logic to `routes.js`.** It is already too large. New routes belong in a dedicated route file.
- **Never add new utility functions to `utils.js`** without first checking whether they belong in a more specific module.
- **Never import from anything in `misc/`.** That code is dead and scheduled for removal.

## Commands

```bash
npm install          # install dependencies
npm run db:seed      # create schema and seed sample data (run once after install)
npm run db:reset     # drop and re-seed (wipes taskr.db)
npm run dev          # start server with file watching (Node 18+)
npm test             # run all tests
npm run test:watch   # run tests in watch mode
```

Run a single test file:
```bash
npx jest tests/tasks.test.js
```

Server runs on port 3000. Check `GET /health` to confirm it's up.

## Architecture

**Entry point:** `index.js` creates the Express app, mounts `routes.js`, and exports `app` for testing. It also holds two routes that were never moved to `routes.js` (`GET /` and `POST /webhooks/task-update`).

**Database:** `DB.js` opens a `better-sqlite3` connection. When `NODE_ENV=test` it uses `:memory:` instead of `taskr.db`. Schema is defined in `db/seed.js` via `db.exec(...)` — there is no separate migration system.

**Routes:** All route handlers live in `routes.js` — one large file by design (see TODOs at the top). The one exception is users, which delegate to `UserController.js`. All other resources (projects, tasks, comments, tags) query the database inline in the route handler.

**Inconsistency to be aware of:** `UserController.js` is the only extracted controller. It also fires a welcome email via `sendEmail.js` on user creation — the only side-effect call in the codebase.

**Circular dependency workaround:** `projectHelpers.js` calls `getTasksForProject`, which is exported from `routes.js`. To avoid a load-time circular dependency, `routes.js` uses a lazy `require('./projectHelpers')` inside the `GET /projects/:id` handler.

**Auth:** `auth.js` is a stub — it checks for `x-api-key: dev-key` (or `process.env.API_KEY`). The `authenticate` middleware is only applied to `DELETE /users/:id` and `DELETE /projects/:id`; all other routes are unprotected.

**Task status:** Constrained to `active | completed | archived` (enforced by a SQLite CHECK and validated in routes). Setting status to `completed` auto-sets `completed_at`; changing away from `completed` clears it.

**`GET /tasks/:id`** returns the task with embedded `tags` and `comments` arrays. `GET /tasks` (list) does not embed these.

**Pagination** on `GET /tasks`: `?page=&page_size=`, default 20, max 100.

## Testing

Tests set `NODE_ENV=test` at the top of each file, which causes `DB.js` to use `:memory:`. `tests/schema.js` exports `createSchema(db)` — called in `beforeAll` to build the schema. Each `beforeEach` wipes all tables and inserts a minimal user + project fixture so tests are independent.

Jest is configured to pick up `**/tests/*.test.js`, `**/tests/userTest.js`, and `**/tests/test-projects.js`.

New test files must follow the `resource.test.js` naming pattern (e.g. `users.test.js`, `projects.test.js`). The inconsistent naming of existing files (`userTest.js`, `test-projects.js`) is a known problem that will be standardized.
