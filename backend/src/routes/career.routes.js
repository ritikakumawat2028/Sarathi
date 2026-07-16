import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as careerController from '../controllers/career.controller.js';

const router = Router();

router.post('/chat', asyncHandler(careerController.chatCareerCoach));
router.post('/interview-prep', asyncHandler(careerController.generateInterviewQuestions));
router.post('/interview-analyze', asyncHandler(careerController.analyzeInterviewAnswer));
router.post('/resume-review', asyncHandler(careerController.reviewATSResume));
router.post('/roadmap', asyncHandler(careerController.generateRoadmap));
router.post('/portfolio-review', asyncHandler(careerController.reviewPortfolio));

router.get('/courses', asyncHandler(careerController.getCourses));
router.get('/jobs', asyncHandler(careerController.getJobs));
router.get('/certifications', asyncHandler(careerController.getCertifications));
router.get('/scholarships', asyncHandler(careerController.getScholarships));
router.get('/events', asyncHandler(careerController.getEvents));
router.get('/analytics', asyncHandler(careerController.getAnalytics));

export default router;
