import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { attachUserIfPresent } from '../middleware/auth.middleware.js';
import * as eligibilityController from '../controllers/eligibility.controller.js';

const router = Router();

// attachUserIfPresent: auto-loads profile if logged in, still works for guests
router.post('/check', attachUserIfPresent, asyncHandler(eligibilityController.checkEligibility));

export default router;
