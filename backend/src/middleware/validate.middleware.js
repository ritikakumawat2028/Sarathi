import { validationResult } from 'express-validator';
import { AppError } from '../utils/AppError.js';

export function validateRequest(req, _res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Invalid request data.', 400, errors.array()));
  }
  next();
}
