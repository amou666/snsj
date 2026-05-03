'use client';

import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter, useParams } from 'next/navigation';
import useSWR, { mutate } from 'swr';
import { useState } from 'react';
import { ArrowLeft, ChevronRight, Plus, Edit, Trash2, Phone, MessageSquare, FileText, DollarSign, ClipboardList, Upload, CheckCircle2, Circle, Clock, AlertTriangle } from 'lucide-react';
import { PROJECT_STAGES } from '@/lib/constants';

const TABS = ['信息', '需求', '文件', '任务', '沟通', '付款'];

export default function ProjectDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const [activeTab, setActiveTab] = useState('信息');
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', task_type: 'design_review', due_date: '', priority: 'normal' });
  const [showAddComm, setShowAddComm] = useState(false);
  const [commForm, setCommForm] = useState({ channel: 'phone', summary: '', detail: '' });
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ milestone: '', amount: '', notes: '' });

  const { data: project, isLoading: projectLoading } = useSWR(
    user ? `/api/projects/${projectId}` : null
  );
  const { data: tasksData, isLoading: tasksLoading } = useSWR(
    user ? `/api/projects/${projectId}/tasks` : null
  );
  const { data: commsData } = useSWR(
    user ? `/api/projects/${projectId}/communications` : null
  );
  const { data: paymentsData } = useSWR(
    user ? `/api/projects/${projectId}/payments` : null
  );

  const stageIdx = project ? PROJECT_STAGES.findIndex(s => s.key === project.stage) : 0;

  const tasks = tasksData?.data || [];
  const comms = commsData?.data || [];
  const payments = paymentsData?.data || [];

  const [actionError, setActionError] = useState('');

  const handleAdvanceStage = async (direction: 'forward' | 'backward') => {
    const label = direction === 'forward' ? '推进' : '回退';
    if (!confirm(`确定${label}项目阶段？`)) return;
    setActionError('');
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ direction }) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || '操作失败'); }
      mutate(`/api/projects/${projectId}`);
    } catch (err: any) { setActionError(err.message); }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    setActionError('');
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(taskForm) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || '添加失败'); }
      mutate(`/api/projects/${projectId}/tasks`);
      setShowAddTask(false);
      setTaskForm({ title: '', task_type: 'design_review', due_date: '', priority: 'normal' });
    } catch (err: any) { setActionError(err.message); }
  };

  const handleAddComm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commForm.summary.trim()) return;
    setActionError('');
    try {
      const res = await fetch(`/api/projects/${projectId}/communications`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(commForm) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || '添加失败'); }
      mutate(`/api/projects/${projectId}/communications`);
      setShowAddComm(false);
      setCommForm({ channel: 'phone', summary: '', detail: '' });
    } catch (err: any) { setActionError(err.message); }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(paymentForm.amount);
    if (!paymentForm.milestone.trim() || isNaN(amount) || amount <= 0) { setActionError('请输入有效的里程碑名称和金额'); return; }
    setActionError('');
    try {
      const res = await fetch(`/api/projects/${projectId}/payments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...paymentForm, amount }) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || '添加失败'); }
      mutate(`/api/projects/${projectId}/payments`);
      setShowAddPayment(false);
      setPaymentForm({ milestone: '', amount: '', notes: '' });
    } catch (err: any) { setActionError(err.message); }
  };

  const handleCompleteTask = async (taskId: number) => {
    setActionError('');
    try {
      await fetch(`/api/projects/${projectId}/tasks`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ taskId, status: 'done', completed_at: new Date().toISOString() }) });
      mutate(`/api/projects/${projectId}/tasks`);
    } catch (err: any) { setActionError(err.message); }
  };

  const totalPayments = (payments || []).reduce((s: number, p: any) => s + (p.status === 'paid' ? p.amount : 0), 0);
  const totalBudget = (payments || []).reduce((s: number, p: any) => s + p.amount, 0);

  if (projectLoading) return <AppLayout><div className="p-8"><div className="animate-shimmer h-64 card" /></div></AppLayout>;
  if (!project) return <AppLayout><div className="p-8 text-center text-gray-500">项目不存在</div></AppLayout>;

  return (
    <AppLayout>
      <div className="min-h-screen p-6 lg:p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.push('/projects')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            {project.client_name && <p className="text-sm text-gray-500">{project.client_name} · {project.address || ''}</p>}
          </div>
          <div className="flex gap-2">
            {stageIdx > 0 && <button onClick={() => handleAdvanceStage('backward')} className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">回退阶段</button>}
            {stageIdx < 5 && <button onClick={() => handleAdvanceStage('forward')} className="px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-600">推进阶段</button>}
          </div>
        </div>

        {/* Stage Progress */}
        <div className="card p-4 mb-6">
          <div className="flex items-center gap-2">
            {PROJECT_STAGES.map((s, i) => (
              <div key={s.key} className="flex items-center flex-1">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                  i === stageIdx ? 'bg-indigo-50 text-indigo-600' : i < stageIdx ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400'
                }`}>
                  <span>{s.icon}</span>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {i < 5 && <ChevronRight className="w-4 h-4 text-gray-300 mx-1" />}
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-200">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Action Error */}
        {actionError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">{actionError}</div>
        )}

        {/* Tab Content */}
        {activeTab === '信息' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in">
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-3">项目信息</h3>
              <dl className="space-y-2 text-sm">
                {project.address && <><dt className="text-gray-500">地址</dt><dd className="text-gray-900">{project.address}</dd></>}
                {project.area && <><dt className="text-gray-500">面积</dt><dd className="text-gray-900">{project.area} ㎡</dd></>}
                {project.house_type && <><dt className="text-gray-500">户型</dt><dd className="text-gray-900">{project.house_type}</dd></>}
                {project.budget_max && <><dt className="text-gray-500">预算</dt><dd className="text-gray-900">¥{(project.budget_min||0).toLocaleString()} - ¥{project.budget_max.toLocaleString()}</dd></>}
                {project.deadline && <><dt className="text-gray-500">截止日期</dt><dd className="text-gray-900">{project.deadline}</dd></>}
              </dl>
            </div>
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-3">客户信息</h3>
              <dl className="space-y-2 text-sm">
                {project.client_name && <><dt className="text-gray-500">姓名</dt><dd className="text-gray-900">{project.client_name}</dd></>}
                {project.client_phone && <><dt className="text-gray-500">电话</dt><dd className="text-gray-900">{project.client_phone}</dd></>}
                {project.client_wechat && <><dt className="text-gray-500">微信</dt><dd className="text-gray-900">{project.client_wechat}</dd></>}
              </dl>
            </div>
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-3">快捷操作</h3>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => router.push('/studio/floorplan')} className="flex items-center gap-2 px-4 py-3 bg-indigo-50 text-indigo-600 rounded-lg text-sm hover:bg-indigo-100 transition-colors">
                  <FileText className="w-4 h-4" /> 平面图工作台
                </button>
                <button onClick={() => router.push('/studio/realistic')} className="flex items-center gap-2 px-4 py-3 bg-amber-50 text-amber-600 rounded-lg text-sm hover:bg-amber-100 transition-colors">
                  <Upload className="w-4 h-4" /> 实景化工作台
                </button>
                <button onClick={() => router.push('/studio/assistant')} className="flex items-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-600 rounded-lg text-sm hover:bg-emerald-100 transition-colors">
                  <ClipboardList className="w-4 h-4" /> 方案助手
                </button>
                <button onClick={() => router.push('/studio/detail')} className="flex items-center gap-2 px-4 py-3 bg-purple-50 text-purple-600 rounded-lg text-sm hover:bg-purple-100 transition-colors">
                  <Edit className="w-4 h-4" /> 深化工作台
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === '需求' && (
          <div className="card p-6 animate-fade-in">
            <div className="text-center py-8 text-gray-400">
              <ClipboardList className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">需求采集功能请在方案助手中使用</p>
              <button onClick={() => router.push('/studio/assistant')} className="mt-3 px-4 py-2 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600">打开方案助手</button>
            </div>
          </div>
        )}

        {activeTab === '文件' && (
          <div className="card p-6 animate-fade-in">
            <div className="text-center py-8 text-gray-400">
              <Upload className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">AI 生成的效果图会自动保存到项目文件</p>
            </div>
          </div>
        )}

        {activeTab === '任务' && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">任务列表</h3>
              <button onClick={() => setShowAddTask(true)} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600">
                <Plus className="w-3.5 h-3.5" /> 新增
              </button>
            </div>
            {(!tasks || tasks.length === 0) ? (
              <div className="card p-8 text-center text-gray-400"><p className="text-sm">暂无任务</p></div>
            ) : (
              <div className="space-y-2">
                {tasks.map((t: any) => (
                  <div key={t.id} className="card p-4 flex items-center gap-3">
                    <button onClick={() => t.status !== 'done' && handleCompleteTask(t.id)} className="flex-shrink-0">
                      {t.status === 'done' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5 text-gray-300 hover:text-indigo-500" />}
                    </button>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${t.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{t.title}</p>
                      {t.due_date && <p className="text-xs text-gray-400 mt-0.5">截止: {t.due_date}</p>}
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      t.priority === 'high' ? 'bg-red-50 text-red-600' : t.priority === 'normal' ? 'bg-gray-50 text-gray-600' : 'bg-blue-50 text-blue-600'
                    }`}>{t.priority === 'high' ? '高' : t.priority === 'normal' ? '中' : '低'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === '沟通' && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">沟通记录</h3>
              <button onClick={() => setShowAddComm(true)} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600">
                <Plus className="w-3.5 h-3.5" /> 新增
              </button>
            </div>
            {(!comms || comms.length === 0) ? (
              <div className="card p-8 text-center text-gray-400"><p className="text-sm">暂无沟通记录</p></div>
            ) : (
              <div className="space-y-3">
                {comms.map((c: any) => (
                  <div key={c.id} className="card p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">{c.channel}</span>
                      <span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-900">{c.summary}</p>
                    {c.action_taken && <p className="text-xs text-indigo-500 mt-1">操作: {c.action_taken}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === '付款' && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">付款跟踪</h3>
              <button onClick={() => setShowAddPayment(true)} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600">
                <Plus className="w-3.5 h-3.5" /> 新增
              </button>
            </div>

            {/* Payment Progress */}
            {totalBudget > 0 && (
              <div className="card p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">收款进度</span>
                  <span className="text-sm font-semibold text-gray-900">¥{totalPayments.toLocaleString()} / ¥{totalBudget.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div className="h-2 bg-emerald-500 rounded-full transition-all" style={{ width: `${totalBudget ? (totalPayments / totalBudget * 100) : 0}%` }} />
                </div>
              </div>
            )}

            {(!payments || payments.length === 0) ? (
              <div className="card p-8 text-center text-gray-400"><p className="text-sm">暂无付款记录</p></div>
            ) : (
              <div className="data-table w-full card overflow-hidden">
                <table className="w-full">
                  <thead><tr><th>里程碑</th><th>金额</th><th>状态</th><th>时间</th></tr></thead>
                  <tbody>
                    {payments.map((p: any) => (
                      <tr key={p.id}>
                        <td className="font-medium text-gray-900">{p.milestone}</td>
                        <td className="text-emerald-600 font-semibold">¥{p.amount.toLocaleString()}</td>
                        <td><span className={`px-2 py-0.5 rounded text-xs ${p.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{p.status === 'paid' ? '已付' : '待付'}</span></td>
                        <td>{p.paid_at ? new Date(p.paid_at).toLocaleDateString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Add Task Modal */}
        {showAddTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30" onClick={() => setShowAddTask(false)} />
            <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">新增任务</h2>
              <form onSubmit={handleAddTask} className="space-y-3">
                <input type="text" required value={taskForm.title} onChange={e => setTaskForm(f => ({...f, title: e.target.value}))} placeholder="任务标题" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <div className="grid grid-cols-2 gap-3">
                  <select value={taskForm.priority} onChange={e => setTaskForm(f => ({...f, priority: e.target.value}))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    <option value="high">高优先级</option><option value="normal">中优先级</option><option value="low">低优先级</option>
                  </select>
                  <input type="date" value={taskForm.due_date} onChange={e => setTaskForm(f => ({...f, due_date: e.target.value}))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div className="flex gap-3"><button type="button" onClick={() => setShowAddTask(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm">取消</button><button type="submit" className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm">创建</button></div>
              </form>
            </div>
          </div>
        )}

        {/* Add Communication Modal */}
        {showAddComm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30" onClick={() => setShowAddComm(false)} />
            <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">新增沟通记录</h2>
              <form onSubmit={handleAddComm} className="space-y-3">
                <select value={commForm.channel} onChange={e => setCommForm(f => ({...f, channel: e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                  <option value="phone">电话</option><option value="wechat">微信</option><option value="visit">面谈</option><option value="email">邮件</option>
                </select>
                <input type="text" required value={commForm.summary} onChange={e => setCommForm(f => ({...f, summary: e.target.value}))} placeholder="沟通概要" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                <textarea value={commForm.detail} onChange={e => setCommForm(f => ({...f, detail: e.target.value}))} placeholder="详细内容" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" rows={3} />
                <div className="flex gap-3"><button type="button" onClick={() => setShowAddComm(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm">取消</button><button type="submit" className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm">保存</button></div>
              </form>
            </div>
          </div>
        )}

        {/* Add Payment Modal */}
        {showAddPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30" onClick={() => setShowAddPayment(false)} />
            <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">新增付款记录</h2>
              <form onSubmit={handleAddPayment} className="space-y-3">
                <input type="text" required value={paymentForm.milestone} onChange={e => setPaymentForm(f => ({...f, milestone: e.target.value}))} placeholder="里程碑名称（如：设计定金）" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                <input type="number" required step="0.01" value={paymentForm.amount} onChange={e => setPaymentForm(f => ({...f, amount: e.target.value}))} placeholder="金额" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                <textarea value={paymentForm.notes} onChange={e => setPaymentForm(f => ({...f, notes: e.target.value}))} placeholder="备注" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" rows={2} />
                <div className="flex gap-3"><button type="button" onClick={() => setShowAddPayment(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm">取消</button><button type="submit" className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm">保存</button></div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
