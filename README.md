# Taskr API

A REST API for a simple task management service. Users can create tasks, assign them to projects, mark them complete, add comments, and filter by status.

**Stack:** Node.js · Express · SQLite (via `better-sqlite3`) · Jest

---

## Setup

```bash
npm install
npm run db:seed
npm test
npm run dev
```

The server starts on port 3000. Visit `http://localhost:3000/health` to confirm it's running.

---

## Resources

| Resource | Base path |
|---|---|
| Users | `/users` |
| Projects | `/projects` |
| Tasks | `/tasks` |
| Comments | `/tasks/:id/comments` |
| Tags | `/tags` |

---

## npm scripts

| Script | What it does |
|---|---|
| `npm start` | Start the server |
| `npm run dev` | Start with file watching (Node 18+) |
| `npm test` | Run the test suite |
| `npm run db:seed` | Create schema and seed sample data |
| `npm run db:reset` | Drop and re-seed the database |

---

## Database

SQLite — no external database required. The database file (`taskr.db`) is created locally when you run `npm run db:seed`. Sample data includes 5 users, 3 projects, 20 tasks, 15 comments, and 8 tags.

---

## Testing

Tests use Jest and supertest. The test suite runs against an in-memory database — no setup required beyond `npm install`.

```bash
npm test
npm run test:watch
```
