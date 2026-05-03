'use client';

import useSWR, { mutate } from 'swr';
import { useState } from 'react';
import { Plus, Edit, Check, X } from 'lucide-react';

export default function AdminPlans() {
  const { data: plansData, isLoading } = useSWR('/api/admin/plans');
  const plans = plansData?.data || [];
  const [editing, setEditing] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  const handleSave = async (id: number) => {
    if (!form.name) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/plans', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...form }) });
      if (res.ok) { mutate('/api/admin/plans'); setEditing(null); setForm({}); }
    } finally { setSaving(false); }
  };

  const handleCreate = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/plans', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) { mutate('/api/admin/plans'); setShowCreate(false); setForm({}); }
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900">套餐管理</h1>
        <button onClick={() => { setShowCreate(true); setForm({}); }} className="flex items-center gap-1 px-3 py-2 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600"><Plus className="w-4 h-4" /> 新增</button>
      </div>

      <div className="data-table w-full card overflow-hidden">
        <table className="w-full">
          <thead><tr><th>名称</th><th>月费</th><th>年费</th><th>月含积分</th><th>项目上限</th><th>成员上限</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>
            {(plans || []).map((p: any) => (
              <tr key={p.id}>
                {editing === p.id ? (
                  <>
                    <td><input type="text" defaultValue={p.name} onChange={e => setForm({...form, name: e.target.value})} className="px-2 py-1 border rounded text-sm w-20" /></td>
                    <td><input type="number" defaultValue={p.price_monthly} onChange={e => setForm({...form, price_monthly: parseFloat(e.target.value)})} className="px-2 py-1 border rounded text-sm w-16" /></td>
                    <td><input type="number" defaultValue={p.price_yearly} onChange={e => setForm({...form, price_yearly: parseFloat(e.target.value)})} className="px-2 py-1 border rounded text-sm w-16" /></td>
                    <td><input type="number" defaultValue={p.credits_per_month} onChange={e => setForm({...form, credits_per_month: parseInt(e.target.value)})} className="px-2 py-1 border rounded text-sm w-16" /></td>
                    <td><input type="number" defaultValue={p.max_projects} onChange={e => setForm({...form, max_projects: parseInt(e.target.value)})} className="px-2 py-1 border rounded text-sm w-16" /></td>
                    <td><input type="number" defaultValue={p.max_members} onChange={e => setForm({...form, max_members: parseInt(e.target.value)})} className="px-2 py-1 border rounded text-sm w-16" /></td>
                    <td><span className={`px-2 py-0.5 rounded text-xs ${p.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>{p.is_active ? '启用' : '停用'}</span></td>
                    <td><div className="flex gap-1">
                      <button onClick={() => handleSave(p.id)} disabled={saving} className="p-1 text-emerald-500 hover:bg-emerald-50 rounded disabled:opacity-50"><Check className="w-4 h-4" /></button>
                      <button onClick={() => { setEditing(null); setForm({}); }} className="p-1 text-gray-400 hover:bg-gray-50 rounded"><X className="w-4 h-4" /></button>
                    </div></td>
                  </>
                ) : (
                  <>
                    <td className="font-medium text-gray-900">{p.name}</td>
                    <td>¥{p.price_monthly}</td>
                    <td>{p.price_yearly ? `¥${p.price_yearly}` : '-'}</td>
                    <td>{p.credits_per_month}</td>
                    <td>{p.max_projects || '不限'}</td>
                    <td>{p.max_members}</td>
                    <td><span className={`px-2 py-0.5 rounded text-xs ${p.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>{p.is_active ? '启用' : '停用'}</span></td>
                    <td><button onClick={() => { setEditing(p.id); setForm({}); }} className="p-1 text-indigo-500 hover:bg-indigo-50 rounded"><Edit className="w-4 h-4" /></button></td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowCreate(false)} />
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">新增套餐</h2>
            <div className="space-y-3">
              <input type="text" placeholder="套餐名称" value={form.name || ''} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="月费" value={form.price_monthly || ''} onChange={e => setForm(f => ({...f, price_monthly: parseFloat(e.target.value) || 0}))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                <input type="number" placeholder="年费" value={form.price_yearly || ''} onChange={e => setForm(f => ({...f, price_yearly: parseFloat(e.target.value) || 0}))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <input type="number" placeholder="月积分" value={form.credits_per_month || ''} onChange={e => setForm(f => ({...f, credits_per_month: parseInt(e.target.value) || 0}))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                <input type="number" placeholder="项目上限" value={form.max_projects || ''} onChange={e => setForm(f => ({...f, max_projects: parseInt(e.target.value) || 0}))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                <input type="number" placeholder="成员上限" value={form.max_members || ''} onChange={e => setForm(f => ({...f, max_members: parseInt(e.target.value) || 0}))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setShowCreate(false); setForm({}); }} className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50">取消</button>
                <button onClick={handleCreate} disabled={saving || !form.name} className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-600 disabled:opacity-50">创建</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
