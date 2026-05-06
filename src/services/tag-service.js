const tagQueries = require('../db/queries/tags');
const taskQueries = require('../db/queries/tasks');

function listTags() {
  return tagQueries.listTags();
}

function createTag(name) {
  return tagQueries.insertTag(name.toLowerCase().trim());
}

function addTagToTask(taskId, tagId) {
  const task = taskQueries.findTaskById(taskId);
  if (!task) return null;
  const tag = tagQueries.findTagById(parseInt(tagId));
  if (!tag) {
    const err = new Error('Tag not found');
    err.status = 404;
    throw err;
  }
  tagQueries.insertTaskTag(taskId, parseInt(tagId));
  return { task_id: taskId, tag_id: parseInt(tagId) };
}

function removeTagFromTask(taskId, tagId) {
  const result = tagQueries.deleteTaskTag(taskId, tagId);
  if (result.changes === 0) return null;
  return { deleted: true };
}

module.exports = { listTags, createTag, addTagToTask, removeTagFromTask };
