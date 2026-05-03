import { NextRequest } from 'next/server';
import { registerUser } from '@/lib/services/auth-service';
import { successResponse, errorResponse } from '@/lib/utils/response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return errorResponse('邮箱和密码不能为空');
    }
    if (password.length < 6) {
      return errorResponse('密码至少6位');
    }
    if (!name) {
      return errorResponse('请输入用户名');
    }

    const result = registerUser(email, password, name);
    return successResponse(result, 201);
  } catch (error: any) {
    return errorResponse(error.message);
  }
}
