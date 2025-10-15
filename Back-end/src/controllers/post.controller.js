import prisma from '../config/database.js';
import { validateRequired, validateLength } from '../utils/validators.js';
import { NotFoundError, AuthorizationError, ConflictError } from '../utils/errors.js';

/**
 * Récupérer le fil d'actualité (feed)
 * GET /api/posts
 */
export const getPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const posts = await prisma.post.findMany({
      skip,
      take: parseInt(limit),
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
          select: {
            comments: true,
            likes: true
          }
        },
        likes: {
          where: { userId: req.user.id },
          select: { id: true }
        }
      }
    });
    
    // Ajouter un flag isLikedByCurrentUser
    const postsWithLikeStatus = posts.map(post => ({
      ...post,
      isLikedByCurrentUser: post.likes.length > 0,
      likes: undefined // Retirer le détail, on garde juste le count
    }));
    
    const total = await prisma.post.count();
    
    res.json({
      posts: postsWithLikeStatus,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer un post spécifique
 * GET /api/posts/:postId
 */
export const getPostById = async (req, res, next) => {
  try {
    const { postId } = req.params;
    
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
        _count: {
          select: {
            likes: true
          }
        },
        likes: {
          where: { userId: req.user.id },
          select: { id: true }
        }
      }
    });
    
    if (!post) {
      throw new NotFoundError('Post introuvable');
    }
    
    const postWithLikeStatus = {
      ...post,
      isLikedByCurrentUser: post.likes.length > 0,
      likes: undefined
    };
    
    res.json({ post: postWithLikeStatus });
    
  } catch (error) {
    next(error);
  }
};

/**
 * Créer un nouveau post
 * POST /api/posts
 */
export const createPost = async (req, res, next) => {
  try {
    const { content, imageUrl } = req.body;
    
    validateRequired(['content'], req.body);
    validateLength(content, 'Contenu du post', 5000);
    
    if (imageUrl) {
      validateLength(imageUrl, 'URL de l\'image', 500);
    }
    
    const post = await prisma.post.create({
      data: {
        content,
        imageUrl: imageUrl || null,
        authorId: req.user.id
      },
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
          select: {
            comments: true,
            likes: true
          }
        }
      }
    });
    
    res.status(201).json({
      message: 'Post créé avec succès',
      post: {
        ...post,
        isLikedByCurrentUser: false
      }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * Modifier un post
 * PUT /api/posts/:postId
 */
export const updatePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { content, imageUrl } = req.body;
    
    // Vérifier que le post existe et appartient à l'utilisateur
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });
    
    if (!post) {
      throw new NotFoundError('Post introuvable');
    }
    
    if (post.authorId !== req.user.id) {
      throw new AuthorizationError('Vous ne pouvez modifier que vos propres posts');
    }
    
    const updateData = {};
    
    if (content !== undefined) {
      validateLength(content, 'Contenu du post', 5000);
      updateData.content = content;
    }
    
    if (imageUrl !== undefined) {
      if (imageUrl) {
        validateLength(imageUrl, 'URL de l\'image', 500);
      }
      updateData.imageUrl = imageUrl;
    }
    
    const updatedPost = await prisma.post.update({
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
          select: {
            comments: true,
            likes: true
          }
        },
        likes: {
          where: { userId: req.user.id },
          select: { id: true }
        }
      }
    });
    
    res.json({
      message: 'Post modifié avec succès',
      post: {
        ...updatedPost,
        isLikedByCurrentUser: updatedPost.likes.length > 0,
        likes: undefined
      }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer un post
 * DELETE /api/posts/:postId
 */
export const deletePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    
    // Vérifier que le post existe et appartient à l'utilisateur
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });
    
    if (!post) {
      throw new NotFoundError('Post introuvable');
    }
    
    if (post.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      throw new AuthorizationError('Vous ne pouvez supprimer que vos propres posts');
    }
    
    await prisma.post.delete({
      where: { id: postId }
    });
    
    res.json({ message: 'Post supprimé avec succès' });
    
  } catch (error) {
    next(error);
  }
};

/**
 * Liker un post
 * POST /api/posts/:postId/like
 */
export const likePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    
    // Vérifier que le post existe
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });
    
    if (!post) {
      throw new NotFoundError('Post introuvable');
    }
    
    // Vérifier si l'utilisateur a déjà liké
    const existingLike = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: req.user.id
        }
      }
    });
    
    if (existingLike) {
      throw new ConflictError('Vous avez déjà liké ce post');
    }
    
    // Créer le like
    await prisma.postLike.create({
      data: {
        postId,
        userId: req.user.id
      }
    });
    
    // Compter les likes
    const likesCount = await prisma.postLike.count({
      where: { postId }
    });
    
    res.status(201).json({
      message: 'Post liké avec succès',
      likesCount
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * Unliker un post
 * DELETE /api/posts/:postId/like
 */
export const unlikePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    
    // Supprimer le like
    const deletedLike = await prisma.postLike.deleteMany({
      where: {
        postId,
        userId: req.user.id
      }
    });
    
    if (deletedLike.count === 0) {
      throw new NotFoundError('Like introuvable');
    }
    
    // Compter les likes
    const likesCount = await prisma.postLike.count({
      where: { postId }
    });
    
    res.json({
      message: 'Like retiré avec succès',
      likesCount
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * Ajouter un commentaire à un post
 * POST /api/posts/:postId/comments
 */
export const addComment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    
    validateRequired(['content'], req.body);
    validateLength(content, 'Commentaire', 1000);
    
    // Vérifier que le post existe
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });
    
    if (!post) {
      throw new NotFoundError('Post introuvable');
    }
    
    // Créer le commentaire
    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: req.user.id
      },
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
    
    res.status(201).json({
      message: 'Commentaire ajouté avec succès',
      comment
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * Modifier un commentaire
 * PUT /api/posts/comments/:commentId
 */
export const updateComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    
    validateRequired(['content'], req.body);
    validateLength(content, 'Commentaire', 1000);
    
    // Vérifier que le commentaire existe et appartient à l'utilisateur
    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    });
    
    if (!comment) {
      throw new NotFoundError('Commentaire introuvable');
    }
    
    if (comment.authorId !== req.user.id) {
      throw new AuthorizationError('Vous ne pouvez modifier que vos propres commentaires');
    }
    
    // Mettre à jour le commentaire
    const updatedComment = await prisma.comment.update({
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
    
    res.json({
      message: 'Commentaire modifié avec succès',
      comment: updatedComment
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer un commentaire
 * DELETE /api/posts/comments/:commentId
 */
export const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    
    // Récupérer le commentaire avec le post
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { post: true }
    });
    
    if (!comment) {
      throw new NotFoundError('Commentaire introuvable');
    }
    
    // Vérifier que l'utilisateur est l'auteur du commentaire OU du post OU admin
    if (
      comment.authorId !== req.user.id && 
      comment.post.authorId !== req.user.id &&
      req.user.role !== 'ADMIN'
    ) {
      throw new AuthorizationError('Vous ne pouvez supprimer que vos propres commentaires ou les commentaires sur vos posts');
    }
    
    await prisma.comment.delete({
      where: { id: commentId }
    });
    
    res.json({ message: 'Commentaire supprimé avec succès' });
    
  } catch (error) {
    next(error);
  }
};

