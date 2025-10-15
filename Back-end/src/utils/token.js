import crypto from 'crypto';

export const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const getTokenExpiry = (days = 7) => {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + days);
  return expiry;
};
