import { getDb } from '../db';

export interface ProjectAsset {
  id: number;
  project_id: number;
  folder_path: string;
  filename: string;
  file_type: string | null;
  file_data: string | null;
  file_size: number | null;
  version: number;
  description: string | null;
  created_by: number;
  created_at: string;
}

export function createAsset(data: Omit<ProjectAsset, 'id' | 'created_at'>): ProjectAsset {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO project_assets (project_id, folder_path, filename, file_type, file_data, file_size, version, description, created_by)
    VALUES (@project_id, @folder_path, @filename, @file_type, @file_data, @file_size, @version, @description, @created_by)
  `).run(data);
  return db.prepare('SELECT * FROM project_assets WHERE id = ?').get(Number(result.lastInsertRowid)) as ProjectAsset;
}

export function getAssetsByProject(projectId: number, folderPath?: string): ProjectAsset[] {
  const db = getDb();
  if (folderPath) {
    return db.prepare('SELECT * FROM project_assets WHERE project_id = ? AND folder_path = ? ORDER BY filename ASC').all(projectId, folderPath) as ProjectAsset[];
  }
  return db.prepare('SELECT * FROM project_assets WHERE project_id = ? ORDER BY folder_path, filename ASC').all(projectId) as ProjectAsset[];
}

export function deleteAsset(id: number): boolean {
  return (getDb().prepare('DELETE FROM project_assets WHERE id = ?').run(id).changes > 0);
}
