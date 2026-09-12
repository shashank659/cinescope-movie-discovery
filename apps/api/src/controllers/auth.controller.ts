import type { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, email, password } = req.body;
    const { user, token } = await authService.registerUser({ name, email, password });

    res.cookie('token', token, COOKIE_OPTIONS);
    res.status(201).json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.loginUser({ email, password });

    res.cookie('token', token, COOKIE_OPTIONS);
    res.status(200).json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}

export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized', statusCode: 401 } });
      return;
    }

    const user = await authService.getUserById(userId);
    res.status(200).json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}

export async function logout(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    res.clearCookie('token', COOKIE_OPTIONS);
    res.status(200).json({ success: true, data: { message: 'Logged out successfully' } });
  } catch (err) {
    next(err);
  }
}
