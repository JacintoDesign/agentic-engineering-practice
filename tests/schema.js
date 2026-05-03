function createSchema(db) {
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
}

module.exports = { createSchema };
