import { NextRequest } from 'next/server';
import { requireAuth, successResponse, errorResponse } from '@/lib/utils/response';
import { getPaymentsByProject, createPayment, updatePayment } from '@/lib/models/project-payment';
import { getProjectById } from '@/lib/models/project';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(request);
  if ('error' in auth) return auth.error;

  const project = getProjectById(parseInt((await params).id));
  if (!project || (project.user_id !== auth.user.id && auth.user.role !== 'admin')) {
    return errorResponse('项目不存在', 404);
  }

  const payments = getPaymentsByProject(parseInt((await params).id));
  return successResponse(payments);
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
    const payment = createPayment({
      project_id: parseInt((await params).id),
      milestone: body.milestone,
      amount: body.amount,
      status: body.status || 'pending',
      payment_method: body.payment_method || null,
      notes: body.notes || null,
    });
    return successResponse(payment, 201);
  } catch (error: any) {
    return errorResponse(error.message);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(request);
  if ('error' in auth) return auth.error;

  const pid = parseInt((await params).id);
  const project = getProjectById(pid);
  if (!project || (project.user_id !== auth.user.id && auth.user.role !== 'admin')) {
    return errorResponse('项目不存在', 404);
  }

  try {
    const body = await request.json();
    const { paymentId, ...updates } = body;
    if (!paymentId) return errorResponse('paymentId is required');

    // Verify payment belongs to this project
    const payments = getPaymentsByProject(pid);
    if (!payments.find((p: any) => p.id === paymentId)) {
      return errorResponse('付款记录不存在或不属于该项目');
    }

    const payment = updatePayment(paymentId, updates);
    return successResponse(payment);
  } catch (error: any) {
    return errorResponse(error.message);
  }
}
