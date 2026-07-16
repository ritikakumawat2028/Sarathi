import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import * as schemesController from '../controllers/schemes.controller.js';

const router = Router();

// Public routes
router.get('/', asyncHandler(schemesController.listSchemes));
router.get('/search', asyncHandler(schemesController.smartSearchSchemes));
router.post('/recommendations', asyncHandler(schemesController.getAIRecommendations));
router.post('/eligibility-check', asyncHandler(schemesController.checkDynamicEligibility));
router.get('/state-explorer/:state', asyncHandler(schemesController.getStateExplorerData));
router.get('/categories', asyncHandler(schemesController.listCategories));
router.get('/meta', asyncHandler(schemesController.getMeta));
router.post('/refresh', asyncHandler(schemesController.refreshSchemesNow));

// History routes (can work with or without token)
router.get('/history', asyncHandler(schemesController.getHistory));
router.post('/history', asyncHandler(schemesController.logHistoryItem));

// Favorites routes
router.get('/saved', asyncHandler(schemesController.listSavedSchemes));
router.post('/saved', asyncHandler(schemesController.saveScheme));
router.delete('/saved/:schemeId', asyncHandler(schemesController.unsaveScheme));

// Scheme Details and AI Summary
router.get('/:id', asyncHandler(schemesController.getSchemeById));
router.post('/:id/ai-summary', asyncHandler(schemesController.getSchemeAISummary));

export default router;
