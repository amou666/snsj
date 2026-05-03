import { NextRequest } from 'next/server';
import { requireAdmin, successResponse, errorResponse } from '@/lib/utils/response';
import { getAllModelConfigs, createModelConfig, updateModelConfig, getModelConfigById, sanitizeModelConfig } from '@/lib/models/model-config';

export async function GET(request: NextRequest) {
  const adminErr = requireAdmin(request);
  if (adminErr) return adminErr;

  const configs = getAllModelConfigs().map(sanitizeModelConfig);
  return successResponse({ configs });
}

export async function POST(request: NextRequest) {
  const adminErr = requireAdmin(request);
  if (adminErr) return adminErr;

  try {
    const body = await request.json();
    const { name, model_id, type, api_key, api_base_url, credits_per_call, timeout_ms, max_tokens, is_active } = body;

    if (!name || !model_id || !type || !api_key) {
      return errorResponse('缺少必要字段');
    }

    const id = createModelConfig({
      name, model_id, type, api_key,
      api_base_url: api_base_url || 'https://api.apiyi.com/v1/chat/completions',
      credits_per_call: credits_per_call || 1,
      timeout_ms: timeout_ms || 60000,
      max_tokens: max_tokens || 16384,
      is_active: is_active ?? 1,
    });

    return successResponse({ id }, 201);
  } catch (error: any) {
    return errorResponse(error.message);
  }
}

export async function PUT(request: NextRequest) {
  const adminErr = requireAdmin(request);
  if (adminErr) return adminErr;

  try {
    const body = await request.json();
    const { id, ...config } = body;

    if (!id) return errorResponse('缺少模型配置 ID');
    updateModelConfig(id, config);

    const updated = getModelConfigById(id);
    return successResponse({ config: updated ? sanitizeModelConfig(updated) : null });
  } catch (error: any) {
    return errorResponse(error.message);
  }
}
