import { NextRequest } from 'next/server';
import { requireAuth, successResponse, errorResponse } from '@/lib/utils/response';
import { getNotificationsByUser, getUnreadCount, markAllNotificationsRead } from '@/lib/models/notification';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if ('error' in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const countOnly = searchParams.get('count') === '1';

  if (countOnly) {
    const count = getUnreadCount(auth.user.id);
    return successResponse({ count });
  }

  const notifications = getNotificationsByUser(auth.user.id);
  return successResponse({ data: notifications });
}

export async function PUT(request: NextRequest) {
  const auth = requireAuth(request);
  if ('error' in auth) return auth.error;

  markAllNotificationsRead(auth.user.id);
  return successResponse({ marked: true });
}
