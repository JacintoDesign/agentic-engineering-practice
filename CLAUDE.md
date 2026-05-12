# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Context files

Read these before starting the relevant work:

- `.claude/context/api-conventions.md` — for any task involving API routes or endpoints
- `.claude/context/testing-standards.md` — for any task involving tests or test coverage

## Naming conventions

All files use kebab-case (e.g. `user-service.js`, `project-service.js`). New files must follow this convention — no PascalCase, no camelCase filenames.

## Never do these things

- **Never add new route logic directly to a service or query file.** Route handlers live in `src/routes/`.
- **Never query the database from a route handler or service directly.** All SQL belongs in `src/db/queries/`.
- **Never add utility functions without first checking whether they belong in a more specific module.**

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

**Entry point:** `index.js` (project root) creates the Express app, mounts all route files from `src/routes/`, and exports `app` for testing. It also owns `GET /` and `POST /webhooks/task-update` directly.

**Layer order:** routes → services → queries → connection. Each layer only calls the one directly below it.

**Database:** `src/db/connection.js` opens a `better-sqlite3` connection. When `NODE_ENV=test` it uses `:memory:` instead of `taskr.db`. Schema is defined in `db/seed.js` via `db.exec(...)` — there is no separate migration system.

**Routes** (`src/routes/`): One file per resource — `health.js`, `users.js`, `projects.js`, `tasks.js`, `comments.js`, `tags.js`. Route handlers parse the request, call one service function, and send the response. No SQL, no business logic.

**Services** (`src/services/`): Business logic, validation, existence checks, and side effects (e.g. `email.js` is called from `user-service.js` on user creation). One file per resource: `user-service.js`, `project-service.js`, `task-service.js`, `comment-service.js`, `tag-service.js`.

**Queries** (`src/db/queries/`): Raw SQL only — one file per resource: `users.js`, `projects.js`, `tasks.js`, `comments.js`, `tags.js`. Query functions return plain objects and have no business logic.

**Middleware** (`src/middleware/`): `auth.js` is a stub that checks for `x-api-key: dev-key` (or `process.env.API_KEY`). The `authenticate` middleware is only applied to `DELETE /users/:id` and `DELETE /projects/:id`. `index.js` exports `requestLogger` and `errorHandler`.

**Utils** (`src/utils/`): `index.js` holds general helpers (`validateEmail`, `isNonEmptyString`, etc.). `constants.js` holds shared constants (`VALID_TASK_STATUSES`, `PORT`, pagination defaults).

**Task status:** Constrained to `active | completed | archived` (enforced by a SQLite CHECK and validated in `task-service.js`). Setting status to `completed` auto-sets `completed_at`; changing away from `completed` clears it.

**`GET /tasks/:id`** returns the task with embedded `tags` and `comments` arrays. `GET /tasks` (list) does not embed these.

**Pagination** on `GET /tasks`: `?page=&page_size=`, default 20, max 100.

## Verification

After completing any significant change, run `/verify-app` before committing. Do not commit if any tests are failing. The test suite uses Supertest and covers all API endpoints. A passing run confirms the full application is working correctly.

## Testing

Tests set `NODE_ENV=test` at the top of each file, which causes `src/db/connection.js` to use `:memory:`. `tests/schema.js` exports `createSchema(db)` — called in `beforeAll` to build the schema. Each `beforeEach` wipes all tables and inserts a minimal user + project fixture so tests are independent.

Jest is configured to pick up `**/tests/*.test.js`.

New test files must follow the `resource.test.js` naming pattern (e.g. `users.test.js`, `projects.test.js`).
