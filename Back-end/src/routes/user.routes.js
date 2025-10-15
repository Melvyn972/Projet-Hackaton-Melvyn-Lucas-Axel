import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/search', requireAuth, userController.searchUsers);
router.get('/profile', requireAuth, userController.getProfile);
router.put('/profile', requireAuth, userController.updateProfile);
router.post('/addresses', requireAuth, userController.addAddress);
router.put('/addresses/:addressId', requireAuth, userController.updateAddress);
router.delete('/addresses/:addressId', requireAuth, userController.deleteAddress);
router.post('/:userId/comments', requireAuth, userController.addProfileComment);
router.put('/comments/:commentId', requireAuth, userController.updateProfileComment);
router.delete('/comments/:commentId', requireAuth, userController.deleteProfileComment);
router.get('/:userId', requireAuth, userController.getUserById);

export default router;
