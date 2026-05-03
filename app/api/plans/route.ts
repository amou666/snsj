import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { getAllPlans } from '@/lib/models/plan';

export async function GET(request: NextRequest) {
  try {
    const plans = getAllPlans();
    // Return active plans for public consumption
    const activePlans = plans.filter((p: any) => p.is_active);
    return successResponse(activePlans);
  } catch (error: any) {
    return errorResponse(error.message);
  }
}
