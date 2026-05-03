'use client';

import { ReactNode } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Settings2 } from 'lucide-react';

interface ToolPageLayoutProps {
  title: string;
  description: string;
  color?: string;
  statusText?: string;
  children: ReactNode;
  settingsPanel: ReactNode;
}

export default function ToolPageLayout({
  title, description, color = 'indigo', statusText = '已连接 API', children, settingsPanel
}: ToolPageLayoutProps) {
  const colorMap: Record<string, { text: string; bg: string; border: string; dot: string; gradient: string }> = {
    indigo: { text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', dot: 'bg-green-500', gradient: 'from-indigo-600 to-purple-600' },
    purple: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', dot: 'bg-green-500', gradient: 'from-purple-600 to-pink-600' },
    amber: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', dot: 'bg-green-500', gradient: 'from-amber-600 to-orange-600' },
    emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-green-500', gradient: 'from-emerald-600 to-green-600' },
    cyan: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', dot: 'bg-green-500', gradient: 'from-cyan-600 to-teal-600' },
    red: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', dot: 'bg-green-500', gradient: 'from-red-600 to-rose-600' },
  };
  const c = colorMap[color] || colorMap.indigo;

  return (
    <AppLayout>
      <div className="min-h-screen pt-8 pb-12 px-6 lg:px-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-in">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
            <p className="text-slate-400">{description}</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 ${c.bg} border ${c.border} ${c.text} rounded-lg text-sm`}>
            <span className={`w-2 h-2 ${c.dot} rounded-full animate-pulse`} />
            {statusText}
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {children}
          </div>

          {/* Settings sidebar */}
          <div className="space-y-6">
            <div className="glass-card p-6 sticky top-24">
              <div className={`flex items-center gap-2 mb-6 ${c.text}`}>
                <Settings2 className="w-5 h-5" />
                <h3 className="font-bold uppercase tracking-wider text-sm">参数设置</h3>
              </div>
              {settingsPanel}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
