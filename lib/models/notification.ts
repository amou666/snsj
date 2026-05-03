import { getDb } from '../db';

export interface Notification {
  id: number;
  user_id: number | null;
  title: string;
  content: string;
  type: string;
  is_read: number;
  created_at: string;
}

export function createNotification(data: Omit<Notification, 'id' | 'created_at'>): Notification {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO notifications (user_id, title, content, type, is_read)
    VALUES (@user_id, @title, @content, @type, @is_read)
  `).run(data);
  return db.prepare('SELECT * FROM notifications WHERE id = ?').get(Number(result.lastInsertRowid)) as Notification;
}

export function getNotificationsByUser(userId: number, limit = 20): Notification[] {
  return getDb().prepare('SELECT * FROM notifications WHERE user_id = ? OR user_id IS NULL ORDER BY created_at DESC LIMIT ?').all(userId, limit) as Notification[];
}

export function markNotificationRead(id: number): void {
  getDb().prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(id);
}

export function markAllNotificationsRead(userId: number): void {
  getDb().prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ? OR user_id IS NULL').run(userId);
}

export function getUnreadCount(userId: number): number {
  return (getDb().prepare('SELECT COUNT(*) as c FROM notifications WHERE (user_id = ? OR user_id IS NULL) AND is_read = 0').get(userId) as any).c;
}
