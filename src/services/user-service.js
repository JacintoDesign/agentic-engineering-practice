const userQueries = require('../db/queries/users');
const { sendEmail } = require('./email');
const { validateEmail } = require('../utils');

/**
 * @description Returns all users ordered by creation date descending.
 * @returns {object[]} Array of user records.
 */
function listUsers() {
  return userQueries.listUsers();
}

/**
 * @description Retrieves a single user by their numeric ID.
 * @param {number} id - The user's ID.
 * @returns {object|undefined} The user record, or undefined if not found.
 */
function getUser(id) {
  return userQueries.findUserById(id);
}

/**
 * @description Creates a new user and sends a welcome email; throws 400 if the email is invalid.
 * @param {string} name - The user's display name.
 * @param {string} email - The user's email address (must be valid).
 * @returns {Promise<object>} The newly created user record.
 */
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

/**
 * @description Updates an existing user's name and/or email; throws 404 if the user does not exist.
 * @param {number} id - The ID of the user to update.
 * @param {{ name?: string, email?: string }} data - Fields to update.
 * @returns {object} The updated user record.
 */
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

/**
 * @description Deletes a user by ID; throws 404 if the user does not exist.
 * @param {number} id - The ID of the user to delete.
 * @returns {{ deleted: boolean }} Confirmation object.
 */
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
