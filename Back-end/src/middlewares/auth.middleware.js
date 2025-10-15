import prisma from '../config/database.js';
import { AuthenticationError, SessionExpiredError, AuthorizationError } from '../utils/errors.js';

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies.sessionToken;
    
    if (!token) {
      throw new AuthenticationError('No session token provided');
    }
    
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true }
    });
    
    if (!session) {
      throw new AuthenticationError('Invalid session token');
    }
    
    if (new Date() > session.expiresAt) {
      await prisma.session.delete({ where: { id: session.id } });
      throw new SessionExpiredError();
    }
    
    req.user = session.user;
    req.sessionId = session.id;
    
    next();
  } catch (error) {
    next(error);
  }
};

export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      throw new AuthorizationError('Admin access required');
    }
    next();
  } catch (error) {
    next(error);
  }
};
