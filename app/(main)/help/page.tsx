'use client';

import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/components/providers/AuthProvider';
import { useState } from 'react';
import { BookOpen, HelpCircle, Search, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';

const FAQ_ITEMS = [
  { q: '如何使用 AI 工具？', a: '在左侧导航选择一个工作台，上传图片后点击"生成"按钮即可。每个工具消耗 1-2 积分。' },
  { q: '积分如何计算？', a: '分析操作消耗 1 积分，生成操作消耗 1 积分。空间拆解仅分析（1积分），其他工具分析+生成（2积分）。' },
  { q: '如何充值积分？', a: '前往"积分充值"页面，选择合适的套餐进行购买。' },
  { q: '生成的图片保存在哪里？', a: '所有生成结果自动保存到收藏夹，你也可以在项目详情中查看。' },
  { q: '如何管理项目？', a: '在"我的项目"中创建项目，关联客户信息，AI 工具的结果可以保存到项目中。' },
  { q: '平面图工作台的管道是什么？', a: '管道是多个 AI 工具串联执行：上色→3D→布局，上一步的输出自动作为下一步的输入，节省操作。' },
];

const TUTORIAL_CATEGORIES = [
  { key: 'project', label: '项目管理', articles: [
    { title: '如何创建第一个项目', desc: '从客户建档到方案设计，完整的项目管理流程' },
    { title: '项目阶段说明', desc: '6个阶段的含义和推进时机' },
  ]},
  { key: 'tools', label: 'AI 工具使用', articles: [
    { title: '平面图工作台完整教程', desc: '4合1管道的使用方法和技巧' },
    { title: '实景化工作台多风格对比', desc: '如何使用对比模式生成多种风格' },
    { title: '方案助手从需求到预算', desc: '4步串联的完整流程' },
  ]},
  { key: 'credits', label: '积分说明', articles: [
    { title: '积分计价规则', desc: '分析和生成的积分消耗说明' },
    { title: '套餐对比和选择', desc: '免费版/专业版/企业版的功能差异' },
  ]},
];

export default function HelpPage() {
  const { user } = useAuth();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <AppLayout>
      <div className="min-h-screen p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">帮助中心</h1>
          <p className="text-sm text-gray-500 mt-1">使用教程和常见问题</p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="搜索教程和问题..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        {/* FAQ */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">常见问题</h2>
          <div className="space-y-2">
            {FAQ_ITEMS.filter(f => !searchQuery || f.q.includes(searchQuery) || f.a.includes(searchQuery)).map((faq, i) => (
              <div key={i} className="card overflow-hidden">
                <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)} className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors">
                  <HelpCircle className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  <span className="flex-1 text-sm font-medium text-gray-900">{faq.q}</span>
                  {expandedFaq === i ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                </button>
                {expandedFaq === i && (
                  <div className="px-4 pb-4 pl-11 text-sm text-gray-600 animate-fade-in-fast">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tutorials */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">使用教程</h2>
          <div className="space-y-6">
            {TUTORIAL_CATEGORIES.filter(cat => !searchQuery || cat.label.includes(searchQuery)).map(cat => (
              <div key={cat.key}>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{cat.label}</h3>
                <div className="space-y-2">
                  {cat.articles.map((article, i) => (
                    <div key={i} className="card p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer">
                      <BookOpen className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{article.title}</p>
                        <p className="text-xs text-gray-500">{article.desc}</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-300" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
