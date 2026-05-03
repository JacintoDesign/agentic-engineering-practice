// TODO: replace with real email provider (SendGrid, SES, etc.)

function sendEmail({ to, subject, body }) {
  console.log('[EMAIL] Sending to:', to, '| Subject:', subject);
  return Promise.resolve({ sent: true, to, subject });
}

module.exports = { sendEmail };
