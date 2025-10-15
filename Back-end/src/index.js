import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import postRoutes from './routes/post.routes.js';
import adminRoutes from './routes/admin.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie']
}));

app.use(express.json());
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// Route d'accueil
app.get('/', (req, res) => {
  res.json({
    name: 'Mini Réseau Social API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/*',
      users: '/api/users/*',
      posts: '/api/posts/*',
      admin: '/api/admin/*'
    },
    documentation: 'Consultez API_DOCUMENTATION.md pour plus de détails'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend is running!',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path 
  });
});

app.use((err, req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }
  
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Cette ressource existe déjà',
      field: err.meta?.target
    });
  }
  
  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Ressource introuvable'
    });
  }
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  });
}

export default app;
