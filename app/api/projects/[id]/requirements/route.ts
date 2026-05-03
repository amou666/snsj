import { NextRequest } from 'next/server';
import { requireAuth, successResponse, errorResponse } from '@/lib/utils/response';
import { getRequirementByProject, upsertRequirement } from '@/lib/models/design-requirement';
import { getProjectById } from '@/lib/models/project';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(request);
  if ('error' in auth) return auth.error;

  const project = getProjectById(parseInt((await params).id));
  if (!project || (project.user_id !== auth.user.id && auth.user.role !== 'admin')) {
    return errorResponse('项目不存在', 404);
  }

  const req = getRequirementByProject(parseInt((await params).id));
  return successResponse(req);
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
    const req = upsertRequirement(parseInt((await params).id), body);
    return successResponse(req);
  } catch (error: any) {
    return errorResponse(error.message);
  }
}
