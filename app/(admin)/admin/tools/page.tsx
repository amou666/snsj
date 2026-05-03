'use client';

import useSWR from 'swr';

export default function AdminTools() {
  const { data } = useSWR('/api/admin/tool-configs');
  const tools = data?.configs || [];

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">工具配置</h1>
      <div className="data-table w-full card overflow-hidden">
        <table className="w-full">
          <thead><tr><th>工具</th><th>工作台</th><th>分析</th><th>生成</th><th>总积分</th><th>状态</th></tr></thead>
          <tbody>
            {tools.map((t: any) => (
              <tr key={t.id}>
                <td><span className="font-medium text-gray-900">{t.emoji} {t.name}</span><span className="text-xs text-gray-400 ml-2">{t.tool_key}</span></td>
                <td><span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{t.workbench || '-'}</span></td>
                <td>{t.has_analysis ? '✅' : '❌'}</td>
                <td>{t.has_generation ? '✅' : '❌'}</td>
                <td className="font-semibold">{(t.has_analysis ? 1 : 0) + (t.has_generation ? 1 : 0)}</td>
                <td><span className={`px-2 py-0.5 rounded text-xs ${t.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>{t.is_active ? '启用' : '停用'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
