const PORT = process.env.PORT || 3000;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const VALID_TASK_STATUSES = ['active', 'completed', 'archived'];
const EMAIL_FROM = 'noreply@taskr.io';

function formatError(message, code) {
  return { error: message, code };
}

function paginate(page, pageSize) {
  const p = Math.max(1, parseInt(page) || 1);
  const ps = Math.min(MAX_PAGE_SIZE, parseInt(pageSize) || DEFAULT_PAGE_SIZE);
  return { limit: ps, offset: (p - 1) * ps };
}

module.exports = { PORT, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, VALID_TASK_STATUSES, EMAIL_FROM, formatError, paginate };
