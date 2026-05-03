'use client';

import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/components/providers/AuthProvider';
import { useState } from 'react';
import { Upload, Wand2, Loader2, AlertCircle } from 'lucide-react';

export default function AnalyzeStudio() {
  const { user } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/studio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolKey: 'space-decompose', prompt: '空间元素拆解', imageUrl: image }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      const { success: _, ...resultData } = data;
      setResult(resultData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">空间拆解</h1>
          <p className="text-sm text-gray-500 mt-1">上传室内图片，AI 自动识别并拆解空间中的所有设计元素（1积分）</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {!image ? (
              <div className="card p-12 text-center">
                <label className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 mb-2">上传室内图片进行拆解</p>
                  <span className="px-4 py-2 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600 inline-block">选择图片</span>
                  <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                </label>
              </div>
            ) : (
              <div className="card p-4">
                <img src={image} alt="输入" className="w-full max-h-[500px] object-contain rounded-lg bg-gray-50" />
                <button onClick={handleAnalyze} disabled={loading} className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 disabled:opacity-50">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />} 开始拆解 (1积分)
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {result?.outputImage && (
              <div className="card p-4 animate-fade-in">
                <h3 className="text-sm font-medium text-gray-700 mb-2">拆解结果</h3>
                <img src={result.outputImage} alt="结果" className="w-full rounded-lg bg-gray-50" />
              </div>
            )}
            {error && <div className="card p-4 border-red-200 bg-red-50"><div className="flex items-center gap-2 text-red-600 text-sm"><AlertCircle className="w-4 h-4" />{error}</div></div>}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
