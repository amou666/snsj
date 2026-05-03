'use client';

import useSWR from 'swr';
import { Search, FileText } from 'lucide-react';
import { useState } from 'react';

export default function AdminOrders() {
  const [status, setStatus] = useState('');
  const { data } = useSWR(`/api/admin/orders?status=${status}`);
  const orders = data?.data || [];

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">订单管理</h1>
      <select value={status} onChange={e => setStatus(e.target.value)} className="mb-4 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm">
        <option value="">全部状态</option><option value="paid">已支付</option><option value="pending">待支付</option><option value="refunded">已退款</option>
      </select>
      <div className="data-table w-full card overflow-hidden">
        <table className="w-full">
          <thead><tr><th>订单号</th><th>用户</th><th>金额</th><th>积分</th><th>状态</th><th>时间</th></tr></thead>
          <tbody>
            {orders.length === 0 ? <tr><td colSpan={6} className="text-center text-gray-400 py-8">暂无订单</td></tr> : orders.map((o: any) => (
              <tr key={o.id}>
                <td className="font-mono text-xs">{o.order_no}</td>
                <td>{o.user_name || o.user_email}</td>
                <td className="font-semibold">¥{o.amount}</td>
                <td>{o.credits}</td>
                <td><span className={`px-2 py-0.5 rounded text-xs ${o.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : o.status === 'refunded' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>{o.status}</span></td>
                <td className="text-gray-400">{new Date(o.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
