import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/auth.service.js';
import type { AppError } from './error.middleware.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  // Check cookie or Authorization Bearer header
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    const error: AppError = new Error('Authentication required. Please log in.');
    error.statusCode = 401;
    return next(error);
  }

  try {
    const payload = verifyToken(token);
    req.user = {
      id: payload.userId,
      email: payload.email,
    };
    next();
  } catch (err) {
    next(err);
  }
}
