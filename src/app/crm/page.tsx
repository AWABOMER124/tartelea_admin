"use client";

import { useEffect, useState } from 'react';
import { Card } from '@/components/Card';
import { 
  Users, 
  Search, 
  Filter, 
  Calendar,
  MoreVertical,
  Download,
  TrendingUp,
  Zap,
  Target,
  Sparkles,
  Compass,
  LineChart,
  ArrowUpRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useUI } from '@/context/UIContext';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const analyticsData = [
  { name: 'Week 1', growth: 45 },
  { name: 'Week 2', growth: 52 },
  { name: 'Week 3', growth: 48 },
  { name: 'Week 4', growth: 61 },
  { name: 'Week 5', growth: 55 },
  { name: 'Week 6', growth: 72 },
  { name: 'Week 7', growth: 89 },
];

export default function CRMPage() {
  const { t } = useUI();
  const [stats, setStats] = useState({ totalStudents: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    setLoading(true);
    try {
      const res = await fetch('/api/crm');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats || { totalStudents: 0 });
      } else {
        toast.error('Failed to fetch CRM analytics');
      }
    } catch (e) {
      toast.error('حدث خطأ أثناء الاتصال بالخادم');
    }
    setLoading(false);
  }


  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
           <h1 className="text-4xl font-bold gradient-text mb-3 flex items-center gap-3">
             نظام إدارة تفاعل الطلاب (CRM)
            <Target className="text-primary inline" size={24} />
          </h1>
           <p className="text-foreground/50 spiritual-text text-lg italic">تحليل أداء الطلاب ومراقبة نشاط المنصة.</p>
        </div>
        <button className="bg-white/5 border border-white/10 px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all hover:bg-white/10 text-primary shadow-xl shadow-black/20">
          <Download size={22} />
          <span>تصدير تقارير النمو</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="إجمالي المستخدمين" value={stats.totalStudents} icon={Users} trend="+12.5%" delay={0.1} />
        <StatCard title="طلاب نشطون" value={Math.floor(stats.totalStudents * 0.82)} icon={Zap} trend="+5%" delay={0.2} />
        <StatCard title="متوسط التفاعل" value="88%" icon={TrendingUp} trend="+2%" delay={0.3} />
        <StatCard title="معدل الاحتفاظ" value="94%" icon={Target} delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
           <Card title="منحنى الارتقاء الجماعي">
              <div className="h-[350px] w-full mt-6">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData}>
                       <defs>
                          <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <XAxis dataKey="name" stroke="rgba(212, 175, 55, 0.2)" fontSize={12} tickLine={false} axisLine={false} />
                       <YAxis hide />
                       <Tooltip 
                        contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: '16px' }}
                        itemStyle={{ color: '#D4AF37' }}
                       />
                       <Area type="monotone" dataKey="growth" stroke="#D4AF37" strokeWidth={4} fillOpacity={1} fill="url(#colorGrowth)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </Card>
        </div>

        <div className="space-y-6">
           <Card title="أفضل الطلاب أداءً">
              <div className="space-y-6 mt-4">
                 {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-white/5 p-3 rounded-2xl transition-all border border-transparent hover:border-white/5">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                             {i}
                          </div>
                          <div>
                             <p className="text-sm font-bold">طالب مميز #{i}</p>
                             <div className="flex items-center gap-1 text-[10px] text-foreground/40 mt-1 uppercase font-black">
                                <Sparkles size={10} className="text-primary" />
                                9{10-i}% تفاعل
                             </div>
                          </div>
                       </div>
                       <ArrowUpRight size={16} className="text-foreground/20 group-hover:text-primary transition-colors" />
                    </div>
                 ))}
              </div>
              <button className="w-full mt-6 py-3 rounded-xl border border-white/10 text-xs font-bold hover:bg-white/5 transition-all uppercase tracking-widest">
                 عرض قائمة الأوائل
              </button>
           </Card>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, icon: Icon, trend, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="hover:-translate-y-1 transition-all group overflow-hidden border-none shadow-xl bg-black/40 backdrop-blur-md">
        <div className="flex justify-between items-start mb-6">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-700/20 to-yellow-400/20 text-primary border border-primary/20 group-hover:scale-110 transition-transform shadow-inner">
            <Icon size={24} strokeWidth={2.5} />
          </div>
          {trend && (
             <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">{trend}</span>
          )}
        </div>
        <div>
          <p className="text-foreground/40 text-[10px] font-black uppercase tracking-[0.2em] mb-1 spiritual-text">{title}</p>
          <h4 className="text-4xl font-bold tracking-tight text-foreground gradient-text">{value}</h4>
        </div>
        <div className="absolute -bottom-6 -right-6 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
           <Icon size={120} strokeWidth={1} />
        </div>
      </Card>
    </motion.div>
  );
}

