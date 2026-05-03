import { getDb } from '../db';
import { safeUpdate } from '../utils/db';

export interface HelpArticle {
  id: number;
  title: string;
  category: string;
  tags: string | null;
  content: string;
  cover_image: string | null;
  sort_order: number;
  is_published: number;
  created_at: string;
  updated_at: string;
}

export function getPublishedArticles(category?: string): HelpArticle[] {
  const db = getDb();
  if (category) {
    return db.prepare('SELECT * FROM help_articles WHERE is_published = 1 AND category = ? ORDER BY sort_order ASC, created_at DESC').all(category) as HelpArticle[];
  }
  return db.prepare('SELECT * FROM help_articles WHERE is_published = 1 ORDER BY category, sort_order ASC, created_at DESC').all() as HelpArticle[];
}

export function getArticleById(id: number): HelpArticle | null {
  return getDb().prepare('SELECT * FROM help_articles WHERE id = ?').get(id) as HelpArticle || null;
}

export function getAllArticles(): HelpArticle[] {
  return getDb().prepare('SELECT * FROM help_articles ORDER BY category, sort_order ASC, created_at DESC').all() as HelpArticle[];
}

export function createArticle(data: Omit<HelpArticle, 'id' | 'created_at' | 'updated_at'>): HelpArticle {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO help_articles (title, category, tags, content, cover_image, sort_order, is_published)
    VALUES (@title, @category, @tags, @content, @cover_image, @sort_order, @is_published)
  `).run(data);
  return getArticleById(Number(result.lastInsertRowid))!;
}

export function updateArticle(id: number, data: Partial<HelpArticle>): HelpArticle | null {
  const db = getDb();
  const fields: string[] = [];
  const values: any[] = [];
  for (const [k, v] of Object.entries(data)) {
    if (k === 'id' || k === 'created_at') continue;
    fields.push(`${k} = ?`);
    values.push(v);
  }
  if (fields.length === 0) return getArticleById(id);
  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);
  db.prepare(`UPDATE help_articles SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  return getArticleById(id);
}

export function deleteArticle(id: number): boolean {
  return (getDb().prepare('DELETE FROM help_articles WHERE id = ?').run(id).changes > 0);
}
