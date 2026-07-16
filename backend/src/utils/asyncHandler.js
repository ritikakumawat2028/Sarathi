// Wraps an async route handler so thrown errors/rejected promises reach errorHandler
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
