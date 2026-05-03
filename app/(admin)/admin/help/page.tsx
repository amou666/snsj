'use client';

import useSWR, { mutate } from 'swr';
import { useState } from 'react';
import { Plus, Edit, Trash2, Check, X } from 'lucide-react';

export default function AdminHelp() {
  const { data: helpData } = useSWR('/api/admin/help');
  const articles = helpData?.data || [];
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'tutorial', content: '', is_published: 1 });

  const handleCreate = async () => {
    await fetch('/api/admin/help', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    mutate('/api/admin/help');
    setShowCreate(false);
    setForm({ title: '', category: 'tutorial', content: '', is_published: 1 });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除此文章？')) return;
    await fetch(`/api/admin/help?id=${id}`, { method: 'DELETE' });
    mutate('/api/admin/help');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900">内容管理</h1>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1 px-3 py-2 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600"><Plus className="w-4 h-4" /> 新增</button>
      </div>

      <div className="data-table w-full card overflow-hidden">
        <table className="w-full">
          <thead><tr><th>标题</th><th>分类</th><th>状态</th><th>更新时间</th><th>操作</th></tr></thead>
          <tbody>
            {(articles || []).length === 0 ? <tr><td colSpan={5} className="text-center text-gray-400 py-8">暂无内容</td></tr> : (articles || []).map((a: any) => (
              <tr key={a.id}>
                <td className="font-medium text-gray-900">{a.title}</td>
                <td><span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{a.category}</span></td>
                <td><span className={`px-2 py-0.5 rounded text-xs ${a.is_published ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>{a.is_published ? '已发布' : '草稿'}</span></td>
                <td className="text-gray-400">{new Date(a.updated_at || a.created_at).toLocaleDateString()}</td>
                <td><button onClick={() => handleDelete(a.id)} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowCreate(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">新增文章</h2>
            <div className="space-y-3">
              <input type="text" placeholder="标题" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="tutorial">教程</option><option value="faq">FAQ</option><option value="guide">指南</option>
              </select>
              <textarea placeholder="内容 (Markdown)" value={form.content} onChange={e => setForm(f => ({...f, content: e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" rows={6} />
              <div className="flex gap-3">
                <button onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm">取消</button>
                <button onClick={handleCreate} className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm">创建</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
