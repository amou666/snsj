import { NextRequest } from 'next/server';
import { requireAuth, successResponse, errorResponse } from '@/lib/utils/response';
import { getCreditsLog } from '@/lib/models/credit';
import { getUserById, sanitizeUser } from '@/lib/models/user';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if ('error' in auth) return auth.error;

  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    const user = getUserById(auth.user.id);
    const { logs, total } = getCreditsLog(auth.user.id, { page, limit });

    return successResponse({
      credits: user?.credits || 0,
      user: user ? sanitizeUser(user) : null,
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    return errorResponse(error.message);
  }
}
