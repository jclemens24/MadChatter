const AppError = require('../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors)
    .map(msg => msg.message)
    .join('. ');
  const messages = `Invalid input data. ${errors
    .charAt(0)
    .toUpperCase()}${errors.substring(1)}`;
  return new AppError(messages, 400);
};

const handleDuplicateFields = err => {
  const value = err.errmsg.match(/\{(\s*?.*?)*?\}/);
  const message = `Duplicate field value: ${value} already exists`;
  return new AppError(message, 400);
};

const handleJWTError = () => {
  return new AppError('Invalid signature. Please log in again', 401);
};

const handleJWTExpired = () => {
  return new AppError('Token has expired. Please log in again', 401);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (err.name === 'CastError') err = handleCastErrorDB(err);
  if (err.name === 'ValidationError') err = handleValidationErrorDB(err);
  if (err.code === 11000) err = handleDuplicateFields(err);
  if (err.name === 'JsonWebTokenError') err = handleJWTError();
  if (err.name === 'TokenExpiredError') err = handleJWTExpired();

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
};
