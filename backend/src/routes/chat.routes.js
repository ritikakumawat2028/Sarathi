import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { chatWithAI, chatWithAIStream } from '../controllers/user.controller.js';

const router = express.Router();

/**
 * POST /api/chat
 * Standard (non-streaming) chat — backward compatible.
 */
router.post('/', asyncHandler(chatWithAI));

/**
 * POST /api/chat/stream
 * Server-Sent Events streaming endpoint.
 * Frontend connects and receives token chunks as they are generated.
 */
router.post('/stream', asyncHandler(chatWithAIStream));

export default router;
