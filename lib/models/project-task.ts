import { getDb } from '../db';
import { safeUpdate } from '../utils/db';

export interface ProjectTask {
  id: number;
  project_id: number;
  title: string;
  description: string | null;
  assignee_id: number | null;
  task_type: string | null;
  due_date: string | null;
  priority: string;
  status: string;
  completed_at: string | null;
  created_at: string;
}

export function createTask(data: Omit<ProjectTask, 'id' | 'created_at' | 'completed_at'>): ProjectTask {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO project_tasks (project_id, title, description, assignee_id, task_type, due_date, priority, status)
    VALUES (@project_id, @title, @description, @assignee_id, @task_type, @due_date, @priority, @status)
  `).run(data);
  return db.prepare('SELECT * FROM project_tasks WHERE id = ?').get(Number(result.lastInsertRowid)) as ProjectTask;
}

export function getTasksByProject(projectId: number, opts?: { status?: string }): ProjectTask[] {
  const db = getDb();
  if (opts?.status) {
    return db.prepare('SELECT * FROM project_tasks WHERE project_id = ? AND status = ? ORDER BY due_date ASC, created_at DESC').all(projectId, opts.status) as ProjectTask[];
  }
  return db.prepare('SELECT * FROM project_tasks WHERE project_id = ? ORDER BY status ASC, due_date ASC, created_at DESC').all(projectId) as ProjectTask[];
}

export function updateTask(id: number, data: Partial<ProjectTask>): ProjectTask | null {
  const db = getDb();
  const fields: string[] = [];
  const values: any[] = [];
  for (const [k, v] of Object.entries(data)) {
    if (k === 'id' || k === 'created_at') continue;
    fields.push(`${k} = ?`);
    values.push(v);
  }
  if (fields.length === 0) return null;
  values.push(id);
  db.prepare(`UPDATE project_tasks SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  return db.prepare('SELECT * FROM project_tasks WHERE id = ?').get(id) as ProjectTask;
}

export function deleteTask(id: number): boolean {
  return (getDb().prepare('DELETE FROM project_tasks WHERE id = ?').run(id).changes > 0);
}
