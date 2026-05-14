/**
 * @description Simulates sending an email by logging to the console and resolving immediately.
 * @param {{ to: string, subject: string, body: string }} options - Email details.
 * @param {string} options.to - Recipient email address.
 * @param {string} options.subject - Email subject line.
 * @param {string} options.body - Email body text.
 * @returns {Promise<{ sent: boolean, to: string, subject: string }>} Resolves with a confirmation object.
 */
function sendEmail({ to, subject, body }) {
  console.log('[EMAIL] Sending to:', to, '| Subject:', subject);
  return Promise.resolve({ sent: true, to, subject });
}

module.exports = { sendEmail };
