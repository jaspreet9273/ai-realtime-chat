// Centralized error handler. Keep responses shaped consistently so the
// frontend's axios response interceptor can normalize them into ApiError.
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error("[error]", err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Internal server error",
  });
}

module.exports = errorHandler;
