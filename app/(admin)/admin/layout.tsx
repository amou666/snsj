'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { Home, Users, CreditCard, FileText, LayoutDashboard, Wand2, BookOpen, Settings, ChevronRight } from 'lucide-react';

const adminNav = [
  { label: '仪表盘', href: '/admin', icon: Home },
  { label: '用户管理', href: '/admin/users', icon: Users },
  { label: '套餐管理', href: '/admin/plans', icon: CreditCard },
  { label: '订单管理', href: '/admin/orders', icon: FileText },
  { label: '模型配置', href: '/admin/models', icon: LayoutDashboard },
  { label: '工具配置', href: '/admin/tools', icon: Wand2 },
  { label: '积分流水', href: '/admin/credits', icon: CreditCard },
  { label: '内容管理', href: '/admin/help', icon: BookOpen },
  { label: '系统设置', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') {
    return <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7]"><div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex">
      {/* Admin Sidebar */}
      <aside className="w-[240px] bg-white border-r border-gray-200 p-4 fixed left-0 top-0 bottom-0 overflow-y-auto">
        <div className="px-3 py-4 mb-4">
          <h2 className="text-lg font-bold text-gray-900">InteriorAI</h2>
          <p className="text-xs text-gray-400">管理后台</p>
        </div>
        <nav className="space-y-0.5">
          {adminNav.map(item => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                pathname === item.href ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="mt-8 pt-4 border-t border-gray-100">
          <button onClick={() => router.push('/')} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg">
            ← 返回前台
          </button>
        </div>
      </aside>

      <main className="ml-[240px] flex-1 p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
