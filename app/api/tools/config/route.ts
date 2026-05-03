import { NextRequest } from 'next/server';
import { requireAuth, successResponse } from '@/lib/utils/response';
import { getAllToolConfigs } from '@/lib/models/tool-config';
import { getAllModelConfigs, sanitizeModelConfig } from '@/lib/models/model-config';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if ('error' in auth) return auth.error;

  const tools = getAllToolConfigs();
  const models = getAllModelConfigs().map(sanitizeModelConfig);

  return successResponse({ tools, models });
}
