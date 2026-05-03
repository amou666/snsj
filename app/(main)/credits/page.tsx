'use client';

import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/components/providers/AuthProvider';
import useSWR from 'swr';
import { CreditCard, Zap, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function CreditsPage() {
  const { user } = useAuth();
  const { data: creditsData, isLoading } = useSWR(
    user ? '/api/user/credits?page=1' : null
  );
  const { data: plansData } = useSWR('/api/plans');

  const logs = creditsData?.logs || [];
  const plans = plansData?.data || [];

  return (
    <AppLayout>
      <div className="min-h-screen p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">积分充值</h1>
        </div>

        {/* Balance */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Zap className="w-7 h-7 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">当前积分</p>
              <p className="text-[30px] font-bold text-gray-900">{user?.credits?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>

        {/* Plans */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">套餐选择</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(plans.length > 0 ? plans : [
              { id: 1, name: '免费版', price_monthly: 0, credits_per_month: 0, max_projects: 3 },
              { id: 2, name: '专业版', price_monthly: 299, credits_per_month: 500, max_projects: 50 },
              { id: 3, name: '企业版', price_monthly: 899, credits_per_month: 2000, max_projects: 0 },
            ]).map((plan: any) => (
              <div key={plan.id} className="card p-6 text-center">
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <div className="my-4">
                  <span className="text-3xl font-bold text-gray-900">¥{plan.price_monthly}</span>
                  <span className="text-sm text-gray-500">/月</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-2 mb-6">
                  <li>月含 {plan.credits_per_month} 积分</li>
                  <li>项目上限 {plan.max_projects || '不限'} 个</li>
                </ul>
                <button className="w-full px-4 py-2 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600 transition-colors">
                  选择套餐
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Credit Logs */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">积分明细</h2>
          {logs.length === 0 ? (
            <div className="card p-8 text-center text-gray-400"><p className="text-sm">暂无积分记录</p></div>
          ) : (
            <div className="data-table w-full card overflow-hidden">
              <table className="w-full">
                <thead><tr><th>时间</th><th>类型</th><th>变动</th><th>余额</th><th>说明</th></tr></thead>
                <tbody>
                  {logs.map((log: any) => (
                    <tr key={log.id}>
                      <td>{new Date(log.created_at).toLocaleString()}</td>
                      <td><span className={`px-2 py-0.5 rounded text-xs ${log.amount > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{log.type}</span></td>
                      <td className={log.amount > 0 ? 'text-emerald-600' : 'text-red-600'}>
                        <span className="flex items-center gap-1">{log.amount > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{log.amount > 0 ? '+' : ''}{log.amount}</span>
                      </td>
                      <td>{log.balance_after}</td>
                      <td>{log.description || log.tool_key || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
