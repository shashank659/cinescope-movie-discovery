import type { AuthUser, AuthResponse, ApiResponse } from '@cinescope/shared';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export function getStoredToken(): string | null {
  return null;
}

export function setStoredToken(_token: string | null): void {
  // No-op: Authentication is securely handled by HTTP-only cookies
}

export function getAuthHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

export async function register(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(input),
    credentials: 'include',
  });

  const body = (await res.json()) as ApiResponse<AuthResponse>;
  if (!res.ok || !body.success || !body.data) {
    throw new Error(body?.error?.message || 'Registration failed');
  }

  return body.data;
}

export async function login(input: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(input),
    credentials: 'include',
  });

  const body = (await res.json()) as ApiResponse<AuthResponse>;
  if (!res.ok || !body.success || !body.data) {
    throw new Error(body?.error?.message || 'Login failed');
  }

  return body.data;
}

export async function getMe(): Promise<AuthUser> {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  const body = (await res.json()) as ApiResponse<{ user: AuthUser }>;
  if (!res.ok || !body.success || !body.data) {
    throw new Error(body?.error?.message || 'Unauthorized');
  }

  return body.data.user;
}

export async function logout(): Promise<void> {
  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
}
