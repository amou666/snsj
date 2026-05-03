import { getDb } from '../db';

export interface GenerationRecord {
  id: number;
  user_id: number;
  tool_key: string;
  request_id: string;
  model_used: string;
  input_image: string | null;
  output_image: string | null;
  style: string | null;
  prompt_used: string | null;
  credits_charged: number;
  status: string;
  error: string | null;
  created_at: string;
}

export function createGenerationRecord(record: Omit<GenerationRecord, 'id' | 'created_at'>): number {
  const result = getDb().prepare(
    `INSERT INTO generation_records (user_id, tool_key, request_id, model_used, input_image, output_image, style, prompt_used, credits_charged, status, error)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    record.user_id, record.tool_key, record.request_id, record.model_used,
    record.input_image, record.output_image, record.style, record.prompt_used,
    record.credits_charged, record.status, record.error
  );
  return result.lastInsertRowid as number;
}

export function getUserRecords(userId: number, opts: { toolKey?: string; limit?: number } = {}): GenerationRecord[] {
  const limit = opts.limit || 50;
  if (opts.toolKey) {
    return getDb().prepare(
      'SELECT * FROM generation_records WHERE user_id = ? AND tool_key = ? ORDER BY created_at DESC LIMIT ?'
    ).all(userId, opts.toolKey, limit) as GenerationRecord[];
  }
  return getDb().prepare(
    'SELECT * FROM generation_records WHERE user_id = ? ORDER BY created_at DESC LIMIT ?'
  ).all(userId, limit) as GenerationRecord[];
}

export function getRecordByRequestId(requestId: string): GenerationRecord | undefined {
  return getDb().prepare('SELECT * FROM generation_records WHERE request_id = ?').get(requestId) as GenerationRecord | undefined;
}

export function getTotalGenerationCount(): number {
  return (getDb().prepare('SELECT COUNT(*) as count FROM generation_records').get() as any).count;
}
