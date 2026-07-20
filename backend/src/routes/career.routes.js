import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { attachUserIfPresent } from '../middleware/auth.middleware.js';
import * as careerController from '../controllers/career.controller.js';

const router = Router();

// Attach user authentication context to every career request
router.use(attachUserIfPresent);

router.post('/chat', asyncHandler(careerController.chatCareerCoach));
router.post('/interview-prep', asyncHandler(careerController.generateInterviewQuestions));
router.post('/interview-analyze', asyncHandler(careerController.analyzeInterviewAnswer));
router.post('/resume-review', asyncHandler(careerController.reviewATSResume));
router.post('/roadmap', asyncHandler(careerController.generateRoadmap));
router.get('/roadmap', asyncHandler(careerController.getRoadmap));
router.post('/portfolio-review', asyncHandler(careerController.reviewPortfolio));
router.get('/reviews', asyncHandler(careerController.getCareerReviews));
router.post('/reviews', asyncHandler(careerController.saveCareerReview));
router.get('/resume', asyncHandler(careerController.getResumeData));
router.post('/resume', asyncHandler(careerController.saveResumeData));

router.get('/courses', asyncHandler(careerController.getCourses));
router.get('/jobs', asyncHandler(careerController.getJobs));
router.get('/certifications', asyncHandler(careerController.getCertifications));
router.get('/scholarships', asyncHandler(careerController.getScholarships));
router.get('/events', asyncHandler(careerController.getEvents));
router.get('/analytics', asyncHandler(careerController.getAnalytics));
router.post('/analytics/update', asyncHandler(careerController.updateAnalytics));
router.post('/skills-gap-analysis', asyncHandler(careerController.analyzeSkillsGap));

router.get('/profile', asyncHandler(careerController.getCareerProfile));
router.post('/profile', asyncHandler(careerController.updateCareerProfile));
router.post('/goals', asyncHandler(careerController.manageCareerGoal));
router.post('/activity', asyncHandler(careerController.logCareerActivity));

export default router;
