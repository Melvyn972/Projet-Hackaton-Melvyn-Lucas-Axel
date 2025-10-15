import prisma from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { generateToken, getTokenExpiry } from '../utils/token.js';
import { AuthenticationError, ConflictError } from '../utils/errors.js';

class AuthService {
  async createUser(userData) {
    const { email, password, firstName, lastName, gender } = userData;
    
    const existingUser = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() } 
    });
    
    if (existingUser) {
      throw new ConflictError('Cet email est déjà utilisé');
    }
    
    const passwordHash = await hashPassword(password);
    
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        gender: gender || null
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        description: true,
        gender: true,
        role: true,
        createdAt: true
      }
    });
    
    return user;
  }

  async authenticateUser(email, password) {
    const user = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() } 
    });
    
    if (!user) {
      throw new AuthenticationError('Email ou mot de passe incorrect');
    }
    
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    
    if (!isPasswordValid) {
      throw new AuthenticationError('Email ou mot de passe incorrect');
    }
    
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async createSession(userId) {
    const token = generateToken();
    const expiresAt = getTokenExpiry(parseInt(process.env.SESSION_TOKEN_EXPIRY_DAYS || '7'));
    
    await prisma.session.create({
      data: { token, expiresAt, userId }
    });
    
    return { token, expiresAt };
  }

  async deleteSession(sessionId) {
    await prisma.session.delete({ where: { id: sessionId } });
  }

  async refreshSession(oldSessionId, userId) {
    await this.deleteSession(oldSessionId);
    return await this.createSession(userId);
  }

  async cleanExpiredSessions() {
    const result = await prisma.session.deleteMany({
      where: { expiresAt: { lt: new Date() } }
    });
    return result.count;
  }
}

export default new AuthService();

