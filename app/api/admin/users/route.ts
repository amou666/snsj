import { NextRequest } from 'next/server';
import { requireAdmin, successResponse, errorResponse, getAuthUser } from '@/lib/utils/response';
import { getAllUsers, adjustUserCredits, getUserById, sanitizeUser } from '@/lib/models/user';

export async function GET(request: NextRequest) {
  const adminErr = requireAdmin(request);
  if (adminErr) return adminErr;

  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const search = url.searchParams.get('search') || '';

    const result = getAllUsers({ page, limit, search });
    return successResponse(result);
  } catch (error: any) {
    return errorResponse(error.message);
  }
}

export async function PATCH(request: NextRequest) {
  const adminErr = requireAdmin(request);
  if (adminErr) return adminErr;

  try {
    const body = await request.json();
    const { userId, action, amount, description } = body;

    if (!userId || !action) return errorResponse('缺少参数');

    if (action === 'adjust_credits') {
      if (typeof amount !== 'number') return errorResponse('需要调整的积分数量');
      adjustUserCredits(userId, amount, description || '管理员调整');
      const user = getUserById(userId);
      return successResponse({ user: user ? sanitizeUser(user) : null });
    }

    return errorResponse('未知操作');
  } catch (error: any) {
    return errorResponse(error.message);
  }
}
