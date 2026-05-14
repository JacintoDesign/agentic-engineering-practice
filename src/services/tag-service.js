const tagQueries = require('../db/queries/tags');
const taskQueries = require('../db/queries/tasks');

/**
 * @description Returns all tags sorted alphabetically by name.
 * @returns {object[]} Array of tag records.
 */
function listTags() {
  return tagQueries.listTags();
}

/**
 * @description Creates a new tag with the provided name normalized to lowercase and trimmed.
 * @param {string} name - The tag name to create.
 * @returns {object} The newly created tag record.
 */
function createTag(name) {
  return tagQueries.insertTag(name.toLowerCase().trim());
}

/**
 * @description Associates an existing tag with a task; returns null if the task does not exist, throws 404 if the tag does not exist.
 * @param {number} taskId - The ID of the task.
 * @param {number|string} tagId - The ID of the tag to add.
 * @returns {{ task_id: number, tag_id: number }|null} The association object, or null if the task was not found.
 */
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

/**
 * @description Removes a tag association from a task; returns null if the association does not exist.
 * @param {number} taskId - The ID of the task.
 * @param {number} tagId - The ID of the tag to remove.
 * @returns {{ deleted: boolean }|null} Confirmation object, or null if the association was not found.
 */
function removeTagFromTask(taskId, tagId) {
  const result = tagQueries.deleteTaskTag(taskId, tagId);
  if (result.changes === 0) return null;
  return { deleted: true };
}

module.exports = { listTags, createTag, addTagToTask, removeTagFromTask };
