const { db } = require('./DB');
const { sendEmail } = require('./sendEmail');
const { validateEmail } = require('./utils');

async function createUser(name, email) {
  if (!validateEmail(email)) {
    const err = new Error('Invalid email address');
    err.status = 400;
    throw err;
  }
  const result = db.prepare(
    'INSERT INTO users (name, email) VALUES (?, ?)'
  ).run(name, email);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);

  // Sending welcome email here belongs in a notification service, not in a controller
  await sendEmail({
    to: user.email,
    subject: 'Welcome to Taskr!',
    body: `Hi ${user.name}, your account is ready. Start managing your tasks at taskr.io.`
  });

  return user;
}

function updateUser(id, data) {
  const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  if (!existing) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  const name = data.name !== undefined ? data.name : existing.name;
  const email = data.email !== undefined ? data.email : existing.email;
  db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?').run(name, email, id);
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

function deleteUser(id) {
  const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);
  if (result.changes === 0) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return { deleted: true };
}

function listUsers() {
  return db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
}

function getUserById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

module.exports = { createUser, updateUser, deleteUser, listUsers, getUserById };
