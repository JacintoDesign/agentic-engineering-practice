# Contributing to Taskr

## Development setup

**Prerequisites:** Node.js 18 or later.

```bash
git clone <repo-url>
cd agentic-engineering-practice
npm install
npm run db:seed   # creates taskr.db and seeds sample data (run once)
npm run dev       # starts the server on port 3000 with file watching
```

Confirm the server is up:

```bash
curl http://localhost:3000/health
```

To reset the database at any time (wipes all data and re-seeds):

```bash
npm run db:reset
```

## Commit message convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <short description>
```

Common types:

| Type | When to use |
|------|-------------|
| `feat` | New feature or endpoint |
| `fix` | Bug fix |
| `refactor` | Code restructuring with no behavior change |
| `test` | Adding or updating tests |
| `docs` | Documentation only |
| `chore` | Tooling, dependencies, config |

Keep the subject line under 72 characters. No period at the end.

Examples:

```
feat: add pagination to GET /tasks
fix: clear completed_at when task status changes away from completed
docs: add JSDoc to task-service exports
```

## Running the test suite

```bash
npm test
```

Tests use Supertest against an in-memory SQLite database (`NODE_ENV=test`), so no running server is needed and the real `taskr.db` is never touched.

Run a single file:

```bash
npx jest tests/tasks.test.js
```

Watch mode (reruns on save):

```bash
npm run test:watch
```

### What a passing run looks like

```
Test Suites: 3 passed, 3 total
Tests:       XX passed, XX total
Snapshots:   0 total
Time:        ~Xs
Ran all test suites.
```

All three suites (`users.test.js`, `projects.test.js`, `tasks.test.js`) must report passed with zero failures and zero skipped tests.

## Verification before committing

After any significant change, run the full verification suite before committing:

```
/verify-app
```

This runs `npm test -- --runInBand` (serial execution to avoid in-memory SQLite conflicts) and confirms all API endpoints are working correctly.

**Do not commit with failing tests.** If any test is red, fix the implementation — never skip or delete the test to make the suite pass. The only exception is if the test itself contains a clear bug, in which case fix the test and note why in the commit message.
