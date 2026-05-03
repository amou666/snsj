import { getDb } from '../db';
import { safeUpdate } from '../utils/db';

export interface Plan {
  id: number;
  name: string;
  price_monthly: number | null;
  price_yearly: number | null;
  credits_per_month: number;
  max_projects: number;
  max_members: number;
  max_storage_mb: number;
  is_active: number;
  sort_order: number;
  created_at: string;
}

export function getAllPlans(): Plan[] {
  return getDb().prepare('SELECT * FROM plans ORDER BY sort_order ASC').all() as Plan[];
}

export function getActivePlans(): Plan[] {
  return getDb().prepare('SELECT * FROM plans WHERE is_active = 1 ORDER BY sort_order ASC').all() as Plan[];
}

export function getPlanById(id: number): Plan | null {
  return getDb().prepare('SELECT * FROM plans WHERE id = ?').get(id) as Plan || null;
}

export function createPlan(data: Omit<Plan, 'id' | 'created_at'>): Plan {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO plans (name, price_monthly, price_yearly, credits_per_month, max_projects, max_members, max_storage_mb, is_active, sort_order)
    VALUES (@name, @price_monthly, @price_yearly, @credits_per_month, @max_projects, @max_members, @max_storage_mb, @is_active, @sort_order)
  `).run(data);
  return getPlanById(Number(result.lastInsertRowid))!;
}

export function updatePlan(id: number, data: Partial<Plan>): Plan | null {
  safeUpdate('plans', id, data);
  return getPlanById(id);
}
