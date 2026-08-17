function sendSuccess(res, statusCode = 200, data = {}) {
  res.status(statusCode).json({ success: true, ...data });
}

function sendError(res, statusCode = 500, message = 'Internal Server Error') {
  res.status(statusCode).json({ error: message });
}

module.exports = { sendSuccess, sendError };
