'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import {
  Home, LayoutDashboard, Wand2, Star, BarChart3, BookOpen,
  CreditCard, Settings, LogOut, Menu, X, ChevronDown, ChevronRight,
  Search, Bell, HelpCircle, FolderKanban, MousePointerClick, FileText, Hammer, HomeIcon
} from 'lucide-react';
import useSWR from 'swr';

const STAGES = ['client_filing', 'requirement', 'design', 'confirm', 'construction', 'complete'];

const workbenchItems = [
  { label: '平面图工作台', href: '/studio/floorplan', icon: LayoutDashboard, desc: '4合1' },
  { label: '实景化工作台', href: '/studio/realistic', icon: Wand2, desc: '3合1' },
  { label: '方案助手', href: '/studio/assistant', icon: FileText, desc: '4合1' },
  { label: '深化工作台', href: '/studio/detail', icon: Hammer, desc: '2合1' },
  { label: '空间拆解', href: '/studio/analyze', icon: Search, desc: '分析' },
];

const navItems = [
  { label: '我的项目', href: '/projects', icon: FolderKanban },
  { label: 'AI 工作台', icon: Wand2, children: workbenchItems },
  { label: '收藏夹', href: '/favorites', icon: Star },
  { label: '我的数据', href: '/analytics', icon: BarChart3 },
  { label: '使用教程', href: '/help', icon: BookOpen },
];

const adminItems = [
  { label: '仪表盘', href: '/admin', icon: Home },
  { label: '用户管理', href: '/admin/users', icon: Settings },
  { label: '套餐管理', href: '/admin/plans', icon: CreditCard },
  { label: '订单管理', href: '/admin/orders', icon: FileText },
  { label: '模型配置', href: '/admin/models', icon: LayoutDashboard },
  { label: '工具配置', href: '/admin/tools', icon: Wand2 },
  { label: '积分流水', href: '/admin/credits', icon: CreditCard },
  { label: '内容管理', href: '/admin/help', icon: BookOpen },
  { label: '系统设置', href: '/admin/settings', icon: Settings },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [toolsOpen, setToolsOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isAdmin = pathname?.startsWith('/admin');
  const items = user?.role === 'admin' && isAdmin ? adminItems : navItems;

  const isActive = (href: string) => pathname === href;

  // Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Fetch notifications count
  const { data: notifData } = useSWR(
    user ? '/api/user/notifications?count=1' : null,
    { refreshInterval: 30000 }
  );
  const unreadCount = notifData?.count || 0;

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/projects?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  }, [searchQuery, router]);

  const NavContent = () => (
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className="px-6 py-5 flex items-center gap-3 border-b border-gray-100">
        <div className="w-9 h-9 gradient-indigo rounded-lg flex items-center justify-center">
          <Wand2 className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">InteriorAI</h1>
          <p className="text-[11px] text-gray-400">AI 室内设计工作台</p>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <button
          onClick={() => setSearchOpen(true)}
          className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-400 transition-colors border border-gray-100"
        >
          <Search className="w-4 h-4" />
          <span className="flex-1 text-left">快速搜索...</span>
          <kbd className="hidden sm:inline text-[10px] px-1.5 py-0.5 bg-white rounded border border-gray-200 text-gray-400">⌘K</kbd>
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-1 space-y-0.5 custom-scrollbar overflow-y-auto">
        {items.map((item) => {
          if ('children' in item && item.children) {
            return (
              <div key={item.label}>
                <button
                  onClick={() => setToolsOpen(!toolsOpen)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    item.children.some(c => isActive(c.href)) ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="flex-1 text-left font-medium">{item.label}</span>
                  {toolsOpen ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
                </button>
                {toolsOpen && (
                  <div className="ml-4 space-y-0.5 mt-0.5 mb-1">
                    {item.children.map((child: any) => (
                      <button
                        key={child.href}
                        onClick={() => { router.push(child.href); setMobileOpen(false); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive(child.href)
                            ? 'bg-indigo-50 text-indigo-600 font-medium'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <child.icon className="w-3.5 h-3.5" />
                        <span className="flex-1 text-left">{child.label}</span>
                        {child.desc && <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-400">{child.desc}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          const Icon = item.icon;
          return (
            <button
              key={item.href}
              onClick={() => { router.push(item.href!); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive(item.href!)
                  ? 'bg-indigo-50 text-indigo-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Info */}
      {user && (
        <div className="p-4 border-t border-gray-100">
          {/* Credits */}
          <div className="mb-3 px-3 py-2.5 bg-indigo-50 rounded-lg border border-indigo-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">积分余额</span>
              <span className="text-sm font-bold text-indigo-600">{user.credits?.toLocaleString()}</span>
            </div>
            <button
              onClick={() => router.push('/credits')}
              className="mt-1.5 w-full text-xs text-indigo-500 hover:text-indigo-700 font-medium"
            >
              充值 →
            </button>
          </div>

          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 gradient-indigo rounded-full flex items-center justify-center text-white text-xs font-bold">
              {user.name?.[0] || user.email[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name || user.email}</p>
              <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
            </div>
            <button onClick={logout} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="退出">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-100"
      >
        {mobileOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-[280px] border-r border-gray-200 bg-white z-40">
        <NavContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-[280px]">
            <NavContent />
          </aside>
        </div>
      )}

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[20vh]">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSearchOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-gray-200 animate-slide-in-up">
            <form onSubmit={handleSearch} className="flex items-center gap-3 p-4 border-b border-gray-100">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索项目名、客户名、地址..."
                className="flex-1 text-sm bg-transparent outline-none text-gray-900 placeholder-gray-400"
                autoFocus
              />
              <kbd className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200 text-gray-400">ESC</kbd>
            </form>
            <div className="p-4 text-center text-sm text-gray-400">
              输入关键词搜索项目、客户、文件
            </div>
          </div>
        </div>
      )}
    </>
  );
}
