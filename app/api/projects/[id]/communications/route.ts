import { NextRequest } from 'next/server';
import { requireAuth, successResponse, errorResponse } from '@/lib/utils/response';
import { getCommunicationsByProject, createCommunication } from '@/lib/models/project-communication';
import { getProjectById } from '@/lib/models/project';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(request);
  if ('error' in auth) return auth.error;

  const project = getProjectById(parseInt((await params).id));
  if (!project || (project.user_id !== auth.user.id && auth.user.role !== 'admin')) {
    return errorResponse('项目不存在', 404);
  }

  const comms = getCommunicationsByProject(parseInt((await params).id));
  return successResponse(comms);
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
    const comm = createCommunication({
      project_id: parseInt((await params).id),
      channel: body.channel || null,
      summary: body.summary,
      detail: body.detail || null,
      action_taken: body.action_taken || null,
      created_by: auth.user.id,
    });
    return successResponse(comm, 201);
  } catch (error: any) {
    return errorResponse(error.message);
  }
}
