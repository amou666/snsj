import { getDb } from '../db';
import { safeUpdate } from '../utils/db';

export interface ProjectPayment {
  id: number;
  project_id: number;
  milestone: string;
  amount: number;
  status: string;
  paid_at: string | null;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
}

export function createPayment(data: Omit<ProjectPayment, 'id' | 'created_at' | 'paid_at'>): ProjectPayment {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO project_payments (project_id, milestone, amount, status, payment_method, notes)
    VALUES (@project_id, @milestone, @amount, @status, @payment_method, @notes)
  `).run(data);
  return db.prepare('SELECT * FROM project_payments WHERE id = ?').get(Number(result.lastInsertRowid)) as ProjectPayment;
}

export function getPaymentsByProject(projectId: number): ProjectPayment[] {
  return getDb().prepare('SELECT * FROM project_payments WHERE project_id = ? ORDER BY created_at ASC').all(projectId) as ProjectPayment[];
}

export function updatePayment(id: number, data: Partial<ProjectPayment>): ProjectPayment | null {
  safeUpdate('project_payments', id, data);
  return getDb().prepare('SELECT * FROM project_payments WHERE id = ?').get(id) as ProjectPayment;
}
