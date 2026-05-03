'use client';

import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/components/providers/AuthProvider';
import { useState } from 'react';
import { ClipboardList, LayoutDashboard, TreePine, DollarSign, Wand2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const STEPS = [
  { key: 'requirement', label: '需求采集', desc: '填写设计需求问卷', icon: ClipboardList, toolKey: 'space-decompose' },
  { key: 'layout', label: '布局规划', desc: 'AI 生成布局方案 (1积分)', icon: LayoutDashboard, toolKey: 'layout-plan' },
  { key: 'material', label: '选材推荐', desc: 'AI 推荐匹配材料 (2积分)', icon: TreePine, toolKey: 'material-recommend' },
  { key: 'budget', label: '预算估算', desc: '自动计算装修预算 (1积分)', icon: DollarSign, toolKey: 'budget-estimate' },
];

export default function AssistantStudio() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [image, setImage] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ rooms: '', style: '现代简约', area: '', budget: '', family: '', special: '' });

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleRunStep = async (stepIdx: number) => {
    const step = STEPS[stepIdx];
    if (!step.toolKey) { setCurrentStep(stepIdx + 1); return; }

    setLoading(true);
    setError('');
    try {
      const prompt = step.key === 'requirement'
        ? `分析此空间: ${formData.style}风格, ${formData.area}㎡, ${formData.rooms}, 预算${formData.budget}, 家庭${formData.family}, 特殊需求${formData.special}`
        : step.key === 'layout' ? `布局规划: ${formData.style}风格, ${formData.area}㎡, ${formData.rooms}`
        : step.key === 'material' ? `选材推荐: ${formData.style}风格`
        : `预算估算: ${formData.area}㎡, ${formData.style}风格, 预算范围${formData.budget}`;

      const res = await fetch('/api/studio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolKey: step.toolKey, prompt, imageUrl: image || 'data:image/png;base64,iVBOR', style: formData.style }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      const { success: _, ...resultData } = data;
      setResults(prev => ({ ...prev, [step.key]: resultData }));
      setCurrentStep(stepIdx + 1);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFullPipeline = async () => {
    setLoading(true);
    setError('');
    for (let i = 0; i < STEPS.length; i++) {
      try {
        await handleRunStep(i);
      } catch (err: any) {
        setError(err.message);
        break;
      }
    }
    setLoading(false);
  };

  return (
    <AppLayout>
      <div className="min-h-screen p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">方案助手</h1>
          <p className="text-sm text-gray-500 mt-1">4合1：需求采集 → 布局规划 → 选材推荐 → 预算估算</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Step 0: Requirement Form */}
            {currentStep === 0 && (
              <div className="card p-6 animate-fade-in">
                <h3 className="font-semibold text-gray-900 mb-4">📋 需求采集</h3>
                <div className="space-y-3">
                  <div><label className="text-sm font-medium text-gray-700">房间信息</label><input type="text" value={formData.rooms} onChange={e => setFormData(f => ({...f, rooms: e.target.value}))} placeholder="如：3室2厅2卫" className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-sm font-medium text-gray-700">面积(㎡)</label><input type="text" value={formData.area} onChange={e => setFormData(f => ({...f, area: e.target.value}))} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
                    <div><label className="text-sm font-medium text-gray-700">预算范围</label><input type="text" value={formData.budget} onChange={e => setFormData(f => ({...f, budget: e.target.value}))} placeholder="如：20-30万" className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
                  </div>
                  <div><label className="text-sm font-medium text-gray-700">家庭成员</label><input type="text" value={formData.family} onChange={e => setFormData(f => ({...f, family: e.target.value}))} placeholder="如：2大1小" className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
                  <div><label className="text-sm font-medium text-gray-700">特殊需求</label><textarea value={formData.special} onChange={e => setFormData(f => ({...f, special: e.target.value}))} placeholder="如有宠物、需要书房等" className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" rows={2} /></div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">上传户型图（可选）</label>
                    <input type="file" accept="image/*" onChange={handleUpload} className="w-full mt-1 text-sm" />
                  </div>
                </div>
                <button onClick={() => handleRunStep(0)} disabled={loading} className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600 disabled:opacity-50">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />} 分析需求 (1积分)
                </button>
              </div>
            )}

            {/* Results for completed steps */}
            {Object.entries(results).map(([key, data]: [string, any]) => (
              <div key={key} className="card p-5 animate-fade-in">
                <h3 className="font-semibold text-gray-900 mb-2">{STEPS.find(s => s.key === key)?.label}结果</h3>
                {data.outputImage ? (
                  <img src={data.outputImage} alt={key} className="w-full rounded-lg bg-gray-50" />
                ) : (
                  <p className="text-sm text-gray-500">分析完成，积分已扣减</p>
                )}
              </div>
            ))}

            {error && <div className="card p-4 border-red-200 bg-red-50"><div className="flex items-center gap-2 text-red-600 text-sm"><AlertCircle className="w-4 h-4" />{error}</div></div>}
          </div>

          {/* Right: Steps */}
          <div className="space-y-4">
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-4">步骤进度</h3>
              <div className="space-y-3">
                {STEPS.map((step, i) => (
                  <div key={step.key} className={`flex items-center gap-3 p-3 rounded-lg ${i < currentStep ? 'bg-emerald-50' : i === currentStep ? 'bg-indigo-50' : 'bg-gray-50'}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center ${i < currentStep ? 'bg-emerald-500 text-white' : i === currentStep ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                      {i < currentStep ? <CheckCircle2 className="w-4 h-4" /> : <step.icon className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${i <= currentStep ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                      <p className="text-xs text-gray-400">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              {currentStep > 0 && currentStep < STEPS.length && (
                <button onClick={() => handleRunStep(currentStep)} disabled={loading} className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600 disabled:opacity-50">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />} 继续下一步
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
