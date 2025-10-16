export class AppError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentification échouée') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Accès refusé') {
    super(message, 403);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Échec de validation') {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Ressource introuvable') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'La ressource existe déjà') {
    super(message, 409);
  }
}

export class SessionExpiredError extends AppError {
  constructor(message = 'Session expirée') {
    super(message, 401);
  }
}

export class ContentLengthError extends ValidationError {
  constructor(field, maxLength) {
    super(`${field} dépasse la longueur maximale de ${maxLength} caractères`);
  }
}
