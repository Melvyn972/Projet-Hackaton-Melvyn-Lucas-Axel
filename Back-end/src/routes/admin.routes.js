import express from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireAdmin);

router.get('/dashboard/stats', adminController.getStats);
router.get('/dashboard/users', adminController.getAllUsers);
router.get('/dashboard/top-users', adminController.getTopUsers);
router.get('/dashboard/top-posts', adminController.getTopPosts);
router.get('/dashboard/activity-timeline', adminController.getActivityTimeline);
router.get('/users/:userId/stats', adminController.getUserStats);
router.put('/users/:userId/role', adminController.updateUserRole);
router.delete('/users/:userId', adminController.deleteUser);

export default router;
