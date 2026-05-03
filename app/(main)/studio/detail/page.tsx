'use client';

import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/components/providers/AuthProvider';
import { useState } from 'react';
import { Upload, Wand2, Loader2, AlertCircle, FileText, Globe } from 'lucide-react';

const TOOLS = [
  { key: 'construction-drawing', label: '施工图生成', desc: '天花/灯具/插座等施工图', icon: FileText, toolKey: 'construction-drawing', credits: 2 },
  { key: 'panorama', label: '全景图生成', desc: '360° 全景 VR 预览', icon: Globe, toolKey: 'panorama-generate', credits: 1 },
];

export default function DetailStudio() {
  const { user } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState('construction-drawing');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!image) return;
    const tool = TOOLS.find(t => t.key === activeTool);
    if (!tool) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/studio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolKey: tool.toolKey, prompt: tool.label, imageUrl: image }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setResult(data.outputImage);
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
          <h1 className="text-3xl font-extrabold text-gray-900">深化工作台</h1>
          <p className="text-sm text-gray-500 mt-1">2合1：效果图 → 施工图/全景VR，下游深化处理</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {!image ? (
              <div className="card p-12 text-center">
                <label className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 mb-2">上传效果图进行深化</p>
                  <span className="px-4 py-2 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600 inline-block">选择图片</span>
                  <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                </label>
              </div>
            ) : (
              <div className="card p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">输入效果图</h3>
                <img src={image} alt="输入" className="w-full max-h-[400px] object-contain rounded-lg bg-gray-50" />
              </div>
            )}

            {result && (
              <div className="card p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">深化结果</h3>
                <img src={result} alt="结果" className="w-full rounded-lg bg-gray-50" />
              </div>
            )}

            {error && <div className="card p-4 border-red-200 bg-red-50"><div className="flex items-center gap-2 text-red-600 text-sm"><AlertCircle className="w-4 h-4" />{error}</div></div>}
          </div>

          <div className="space-y-4">
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-3">深化工具</h3>
              <div className="space-y-2">
                {TOOLS.map(t => (
                  <button key={t.key} onClick={() => setActiveTool(t.key)} className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm transition-colors ${activeTool === t.key ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : 'bg-gray-50 text-gray-600 border border-transparent hover:bg-gray-100'}`}>
                    <t.icon className="w-4 h-4" />
                    <div className="text-left"><p className="font-medium">{t.label}</p><p className="text-xs text-gray-400">{t.desc}</p></div>
                    <span className="ml-auto text-xs text-gray-400">{t.credits}积分</span>
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleGenerate} disabled={!image || loading} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              开始深化
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
