import prisma from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { generateToken, getTokenExpiry } from '../utils/token.js';
import { validateEmail, validatePassword, validateRequired } from '../utils/validators.js';
import { AuthenticationError, ConflictError, ValidationError } from '../utils/errors.js';

export const signup = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, gender } = req.body;
    
    validateRequired(['email', 'password', 'firstName', 'lastName'], req.body);
    validateEmail(email);
    validatePassword(password);
    
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
    
    const token = generateToken();
    const expiresAt = getTokenExpiry(parseInt(process.env.SESSION_TOKEN_EXPIRY_DAYS || '7'));
    
    await prisma.session.create({
      data: {
        token,
        expiresAt,
        userId: user.id
      }
    });
    
    res.cookie('sessionToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: expiresAt
    });
    
    res.status(201).json({
      message: 'Inscription réussie',
      user
    });
    
  } catch (error) {
    next(error);
  }
};

export const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    validateRequired(['email', 'password'], req.body);
    
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
    
    const token = generateToken();
    const expiresAt = getTokenExpiry(parseInt(process.env.SESSION_TOKEN_EXPIRY_DAYS || '7'));
    
    await prisma.session.create({
      data: {
        token,
        expiresAt,
        userId: user.id
      }
    });
    
    res.cookie('sessionToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: expiresAt
    });
    
    const { passwordHash: _, ...userWithoutPassword } = user;
    
    res.json({
      message: 'Connexion réussie',
      user: userWithoutPassword
    });
    
  } catch (error) {
    next(error);
  }
};

export const signout = async (req, res, next) => {
  try {
    const sessionId = req.sessionId;
    
    await prisma.session.delete({
      where: { id: sessionId }
    });
    
    res.clearCookie('sessionToken');
    
    res.json({ message: 'Déconnexion réussie' });
    
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const oldSessionId = req.sessionId;
    const userId = req.user.id;
    
    await prisma.session.delete({
      where: { id: oldSessionId }
    });
    
    const token = generateToken();
    const expiresAt = getTokenExpiry(parseInt(process.env.SESSION_TOKEN_EXPIRY_DAYS || '7'));
    
    await prisma.session.create({
      data: {
        token,
        expiresAt,
        userId
      }
    });
    
    res.cookie('sessionToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: expiresAt
    });
    
    res.json({ 
      message: 'Token renouvelé avec succès',
      expiresAt 
    });
    
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
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
        role: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            comments: true,
            addresses: true
          }
        }
      }
    });
    
    res.json({ user });
    
  } catch (error) {
    next(error);
  }
};

export const cleanupExpiredSessions = async (req, res, next) => {
  try {
    const result = await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });
    
    res.json({ 
      message: 'Sessions expirées nettoyées',
      count: result.count 
    });
    
  } catch (error) {
    next(error);
  }
};
