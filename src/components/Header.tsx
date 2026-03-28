"use client";

import { Bell, Search, User, Globe, Moon, Sun, Menu, X, Sparkles } from 'lucide-react';
import { useUI } from '@/context/UIContext';
import { motion, AnimatePresence } from 'framer-motion';

export function Header() {
  const { language, setLanguage, theme, toggleTheme, sidebarOpen, setSidebarOpen, t } = useUI();

  return (
    <header className="h-20 sidebar-glass z-40 px-6 flex items-center justify-between border-b border-white/5 sticky top-0 w-full transition-all duration-300">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-primary/10 rounded-xl transition-all md:hidden text-primary"
        >
          <AnimatePresence mode="wait">
            {sidebarOpen ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                <X size={24} />
              </motion.div>
            ) : (
              <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                <Menu size={24} />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
        
        {/* Mobile Logo Only */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-primary/20 bg-black/40">
            <img src="/images/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold gradient-text text-lg tracking-tight">ترتيلية</span>
        </div>

        <div className="hidden md:flex items-center gap-2">
           {/* Placeholder for content when sidebar is hidden/showing */}
        </div>
      </div>
      
      <div className="flex-1 max-w-xl mx-8 hidden lg:block">
        <div className="relative group">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-foreground/30 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder={t('search_placeholder') || "Search for students, workshops, or data..."}
            className="w-full bg-white/5 border border-border rounded-2xl py-2.5 ps-12 pe-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all text-sm placeholder:text-foreground/30"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3 md:gap-6">
        <div className="hidden sm:flex items-center gap-1 bg-white/[0.03] p-1.5 rounded-2xl border border-white/5 shadow-inner">
          <button 
            onClick={toggleTheme}
            className="p-2 hover:bg-primary/10 rounded-xl transition-colors text-foreground/40 hover:text-primary"
            title="تبديل المظهر"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <button 
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-primary/10 rounded-xl transition-colors font-black text-[9px] uppercase tracking-widest text-foreground/40 hover:text-primary border border-transparent hover:border-primary/10"
            title="تبديل اللغة"
          >
            <Globe size={16} className="text-primary" />
            <span>{language === 'ar' ? 'English' : 'العربية'}</span>
          </button>
        </div>

        <button className="relative text-foreground/40 hover:text-primary transition-all p-2.5 bg-white/[0.03] rounded-2xl border border-white/5 hover:border-primary/20 group">
          <Bell size={20} className="group-hover:rotate-12 transition-transform" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full ring-2 ring-black animate-pulse" />
        </button>
        
        <div className="flex items-center gap-4 ps-4 border-s border-white/5">
          <div className="text-right hidden xl:block">
            <p className="text-xs font-black leading-none text-foreground/80 spiritual-text">مدير النظام</p>
            <p className="text-[9px] text-primary/40 mt-1 uppercase tracking-[0.2em] font-black">Administrator</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-yellow-700/20 to-yellow-400/20 flex items-center justify-center text-primary border border-primary/20 group hover:border-primary transition-all cursor-pointer shadow-lg shadow-black/20">
            <User size={22} className="group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>
    </header>
  );
}

