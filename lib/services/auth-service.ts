import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getUserByEmail, createUser, getUserById, updateLastActive, sanitizeUser } from '../models/user';

const JWT_SECRET = process.env.JWT_SECRET || 'interior-design-ai-secret';
const JWT_EXPIRES_IN = '7d';

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function signToken(userId: number, role: string): string {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): { userId: number; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; role: string };
  } catch {
    return null;
  }
}

export function registerUser(email: string, password: string, name: string) {
  const existing = getUserByEmail(email);
  if (existing) throw new Error('该邮箱已被注册');
  const hash = hashPassword(password);
  const user = createUser(email, hash, name);
  const token = signToken(user.id, user.role);
  return { user: sanitizeUser(user), token };
}

export function loginUser(email: string, password: string) {
  const user = getUserByEmail(email);
  if (!user) throw new Error('邮箱或密码错误');
  if (!verifyPassword(password, user.password)) throw new Error('邮箱或密码错误');
  updateLastActive(user.id);
  const token = signToken(user.id, user.role);
  return { user: sanitizeUser(user), token };
}

export function getUserFromToken(token: string) {
  const payload = verifyToken(token);
  if (!payload) return null;
  const user = getUserById(payload.userId);
  if (!user) return null;
  return sanitizeUser(user);
}
