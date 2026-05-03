import { NextRequest } from 'next/server';
import { requireAuth, successResponse, errorResponse } from '@/lib/utils/response';
import { getProjectById, updateProject, deleteProject, advanceProjectStage } from '@/lib/models/project';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(request);
  if ('error' in auth) return auth.error;

  const project = getProjectById(parseInt((await params).id));
  if (!project || (project.user_id !== auth.user.id && auth.user.role !== 'admin')) {
    return errorResponse('项目不存在', 404);
  }
  return successResponse(project);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(request);
  if ('error' in auth) return auth.error;

  const project = getProjectById(parseInt((await params).id));
  if (!project || (project.user_id !== auth.user.id && auth.user.role !== 'admin')) {
    return errorResponse('项目不存在', 404);
  }

  try {
    const body = await request.json();
    const updated = updateProject(parseInt((await params).id), body);
    return successResponse(updated);
  } catch (error: any) {
    return errorResponse(error.message);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(request);
  if ('error' in auth) return auth.error;

  const project = getProjectById(parseInt((await params).id));
  if (!project || (project.user_id !== auth.user.id && auth.user.role !== 'admin')) {
    return errorResponse('项目不存在', 404);
  }

  deleteProject(parseInt((await params).id));
  return successResponse({ deleted: true });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(request);
  if ('error' in auth) return auth.error;

  const project = getProjectById(parseInt((await params).id));
  if (!project || (project.user_id !== auth.user.id && auth.user.role !== 'admin')) {
    return errorResponse('项目不存在', 404);
  }

  const body = await request.json();
  const direction = body.direction || 'forward';
  const updated = advanceProjectStage(parseInt((await params).id), direction);
  return successResponse(updated);
}
