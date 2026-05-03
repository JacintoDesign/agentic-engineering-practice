function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

function truncate(str, len) {
  if (!str || str.length <= len) return str;
  return str.slice(0, len) + '...';
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isNonEmptyString(val) {
  return typeof val === 'string' && val.trim().length > 0;
}

function buildPaginationMeta(total, page, pageSize) {
  return {
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  };
}

function parseIntSafe(val, fallback) {
  const n = parseInt(val, 10);
  return isNaN(n) ? fallback : n;
}

module.exports = { formatDate, slugify, truncate, validateEmail, isNonEmptyString, buildPaginationMeta, parseIntSafe };
