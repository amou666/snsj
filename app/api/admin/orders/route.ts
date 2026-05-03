import { NextRequest } from 'next/server';
import { requireAdmin, successResponse, errorResponse, getAuthUser } from '@/lib/utils/response';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  const adminErr = requireAdmin(request);
  if (adminErr) return adminErr;

  const db = getDb();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  let where = '';
  const params: any[] = [];
  if (status) { where = 'WHERE o.status = ?'; params.push(status); }

  const total = (db.prepare(`SELECT COUNT(*) as c FROM orders o ${where}`).get(...params) as any).c;
  const orders = db.prepare(`
    SELECT o.*, u.name as user_name, u.email as user_email
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    ${where}
    ORDER BY o.created_at DESC LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  return successResponse({ data: orders, total, page, limit });
}

export async function PUT(request: NextRequest) {
  const adminErr = requireAdmin(request);
  if (adminErr) return adminErr;

  try {
    const body = await request.json();
    const { orderId, status, refund } = body;
    if (!orderId) return errorResponse('orderId is required');

    const db = getDb();
    if (refund) {
      // Refund: add credits back to user
      const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as any;
      if (!order) return errorResponse('订单不存在');
      if (order.status === 'refunded') return errorResponse('订单已退款');

      db.prepare('UPDATE orders SET status = ? WHERE id = ?').run('refunded', orderId);
      db.prepare('UPDATE users SET credits = credits + ? WHERE id = ?').run(order.credits, order.user_id);
      db.prepare("INSERT INTO credits_log (user_id, amount, balance_after, type, tool_key, description) VALUES (?, ?, (SELECT credits FROM users WHERE id = ?), 'refund', 'order', ?)")
        .run(order.user_id, order.credits, order.user_id, `订单 ${order.order_no} 退款`);

      return successResponse({ refunded: true });
    }

    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, orderId);
    return successResponse({ updated: true });
  } catch (error: any) {
    return errorResponse(error.message);
  }
}
