'use client';

import { ImageSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Download, RefreshCw, Edit3, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { useState } from 'react';

interface ResultPanelProps {
  resultUrl: string | null;
  loading: boolean;
  originalUrl?: string | null;
  onRegenerate: () => void;
  onEdit: () => void;
}

export default function ResultPanel({ resultUrl, loading, originalUrl, onRegenerate, onEdit }: ResultPanelProps) {
  const [showCompare, setShowCompare] = useState(false);

  if (loading) return <ImageSkeleton />;

  if (!resultUrl) return null;

  return (
    <div className="glass-card p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">生成结果</h3>
        <div className="flex items-center gap-2">
          {originalUrl && (
            <button
              onClick={() => setShowCompare(!showCompare)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                showCompare ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {showCompare ? '查看结果' : '对比原图'}
            </button>
          )}
        </div>
      </div>

      <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-900/50">
        {showCompare && originalUrl ? (
          <div className="grid grid-cols-2 gap-1">
            <div className="relative">
              <img src={originalUrl} alt="原图" className="w-full h-auto max-h-[500px] object-contain" />
              <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 rounded text-xs text-white/80">原图</span>
            </div>
            <div className="relative">
              <img src={resultUrl} alt="结果" className="w-full h-auto max-h-[500px] object-contain" />
              <span className="absolute top-2 left-2 px-2 py-0.5 bg-indigo-500/80 rounded text-xs text-white">结果</span>
            </div>
          </div>
        ) : (
          <img src={resultUrl} alt="AI 生成结果" className="w-full h-auto max-h-[600px] object-contain" />
        )}
      </div>

      <div className="flex items-center gap-3 mt-4">
        <Button variant="secondary" size="sm" onClick={onRegenerate}>
          <RefreshCw className="w-4 h-4" /> 重新生成
        </Button>
        <Button variant="secondary" size="sm" onClick={onEdit}>
          <Edit3 className="w-4 h-4" /> 局部修改
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const a = document.createElement('a');
            a.href = resultUrl;
            a.download = `interior-ai-${Date.now()}.png`;
            a.click();
          }}
        >
          <Download className="w-4 h-4" /> 下载
        </Button>
      </div>
    </div>
  );
}
