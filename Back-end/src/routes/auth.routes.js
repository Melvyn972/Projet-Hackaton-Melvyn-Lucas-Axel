import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/signin', authController.signin);
router.get('/me', requireAuth, authController.getCurrentUser);
router.post('/signout', requireAuth, authController.signout);
router.post('/refresh-token', requireAuth, authController.refreshToken);
router.delete('/cleanup-sessions', authController.cleanupExpiredSessions);

export default router;
