'use client';

import useSWR, { mutate } from 'swr';
import { useState } from 'react';

export default function AdminSettings() {
  const { data: settingsData } = useSWR('/api/admin/settings');
  const settings = settingsData?.settings || {};
  const [form, setForm] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const merged = { ...settings, ...form };

  const handleSave = async () => {
    await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ settings: form }) });
    mutate('/api/admin/settings');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">系统设置</h1>
      <div className="card p-6 max-w-lg space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">分析操作积分</label>
          <input type="number" value={merged.analysis_credits || '1'} onChange={e => setForm(f => ({...f, analysis_credits: e.target.value}))} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">生成操作积分</label>
          <input type="number" value={merged.generation_credits || '1'} onChange={e => setForm(f => ({...f, generation_credits: e.target.value}))} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">站点名称</label>
          <input type="text" value={merged.site_name || ''} onChange={e => setForm(f => ({...f, site_name: e.target.value}))} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">联系邮箱</label>
          <input type="email" value={merged.contact_email || ''} onChange={e => setForm(f => ({...f, contact_email: e.target.value}))} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <button onClick={handleSave} className="px-4 py-2 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600 transition-colors">
          {saved ? '✅ 已保存' : '保存设置'}
        </button>
      </div>
    </div>
  );
}
