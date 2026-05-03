'use client';

import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/components/providers/AuthProvider';
import useSWR from 'swr';
import { BarChart3, TrendingUp, Zap, Calendar } from 'lucide-react';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { data: stats } = useSWR(user ? '/api/user/analytics' : null);

  const usage = stats?.usage || { total: 0, thisMonth: 0 };
  const statItems = [
    { label: '本月调用', value: usage.thisMonth, icon: Zap, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: '消耗积分', value: usage.total, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: '活跃项目', value: stats?.activeProjects || 0, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: '生成结果', value: stats?.totalResults || 0, icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <AppLayout>
      <div className="min-h-screen p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">我的数据</h1>
          <p className="text-sm text-gray-500 mt-1">查看你的使用统计和趋势</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statItems.map(s => (
            <div key={s.label} className="card p-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-[30px] font-bold text-gray-900 leading-tight">{s.value}</p>
                  <p className="text-[13px] text-gray-500">{s.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card p-8 text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">使用数据将在你开始使用 AI 工具后显示</p>
        </div>
      </div>
    </AppLayout>
  );
}
