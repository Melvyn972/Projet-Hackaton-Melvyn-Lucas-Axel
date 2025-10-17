import prisma from '../config/database.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';

/**
 * Obtenir les statistiques globales du dashboard
 * GET /api/admin/dashboard/stats
 */
export const getStats = async (req, res, next) => {
  try {
    // Statistiques générales
    const [
      totalUsers,
      totalPosts,
      totalComments,
      totalProfileComments,
      totalLikes,
      totalAddresses
    ] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.comment.count(),
      prisma.profileComment.count(),
      prisma.postLike.count(),
      prisma.address.count()
    ]);
    
    // Répartition par genre
    const genderStats = await prisma.user.groupBy({
      by: ['gender'],
      _count: true
    });
    
    // Utilisateurs avec au moins une adresse
    const usersWithAddress = await prisma.user.count({
      where: {
        addresses: {
          some: {}
        }
      }
    });
    
    // Utilisateurs créés dans les 7 derniers jours
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const newUsersLastWeek = await prisma.user.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    });
    
    // Posts créés dans les 7 derniers jours
    const newPostsLastWeek = await prisma.post.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    });
    
    // Moyenne de posts par utilisateur
    const avgPostsPerUser = totalUsers > 0 ? (totalPosts / totalUsers).toFixed(2) : 0;
    
    // Moyenne de commentaires par post
    const avgCommentsPerPost = totalPosts > 0 ? (totalComments / totalPosts).toFixed(2) : 0;
    
    // Moyenne de likes par post
    const avgLikesPerPost = totalPosts > 0 ? (totalLikes / totalPosts).toFixed(2) : 0;
    
    // Taux d'engagement (likes + commentaires) / posts
    const engagementRate = totalPosts > 0 
      ? (((totalLikes + totalComments) / totalPosts) * 100).toFixed(2) 
      : 0;
    
    res.json({
      overview: {
        totalUsers,
        totalPosts,
        totalComments,
        totalProfileComments,
        totalLikes,
        totalAddresses,
        usersWithAddress,
        newUsersLastWeek,
        newPostsLastWeek
      },
      genderDistribution: genderStats.map(stat => ({
        gender: stat.gender || 'Non renseigné',
        count: stat._count
      })),
      averages: {
        postsPerUser: parseFloat(avgPostsPerUser),
        commentsPerPost: parseFloat(avgCommentsPerPost),
        likesPerPost: parseFloat(avgLikesPerPost),
        engagementRate: parseFloat(engagementRate)
      }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir la liste de tous les utilisateurs avec filtres et pagination
 * GET /api/admin/dashboard/users
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      sortBy = 'createdAt', 
      order = 'desc',
      role,
      gender,
      search 
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Construction des filtres
    const where = {};
    
    if (role && ['USER', 'ADMIN'].includes(role)) {
      where.role = role;
    }
    
    if (gender && ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'].includes(gender)) {
      where.gender = gender;
    }
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Validation du champ de tri
    const validSortFields = ['createdAt', 'firstName', 'lastName', 'email'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder = order === 'asc' ? 'asc' : 'desc';
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortField]: sortOrder },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatar: true,
          description: true,
          gender: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          addresses: {
            orderBy: { isPrimary: 'desc' },
            select: {
              id: true,
              street: true,
              city: true,
              postalCode: true,
              country: true,
              isPrimary: true,
            }
          },
          _count: {
            select: {
              posts: true,
              comments: true,
              addresses: true,
              postLikes: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);
    
    res.json({
      users,
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
 * Obtenir les utilisateurs les plus actifs
 * GET /api/admin/dashboard/top-users
 */
export const getTopUsers = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    
    // Récupérer tous les utilisateurs avec leurs counts
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            comments: true,
            profileComments: true,
            postLikes: true
          }
        }
      }
    });
    
    // Calculer le score d'activité pour chaque utilisateur
    const usersWithScore = users.map(user => {
      const activityScore = 
        (user._count.posts * 5) +        // Posts valent 5 points
        (user._count.comments * 2) +      // Commentaires valent 2 points
        (user._count.profileComments * 2) + // Commentaires profil valent 2 points
        (user._count.postLikes * 1);      // Likes valent 1 point
      
      return {
        ...user,
        activityScore,
        totalActions: user._count.posts + user._count.comments + 
                     user._count.profileComments + user._count.postLikes
      };
    });
    
    // Trier par score d'activité et limiter
    const topUsers = usersWithScore
      .sort((a, b) => b.activityScore - a.activityScore)
      .slice(0, parseInt(limit));
    
    res.json({ topUsers });
    
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir les posts les plus populaires
 * GET /api/admin/dashboard/top-posts
 */
export const getTopPosts = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    
    const posts = await prisma.post.findMany({
      take: parseInt(limit),
      orderBy: [
        { likes: { _count: 'desc' } },
        { comments: { _count: 'desc' } }
      ],
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
    
    res.json({ posts });
    
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir les statistiques d'activité par jour (30 derniers jours)
 * GET /api/admin/dashboard/activity-timeline
 */
export const getActivityTimeline = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const daysCount = parseInt(days);
    
    if (daysCount > 365) {
      throw new ValidationError('Maximum 365 jours');
    }
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysCount);
    
    // Récupérer les utilisateurs créés par jour
    const usersByDay = await prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: startDate
        }
      },
      _count: true
    });
    
    // Récupérer les posts créés par jour
    const postsByDay = await prisma.post.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: startDate
        }
      },
      _count: true
    });
    
    // Formater les données par jour
    const timeline = [];
    for (let i = daysCount - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const usersCount = usersByDay.filter(u => {
        const createdAt = new Date(u.createdAt);
        return createdAt >= dayStart && createdAt <= dayEnd;
      }).reduce((sum, u) => sum + u._count, 0);
      
      const postsCount = postsByDay.filter(p => {
        const createdAt = new Date(p.createdAt);
        return createdAt >= dayStart && createdAt <= dayEnd;
      }).reduce((sum, p) => sum + p._count, 0);
      
      timeline.push({
        date: dayStart.toISOString().split('T')[0],
        newUsers: usersCount,
        newPosts: postsCount
      });
    }
    
    res.json({ timeline });
    
  } catch (error) {
    next(error);
  }
};

/**
 * Modifier le rôle d'un utilisateur
 * PUT /api/admin/users/:userId/role
 */
export const updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    if (!role || !['USER', 'ADMIN'].includes(role)) {
      throw new ValidationError('Rôle invalide. Doit être USER ou ADMIN');
    }
    
    // Ne pas permettre de se retirer soi-même le rôle admin
    if (userId === req.user.id && role === 'USER') {
      throw new ValidationError('Vous ne pouvez pas retirer votre propre rôle admin');
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });
    
    res.json({
      message: 'Rôle utilisateur modifié avec succès',
      user: updatedUser
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer un utilisateur (admin uniquement)
 * DELETE /api/admin/users/:userId
 */
export const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    // Ne pas permettre de se supprimer soi-même
    if (userId === req.user.id) {
      throw new ValidationError('Vous ne pouvez pas supprimer votre propre compte');
    }
    
    await prisma.user.delete({
      where: { id: userId }
    });
    
    res.json({ message: 'Utilisateur supprimé avec succès' });
    
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir les statistiques détaillées d'un utilisateur
 * GET /api/admin/users/:userId/stats
 */
export const getUserStats = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            posts: true,
            comments: true,
            profileComments: true,
            receivedProfileComments: true,
            postLikes: true,
            addresses: true,
            sessions: true
          }
        }
      }
    });
    
    if (!user) {
      throw new NotFoundError('Utilisateur introuvable');
    }
    
    // Récupérer les likes reçus sur les posts de l'utilisateur
    const likesReceived = await prisma.postLike.count({
      where: {
        post: {
          authorId: userId
        }
      }
    });
    
    // Récupérer les commentaires reçus sur les posts
    const commentsReceived = await prisma.comment.count({
      where: {
        post: {
          authorId: userId
        },
        authorId: {
          not: userId // Exclure les commentaires de l'utilisateur sur ses propres posts
        }
      }
    });
    
    const { passwordHash, ...userWithoutPassword } = user;
    
    res.json({
      user: userWithoutPassword,
      interactions: {
        likesReceived,
        commentsReceived,
        profileCommentsReceived: user._count.receivedProfileComments
      }
    });
    
  } catch (error) {
    next(error);
  }
};

