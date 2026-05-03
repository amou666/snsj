import { getDb } from '../db';

export interface ProjectCommunication {
  id: number;
  project_id: number;
  channel: string | null;
  summary: string;
  detail: string | null;
  action_taken: string | null;
  created_by: number;
  created_at: string;
}

export function createCommunication(data: Omit<ProjectCommunication, 'id' | 'created_at'>): ProjectCommunication {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO project_communications (project_id, channel, summary, detail, action_taken, created_by)
    VALUES (@project_id, @channel, @summary, @detail, @action_taken, @created_by)
  `).run(data);
  return db.prepare('SELECT * FROM project_communications WHERE id = ?').get(Number(result.lastInsertRowid)) as ProjectCommunication;
}

export function getCommunicationsByProject(projectId: number): ProjectCommunication[] {
  return getDb().prepare('SELECT * FROM project_communications WHERE project_id = ? ORDER BY created_at DESC').all(projectId) as ProjectCommunication[];
}
