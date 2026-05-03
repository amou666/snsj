import { NextRequest } from 'next/server';
import { requireAuth, successResponse, errorResponse } from '@/lib/utils/response';
import { getProjectsByUserId, createProject, getProjectStats } from '@/lib/models/project';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if ('error' in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const stage = searchParams.get('stage') || undefined;
  const search = searchParams.get('search') || undefined;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const stats = searchParams.get('stats') === '1';

  if (stats) {
    const projectStats = getProjectStats(auth.user.id);
    return successResponse(projectStats);
  }

  const result = getProjectsByUserId(auth.user.id, { stage, search, page, limit });
  // Return consistent structure: { data, total, page, limit }
  return successResponse({
    data: result.data,
    total: result.total,
    page,
    limit,
  });
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if ('error' in auth) return auth.error;

  try {
    const body = await request.json();
    const { name, client_name, client_phone, client_wechat, client_email, address, building_name, area, house_type, budget_min, budget_max, priority, deadline, source, tags, description } = body;

    if (!name) return errorResponse('项目名称不能为空');

    const project = createProject({
      user_id: auth.user.id,
      name,
      client_name: client_name || null,
      client_phone: client_phone || null,
      client_wechat: client_wechat || null,
      client_email: client_email || null,
      address: address || null,
      building_name: building_name || null,
      area: area || null,
      house_type: house_type || null,
      budget_min: budget_min || null,
      budget_max: budget_max || null,
      priority: priority || 'normal',
      deadline: deadline || null,
      source: source || null,
      tags: tags || null,
      description: description || null,
    });

    // Return nested in 'data' for consistency
    return successResponse({ data: project }, 201);
  } catch (error: any) {
    return errorResponse(error.message);
  }
}
