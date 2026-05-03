import { NextRequest } from 'next/server';
import { requireAdmin, successResponse, errorResponse, getAuthUser } from '@/lib/utils/response';
import { getAllArticles, createArticle, updateArticle, deleteArticle } from '@/lib/models/help-article';

export async function GET(request: NextRequest) {
  const adminErr = requireAdmin(request);
  if (adminErr) return adminErr;

  const articles = getAllArticles();
  return successResponse(articles);
}

export async function POST(request: NextRequest) {
  const adminErr = requireAdmin(request);
  if (adminErr) return adminErr;

  try {
    const body = await request.json();
    const article = createArticle({
      title: body.title,
      category: body.category,
      tags: body.tags || null,
      content: body.content,
      cover_image: body.cover_image || null,
      sort_order: body.sort_order || 0,
      is_published: body.is_published ?? 1,
    });
    return successResponse(article, 201);
  } catch (error: any) {
    return errorResponse(error.message);
  }
}

export async function PUT(request: NextRequest) {
  const adminErr = requireAdmin(request);
  if (adminErr) return adminErr;

  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return errorResponse('id is required');
    const article = updateArticle(id, updates);
    return successResponse(article);
  } catch (error: any) {
    return errorResponse(error.message);
  }
}

export async function DELETE(request: NextRequest) {
  const adminErr = requireAdmin(request);
  if (adminErr) return adminErr;

  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get('id') || '0');
  if (!id) return errorResponse('id is required');
  deleteArticle(id);
  return successResponse({ deleted: true });
}
