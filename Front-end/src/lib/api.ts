import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  description?: string;
  gender?: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface Post {
  id: string;
  content: string;
  imageUrl?: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  _count: {
    comments: number;
    likes: number;
  };
  isLikedByCurrentUser: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const authApi = {
  signup: (data: { email: string; password: string; firstName: string; lastName: string; gender?: string; phone?: string; address?: { street: string; city: string; postalCode: string; country: string } }) =>
    api.post('/auth/signup', data),
  signin: (email: string, password: string) => api.post('/auth/signin', { email, password }),
  signout: () => api.post('/auth/signout'),
  getCurrentUser: () => api.get('/auth/me'),
};

export const userApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: Partial<User>) => api.put('/users/profile', data),
  getUserById: (userId: string) => api.get(`/users/${userId}`),
  searchUsers: (query: string) => api.get(`/users/search?q=${query}`),
  addProfileComment: (userId: string, content: string) => api.post(`/users/${userId}/comments`, { content }),
  updateProfileComment: (commentId: string, content: string) =>
    api.put(`/users/comments/${commentId}`, { content }),
  deleteProfileComment: (commentId: string) => api.delete(`/users/comments/${commentId}`),
  // Adresses
  addAddress: (data: { street: string; city: string; postalCode: string; country: string; isPrimary?: boolean }) =>
    api.post('/users/addresses', data),
  updateAddress: (addressId: string, data: Partial<{ street: string; city: string; postalCode: string; country: string; isPrimary: boolean }>) =>
    api.put(`/users/addresses/${addressId}`, data),
  deleteAddress: (addressId: string) => api.delete(`/users/addresses/${addressId}`),
};

export const postApi = {
  getPosts: (page = 1, limit = 20) => api.get(`/posts?page=${page}&limit=${limit}`),
  getPostById: (postId: string) => api.get(`/posts/${postId}`),
  createPost: (content: string, imageUrl?: string) => api.post('/posts', { content, imageUrl }),
  updatePost: (postId: string, content: string, imageUrl?: string) => 
    api.put(`/posts/${postId}`, { content, imageUrl }),
  deletePost: (postId: string) => api.delete(`/posts/${postId}`),
  likePost: (postId: string) => api.post(`/posts/${postId}/like`),
  unlikePost: (postId: string) => api.delete(`/posts/${postId}/like`),
  addComment: (postId: string, content: string) => api.post(`/posts/${postId}/comments`, { content }),
  updateComment: (commentId: string, content: string) => 
    api.put(`/posts/comments/${commentId}`, { content }),
  deleteComment: (commentId: string) => api.delete(`/posts/comments/${commentId}`),
};

export const adminApi = {
  getStats: () => api.get('/admin/dashboard/stats'),
  getAllUsers: (params?: any) => api.get('/admin/dashboard/users', { params }),
  getTopUsers: (limit = 10) => api.get(`/admin/dashboard/top-users?limit=${limit}`),
  getTopPosts: (limit = 10) => api.get(`/admin/dashboard/top-posts?limit=${limit}`),
  getActivityTimeline: (days = 30) => api.get(`/admin/dashboard/activity-timeline?days=${days}`),
  getUserStats: (userId: string) => api.get(`/admin/users/${userId}/stats`),
  updateUserRole: (userId: string, role: 'USER' | 'ADMIN') =>
    api.put(`/admin/users/${userId}/role`, { role }),
  deleteUser: (userId: string) => api.delete(`/admin/users/${userId}`),
};

export default api;

