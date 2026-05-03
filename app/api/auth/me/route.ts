import { NextRequest } from 'next/server';
import { requireAuth, successResponse, errorResponse } from '@/lib/utils/response';
import { getUserById, sanitizeUser, updateLastActive } from '@/lib/models/user';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if ('error' in auth) return auth.error;

  try {
    updateLastActive(auth.user.id);
    const user = getUserById(auth.user.id);
    if (!user) return errorResponse('用户不存在', 404);
    return successResponse({ user: sanitizeUser(user) });
  } catch (error: any) {
    return errorResponse(error.message);
  }
}
