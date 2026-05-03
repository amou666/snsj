'use client';

import useSWR from 'swr';

export default function AdminCredits() {
  const { data } = useSWR('/api/admin/credits?page=1&limit=50');
  const logs = data?.logs || [];

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">积分流水</h1>
      <div className="data-table w-full card overflow-hidden">
        <table className="w-full">
          <thead><tr><th>时间</th><th>用户</th><th>变动</th><th>余额</th><th>类型</th><th>工具</th><th>状态</th></tr></thead>
          <tbody>
            {logs.length === 0 ? <tr><td colSpan={7} className="text-center text-gray-400 py-8">暂无记录</td></tr> : logs.map((l: any) => (
              <tr key={l.id}>
                <td className="text-gray-400">{new Date(l.created_at).toLocaleString()}</td>
                <td>用户#{l.user_id}</td>
                <td className={l.amount > 0 ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'}>{l.amount > 0 ? '+' : ''}{l.amount}</td>
                <td>{l.balance_after}</td>
                <td>{l.type}</td>
                <td>{l.tool_key || '-'}</td>
                <td><span className={`px-2 py-0.5 rounded text-xs ${l.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{l.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
