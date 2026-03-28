"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, 
  Video, 
  Volume2, 
  Calendar, 
  BarChart2, 
  Bell, 
  LayoutDashboard,
  Settings,
  LogOut,
  FileText,
  Database,
  Mail,
  Compass,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUI } from '@/context/UIContext';
import { motion } from 'framer-motion';

export function Sidebar() {
  const pathname = usePathname();
  const { t, sidebarOpen, setSidebarOpen } = useUI();

  const menuItems = [
    { icon: LayoutDashboard, label: t('dashboard'), href: '/' },
    { icon: Compass, label: t('spiritual_journey'), href: '/journey' },
    { icon: Users, label: t('students'), href: '/users' },
    { icon: Video, label: t('vocal_content'), href: '/content' },
    { icon: FileText, label: t('articles'), href: '/articles' },
    { icon: Calendar, label: t('workshops'), href: '/workshops' },
    { icon: Volume2, label: t('audio_rooms'), href: '/rooms' },
    { icon: Database, label: t('crm'), href: '/crm' },
    { icon: Mail, label: t('marketing'), href: '/marketing' },
    { icon: Bell, label: t('notifications'), href: '/notifications' },
    { icon: BarChart2, label: t('analytics'), href: '/reports' },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-md"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <aside className={cn(
        "h-screen w-64 sidebar-glass flex-col transition-all duration-500 flex-shrink-0 z-50 border-e border-white/5",
        // Mobile: fixed overlay, Desktop: stable in flex
        "fixed md:relative top-0",
        sidebarOpen ? "start-0" : "-start-64 md:start-0 flex"
      )}>
        {/* Branding Area */}
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-8 group">
            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg shadow-black/40 ring-1 ring-primary/20 hover:scale-105 transition-all duration-500">
              <img src="/images/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text tracking-wider leading-none">المدرسة</h1>
              <p className="text-[10px] text-primary/60 uppercase tracking-[0.2em] font-bold mt-1">الترتيلية</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'nav-link group relative overflow-hidden',
                  pathname === item.href && 'active'
                )}
              >
                <item.icon size={18} className={cn(
                   "transition-colors duration-300",
                   pathname === item.href ? "text-primary" : "text-foreground/40 group-hover:text-primary"
                )} />
                <span className="font-medium text-sm">{item.label}</span>
                {pathname === item.href && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute start-0 w-1 h-6 bg-primary rounded-full"
                  />
                )}
              </Link>
            </motion.div>
          ))}
        </nav>
        
        <div className="p-4 mt-auto border-t border-border">
          <button className="nav-link w-full text-start mb-1">
            <Settings size={18} className="text-foreground/40" />
            <span className="text-sm">{t('settings')}</span>
          </button>
          <button className="nav-link w-full text-start text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut size={18} />
            <span className="text-sm">{t('logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
}

