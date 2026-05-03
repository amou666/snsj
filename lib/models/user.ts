import { getDb } from '../db';

export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  role: 'user' | 'admin';
  credits: number;
  onboarded: number;
  last_active_at: string | null;
  created_at: string;
  updated_at: string;
}

export function getUserById(id: number): User | undefined {
  return getDb().prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
}

export function getUserByEmail(email: string): User | undefined {
  return getDb().prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;
}

export function createUser(email: string, password: string, name: string): User {
  const result = getDb().prepare(
    'INSERT INTO users (email, password, name, role, credits) VALUES (?, ?, ?, ?, ?)'
  ).run(email, password, name, 'user', 0);
  return getUserById(result.lastInsertRowid as number)!;
}

export function updateUserCredits(userId: number, amount: number): void {
  getDb().prepare('UPDATE users SET credits = credits + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(amount, userId);
}

export function updateUserOnboarded(userId: number): void {
  getDb().prepare('UPDATE users SET onboarded = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(userId);
}

export function updateLastActive(userId: number): void {
  getDb().prepare('UPDATE users SET last_active_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(userId);
}

export function getAllUsers(opts: { page?: number; limit?: number; search?: string } = {}): { users: any[]; total: number } {
  const page = opts.page || 1;
  const limit = opts.limit || 20;
  const offset = (page - 1) * limit;
  const search = opts.search || '';

  let where = '';
  const params: any[] = [];
  if (search) {
    where = 'WHERE email LIKE ? OR name LIKE ?';
    params.push(`%${search}%`, `%${search}%`);
  }

  const total = (getDb().prepare(`SELECT COUNT(*) as count FROM users ${where}`).get(...params) as any).count;
  const users = getDb().prepare(`SELECT id, email, name, role, credits, onboarded, last_active_at, created_at FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .all(...params, limit, offset);
  return { users, total };
}

export function updateUserRole(userId: number, role: string): void {
  getDb().prepare('UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(role, userId);
}

export function adjustUserCredits(userId: number, amount: number, description: string): void {
  const db = getDb();
  const tx = db.transaction(() => {
    const user = getUserById(userId);
    if (!user) throw new Error('User not found');
    const newBalance = user.credits + amount;
    if (newBalance < 0) throw new Error('Insufficient credits');
    updateUserCredits(userId, amount);
    db.prepare(
      'INSERT INTO credits_log (user_id, amount, balance_after, type, status, description) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(userId, amount, newBalance, amount > 0 ? 'admin_adjust' : 'admin_deduct', 'success', description);
  });
  tx();
}

export function getUserCount(): number {
  return (getDb().prepare('SELECT COUNT(*) as count FROM users').get() as any).count;
}

export function getActiveUserCount(days: number = 7): number {
  return (getDb().prepare(`SELECT COUNT(*) as count FROM users WHERE last_active_at >= datetime('now', '-${days} days')`).get() as any).count;
}

// Return user without password
export function sanitizeUser(user: User): Omit<User, 'password'> {
  const { password, ...rest } = user;
  return rest;
}
