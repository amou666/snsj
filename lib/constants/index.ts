// Shared constants - safe for both client and server

export const PROJECT_STAGES = [
  { key: 'client_filing', label: '客户建档', icon: '👤' },
  { key: 'requirement', label: '需求采集', icon: '📝' },
  { key: 'design', label: '方案设计', icon: '🎨' },
  { key: 'confirm', label: '确认签约', icon: '✅' },
  { key: 'construction', label: '施工跟进', icon: '🔨' },
  { key: 'complete', label: '完工归档', icon: '🏠' },
] as const;

export const STYLES = [
  '现代简约', '北欧风', '日式侘寂', '新中式', '法式优雅',
  '工业风', '地中海', '美式乡村', '轻奢风', '奶油风',
  'Art Deco', '波西米亚', '极简主义', '复古怀旧', '摩洛哥',
  '东南亚', '维多利亚', '包豪斯', '侘寂风', '无印良品风',
  '台式简约', '港式轻奢', '混搭风'
];

export const WORKBENCHES = [
  { key: 'floorplan', name: '平面图工作台', desc: '4合1', href: '/studio/floorplan' },
  { key: 'realistic', name: '实景化工作台', desc: '3合1', href: '/studio/realistic' },
  { key: 'assistant', name: '方案助手', desc: '4合1', href: '/studio/assistant' },
  { key: 'detail', name: '深化工作台', desc: '2合1', href: '/studio/detail' },
  { key: 'analyze', name: '空间拆解', desc: '分析', href: '/studio/analyze' },
];
