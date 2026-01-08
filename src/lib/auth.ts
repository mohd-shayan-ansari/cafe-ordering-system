import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import User from '@/models/User';

const SESSION_SECRET = process.env.SESSION_SECRET || 'fallback-secret-dev-only';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: { userId: string; role: string }): string {
  return jwt.sign(payload, SESSION_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string; role: string } | null {
  try {
    const decoded = jwt.verify(token, SESSION_SECRET) as { userId: string; role: string };
    console.log(`[Auth] Token verified successfully for userId: ${decoded.userId}, role: ${decoded.role}`);
    return decoded;
  } catch (error) {
    console.error(`[Auth] Token verification failed:`, error instanceof Error ? error.message : String(error));
    console.log(`[Auth] SESSION_SECRET is set: ${!!process.env.SESSION_SECRET}`);
    return null;
  }
}

export async function setSessionCookie(userId: string, role: string) {
  const token = signToken({ userId, role });
  console.log(`[Auth] Creating token for userId: ${userId}, role: ${role}`);
  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
  console.log(`[Auth] Cookie set successfully. Node env: ${process.env.NODE_ENV}`);
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

export async function getSession(): Promise<{ userId: string; role: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  const user = await User.findById(session.userId).select('-passwordHash').lean();
  return user;
}

export function getSessionFromRequest(req: NextRequest): { userId: string; role: string } | null {
  const token = req.cookies.get('session')?.value;
  if (!token) return null;
  return verifyToken(token);
}
