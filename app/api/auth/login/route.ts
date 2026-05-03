import { NextRequest } from 'next/server';
import { loginUser } from '@/lib/services/auth-service';
import { successResponse, errorResponse } from '@/lib/utils/response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return errorResponse('邮箱和密码不能为空');
    }

    const result = loginUser(email, password);
    return successResponse(result);
  } catch (error: any) {
    return errorResponse(error.message);
  }
}
