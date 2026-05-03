import { NextRequest } from 'next/server';
import { requireAuth, successResponse, errorResponse } from '@/lib/utils/response';
import { getUserFavorites, addFavorite, deleteFavorite } from '@/lib/models/favorite';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if ('error' in auth) return auth.error;

  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    const result = getUserFavorites(auth.user.id, { page, limit });
    // Return consistent structure
    return successResponse({
      data: result.favorites,
      total: result.total,
      page,
    });
  } catch (error: any) {
    return errorResponse(error.message);
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if ('error' in auth) return auth.error;

  try {
    const body = await request.json();
    const { recordId, originalImage, resultImage, toolKey, style } = body;

    if (!resultImage) return errorResponse('缺少结果图片');

    const id = addFavorite(auth.user.id, { recordId, originalImage, resultImage, toolKey, style });
    return successResponse({ id }, 201);
  } catch (error: any) {
    return errorResponse(error.message);
  }
}

export async function DELETE(request: NextRequest) {
  const auth = requireAuth(request);
  if ('error' in auth) return auth.error;

  try {
    const url = new URL(request.url);
    const id = parseInt(url.searchParams.get('id') || '0');
    if (!id) return errorResponse('缺少收藏 ID');

    const deleted = deleteFavorite(id, auth.user.id);
    if (!deleted) return errorResponse('收藏不存在');
    return successResponse({ deleted: true });
  } catch (error: any) {
    return errorResponse(error.message);
  }
}
