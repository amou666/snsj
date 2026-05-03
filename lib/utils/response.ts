import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../services/auth-service';
import { getUserById, sanitizeUser } from '../models/user';

export function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload) return null;
  const user = getUserById(payload.userId);
  if (!user) return null;
  return sanitizeUser(user);
}

export function requireAuth(request: NextRequest): { user: any } | { error: NextResponse } {
  const user = authenticateRequest(request);
  if (!user) {
    return { error: NextResponse.json({ success: false, error: '未认证' }, { status: 401 }) };
  }
  return { user };
}

export function requireAdmin(request: NextRequest): NextResponse | null {
  const user = authenticateRequest(request);
  if (!user) {
    return NextResponse.json({ success: false, error: '未认证' }, { status: 401 });
  }
  if (user.role !== 'admin') {
    return NextResponse.json({ success: false, error: '需要管理员权限' }, { status: 403 });
  }
  return null; // null means authorized
}

export function getAuthUser(request: NextRequest): any | null {
  return authenticateRequest(request);
}

export function successResponse(data: any, status = 200) {
  // If data is an array, wrap it in { data } to avoid spreading into indexed keys
  if (Array.isArray(data)) {
    return NextResponse.json({ success: true, data }, { status });
  }
  return NextResponse.json({ success: true, ...data }, { status });
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}
