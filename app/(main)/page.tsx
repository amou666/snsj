'use client';

import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { FolderKanban, Plus, LayoutDashboard, Wand2, BarChart3, CreditCard, Search, ArrowRight, TrendingUp, Zap, Clock, MapPin, Calendar } from 'lucide-react';
import { PROJECT_STAGES } from '@/lib/constants';

const workbenches = [
  { key: 'floorplan', name: '平面图工作台', desc: '黑白上色→彩色转3D→布局规划，链式管道一步到位', href: '/studio/floorplan', icon: LayoutDashboard, gradient: 'from-indigo-500 to-purple-500', badge: '4合1' },
  { key: 'realistic', name: '实景化工作台', desc: '毛坯/平面/3D自动识别，多风格对比生成', href: '/studio/realistic', icon: Wand2, gradient: 'from-amber-500 to-orange-500', badge: '3合1' },
  { key: 'assistant', name: '方案助手', desc: '需求采集→布局→选材→预算，4步串联', href: '/studio/assistant', icon: Search, gradient: 'from-emerald-500 to-teal-500', badge: '4合1' },
  { key: 'detail', name: '深化工作台', desc: '效果图→施工图/全景VR，下游深化处理', href: '/studio/detail', icon: CreditCard, gradient: 'from-purple-500 to-pink-500', badge: '2合1' },
  { key: 'analyze', name: '空间拆解', desc: '上传即出拆解结果，仅分析', href: '/studio/analyze', icon: BarChart3, gradient: 'from-red-500 to-rose-500', badge: '分析' },
];

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();

  const { data: projectStats } = useSWR(user ? '/api/projects?stats=1' : null);
  const { data: recentProjectsData } = useSWR(user ? '/api/projects?limit=3' : null);

  const recentProjects = recentProjectsData?.data || [];
  const stageLabel = (key: string) => PROJECT_STAGES.find(s => s.key === key)?.label || key;

  return (
    <AppLayout>
      <div className="min-h-screen p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Hero */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
            你好，{user?.name || '设计师'} 👋
          </h1>
          <p className="text-gray-500">选择一个工作台，开始你的设计之旅</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center"><Zap className="w-5 h-5 text-indigo-600" /></div>
              <div>
                <p className="text-[30px] font-bold text-gray-900 leading-tight">{user?.credits?.toLocaleString() || 0}</p>
                <p className="text-[13px] text-gray-500">积分余额</p>
              </div>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center"><FolderKanban className="w-5 h-5 text-emerald-600" /></div>
              <div>
                <p className="text-[30px] font-bold text-gray-900 leading-tight">{projectStats?.total || 0}</p>
                <p className="text-[13px] text-gray-500">项目总数</p>
              </div>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-amber-600" /></div>
              <div>
                <p className="text-[30px] font-bold text-gray-900 leading-tight">{projectStats?.active || 0}</p>
                <p className="text-[13px] text-gray-500">进行中</p>
              </div>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center"><Clock className="w-5 h-5 text-purple-600" /></div>
              <div>
                <p className="text-[30px] font-bold text-gray-900 leading-tight">5</p>
                <p className="text-[13px] text-gray-500">AI 工作台</p>
              </div>
            </div>
          </div>
        </div>

        {/* Workbench Cards */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">AI 工作台</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {workbenches.map((wb, i) => (
              <button
                key={wb.key}
                onClick={() => router.push(wb.href)}
                className="card card-interactive p-6 text-left group animate-fade-in relative overflow-hidden"
                style={{ animationDelay: `${0.05 * (i + 1)}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${wb.gradient} flex items-center justify-center shadow-sm`}>
                    <wb.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs font-medium">{wb.badge}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1.5">{wb.name}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{wb.desc}</p>
                <div className="flex items-center text-sm text-indigo-500 font-medium group-hover:gap-2 transition-all">
                  进入工作台 <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Projects */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">最近项目</h2>
            <button onClick={() => router.push('/projects')} className="text-sm text-indigo-500 hover:text-indigo-700 font-medium">查看全部</button>
          </div>
          {recentProjects.length === 0 ? (
            <div className="card p-6">
              <div className="text-center py-8 text-gray-400">
                <FolderKanban className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">暂无项目，点击创建你的第一个项目</p>
                <button onClick={() => router.push('/projects')} className="mt-3 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors">
                  <Plus className="w-4 h-4 inline mr-1" /> 新建项目
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentProjects.map((p: any) => (
                <button
                  key={p.id}
                  onClick={() => router.push(`/projects/${p.id}`)}
                  className="card card-interactive p-5 text-left"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{p.name}</h3>
                    <span className={`stage-${p.stage} px-2 py-0.5 rounded text-xs font-medium flex-shrink-0`}>{stageLabel(p.stage)}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    {p.client_name && <span>{p.client_name}</span>}
                    {p.area && <span>{p.area}㎡</span>}
                    {p.address && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{p.address}</span>}
                  </div>
                  <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(p.created_at).toLocaleDateString()}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
