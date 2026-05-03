'use client';

import useSWR from 'swr';
import { Users, Zap, CreditCard, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function AdminDashboard() {
  const { data, isLoading } = useSWR('/api/admin/dashboard');

  const stats = [
    { label: '注册用户', value: data?.userCount || 0, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: '今日调用', value: data?.todayCalls || 0, icon: Zap, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: '总项目数', value: data?.projectCount || 0, icon: CreditCard, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: '生成记录', value: data?.recordCount || 0, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">运营仪表盘</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="card p-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
              <div>
                <p className="text-[30px] font-bold text-gray-900 leading-tight">{s.value}</p>
                <p className="text-[13px] text-gray-500">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="card p-8 text-center text-gray-400">
        <TrendingUp className="w-10 h-10 mx-auto mb-3 text-gray-300" />
        <p className="text-sm">更多数据图表即将上线</p>
      </div>
    </div>
  );
}
