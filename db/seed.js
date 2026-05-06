const { db } = require('../src/db/connection');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    owner_id INTEGER REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'archived')),
    project_id INTEGER REFERENCES projects(id),
    assignee_id INTEGER REFERENCES users(id),
    due_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER REFERENCES tasks(id),
    user_id INTEGER REFERENCES users(id),
    body TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS task_tags (
    task_id INTEGER REFERENCES tasks(id),
    tag_id INTEGER REFERENCES tags(id),
    PRIMARY KEY (task_id, tag_id)
  );
`);

const existing = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (existing.count > 0) {
  console.log('Database already seeded — skipping.');
  process.exit(0);
}

// Users
const insertUser = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
const seedUsers = db.transaction(() => {
  insertUser.run('Alice Chen', 'alice@taskr.io');
  insertUser.run('Bob Martinez', 'bob@taskr.io');
  insertUser.run('Carol White', 'carol@taskr.io');
  insertUser.run('David Kim', 'david@taskr.io');
  insertUser.run('Emma Johnson', 'emma@taskr.io');
});
seedUsers();

// Projects
const insertProject = db.prepare('INSERT INTO projects (name, description, owner_id) VALUES (?, ?, ?)');
const seedProjects = db.transaction(() => {
  insertProject.run('Website Redesign', 'Overhaul the public-facing website with new brand guidelines', 1);
  insertProject.run('Mobile App', 'iOS and Android app for task management on the go', 2);
  insertProject.run('API Integration', 'Connect Taskr to third-party tools: Slack, GitHub, Zapier', 3);
});
seedProjects();

// Tasks
const insertTask = db.prepare(
  'INSERT INTO tasks (title, description, status, project_id, assignee_id, due_date) VALUES (?, ?, ?, ?, ?, ?)'
);
const seedTasks = db.transaction(() => {
  // Website Redesign tasks (project 1)
  insertTask.run('Design homepage mockup', 'Create Figma mockup for new homepage layout', 'completed', 1, 1, '2026-03-15');
  insertTask.run('Update color palette', 'Apply new brand colors across all components', 'completed', 1, 1, '2026-03-20');
  insertTask.run('Write copy for About page', null, 'active', 1, 3, '2026-04-10');
  insertTask.run('Implement responsive nav', 'Mobile-first navigation redesign', 'active', 1, 2, '2026-04-15');
  insertTask.run('Accessibility audit', 'Run axe-core and fix WCAG AA violations', 'active', 1, 4, '2026-04-30');
  insertTask.run('SEO meta tags review', null, 'archived', 1, 3, null);
  insertTask.run('Performance baseline', 'Lighthouse audit before redesign goes live', 'active', 1, 2, '2026-05-01');

  // Mobile App tasks (project 2)
  insertTask.run('Set up React Native project', 'Expo managed workflow, TypeScript template', 'completed', 2, 5, '2026-02-28');
  insertTask.run('Implement push notifications', null, 'active', 2, 5, '2026-04-20');
  insertTask.run('Offline sync strategy', 'Research and implement offline-first data layer', 'active', 2, 2, '2026-05-15');
  insertTask.run('App Store screenshots', 'Produce marketing screenshots for both stores', 'active', 2, 1, '2026-05-20');
  insertTask.run('Beta TestFlight release', null, 'active', 2, 5, '2026-05-01');
  insertTask.run('Fix login crash on Android', 'Reproducible on Android 12 when biometrics enabled', 'active', 2, 4, '2026-04-05');
  insertTask.run('Dark mode support', null, 'archived', 2, 1, null);

  // API Integration tasks (project 3)
  insertTask.run('Slack webhook handler', 'Receive Slack slash command events', 'completed', 3, 3, '2026-03-10');
  insertTask.run('GitHub Issues sync', 'Two-way sync between Taskr tasks and GitHub issues', 'active', 3, 4, '2026-04-25');
  insertTask.run('Zapier trigger: task created', null, 'active', 3, 3, '2026-05-10');
  insertTask.run('Zapier action: create task', null, 'active', 3, 3, '2026-05-10');
  insertTask.run('OAuth2 app registration', 'Register Taskr as an OAuth2 app with GitHub and Slack', 'completed', 3, 4, '2026-03-05');
  insertTask.run('Rate limiting for webhook endpoint', 'Protect /webhooks from abuse', 'active', 3, 2, '2026-05-20');
});
seedTasks();

// Tags
const insertTag = db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)');
const tagNames = ['bug', 'feature', 'urgent', 'design', 'backend', 'frontend', 'blocked', 'review'];
const seedTags = db.transaction(() => {
  for (const name of tagNames) insertTag.run(name);
});
seedTags();

// Tag IDs by name
const tagMap = {};
for (const name of tagNames) {
  tagMap[name] = db.prepare('SELECT id FROM tags WHERE name = ?').get(name).id;
}

// Task-tag associations
const insertTaskTag = db.prepare('INSERT OR IGNORE INTO task_tags (task_id, tag_id) VALUES (?, ?)');
const seedTaskTags = db.transaction(() => {
  insertTaskTag.run(1, tagMap['design']);
  insertTaskTag.run(1, tagMap['review']);
  insertTaskTag.run(2, tagMap['design']);
  insertTaskTag.run(2, tagMap['frontend']);
  insertTaskTag.run(4, tagMap['frontend']);
  insertTaskTag.run(4, tagMap['feature']);
  insertTaskTag.run(5, tagMap['frontend']);
  insertTaskTag.run(13, tagMap['bug']);
  insertTaskTag.run(13, tagMap['urgent']);
  insertTaskTag.run(13, tagMap['blocked']);
  insertTaskTag.run(10, tagMap['backend']);
  insertTaskTag.run(10, tagMap['feature']);
  insertTaskTag.run(15, tagMap['backend']);
  insertTaskTag.run(15, tagMap['review']);
  insertTaskTag.run(16, tagMap['backend']);
  insertTaskTag.run(16, tagMap['feature']);
});
seedTaskTags();

// Comments
const insertComment = db.prepare('INSERT INTO comments (task_id, user_id, body) VALUES (?, ?, ?)');
const seedComments = db.transaction(() => {
  insertComment.run(1, 2, 'Looks great — can we add a hero animation too?');
  insertComment.run(1, 1, 'Animation is out of scope for this sprint, adding to backlog.');
  insertComment.run(1, 3, 'LGTM, marking as complete.');
  insertComment.run(4, 2, 'Starting this today. Will have a PR up by EOD.');
  insertComment.run(4, 4, 'Remember to test on iOS Safari — has some quirks with position: sticky.');
  insertComment.run(5, 1, 'Running initial audit now. Found 12 violations.');
  insertComment.run(5, 4, 'Most are color contrast issues, should be quick fixes once we update the palette.');
  insertComment.run(10, 5, 'Reviewing WatermelonDB vs Realm vs custom sync. Will share findings by Friday.');
  insertComment.run(10, 2, 'We should also consider the conflict resolution strategy for concurrent edits.');
  insertComment.run(13, 4, 'Crash happens in onActivityResult — biometrics callback not on main thread.');
  insertComment.run(13, 5, 'Confirmed fix: wrap callback in runOnUiThread. PR incoming.');
  insertComment.run(16, 3, 'GitHub API docs: https://docs.github.com/en/rest/issues — using REST not GraphQL for simplicity.');
  insertComment.run(16, 4, 'We need to handle the case where a GitHub issue is closed outside Taskr.');
  insertComment.run(17, 3, 'Zapier developer platform requires an invite to publish. Applied last week.');
  insertComment.run(20, 4, 'Using express-rate-limit. 100 req/min per IP should be fine for now.');
});
seedComments();

console.log('Seeding complete.');
console.log('  5 users, 3 projects, 20 tasks, 15 comments, 8 tags');
