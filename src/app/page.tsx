"use client";

import { useEffect, useState } from 'react';
import { Card } from '@/components/Card';
import { 
  Users, 
  Video, 
  Volume2, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  Sparkles,
  Zap,
  Shield,
  Heart
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { cn } from '@/lib/utils';
import { useUI } from '@/context/UIContext';

const data = [
  { name: 'Jan', listeners: 1200, activity: 65 },
  { name: 'Feb', listeners: 2100, activity: 72 },
  { name: 'Mar', listeners: 1800, activity: 85 },
  { name: 'Apr', listeners: 2400, activity: 90 },
  { name: 'May', listeners: 3200, activity: 88 },
  { name: 'Jun', listeners: 4000, activity: 95 },
  { name: 'Jul', listeners: 5200, activity: 98 },
];

export default function Dashboard() {
  const { t, theme } = useUI();
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeHalaqat: 0,
    totalContent: 0,
    enlightenmentIndex: 88
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/crm');
        const data = await res.json();
        
        if (data.success) {
          setStats(data.stats);
        }
      } catch (e) {
        console.error("Failed to fetch dashboard stats", e);
      }

    }

    fetchStats();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">مرحباً بك في لوحة تحكم المدرسة</h1>
          <p className="text-foreground/50 spiritual-text text-lg">إدارة وتتبع أداء المنصة ونشاط المستخدمين.</p>
        </div>
        <div className="flex gap-3">
          <button className="gold-gradient text-black font-bold px-6 py-3 rounded-2xl shadow-lg shadow-yellow-900/20 hover:scale-105 transition-transform">
             {t('sync_database') || "تحديث البيانات"}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          title="إجمالي المستخدمين"
          value={stats.totalStudents.toLocaleString()} 
          icon={Users} 
          trend="+18%" 
          trendUp={true} 
          delay={0.1}
        />
        <StatCard 
          title="الحلقات النشطة"
          value={stats.activeHalaqat} 
          icon={Volume2} 
          trend="Live Now" 
          trendUp={true} 
          delay={0.2}
          isLive
        />
        <StatCard 
          title="المحتوى المعرفي"
          value={stats.totalContent} 
          icon={Video} 
          trend="+12 هذا الأسبوع" 
          trendUp={true} 
          delay={0.3}
        />
        <StatCard 
          title="مؤشر التفاعل العام"
          value={`${stats.enlightenmentIndex}%`} 
          icon={Sparkles} 
          trend="+5%" 
          trendUp={true} 
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card title="تحليلات التفاعل">
            <div className="h-[400px] w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorWave" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(212, 175, 55, 0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(212, 175, 55, 0.3)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(212, 175, 55, 0.3)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(10, 10, 10, 0.9)', 
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(212, 175, 55, 0.2)', 
                      borderRadius: '16px' 
                    }}
                    itemStyle={{ color: '#D4AF37' }}
                  />
                  <Area type="monotone" dataKey="listeners" stroke="#D4AF37" strokeWidth={4} fillOpacity={1} fill="url(#colorWave)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        <div className="space-y-6">
           <Card title="أحدث النشاطات" className="h-full">
            <div className="space-y-6 mt-4">
              {[
                { label: "ورشة عمل 'التدبر' بدأت", time: "الآن", icon: Zap, color: "text-amber-500" },
                { label: "رفع مقال 'اخلع نعليك'", time: "منذ ساعتين", icon: Shield, color: "text-blue-500" },
                { label: "50 طالب جديد انضموا", time: "اليوم", icon: Heart, color: "text-rose-500" },
                { label: "تحديث شروط الاستخدام", time: "بالأمس", icon: Clock, color: "text-emerald-500" }
              ].map((act, i) => (
                <div key={i} className="flex gap-4 items-start p-3 rounded-2xl hover:bg-white/5 transition-colors group">
                  <div className={cn("w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover:border-primary/30 transition-all", act.color)}>
                    <act.icon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{act.label}</p>
                    <p className="text-[10px] text-foreground/40 mt-1 uppercase tracking-widest">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 rounded-xl border border-primary/20 text-primary text-sm font-bold hover:bg-primary/5 transition-all">
               عرض كافة السجلات
            </button>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, icon: Icon, trend, trendUp, delay, isLive }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="group hover:-translate-y-1 transition-all duration-300">
        <div className="flex justify-between items-start mb-6">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-700/20 to-yellow-400/20 text-primary border border-primary/20 shadow-inner group-hover:scale-110 transition-transform">
            <Icon size={24} />
          </div>
          <div className={cn(
            'flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter', 
            isLive ? 'bg-rose-500/20 text-rose-500 animate-pulse border border-rose-500/30' : 
            trendUp ? 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20' : 'text-red-500 bg-red-500/10 border border-red-500/20'
          )}>
            {trend}
            {!isLive && (trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />)}
          </div>
        </div>
        <div>
          <p className="text-foreground/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-1 spiritual-text">{title}</p>
          <h4 className="text-4xl font-bold tracking-tight text-foreground gradient-text">{value}</h4>
        </div>
      </Card>
    </motion.div>
  );
}

