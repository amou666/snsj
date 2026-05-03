import { NextRequest } from 'next/server';
import { requireAdmin, successResponse, errorResponse, getAuthUser } from '@/lib/utils/response';
import { getAllToolConfigs, updateToolConfig } from '@/lib/models/tool-config';

export async function GET(request: NextRequest) {
  const adminErr = requireAdmin(request);
  if (adminErr) return adminErr;

  const configs = getAllToolConfigs();
  return successResponse({ configs });
}

export async function PUT(request: NextRequest) {
  const adminErr = requireAdmin(request);
  if (adminErr) return adminErr;

  try {
    const body = await request.json();
    const { toolKey, ...config } = body;

    if (!toolKey) return errorResponse('缺少工具 key');
    updateToolConfig(toolKey, config);

    return successResponse({ updated: true });
  } catch (error: any) {
    return errorResponse(error.message);
  }
}
