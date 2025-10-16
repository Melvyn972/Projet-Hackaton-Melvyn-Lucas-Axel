import prisma from '../config/database.js';
import { hashPassword } from '../utils/hash.js';
import { validateEmail, validateLength, validateRequired, validatePhone, validatePostalCode, validateUrl } from '../utils/validators.js';
import { NotFoundError, AuthorizationError, ValidationError, ConflictError } from '../utils/errors.js';

/**
 * Obtenir le profil de l'utilisateur connecté
 * GET /api/users/profile
 */
export const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        description: true,
        gender: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        addresses: {
          orderBy: { isPrimary: 'desc' }
        },
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
    
    res.json({ user });
    
  } catch (error) {
    next(error);
  }
};

/**
 * Modifier le profil de l'utilisateur connecté
 * PUT /api/users/profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, avatar, description, gender, email, phone } = req.body;
    
    const updateData = {};
    
    // Validation et ajout des champs à mettre à jour
    if (firstName !== undefined) {
      validateLength(firstName, 'Prénom', 50);
      updateData.firstName = firstName;
    }
    
    if (lastName !== undefined) {
      validateLength(lastName, 'Nom', 50);
      updateData.lastName = lastName;
    }
    
    if (avatar !== undefined) {
      validateLength(avatar, 'URL avatar', 500);
      validateUrl(avatar, 'URL avatar');
      updateData.avatar = avatar;
    }
    
    if (description !== undefined) {
      validateLength(description, 'Description', 1000);
      updateData.description = description;
    }
    
    if (gender !== undefined) {
      if (gender && !['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'].includes(gender)) {
        throw new ValidationError('Genre invalide');
      }
      // Mapper chaîne vide -> null pour l'enum Prisma
      updateData.gender = gender || null;
    }
    if (phone !== undefined) {
      validateLength(phone, 'Téléphone', 30);
      validatePhone(phone);
      updateData.phone = phone || null;
    }
    
    if (email !== undefined) {
      validateEmail(email);
      // Vérifier si l'email est déjà utilisé
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });
      if (existingUser && existingUser.id !== req.user.id) {
        throw new ConflictError('Cet email est déjà utilisé');
      }
      updateData.email = email.toLowerCase();
    }
    
    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        description: true,
        gender: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    res.json({
      message: 'Profil mis à jour avec succès',
      user: updatedUser
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * Consulter le profil d'un utilisateur par son ID
 * GET /api/users/:userId
 */
export const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        description: true,
        gender: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            receivedProfileComments: true
          }
        }
      }
    });
    
    if (!user) {
      throw new NotFoundError('Utilisateur introuvable');
    }
    
    // Récupérer les derniers posts de l'utilisateur
    const posts = await prisma.post.findMany({
      where: { authorId: userId },
      take: 10,
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
        }
      }
    });
    
    // Récupérer les commentaires sur le profil
    const profileComments = await prisma.profileComment.findMany({
      where: { targetUserId: userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
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
      user,
      posts,
      profileComments
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * Ajouter un commentaire sur le profil d'un utilisateur
 * POST /api/users/:userId/comments
 */
export const addProfileComment = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { content } = req.body;
    
    validateRequired(['content'], req.body);
    validateLength(content, 'Commentaire', 500);
    
    // Vérifier que l'utilisateur cible existe
    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!targetUser) {
      throw new NotFoundError('Utilisateur introuvable');
    }
    
    // Créer le commentaire
    const comment = await prisma.profileComment.create({
      data: {
        content,
        targetUserId: userId,
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
        targetUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true
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
 * Modifier un commentaire sur un profil
 * PUT /api/users/comments/:commentId
 */
export const updateProfileComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    
    validateRequired(['content'], req.body);
    validateLength(content, 'Commentaire', 500);
    
    // Récupérer le commentaire
    const comment = await prisma.profileComment.findUnique({
      where: { id: commentId }
    });
    
    if (!comment) {
      throw new NotFoundError('Commentaire introuvable');
    }
    
    // Vérifier que l'utilisateur est l'auteur
    if (comment.authorId !== req.user.id) {
      throw new AuthorizationError('Vous ne pouvez modifier que vos propres commentaires');
    }
    
    // Mettre à jour le commentaire
    const updatedComment = await prisma.profileComment.update({
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
 * Supprimer un commentaire sur un profil
 * DELETE /api/users/comments/:commentId
 */
export const deleteProfileComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    
    // Récupérer le commentaire
    const comment = await prisma.profileComment.findUnique({
      where: { id: commentId }
    });
    
    if (!comment) {
      throw new NotFoundError('Commentaire introuvable');
    }
    
    // Vérifier que l'utilisateur est l'auteur OU le propriétaire du profil
    if (comment.authorId !== req.user.id && comment.targetUserId !== req.user.id) {
      throw new AuthorizationError('Vous ne pouvez supprimer que vos propres commentaires ou les commentaires sur votre profil');
    }
    
    // Supprimer le commentaire
    await prisma.profileComment.delete({
      where: { id: commentId }
    });
    
    res.json({ message: 'Commentaire supprimé avec succès' });
    
  } catch (error) {
    next(error);
  }
};

/**
 * Ajouter une adresse
 * POST /api/users/addresses
 */
export const addAddress = async (req, res, next) => {
  try {
    const { street, city, postalCode, country, isPrimary } = req.body;
    
    validateRequired(['street', 'city', 'postalCode', 'country'], req.body);
    validatePostalCode(postalCode);
    
    // Si cette adresse est définie comme principale, retirer le flag des autres
    if (isPrimary) {
      await prisma.address.updateMany({
        where: { userId: req.user.id, isPrimary: true },
        data: { isPrimary: false }
      });
    }
    
    const address = await prisma.address.create({
      data: {
        street,
        city,
        postalCode,
        country,
        isPrimary: isPrimary || false,
        userId: req.user.id
      }
    });
    
    res.status(201).json({
      message: 'Adresse ajoutée avec succès',
      address
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * Modifier une adresse
 * PUT /api/users/addresses/:addressId
 */
export const updateAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const { street, city, postalCode, country, isPrimary } = req.body;
    if (postalCode !== undefined) validatePostalCode(postalCode);
    
    // Vérifier que l'adresse appartient à l'utilisateur
    const address = await prisma.address.findUnique({
      where: { id: addressId }
    });
    
    if (!address) {
      throw new NotFoundError('Adresse introuvable');
    }
    
    if (address.userId !== req.user.id) {
      throw new AuthorizationError('Vous ne pouvez modifier que vos propres adresses');
    }
    
    const updateData = {};
    if (street !== undefined) updateData.street = street;
    if (city !== undefined) updateData.city = city;
    if (postalCode !== undefined) updateData.postalCode = postalCode;
    if (country !== undefined) updateData.country = country;
    if (isPrimary !== undefined) {
      updateData.isPrimary = isPrimary;
      // Si cette adresse devient principale, retirer le flag des autres
      if (isPrimary) {
        await prisma.address.updateMany({
          where: { 
            userId: req.user.id, 
            isPrimary: true,
            id: { not: addressId }
          },
          data: { isPrimary: false }
        });
      }
    }
    
    const updatedAddress = await prisma.address.update({
      where: { id: addressId },
      data: updateData
    });
    
    res.json({
      message: 'Adresse modifiée avec succès',
      address: updatedAddress
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer une adresse
 * DELETE /api/users/addresses/:addressId
 */
export const deleteAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    
    // Vérifier que l'adresse appartient à l'utilisateur
    const address = await prisma.address.findUnique({
      where: { id: addressId }
    });
    
    if (!address) {
      throw new NotFoundError('Adresse introuvable');
    }
    
    if (address.userId !== req.user.id) {
      throw new AuthorizationError('Vous ne pouvez supprimer que vos propres adresses');
    }
    
    await prisma.address.delete({
      where: { id: addressId }
    });
    
    res.json({ message: 'Adresse supprimée avec succès' });
    
  } catch (error) {
    next(error);
  }
};

/**
 * Rechercher des utilisateurs
 * GET /api/users/search?q=...
 */
export const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      throw new ValidationError('La recherche doit contenir au moins 2 caractères');
    }
    
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } }
        ]
      },
      take: 20,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        description: true
      }
    });
    
    res.json({ users });
    
  } catch (error) {
    next(error);
  }
};

