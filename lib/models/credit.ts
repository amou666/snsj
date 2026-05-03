import { getDb } from '../db';

export interface CreditLog {
  id: number;
  user_id: number;
  amount: number;
  balance_after: number;
  type: string;
  tool_key: string | null;
  request_id: string | null;
  model_used: string | null;
  status: string;
  description: string | null;
  created_at: string;
}

export function createCreditLog(log: {
  user_id: number;
  amount: number;
  balance_after: number;
  type: string;
  tool_key?: string;
  request_id?: string;
  model_used?: string;
  status?: string;
  description?: string;
}): void {
  getDb().prepare(
    `INSERT INTO credits_log (user_id, amount, balance_after, type, tool_key, request_id, model_used, status, description)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    log.user_id, log.amount, log.balance_after, log.type,
    log.tool_key || null, log.request_id || null, log.model_used || null,
    log.status || 'success', log.description || null
  );
}

export function getCreditsLog(userId: number, opts: { page?: number; limit?: number } = {}): { logs: CreditLog[]; total: number } {
  const page = opts.page || 1;
  const limit = opts.limit || 20;
  const offset = (page - 1) * limit;
  const total = (getDb().prepare('SELECT COUNT(*) as count FROM credits_log WHERE user_id = ?').get(userId) as any).count;
  const logs = getDb().prepare(
    'SELECT * FROM credits_log WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
  ).all(userId, limit, offset) as CreditLog[];
  return { logs, total };
}

export function getAllCreditsLog(opts: { page?: number; limit?: number } = {}): { logs: CreditLog[]; total: number } {
  const page = opts.page || 1;
  const limit = opts.limit || 20;
  const offset = (page - 1) * limit;
  const total = (getDb().prepare('SELECT COUNT(*) as count FROM credits_log').get() as any).count;
  const logs = getDb().prepare(
    'SELECT cl.*, u.email as user_email FROM credits_log cl LEFT JOIN users u ON cl.user_id = u.id ORDER BY cl.created_at DESC LIMIT ? OFFSET ?'
  ).all(limit, offset) as CreditLog[];
  return { logs, total };
}

export function getTodayUsageCount(): number {
  return (getDb().prepare("SELECT COUNT(*) as count FROM credits_log WHERE type IN ('analysis', 'generation') AND date(created_at) = date('now')").get() as any).count;
}
