import { ValidationError, ContentLengthError } from './errors.js';

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError("Format d'email invalide");
  }
  return true;
};

export const validatePassword = (password) => {
  if (password.length < 8) {
    throw new ValidationError('Le mot de passe doit contenir au moins 8 caractères');
  }
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  if (!hasUpperCase || !hasLowerCase || !hasNumber) {
    throw new ValidationError('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre');
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
    throw new ValidationError(`Champs requis manquants: ${missing.join(', ')}`);
  }
  return true;
};

export const validatePhone = (phone) => {
  if (!phone) return true;
  // Accepte formats internationaux simples + espaces
  const phoneRegex = /^[+]?([0-9][\s-]?){6,15}$/;
  if (!phoneRegex.test(phone)) {
    throw new ValidationError('Numéro de téléphone invalide');
  }
  return true;
};

export const validatePostalCode = (postalCode) => {
  if (!postalCode) return true;
  const pc = String(postalCode).trim();
  if (pc.length < 3 || pc.length > 10) {
    throw new ValidationError('Code postal invalide');
  }
  return true;
};

export const validateUrl = (url, fieldName = 'URL') => {
  if (!url) return true;
  try {
    new URL(url);
    return true;
  } catch {
    throw new ValidationError(`${fieldName} invalide`);
  }
};
