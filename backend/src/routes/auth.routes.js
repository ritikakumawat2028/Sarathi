import { Router } from 'express';
import { body } from 'express-validator';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import * as authController from '../controllers/auth.controller.js';

const router = Router();

router.post(
  '/signup',
  [body('email').isEmail(), body('password').isLength({ min: 6 }), body('name').notEmpty()],
  validateRequest,
  asyncHandler(authController.signup)
);

router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validateRequest,
  asyncHandler(authController.login)
);

router.get('/me', requireAuth, asyncHandler(authController.me));

export default router;
