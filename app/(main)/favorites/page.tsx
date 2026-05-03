'use client';

import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/components/providers/AuthProvider';
import useSWR, { mutate } from 'swr';
import { Star, Trash2, Download, Heart } from 'lucide-react';

export default function FavoritesPage() {
  const { user } = useAuth();
  const { data, isLoading } = useSWR(
    user ? '/api/user/favorites?page=1' : null
  );

  const favorites = data?.data || [];

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除此收藏？')) return;
    await fetch(`/api/user/favorites?id=${id}`, { method: 'DELETE' });
    mutate('/api/user/favorites?page=1');
  };

  return (
    <AppLayout>
      <div className="min-h-screen p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">收藏夹</h1>
          <p className="text-sm text-gray-500 mt-1">你生成的所有 AI 设计结果</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="card p-4 animate-shimmer h-64" />)}
          </div>
        ) : favorites.length === 0 ? (
          <div className="card p-12 text-center">
            <Heart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">暂无收藏，去工作台生成你的第一个设计吧</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((f: any) => (
              <div key={f.id} className="card overflow-hidden group">
                <div className="relative aspect-[4/3] bg-gray-100">
                  {f.result_image && <img src={f.result_image} alt="" className="w-full h-full object-cover" />}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                    {f.result_image && (
                      <a href={f.result_image} download className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100"><Download className="w-4 h-4" /></a>
                    )}
                    <button onClick={() => handleDelete(f.id)} className="p-2 bg-white rounded-full text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{f.tool_key}</span>
                    {f.style && <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs">{f.style}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
