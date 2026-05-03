import { NextRequest } from 'next/server';
import { requireAdmin, successResponse, errorResponse } from '@/lib/utils/response';
import { getAllPlans, createPlan, updatePlan } from '@/lib/models/plan';

export async function GET(request: NextRequest) {
  const adminErr = requireAdmin(request);
  if (adminErr) return adminErr;

  const plans = getAllPlans();
  // Return as array, not spread object
  return successResponse(plans);
}

export async function POST(request: NextRequest) {
  const adminErr = requireAdmin(request);
  if (adminErr) return adminErr;

  try {
    const body = await request.json();
    const plan = createPlan({
      name: body.name,
      price_monthly: body.price_monthly || null,
      price_yearly: body.price_yearly || null,
      credits_per_month: body.credits_per_month || 0,
      max_projects: body.max_projects || 3,
      max_members: body.max_members || 1,
      max_storage_mb: body.max_storage_mb || 100,
      is_active: body.is_active ?? 1,
      sort_order: body.sort_order || 0,
    });
    return successResponse(plan, 201);
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
    const plan = updatePlan(id, updates);
    return successResponse(plan);
  } catch (error: any) {
    return errorResponse(error.message);
  }
}
