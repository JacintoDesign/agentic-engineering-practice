const PORT = process.env.PORT || 3000;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const VALID_TASK_STATUSES = ['active', 'completed', 'archived'];
const EMAIL_FROM = 'noreply@taskr.io';

/**
 * Creates a standardized error response object.
 * @param {string} message - Human-readable error description.
 * @param {string|number} code - Machine-readable error code.
 * @returns {{ error: string, code: string|number }} Formatted error object.
 */
function formatError(message, code) {
  return { error: message, code };
}

/**
 * Computes SQL LIMIT and OFFSET values from page/pageSize query params.
 * Clamps page to a minimum of 1 and pageSize to MAX_PAGE_SIZE.
 * @param {string|number} page - Requested page number (1-indexed).
 * @param {string|number} pageSize - Requested number of records per page.
 * @returns {{ limit: number, offset: number }} Validated limit and offset for use in a SQL query.
 */
function paginate(page, pageSize) {
  const p = Math.max(1, parseInt(page) || 1);
  const ps = Math.min(MAX_PAGE_SIZE, parseInt(pageSize) || DEFAULT_PAGE_SIZE);
  return { limit: ps, offset: (p - 1) * ps };
}

module.exports = { PORT, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, VALID_TASK_STATUSES, EMAIL_FROM, formatError, paginate };
