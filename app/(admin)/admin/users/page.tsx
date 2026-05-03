'use client';

import useSWR, { mutate } from 'swr';
import { useState } from 'react';
import { Search, UserCog } from 'lucide-react';

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useSWR('/api/admin/users');

  const users = (data?.users || []).filter((u: any) => !search || u.name?.includes(search) || u.email?.includes(search));

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">用户管理</h1>
      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="搜索用户名/邮箱" value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm" />
      </div>
      <div className="data-table w-full card overflow-hidden">
        <table className="w-full">
          <thead><tr><th>ID</th><th>用户名</th><th>邮箱</th><th>角色</th><th>积分</th><th>注册时间</th></tr></thead>
          <tbody>
            {users.map((u: any) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td className="font-medium text-gray-900">{u.name || '-'}</td>
                <td>{u.email}</td>
                <td><span className={`px-2 py-0.5 rounded text-xs ${u.role === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-gray-50 text-gray-600'}`}>{u.role}</span></td>
                <td className="font-semibold text-indigo-600">{u.credits}</td>
                <td className="text-gray-400">{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
