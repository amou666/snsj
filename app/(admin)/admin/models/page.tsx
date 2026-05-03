'use client';

import useSWR, { mutate } from 'swr';
import { useState } from 'react';

export default function AdminModels() {
  const { data } = useSWR('/api/admin/model-configs');
  const models = data?.configs || [];

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">模型配置</h1>
      <div className="data-table w-full card overflow-hidden">
        <table className="w-full">
          <thead><tr><th>名称</th><th>模型ID</th><th>类型</th><th>API Key</th><th>积分/次</th><th>超时</th><th>状态</th></tr></thead>
          <tbody>
            {models.map((m: any) => (
              <tr key={m.id}>
                <td className="font-medium text-gray-900">{m.name}</td>
                <td className="font-mono text-xs">{m.model_id}</td>
                <td><span className={`px-2 py-0.5 rounded text-xs ${m.type === 'analysis' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>{m.type}</span></td>
                <td className="font-mono text-xs text-gray-400">{m.api_key_masked || '****'}</td>
                <td>{m.credits_per_call}</td>
                <td>{m.timeout_ms / 1000}s</td>
                <td><span className={`px-2 py-0.5 rounded text-xs ${m.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>{m.is_active ? '启用' : '停用'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
