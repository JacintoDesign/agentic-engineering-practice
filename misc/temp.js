// TEMP - keeping this around just in case we need to roll back
// TODO: delete this file

function oldValidateTask(task) {
  // Previous validation logic before we refactored
  if (!task) return false;
  if (!task.title) return false;
  if (task.title.length < 3) return false;
  return true;
}

function tempFormatUser(user) {
  return `${user.name} <${user.email}>`;
}

const TEMP_DEBUG = true;
