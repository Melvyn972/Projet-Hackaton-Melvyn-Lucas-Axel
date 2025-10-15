import { ValidationError, ContentLengthError } from './errors.js';

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format');
  }
  return true;
};

export const validatePassword = (password) => {
  if (password.length < 8) {
    throw new ValidationError('Password must be at least 8 characters long');
  }
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  if (!hasUpperCase || !hasLowerCase || !hasNumber) {
    throw new ValidationError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
  }
  
  return true;
};

export const validateLength = (value, fieldName, maxLength) => {
  if (value && value.length > maxLength) {
    throw new ContentLengthError(fieldName, maxLength);
  }
  return true;
};

export const validateRequired = (fields, data) => {
  const missing = fields.filter(field => !data[field]);
  if (missing.length > 0) {
    throw new ValidationError(`Missing required fields: ${missing.join(', ')}`);
  }
  return true;
};
