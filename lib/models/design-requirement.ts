import { getDb } from '../db';

export interface DesignRequirement {
  id: number;
  project_id: number;
  rooms: string | null;
  style_preferences: string | null;
  functional_needs: string | null;
  special_requirements: string | null;
  family_members: string | null;
  lifestyle_info: string | null;
  reference_images: string | null;
  ai_report: string | null;
  created_at: string;
  updated_at: string;
}

export function getRequirementByProject(projectId: number): DesignRequirement | null {
  return getDb().prepare('SELECT * FROM design_requirements WHERE project_id = ?').get(projectId) as DesignRequirement || null;
}

export function upsertRequirement(projectId: number, data: Partial<DesignRequirement>): DesignRequirement {
  const db = getDb();
  const existing = getRequirementByProject(projectId);

  if (existing) {
    const fields: string[] = [];
    const values: any[] = [];
    for (const [k, v] of Object.entries(data)) {
      if (k === 'id' || k === 'project_id' || k === 'created_at') continue;
      fields.push(`${k} = ?`);
      values.push(typeof v === 'object' && v !== null ? JSON.stringify(v) : v);
    }
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(projectId);
    db.prepare(`UPDATE design_requirements SET ${fields.join(', ')} WHERE project_id = ?`).run(...values);
  } else {
    const cols = ['project_id'];
    const vals: any[] = [projectId];
    const placeholders = ['?'];
    for (const [k, v] of Object.entries(data)) {
      if (k === 'id' || k === 'created_at' || k === 'updated_at') continue;
      cols.push(k);
      vals.push(typeof v === 'object' && v !== null ? JSON.stringify(v) : v);
      placeholders.push('?');
    }
    db.prepare(`INSERT INTO design_requirements (${cols.join(', ')}) VALUES (${placeholders.join(', ')})`).run(...vals);
  }
  return getRequirementByProject(projectId)!;
}
