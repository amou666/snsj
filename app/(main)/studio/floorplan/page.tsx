'use client';

import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/components/providers/AuthProvider';
import { useState } from 'react';
import { Upload, Wand2, Palette, Box, LayoutDashboard, ArrowRight, CheckCircle2, Loader2, AlertCircle, RotateCcw } from 'lucide-react';

const PIPELINE_STEPS = [
  { key: 'detect', label: '自动检测', desc: 'AI 识别图片类型（黑白/彩色/户型图）', icon: LayoutDashboard },
  { key: 'bw-to-color', label: '黑白上色', desc: '黑白平面图 → 彩色平面图 (2积分)', icon: Palette, toolKey: 'bw-to-color' },
  { key: 'color-to-3d', label: '彩色转3D', desc: '彩色平面图 → 3D 透视图 (2积分)', icon: Box, toolKey: 'color-to-3d' },
  { key: 'layout', label: '布局规划', desc: '分析空间布局方案 (1积分)', icon: LayoutDashboard, toolKey: 'layout-plan' },
  { key: 'realistic', label: '实景化', desc: '跳转实景化工作台', icon: Wand2 },
];

export default function FloorplanStudio() {
  const { user } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [results, setResults] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [style, setStyle] = useState('现代简约');

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleRunStep = async (stepIdx: number) => {
    const step = PIPELINE_STEPS[stepIdx];
    if (!step.toolKey || !image) return;

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/studio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolKey: step.toolKey,
          prompt: `${step.label}: ${style}风格`,
          imageUrl: results['bw-to-color'] || results['detect'] || image,
          style,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || '生成失败');
      setResults(prev => ({ ...prev, [step.key]: data.outputImage }));
      setCurrentStep(stepIdx + 1);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePipeline = async () => {
    if (!image) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/studio/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          steps: [
            { toolKey: 'bw-to-color', prompt: `黑白上色: ${style}风格`, style },
            { toolKey: 'color-to-3d', prompt: `彩色转3D: ${style}风格`, style },
          ],
          imageUrl: image,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || '管道执行失败');
      setResults({ 'bw-to-color': data.results[0]?.outputImage, 'color-to-3d': data.results[1]?.outputImage, final: data.finalImage });
      setCurrentStep(PIPELINE_STEPS.length);
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
          <h1 className="text-3xl font-extrabold text-gray-900">平面图工作台</h1>
          <p className="text-sm text-gray-500 mt-1">4合1：上色 → 3D → 布局 → 实景化，链式管道一步到位</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Upload + Results */}
          <div className="lg:col-span-2 space-y-4">
            {/* Upload */}
            {!image ? (
              <div className="card p-12 text-center">
                <label className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 mb-2">上传平面图（黑白/彩色/户型图均可）</p>
                  <p className="text-xs text-gray-400 mb-4">支持 JPG、PNG、WebP</p>
                  <span className="px-4 py-2 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600 inline-block">选择图片</span>
                  <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                </label>
              </div>
            ) : (
              <>
                {/* Current Image */}
                <div className="card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-700">输入图片</h3>
                    <button onClick={() => { setImage(null); setResults({}); setCurrentStep(0); }} className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1"><RotateCcw className="w-3 h-3" /> 重新上传</button>
                  </div>
                  <img src={image} alt="输入" className="w-full max-h-[400px] object-contain rounded-lg bg-gray-50" />
                </div>

                {/* Results */}
                {Object.keys(results).length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {results['bw-to-color'] && (
                      <div className="card p-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">彩色平面图</h3>
                        <img src={results['bw-to-color']} alt="彩色" className="w-full rounded-lg bg-gray-50" />
                      </div>
                    )}
                    {results['color-to-3d'] && (
                      <div className="card p-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">3D 透视图</h3>
                        <img src={results['color-to-3d']} alt="3D" className="w-full rounded-lg bg-gray-50" />
                      </div>
                    )}
                    {results['final'] && (
                      <div className="col-span-2 card p-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">最终结果</h3>
                        <img src={results['final']} alt="最终" className="w-full max-h-[500px] object-contain rounded-lg bg-gray-50" />
                      </div>
                    )}
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="card p-4 border-red-200 bg-red-50">
                    <div className="flex items-center gap-2 text-red-600 text-sm"><AlertCircle className="w-4 h-4" />{error}</div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right: Pipeline Steps + Config */}
          <div className="space-y-4">
            {/* Pipeline */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-4">处理管道</h3>
              <div className="space-y-3">
                {PIPELINE_STEPS.map((step, i) => (
                  <div key={step.key} className={`flex items-center gap-3 p-3 rounded-lg ${
                    i < currentStep ? 'bg-emerald-50' : i === currentStep && image ? 'bg-indigo-50' : 'bg-gray-50'
                  }`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                      i < currentStep ? 'bg-emerald-500 text-white' : i === currentStep && image ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-400'
                    }`}>
                      {i < currentStep ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs font-bold">{i + 1}</span>}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${i <= currentStep ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                      <p className="text-xs text-gray-400">{step.desc}</p>
                    </div>
                    {step.toolKey && i === currentStep && image && !loading && (
                      <button onClick={() => handleRunStep(i)} className="px-2 py-1 bg-indigo-500 text-white text-xs rounded hover:bg-indigo-600">执行</button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={handlePipeline}
                disabled={!image || loading}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                一键出图（4积分）
              </button>
            </div>

            {/* Style */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-3">设计风格</h3>
              <select value={style} onChange={e => setStyle(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option>现代简约</option><option>北欧风</option><option>日式侘寂</option><option>新中式</option><option>法式优雅</option><option>工业风</option><option>地中海</option><option>美式乡村</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
