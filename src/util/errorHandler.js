module.exports = () => (err, req, res, next) => {
  let status = err.status || err.statusCode || 500;
  if (status < 400) status = 500;
  res.statusCode = status;

  const body = {
    status,
    stack: err.stack,
    message: err.message,
  };
  res.json({
    error: body,
  });
};
