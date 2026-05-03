import { NextRequest } from 'next/server';
import { requireAuth, successResponse, errorResponse } from '@/lib/utils/response';
import { getAssetsByProject, createAsset, deleteAsset } from '@/lib/models/project-asset';
import { getProjectById } from '@/lib/models/project';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(request);
  if ('error' in auth) return auth.error;

  const project = getProjectById(parseInt((await params).id));
  if (!project || (project.user_id !== auth.user.id && auth.user.role !== 'admin')) {
    return errorResponse('项目不存在', 404);
  }

  const { searchParams } = new URL(request.url);
  const folder = searchParams.get('folder') || undefined;
  const assets = getAssetsByProject(parseInt((await params).id), folder);
  return successResponse(assets);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(request);
  if ('error' in auth) return auth.error;

  const project = getProjectById(parseInt((await params).id));
  if (!project || (project.user_id !== auth.user.id && auth.user.role !== 'admin')) {
    return errorResponse('项目不存在', 404);
  }

  try {
    const body = await request.json();
    const asset = createAsset({
      project_id: parseInt((await params).id),
      folder_path: body.folder_path || '/',
      filename: body.filename,
      file_type: body.file_type || null,
      file_data: body.file_data || null,
      file_size: body.file_size || null,
      version: body.version || 1,
      description: body.description || null,
      created_by: auth.user.id,
    });
    return successResponse(asset, 201);
  } catch (error: any) {
    return errorResponse(error.message);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(request);
  if ('error' in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const assetId = parseInt(searchParams.get('assetId') || '0');
  if (!assetId) return errorResponse('assetId is required');
  deleteAsset(assetId);
  return successResponse({ deleted: true });
}
