import { NextRequest } from 'next/server';
import { requireAdmin, successResponse, errorResponse, getAuthUser } from '@/lib/utils/response';
import { getAllSettings, setSetting } from '@/lib/models/settings';

export async function GET(request: NextRequest) {
  const adminErr = requireAdmin(request);
  if (adminErr) return adminErr;

  const settings = getAllSettings();
  return successResponse({ settings });
}

export async function PUT(request: NextRequest) {
  const adminErr = requireAdmin(request);
  if (adminErr) return adminErr;

  try {
    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return errorResponse('需要设置对象');
    }

    for (const [key, value] of Object.entries(settings)) {
      setSetting(key, value as string);
    }

    return successResponse({ updated: true });
  } catch (error: any) {
    return errorResponse(error.message);
  }
}
