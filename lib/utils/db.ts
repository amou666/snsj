import { getDb } from '../db';

// Allowed columns for each table — prevents SQL injection via dynamic field names
const ALLOWED_COLUMNS: Record<string, string[]> = {
  projects: ['user_id', 'name', 'client_name', 'client_phone', 'client_wechat', 'client_email', 'address', 'building_name', 'area', 'house_type', 'budget_min', 'budget_max', 'stage', 'priority', 'deadline', 'source', 'tags', 'status', 'description', 'updated_at'],
  model_configs: ['name', 'model_id', 'type', 'api_key', 'api_base_url', 'credits_per_call', 'timeout_ms', 'max_tokens', 'is_active', 'updated_at'],
  tool_configs: ['name', 'description', 'emoji', 'color', 'has_analysis', 'has_generation', 'workbench', 'default_model_id', 'default_system_prompt', 'is_active', 'sort_order'],
  plans: ['name', 'price_monthly', 'price_yearly', 'credits_per_month', 'max_projects', 'max_members', 'max_storage_mb', 'is_active', 'sort_order'],
  project_payments: ['project_id', 'milestone', 'amount', 'status', 'paid_at', 'payment_method', 'notes'],
  project_tasks: ['project_id', 'title', 'description', 'assignee_id', 'task_type', 'due_date', 'priority', 'status', 'completed_at'],
  help_articles: ['title', 'category', 'tags', 'content', 'cover_image', 'sort_order', 'is_published', 'updated_at'],
  design_requirements: ['project_id', 'rooms', 'style_preference', 'area', 'budget_range', 'family_info', 'special_needs', 'notes', 'updated_at'],
  system_settings: ['value', 'updated_at'],
};

/**
 * Safely build and execute an UPDATE statement with field whitelist validation.
 * Prevents SQL injection from dynamic field names.
 */
export function safeUpdate(
  table: string,
  id: number | string,
  data: Record<string, any>,
  idColumn = 'id'
): boolean {
  const allowed = ALLOWED_COLUMNS[table];
  if (!allowed) {
    throw new Error(`Unknown table: ${table}`);
  }

  const fields: string[] = [];
  const values: any[] = [];

  for (const [key, value] of Object.entries(data)) {
    if (key === 'id' || key === 'created_at') continue;
    if (!allowed.includes(key)) continue; // Skip unknown columns
    fields.push(`${key} = ?`);
    values.push(value);
  }

  if (fields.length === 0) return false;

  // Always update updated_at if the table has it
  if (allowed.includes('updated_at') && !fields.some(f => f.startsWith('updated_at'))) {
    fields.push('updated_at = CURRENT_TIMESTAMP');
  }

  values.push(id);
  const result = getDb().prepare(
    `UPDATE ${table} SET ${fields.join(', ')} WHERE ${idColumn} = ?`
  ).run(...values);

  return result.changes > 0;
}

/**
 * Get allowed column names for a table
 */
export function getAllowedColumns(table: string): string[] {
  return ALLOWED_COLUMNS[table] || [];
}
