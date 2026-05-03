import { getDb } from '../db';
import { safeUpdate } from '../utils/db';

export interface ToolConfig {
  id: number;
  tool_key: string;
  name: string;
  description: string | null;
  emoji: string;
  color: string;
  has_analysis: number;
  has_generation: number;
  default_model_id: string | null;
  default_system_prompt: string | null;
  is_active: number;
  sort_order: number;
  created_at: string;
}

export function getAllToolConfigs(): ToolConfig[] {
  return getDb().prepare('SELECT * FROM tool_configs WHERE is_active = 1 ORDER BY sort_order').all() as ToolConfig[];
}

export function getToolConfigByKey(key: string): ToolConfig | undefined {
  return getDb().prepare('SELECT * FROM tool_configs WHERE tool_key = ?').get(key) as ToolConfig | undefined;
}

export function updateToolConfig(key: string, config: Partial<ToolConfig>): void {
  safeUpdate('tool_configs', key, config, 'tool_key');
}

export function getToolCredits(toolKey: string): number {
  const tool = getToolConfigByKey(toolKey);
  if (!tool) return 2;
  return (tool.has_analysis ? 1 : 0) + (tool.has_generation ? 1 : 0);
}
