import { getDb } from '../db';
import { safeUpdate } from '../utils/db';

export interface ModelConfig {
  id: number;
  name: string;
  model_id: string;
  type: string;
  api_key: string;
  api_base_url: string;
  credits_per_call: number;
  timeout_ms: number;
  max_tokens: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export function getAllModelConfigs(): ModelConfig[] {
  return getDb().prepare('SELECT * FROM model_configs ORDER BY id').all() as ModelConfig[];
}

export function getModelConfigById(id: number): ModelConfig | undefined {
  return getDb().prepare('SELECT * FROM model_configs WHERE id = ?').get(id) as ModelConfig | undefined;
}

export function getModelConfigByModelId(modelId: string): ModelConfig | undefined {
  return getDb().prepare('SELECT * FROM model_configs WHERE model_id = ? AND is_active = 1').get(modelId) as ModelConfig | undefined;
}

export function getModelConfigsByType(type: string): ModelConfig[] {
  return getDb().prepare('SELECT * FROM model_configs WHERE type = ? AND is_active = 1').all(type) as ModelConfig[];
}

export function createModelConfig(config: Omit<ModelConfig, 'id' | 'created_at' | 'updated_at'>): number {
  const result = getDb().prepare(
    `INSERT INTO model_configs (name, model_id, type, api_key, api_base_url, credits_per_call, timeout_ms, max_tokens, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(config.name, config.model_id, config.type, config.api_key, config.api_base_url, config.credits_per_call, config.timeout_ms, config.max_tokens, config.is_active);
  return result.lastInsertRowid as number;
}

export function updateModelConfig(id: number, config: Partial<ModelConfig>): void {
  safeUpdate('model_configs', id, config);
}

// Sanitize model config for API response (hide API key)
export function sanitizeModelConfig(config: ModelConfig): Omit<ModelConfig, 'api_key'> & { api_key_masked?: string } {
  const { api_key, ...rest } = config;
  const masked = api_key ? '****' + api_key.slice(-4) : '';
  return { ...rest, api_key_masked: masked };
}
