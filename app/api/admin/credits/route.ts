import { NextRequest } from 'next/server';
import { requireAdmin, successResponse, errorResponse } from '@/lib/utils/response';
import { getAllCreditsLog } from '@/lib/models/credit';

export async function GET(request: NextRequest) {
  const adminErr = requireAdmin(request);
  if (adminErr) return adminErr;

  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    const result = getAllCreditsLog({ page, limit });
    return successResponse(result);
  } catch (error: any) {
    return errorResponse(error.message);
  }
}
