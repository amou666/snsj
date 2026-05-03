import { NextRequest } from 'next/server';
import { requireAdmin, successResponse, errorResponse, getAuthUser } from '@/lib/utils/response';
import { getUserCount, getActiveUserCount } from '@/lib/models/user';
import { getTotalGenerationCount } from '@/lib/models/generation-record';
import { getTodayUsageCount } from '@/lib/models/credit';
import { getProjectCount } from '@/lib/models/project';

export async function GET(request: NextRequest) {
  const adminErr = requireAdmin(request);
  if (adminErr) return adminErr;

  try {
    const totalUsers = getUserCount();
    const activeUsers = getActiveUserCount(7);
    const totalGenerations = getTotalGenerationCount();
    const todayUsage = getTodayUsageCount();
    const totalProjects = getProjectCount();

    return successResponse({
      userCount: totalUsers,
      activeUsers,
      todayCalls: todayUsage,
      projectCount: totalProjects,
      recordCount: totalGenerations,
    });
  } catch (error: any) {
    return errorResponse(error.message);
  }
}
