import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import type { AppError } from '../middlewares/error.middleware.js';
import type { AuthUser } from '@cinescope/shared';

export interface JwtPayload {
  userId: string;
  email: string;
}

export interface AuthResult {
  user: AuthUser;
  token: string;
}

export function sanitizeUser(user: {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt.toISOString(),
  };
}

export function generateToken(userId: string, email: string): string {
  // Cast to any to avoid StringOptions TypeScript mismatch in jsonwebtoken types
  return jwt.sign({ userId, email }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
}

export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  } catch {
    const error: AppError = new Error('Invalid or expired authentication token');
    error.statusCode = 401;
    throw error;
  }
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  const existing = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (existing) {
    const error: AppError = new Error('An account with this email already exists');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email: input.email.toLowerCase().trim(),
      passwordHash,
    },
  });

  const token = generateToken(user.id, user.email);

  return {
    user: sanitizeUser(user),
    token,
  };
}

export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase().trim() },
  });

  if (!user) {
    const error: AppError = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

  if (!isPasswordValid) {
    const error: AppError = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user.id, user.email);

  return {
    user: sanitizeUser(user),
    token,
  };
}

export async function getUserById(userId: string): Promise<AuthUser> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    const error: AppError = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return sanitizeUser(user);
}
