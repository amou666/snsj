'use client';

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-shimmer rounded-lg ${className}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="glass-card p-6 space-y-4">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-32 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

export function ImageSkeleton() {
  return (
    <div className="glass-card p-6 flex items-center justify-center min-h-[300px]">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-400">AI 正在生成中...</p>
        <p className="text-xs text-slate-500 mt-1">预计需要 30-90 秒</p>
      </div>
    </div>
  );
}
