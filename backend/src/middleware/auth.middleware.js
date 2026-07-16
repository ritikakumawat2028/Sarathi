import { verifyToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';

export function requireAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return next(new AppError('Authentication required. Please log in.', 401));
  }

  try {
    const payload = verifyToken(token);
    req.userId = payload.sub;
    req.userEmail = payload.email;
    next();
  } catch {
    next(new AppError('Session expired or invalid. Please log in again.', 401));
  }
}

// Attaches req.userId if a valid token is present, but never blocks the request.
export function attachUserIfPresent(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try {
      const payload = verifyToken(token);
      req.userId = payload.sub;
      req.userEmail = payload.email;
    } catch {
      // ignore invalid token for optional-auth routes
    }
  }
  next();
}
