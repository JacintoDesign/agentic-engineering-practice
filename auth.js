// TODO: replace with real JWT validation

function authenticate(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  if (apiKey === (process.env.API_KEY || 'dev-key')) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}

module.exports = { authenticate };
