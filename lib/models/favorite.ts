import { getDb } from '../db';

export interface Favorite {
  id: number;
  user_id: number;
  record_id: number | null;
  original_image: string | null;
  result_image: string;
  tool_key: string | null;
  style: string | null;
  created_at: string;
}

export function addFavorite(userId: number, data: {
  recordId?: number;
  originalImage?: string;
  resultImage: string;
  toolKey?: string;
  style?: string;
}): number {
  const result = getDb().prepare(
    'INSERT INTO favorites (user_id, record_id, original_image, result_image, tool_key, style) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(userId, data.recordId || null, data.originalImage || null, data.resultImage, data.toolKey || null, data.style || null);
  return Number(result.lastInsertRowid);
}

export function getUserFavorites(userId: number, opts: { page?: number; limit?: number } = {}): { favorites: Favorite[]; total: number } {
  const page = opts.page || 1;
  const limit = opts.limit || 20;
  const offset = (page - 1) * limit;
  const total = (getDb().prepare('SELECT COUNT(*) as count FROM favorites WHERE user_id = ?').get(userId) as any).count;
  const favorites = getDb().prepare(
    'SELECT * FROM favorites WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
  ).all(userId, limit, offset) as Favorite[];
  return { favorites, total };
}

export function deleteFavorite(id: number, userId: number): boolean {
  const result = getDb().prepare('DELETE FROM favorites WHERE id = ? AND user_id = ?').run(id, userId);
  return result.changes > 0;
}
