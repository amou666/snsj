'use client';

import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/components/providers/AuthProvider';
import { useState } from 'react';
import { Upload, Wand2, Loader2, AlertCircle, RotateCcw, Image, Building2, Box, Columns } from 'lucide-react';

const INPUT_TYPES = [
  { key: 'rough', label: '毛坯房', toolKey: 'rough-to-real', icon: Building2 },
  { key: 'floorplan', label: '平面图', toolKey: 'color-to-real', icon: Image },
  { key: '3d', label: '3D模型', toolKey: 'model-3d-to-real', icon: Box },
];

const STYLES = ['现代简约', '北欧风', '日式侘寂', '新中式', '法式优雅', '工业风', '地中海', '美式乡村', '轻奢风', '奶油风'];

export default function RealisticStudio() {
  const { user } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [inputType, setInputType] = useState('rough');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedStyles, setSelectedStyles] = useState<string[]>(['现代简约']);
  const [results, setResults] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const toggleStyle = (s: string) => {
    setSelectedStyles(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s].slice(0, 3));
  };

  const handleGenerate = async () => {
    if (!image || selectedStyles.length === 0) return;
    setLoading(true);
    setError('');
    setResults({});

    const toolKey = INPUT_TYPES.find(t => t.key === inputType)?.toolKey || 'rough-to-real';

    try {
      for (const s of selectedStyles) {
        const res = await fetch('/api/studio/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ toolKey, prompt: `${inputType === 'rough' ? '毛坯转实拍' : inputType === 'floorplan' ? '平面转实拍' : '3D转实拍'}: ${s}风格`, imageUrl: image, style: s }),
        });
        const data = await res.json();
        if (data.success) setResults(prev => ({ ...prev, [s]: data.outputImage }));
        else setError(prev => prev ? `${prev}; ${s}: ${data.error}` : `${s}: ${data.error}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">实景化工作台</h1>
          <p className="text-sm text-gray-500 mt-1">3合1：毛坯/平面/3D自动识别，多风格对比生成</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Upload */}
            {!image ? (
              <div className="card p-12 text-center">
                <label className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 mb-2">上传图片（毛坯房/平面图/3D模型均可）</p>
                  <span className="px-4 py-2 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600 inline-block">选择图片</span>
                  <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                </label>
              </div>
            ) : (
              <>
                <div className="card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-700">输入图片</h3>
                    <button onClick={() => { setImage(null); setResults({}); }} className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1"><RotateCcw className="w-3 h-3" /> 重新上传</button>
                  </div>
                  <img src={image} alt="输入" className="w-full max-h-[400px] object-contain rounded-lg bg-gray-50" />
                </div>

                {/* Results */}
                {Object.keys(results).length > 0 && (
                  <div className={compareMode && Object.keys(results).length > 1 ? 'grid grid-cols-2 gap-4' : 'space-y-4'}>
                    {Object.entries(results).map(([styleName, imgUrl]) => (
                      <div key={styleName} className="card p-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">{styleName}</h3>
                        <img src={imgUrl} alt={styleName} className="w-full rounded-lg bg-gray-50" />
                      </div>
                    ))}
                  </div>
                )}

                {error && <div className="card p-4 border-red-200 bg-red-50"><div className="flex items-center gap-2 text-red-600 text-sm"><AlertCircle className="w-4 h-4" />{error}</div></div>}
              </>
            )}
          </div>

          {/* Right Panel */}
          <div className="space-y-4">
            {/* Input Type */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-3">输入类型</h3>
              <div className="space-y-2">
                {INPUT_TYPES.map(t => (
                  <button key={t.key} onClick={() => setInputType(t.key)} className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm transition-colors ${inputType === t.key ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : 'bg-gray-50 text-gray-600 border border-transparent hover:bg-gray-100'}`}>
                    <t.icon className="w-4 h-4" /><span className="font-medium">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Style Selection */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">设计风格</h3>
                <label className="flex items-center gap-2 text-sm text-gray-500">
                  <input type="checkbox" checked={compareMode} onChange={e => setCompareMode(e.target.checked)} className="rounded" />
                  对比模式
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                {STYLES.map(s => (
                  <button key={s} onClick={() => toggleStyle(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedStyles.includes(s) ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {s}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">选择1-3种风格{compareMode ? '对比生成' : ''}，每种+2积分</p>
            </div>

            {/* Generate */}
            <button onClick={handleGenerate} disabled={!image || selectedStyles.length === 0 || loading} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              生成实景图（{selectedStyles.length * 2} 积分）
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
