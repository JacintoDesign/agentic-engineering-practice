const userQueries = require('../db/queries/users');
const { sendEmail } = require('./email');
const { validateEmail } = require('../utils');

function listUsers() {
  return userQueries.listUsers();
}

function getUser(id) {
  return userQueries.findUserById(id);
}

async function createUser(name, email) {
  if (!validateEmail(email)) {
    const err = new Error('Invalid email address');
    err.status = 400;
    throw err;
  }
  const user = userQueries.insertUser(name, email);
  await sendEmail({
    to: user.email,
    subject: 'Welcome to Taskr!',
    body: `Hi ${user.name}, your account is ready. Start managing your tasks at taskr.io.`
  });
  return user;
}

function updateUser(id, data) {
  const existing = userQueries.findUserById(id);
  if (!existing) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  const name = data.name !== undefined ? data.name : existing.name;
  const email = data.email !== undefined ? data.email : existing.email;
  return userQueries.updateUser(id, name, email);
}

function deleteUser(id) {
  const result = userQueries.deleteUser(id);
  if (result.changes === 0) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return { deleted: true };
}

module.exports = { listUsers, getUser, createUser, updateUser, deleteUser };
