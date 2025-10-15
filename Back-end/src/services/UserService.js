import prisma from '../config/database.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';

class UserService {
  async getUserById(userId, includeRelations = false) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
        ...(includeRelations && {
          addresses: true,
          _count: {
            select: {
              posts: true,
              comments: true,
              profileComments: true,
              postLikes: true
            }
          }
        })
      }
    });
    
    if (!user) {
      throw new NotFoundError('Utilisateur introuvable');
    }
    
    return user;
  }

  async updateUser(userId, updateData) {
    if (updateData.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: updateData.email.toLowerCase() }
      });
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictError('Cet email est déjà utilisé');
      }
      updateData.email = updateData.email.toLowerCase();
    }
    
    return await prisma.user.update({
      where: { id: userId },
      data: updateData,
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
        updatedAt: true
      }
    });
  }

  async searchUsers(query) {
    return await prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } }
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
  }

  async addAddress(userId, addressData) {
    if (addressData.isPrimary) {
      await prisma.address.updateMany({
        where: { userId, isPrimary: true },
        data: { isPrimary: false }
      });
    }
    
    return await prisma.address.create({
      data: { ...addressData, userId }
    });
  }

  async updateAddress(addressId, userId, updateData) {
    const address = await prisma.address.findUnique({
      where: { id: addressId }
    });
    
    if (!address) {
      throw new NotFoundError('Adresse introuvable');
    }
    
    if (address.userId !== userId) {
      throw new AuthorizationError('Vous ne pouvez modifier que vos propres adresses');
    }
    
    if (updateData.isPrimary) {
      await prisma.address.updateMany({
        where: { userId, isPrimary: true, id: { not: addressId } },
        data: { isPrimary: false }
      });
    }
    
    return await prisma.address.update({
      where: { id: addressId },
      data: updateData
    });
  }

  async deleteAddress(addressId, userId) {
    const address = await prisma.address.findUnique({
      where: { id: addressId }
    });
    
    if (!address) {
      throw new NotFoundError('Adresse introuvable');
    }
    
    if (address.userId !== userId) {
      throw new AuthorizationError('Vous ne pouvez supprimer que vos propres adresses');
    }
    
    await prisma.address.delete({ where: { id: addressId } });
  }
}

export default new UserService();

