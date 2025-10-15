import prisma from '../config/database.js';
import { NotFoundError, ConflictError, AuthorizationError } from '../utils/errors.js';

class PostService {
  async getPosts(page = 1, limit = 20, userId) {
    const skip = (page - 1) * limit;
    
    const posts = await prisma.post.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        _count: {
          select: { comments: true, likes: true }
        },
        likes: {
          where: { userId },
          select: { id: true }
        }
      }
    });
    
    return posts.map(post => ({
      ...post,
      isLikedByCurrentUser: post.likes.length > 0,
      likes: undefined
    }));
  }

  async getPostById(postId, userId) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        comments: {
          orderBy: { createdAt: 'desc' },
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        },
        _count: { select: { likes: true } },
        likes: {
          where: { userId },
          select: { id: true }
        }
      }
    });
    
    if (!post) {
      throw new NotFoundError('Post introuvable');
    }
    
    return {
      ...post,
      isLikedByCurrentUser: post.likes.length > 0,
      likes: undefined
    };
  }

  async createPost(authorId, content, imageUrl) {
    return await prisma.post.create({
      data: { content, imageUrl, authorId },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        _count: {
          select: { comments: true, likes: true }
        }
      }
    });
  }

  async updatePost(postId, userId, updateData) {
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });
    
    if (!post) {
      throw new NotFoundError('Post introuvable');
    }
    
    if (post.authorId !== userId) {
      throw new AuthorizationError('Vous ne pouvez modifier que vos propres posts');
    }
    
    return await prisma.post.update({
      where: { id: postId },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        _count: {
          select: { comments: true, likes: true }
        }
      }
    });
  }

  async deletePost(postId, userId, userRole) {
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });
    
    if (!post) {
      throw new NotFoundError('Post introuvable');
    }
    
    if (post.authorId !== userId && userRole !== 'ADMIN') {
      throw new AuthorizationError('Vous ne pouvez supprimer que vos propres posts');
    }
    
    await prisma.post.delete({ where: { id: postId } });
  }

  async toggleLike(postId, userId) {
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });
    
    if (!post) {
      throw new NotFoundError('Post introuvable');
    }
    
    const existingLike = await prisma.postLike.findUnique({
      where: {
        postId_userId: { postId, userId }
      }
    });
    
    if (existingLike) {
      await prisma.postLike.delete({
        where: { id: existingLike.id }
      });
      return { action: 'unliked' };
    } else {
      await prisma.postLike.create({
        data: { postId, userId }
      });
      return { action: 'liked' };
    }
  }

  async addComment(postId, userId, content) {
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });
    
    if (!post) {
      throw new NotFoundError('Post introuvable');
    }
    
    return await prisma.comment.create({
      data: { content, postId, authorId: userId },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });
  }

  async updateComment(commentId, userId, content) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    });
    
    if (!comment) {
      throw new NotFoundError('Commentaire introuvable');
    }
    
    if (comment.authorId !== userId) {
      throw new AuthorizationError('Vous ne pouvez modifier que vos propres commentaires');
    }
    
    return await prisma.comment.update({
      where: { id: commentId },
      data: { content },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });
  }

  async deleteComment(commentId, userId, userRole) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { post: true }
    });
    
    if (!comment) {
      throw new NotFoundError('Commentaire introuvable');
    }
    
    if (
      comment.authorId !== userId && 
      comment.post.authorId !== userId &&
      userRole !== 'ADMIN'
    ) {
      throw new AuthorizationError('Permissions insuffisantes');
    }
    
    await prisma.comment.delete({ where: { id: commentId } });
  }
}

export default new PostService();

