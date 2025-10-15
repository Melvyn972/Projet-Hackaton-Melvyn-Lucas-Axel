import express from 'express';
import * as postController from '../controllers/post.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', requireAuth, postController.getPosts);
router.post('/', requireAuth, postController.createPost);
router.get('/:postId', requireAuth, postController.getPostById);
router.put('/:postId', requireAuth, postController.updatePost);
router.delete('/:postId', requireAuth, postController.deletePost);
router.post('/:postId/like', requireAuth, postController.likePost);
router.delete('/:postId/like', requireAuth, postController.unlikePost);
router.post('/:postId/comments', requireAuth, postController.addComment);
router.put('/comments/:commentId', requireAuth, postController.updateComment);
router.delete('/comments/:commentId', requireAuth, postController.deleteComment);

export default router;
