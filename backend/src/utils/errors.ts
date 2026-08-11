export class AppError extends Error {
  statusCode: number;
  errors?: unknown;
  data?: unknown;

  constructor(message: string, statusCode = 400, options?: { errors?: unknown; data?: unknown }) {
    super(message);
    this.statusCode = statusCode;
    this.errors = options?.errors;
    this.data = options?.data;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", errors?: unknown) {
    super(message, 400, { errors });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict", data?: unknown) {
    super(message, 409, { data });
  }
}
