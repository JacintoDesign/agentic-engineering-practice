/**
 * Converts a date string to an ISO 8601 string.
 * @param {string|null|undefined} dateStr - The date string to format.
 * @returns {string|null} ISO 8601 string, or null if input is falsy or invalid.
 */
function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

/**
 * Converts a string to a URL-friendly slug.
 * @param {string} str - The string to slugify.
 * @returns {string} Lowercased string with spaces replaced by hyphens and non-word characters removed.
 */
function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

/**
 * Truncates a string to a maximum length, appending "..." if truncated.
 * @param {string} str - The string to truncate.
 * @param {number} len - Maximum number of characters before truncation.
 * @returns {string} The original string if within length, otherwise a truncated string with "..." appended.
 */
function truncate(str, len) {
  if (!str || str.length <= len) return str;
  return str.slice(0, len) + '...';
}

/**
 * Checks whether a string is a valid email address.
 * @param {string} email - The value to test.
 * @returns {boolean} True if the value matches a basic email pattern, false otherwise.
 */
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Checks whether a value is a non-empty string (non-whitespace content required).
 * @param {*} val - The value to check.
 * @returns {boolean} True if val is a string with at least one non-whitespace character.
 */
function isNonEmptyString(val) {
  return typeof val === 'string' && val.trim().length > 0;
}

/**
 * Builds a pagination metadata object.
 * @param {number} total - Total number of records.
 * @param {number} page - Current page number (1-indexed).
 * @param {number} pageSize - Number of records per page.
 * @returns {{ total: number, page: number, pageSize: number, totalPages: number }} Pagination metadata.
 */
function buildPaginationMeta(total, page, pageSize) {
  return {
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  };
}

/**
 * Parses a value as an integer, returning a fallback if parsing fails.
 * @param {*} val - The value to parse.
 * @param {number} fallback - Value to return when val is not a valid integer.
 * @returns {number} The parsed integer, or fallback if parsing yields NaN.
 */
function parseIntSafe(val, fallback) {
  const n = parseInt(val, 10);
  return isNaN(n) ? fallback : n;
}

module.exports = { formatDate, slugify, truncate, validateEmail, isNonEmptyString, buildPaginationMeta, parseIntSafe };
