import { getDb } from '../db';
import { safeUpdate } from '../utils/db';

export interface Project {
  id: number;
  user_id: number;
  name: string;
  client_name: string | null;
  client_phone: string | null;
  client_wechat: string | null;
  client_email: string | null;
  address: string | null;
  building_name: string | null;
  area: number | null;
  house_type: string | null;
  budget_min: number | null;
  budget_max: number | null;
  stage: string;
  priority: string;
  deadline: string | null;
  source: string | null;
  tags: string | null;
  status: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export const PROJECT_STAGES = [
  { key: 'client_filing', label: '客户建档', icon: '👤' },
  { key: 'requirement', label: '需求采集', icon: '📝' },
  { key: 'design', label: '方案设计', icon: '🎨' },
  { key: 'confirm', label: '确认签约', icon: '✅' },
  { key: 'construction', label: '施工跟进', icon: '🔨' },
  { key: 'complete', label: '完工归档', icon: '🏠' },
] as const;

export function createProject(data: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'stage' | 'status'>): Project {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO projects (user_id, name, client_name, client_phone, client_wechat, client_email, address, building_name, area, house_type, budget_min, budget_max, priority, deadline, source, tags, description)
    VALUES (@user_id, @name, @client_name, @client_phone, @client_wechat, @client_email, @address, @building_name, @area, @house_type, @budget_min, @budget_max, @priority, @deadline, @source, @tags, @description)
  `);
  const result = stmt.run(data);
  return getProjectById(result.lastInsertRowid as number)!;
}

export function getProjectById(id: number): Project | null {
  const db = getDb();
  return db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as Project || null;
}

export function getProjectsByUserId(userId: number, opts?: { stage?: string; search?: string; page?: number; limit?: number }): { data: Project[]; total: number } {
  const db = getDb();
  const page = opts?.page || 1;
  const limit = opts?.limit || 20;
  const offset = (page - 1) * limit;

  let where = 'WHERE user_id = ? AND status != ?';
  const params: any[] = [userId, 'deleted'];

  if (opts?.stage) { where += ' AND stage = ?'; params.push(opts.stage); }
  if (opts?.search) {
    where += ' AND (name LIKE ? OR client_name LIKE ? OR address LIKE ? OR building_name LIKE ?)';
    const s = `%${opts.search}%`;
    params.push(s, s, s, s);
  }

  const total = (db.prepare(`SELECT COUNT(*) as count FROM projects ${where}`).get(...params) as any).count;
  const data = db.prepare(`SELECT * FROM projects ${where} ORDER BY updated_at DESC LIMIT ? OFFSET ?`).all(...params, limit, offset) as Project[];

  return { data, total };
}

export function updateProject(id: number, data: Partial<Project>): Project | null {
  safeUpdate('projects', id, data);
  return getProjectById(id);
}

export function advanceProjectStage(id: number, direction: 'forward' | 'backward' = 'forward'): Project | null {
  const project = getProjectById(id);
  if (!project) return null;

  const stageKeys = PROJECT_STAGES.map(s => s.key) as string[];
  const currentIdx = stageKeys.indexOf(project.stage);

  if (direction === 'forward' && currentIdx < stageKeys.length - 1) {
    return updateProject(id, { stage: stageKeys[currentIdx + 1] });
  } else if (direction === 'backward' && currentIdx > 0) {
    return updateProject(id, { stage: stageKeys[currentIdx - 1] });
  }
  return project;
}

export function deleteProject(id: number): boolean {
  const db = getDb();
  const result = db.prepare('UPDATE projects SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run('deleted', id);
  return result.changes > 0;
}

export function getProjectStats(userId: number) {
  const db = getDb();
  const total = (db.prepare('SELECT COUNT(*) as c FROM projects WHERE user_id = ? AND status != ?').get(userId, 'deleted') as any).c;
  const byStage = db.prepare('SELECT stage, COUNT(*) as c FROM projects WHERE user_id = ? AND status != ? GROUP BY stage').all(userId, 'deleted') as any[];
  const active = (db.prepare("SELECT COUNT(*) as c FROM projects WHERE user_id = ? AND status = 'active' AND stage NOT IN ('complete')").get(userId) as any).c;
  return { total, active, byStage: Object.fromEntries(byStage.map(r => [r.stage, r.c])) };
}

export function getProjectCount(): number {
  const db = getDb();
  return (db.prepare('SELECT COUNT(*) as count FROM projects WHERE status != ?').get('deleted') as any).count;
}
