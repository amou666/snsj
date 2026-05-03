'use client';

import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import useSWR, { mutate } from 'swr';
import { useState } from 'react';
import { Plus, Search, Filter, FolderKanban, MoreHorizontal, Trash2, Edit, ChevronRight, MapPin, Calendar, DollarSign } from 'lucide-react';
import { PROJECT_STAGES } from '@/lib/constants';

export default function ProjectsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stageFilter, setStageFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', client_name: '', address: '', area: '', house_type: '', budget_min: '', budget_max: '', deadline: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const { data, isLoading } = useSWR(
    user ? `/api/projects?stage=${stageFilter}&search=${searchQuery}` : null
  );

  const projects = data?.data || [];
  const total = data?.total || 0;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name) return;
    setCreating(true);
    setCreateError('');
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...createForm,
          area: createForm.area ? parseFloat(createForm.area) : null,
          budget_min: createForm.budget_min ? parseFloat(createForm.budget_min) : null,
          budget_max: createForm.budget_max ? parseFloat(createForm.budget_max) : null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        mutate(`/api/projects?stage=${stageFilter}&search=${searchQuery}`);
        setShowCreate(false);
        setCreateForm({ name: '', client_name: '', address: '', area: '', house_type: '', budget_min: '', budget_max: '', deadline: '', description: '' });
      } else {
        setCreateError(data.error || '创建失败');
      }
    } catch { setCreateError('网络错误'); }
    finally { setCreating(false); }
  };

  const stageLabel = (key: string) => PROJECT_STAGES.find(s => s.key === key)?.label || key;
  const stageEmoji = (key: string) => PROJECT_STAGES.find(s => s.key === key)?.icon || '📋';

  return (
    <AppLayout>
      <div className="min-h-screen p-6 lg:p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">我的项目</h1>
            <p className="text-sm text-gray-500 mt-1">共 {total} 个项目</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> 新建项目
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索项目名、客户名、地址..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">全部阶段</option>
            {PROJECT_STAGES.map(s => <option key={s.key} value={s.key}>{s.icon} {s.label}</option>)}
          </select>
        </div>

        {/* Project Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="card p-6 animate-shimmer h-40" />)}
          </div>
        ) : projects.length === 0 ? (
          <div className="card p-12 text-center">
            <FolderKanban className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-4">暂无项目</p>
            <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600 transition-colors">
              创建第一个项目
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((p: any) => (
              <button
                key={p.id}
                onClick={() => router.push(`/projects/${p.id}`)}
                className="card card-interactive p-5 text-left"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{p.name}</h3>
                    {p.client_name && <p className="text-sm text-gray-500">{p.client_name}</p>}
                  </div>
                  <span className={`stage-${p.stage} px-2 py-1 rounded text-xs font-medium`}>
                    {stageEmoji(p.stage)} {stageLabel(p.stage)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                  {p.address && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.address}</span>}
                  {p.area && <span>{p.area}㎡</span>}
                  {p.deadline && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{p.deadline}</span>}
                  {p.budget_max && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />¥{(p.budget_min || 0).toLocaleString()}-{p.budget_max.toLocaleString()}</span>}
                </div>

                {/* Stage Progress Bar */}
                <div className="flex items-center gap-1">
                  {PROJECT_STAGES.map((s, i) => (
                    <div
                      key={s.key}
                      className={`flex-1 h-1.5 rounded-full ${
                        PROJECT_STAGES.findIndex(st => st.key === p.stage) >= i ? 'bg-indigo-500' : 'bg-gray-100'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                  <span>创建于 {new Date(p.created_at).toLocaleDateString()}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30" onClick={() => setShowCreate(false)} />
            <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl p-6 animate-slide-in-up">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">新建项目</h2>
              <form onSubmit={handleCreate} className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">项目名称 *</label>
                  <input type="text" required value={createForm.name} onChange={e => setCreateForm(f => ({...f, name: e.target.value}))} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="如：翡翠湾 3-502" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">客户姓名</label>
                    <input type="text" value={createForm.client_name} onChange={e => setCreateForm(f => ({...f, client_name: e.target.value}))} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">地址</label>
                    <input type="text" value={createForm.address} onChange={e => setCreateForm(f => ({...f, address: e.target.value}))} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">面积(㎡)</label>
                    <input type="number" value={createForm.area} onChange={e => setCreateForm(f => ({...f, area: e.target.value}))} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">户型</label>
                    <input type="text" value={createForm.house_type} onChange={e => setCreateForm(f => ({...f, house_type: e.target.value}))} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="3室2厅" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">截止日期</label>
                    <input type="date" value={createForm.deadline} onChange={e => setCreateForm(f => ({...f, deadline: e.target.value}))} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">预算下限(万)</label>
                    <input type="number" value={createForm.budget_min} onChange={e => setCreateForm(f => ({...f, budget_min: e.target.value}))} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">预算上限(万)</label>
                    <input type="number" value={createForm.budget_max} onChange={e => setCreateForm(f => ({...f, budget_max: e.target.value}))} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">备注</label>
                  <textarea value={createForm.description} onChange={e => setCreateForm(f => ({...f, description: e.target.value}))} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" rows={2} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">取消</button>
                  <button type="submit" disabled={creating} className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-600 transition-colors disabled:opacity-50">{creating ? '创建中...' : '创建'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
