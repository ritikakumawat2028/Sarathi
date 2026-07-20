import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import * as userController from '../controllers/user.controller.js';

const router = Router();

// All user routes require authentication
router.use(requireAuth);

router.get('/profile', asyncHandler(userController.getProfile));
router.put('/profile', asyncHandler(userController.upsertProfile));

router.get('/activity', asyncHandler(userController.getActivity));
router.post('/activity', asyncHandler(userController.addActivity));

router.get('/stats', asyncHandler(userController.getStats));

// Study Plans
router.get('/study-plans', asyncHandler(userController.getStudyPlans));
router.post('/study-plans', asyncHandler(userController.addStudyPlan));
router.put('/study-plans/:planId', asyncHandler(userController.toggleStudyPlan));
router.delete('/study-plans/:planId', asyncHandler(userController.deleteStudyPlan));

// Doubts
router.get('/doubts', asyncHandler(userController.getDoubts));
router.post('/doubts', asyncHandler(userController.addDoubt));
router.post('/doubt-solver', asyncHandler(userController.solveStudentDoubt));

// AI Chat
router.post('/chat', asyncHandler(userController.chatWithAI));


// Wellness / Mood logs
router.get('/wellness', asyncHandler(userController.getWellnessLog));
router.post('/wellness', asyncHandler(userController.addWellnessLog));

// Notifications (citizen & career alerts)
router.get('/notifications', asyncHandler(userController.getNotifications));
router.put('/notifications/read-all', asyncHandler(userController.markAllNotificationsRead));
router.put('/notifications/:id/read', asyncHandler(userController.markNotificationRead));
router.delete('/notifications/all', asyncHandler(userController.deleteNotification));
router.delete('/notifications/:id', asyncHandler(userController.deleteNotification));

export default router;
