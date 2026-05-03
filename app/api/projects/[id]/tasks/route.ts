import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, successResponse, errorResponse } from '@/lib/utils/response';
import { getTasksByProject, createTask, updateTask, deleteTask } from '@/lib/models/project-task';
import { getProjectById } from '@/lib/models/project';

function checkProjectAccess(request: NextRequest, projectId: number): NextResponse | null {
  const auth = requireAuth(request);
  if ('error' in auth) return auth.error;
  const project = getProjectById(projectId);
  if (!project || (project.user_id !== auth.user.id && auth.user.role !== 'admin')) {
    return errorResponse('项目不存在', 404);
  }
  return null; // authorized
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const pid = parseInt((await params).id);
  const err = checkProjectAccess(request, pid);
  if (err) return err;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || undefined;
  const tasks = getTasksByProject(pid, status ? { status } : undefined);
  return successResponse(tasks);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const pid = parseInt((await params).id);
  const err = checkProjectAccess(request, pid);
  if (err) return err;

  try {
    const body = await request.json();
    const task = createTask({
      project_id: pid,
      title: body.title,
      description: body.description || null,
      assignee_id: body.assignee_id || null,
      task_type: body.task_type || null,
      due_date: body.due_date || null,
      priority: body.priority || 'normal',
      status: 'todo',
    });
    return successResponse(task, 201);
  } catch (error: any) {
    return errorResponse(error.message);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const pid = parseInt((await params).id);
  const err = checkProjectAccess(request, pid);
  if (err) return err;

  try {
    const body = await request.json();
    const { taskId, ...updates } = body;
    if (!taskId) return errorResponse('taskId is required');

    // Verify task belongs to this project
    const task = getTasksByProject(pid).find((t: any) => t.id === taskId);
    if (!task) return errorResponse('任务不存在或不属于该项目');

    const updated = updateTask(taskId, updates);
    return successResponse(updated);
  } catch (error: any) {
    return errorResponse(error.message);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const pid = parseInt((await params).id);
  const err = checkProjectAccess(request, pid);
  if (err) return err;

  const { searchParams } = new URL(request.url);
  const taskId = parseInt(searchParams.get('taskId') || '0');
  if (!taskId) return errorResponse('taskId is required');

  // Verify task belongs to this project
  const task = getTasksByProject(pid).find((t: any) => t.id === taskId);
  if (!task) return errorResponse('任务不存在或不属于该项目');

  deleteTask(taskId);
  return successResponse({ deleted: true });
}
