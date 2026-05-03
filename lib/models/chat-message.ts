import { getDb } from '../db';

export interface ChatMessage {
  id: number;
  user_id: number;
  session_id: string;
  role: string;
  content: string;
  tool_key: string | null;
  created_at: string;
}

export function createChatMessage(data: Omit<ChatMessage, 'id' | 'created_at'>): ChatMessage {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO chat_messages (user_id, session_id, role, content, tool_key)
    VALUES (@user_id, @session_id, @role, @content, @tool_key)
  `).run(data);
  return db.prepare('SELECT * FROM chat_messages WHERE id = ?').get(Number(result.lastInsertRowid)) as ChatMessage;
}

export function getChatHistory(userId: number, sessionId: string, limit = 50): ChatMessage[] {
  return getDb().prepare('SELECT * FROM chat_messages WHERE user_id = ? AND session_id = ? ORDER BY created_at ASC LIMIT ?').all(userId, sessionId, limit) as ChatMessage[];
}

export function getChatSessions(userId: number): { session_id: string; last_message: string; created_at: string }[] {
  const db = getDb();
  return db.prepare(`
    SELECT session_id, MAX(created_at) as created_at,
      (SELECT content FROM chat_messages cm2 WHERE cm2.session_id = cm.session_id AND cm2.user_id = ? ORDER BY created_at DESC LIMIT 1) as last_message
    FROM chat_messages cm WHERE user_id = ?
    GROUP BY session_id ORDER BY created_at DESC
  `).all(userId, userId) as any[];
}
