"use client";

import { useEffect, useState } from 'react';
import { Card } from '@/components/Card';
import { 
  Volume2, 
  Users, 
  Activity, 
  Clock, 
  Server, 
  Settings,
  RefreshCw,
  Mic,
  Sparkles,
  Zap,
  Radio,
  Signal,
  ShieldAlert,
  BarChart3
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { useUI } from '@/context/UIContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function RoomsPage() {
  const { t } = useUI();
  const [rooms, setRooms] = useState<any[]>([]);
  const [serverStatus, setServerStatus] = useState('checking...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  async function fetchRooms() {
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      if (data.success) {
        setRooms(data.rooms || []);
        setServerStatus('online');
      } else {
        setServerStatus('offline');
      }
    } catch (e) {
      setServerStatus('error');
    } finally {
      setLoading(false);
    }
  }

  async function handleEndRoom(roomName: string) {
    if (!confirm(`هل أنت متأكد من إنهاء الغرفة "${roomName}"؟ سيتم فصل جميع السالكين فوراً.`)) return;
    
    try {
      const res = await fetch('/api/rooms', {
        method: 'DELETE',
        body: JSON.stringify({ roomName })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`تم إنهاء الغرفة "${roomName}" بنجاح`);
        fetchRooms();
      } else {
        toast.error(`فشل إنهاء الغرفة: ${data.error}`);
      }
    } catch (e) {
      toast.error('خطأ غير متوقع عند محاولة إنهاء الغرفة');
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-3 flex items-center gap-3">
             مراقب الغرف الصوتية 
            <Radio className="text-primary inline animate-pulse" size={24} />
          </h1>
          <p className="text-foreground/50 spiritual-text text-lg italic">متابعة جلسات البث المباشر وحالة خوادم "LiveKit" الترتيلية.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className={cn(
            'px-6 py-3.5 rounded-2xl border flex items-center gap-3 transition-all font-black text-[10px] uppercase tracking-[0.2em] shadow-xl backdrop-blur-md',
            serverStatus === 'online' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-emerald-900/5' :
            serverStatus === 'offline' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 shadow-rose-900/5' :
            'bg-white/5 border-white/10 text-foreground/40'
          )}>
            <div className={cn('w-3 h-3 rounded-full', serverStatus === 'online' ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)] animate-pulse' : 'bg-foreground/20')} />
            <span>خادم البث: {serverStatus === 'online' ? 'متصل ومستقر' : 'غير متصل'}</span>
          </div>
          <button 
            onClick={() => { setLoading(true); fetchRooms(); }}
            className="p-3.5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-primary shadow-lg shadow-black/20"
          >
            <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <Card className="border-none bg-black/40 shadow-2xl overflow-hidden" title="دفق الحلقات النشطة">
            <AnimatePresence mode="popLayout">
              {loading && rooms.length === 0 ? (
                <div className="space-y-6 pt-6">
                  {[1, 2].map(i => <div key={i} className="h-32 premium-card animate-pulse" />)}
                </div>
              ) : rooms.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-32 flex flex-col items-center justify-center text-foreground/20 gap-4"
                >
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-foreground/10 flex items-center justify-center mb-4">
                     <Volume2 size={48} className="opacity-20 translate-y-2" />
                  </div>
                  <p className="font-bold spiritual-text text-xl italic tracking-widest mt-4">الصمت يلف الأروقة حالياً</p>
                  <p className="text-xs uppercase tracking-[0.3em] opacity-30">No Active Spiritual Rooms</p>
                </motion.div>
              ) : (
                <div className="space-y-6 pt-6">
                  {rooms.map((room, i) => (
                    <motion.div 
                      key={room.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 hover:border-primary/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-8 group relative overflow-hidden"
                    >
                      <div className="flex items-center gap-8 relative z-10">
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-yellow-700/20 to-yellow-400/20 flex items-center justify-center text-primary group-hover:scale-110 transition-all duration-500 border border-primary/20 shadow-inner">
                          <Mic size={32} strokeWidth={2.5} />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                             <h4 className="font-bold text-2xl spiritual-text">{room.name}</h4>
                             <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                مباشر
                             </span>
                          </div>
                          <div className="flex items-center gap-8">
                            <span className="flex items-center gap-2.5 text-xs font-bold text-foreground/40 uppercase tracking-widest">
                              <Users size={18} className="text-primary/60" />
                              <span className="text-foreground/80">{room.participantCount} سالك مُنصت</span>
                            </span>
                            <span className="flex items-center gap-2.5 text-xs font-bold text-foreground/40 uppercase tracking-widest">
                              <Clock size={18} className="text-primary/60" />
                              <span className="text-foreground/80">{Math.floor(room.creationTime / 60)} دقيقة</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 relative z-10">
                        <div className="flex -space-x-3">
                          {room.participants?.slice(0, 4).map((p: any, i: number) => (
                            <div key={i} className="w-11 h-11 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border-2 border-[#121212] flex items-center justify-center text-[10px] font-black text-primary shadow-xl group-hover:translate-y-[-2px] transition-transform">
                              {p.name?.[0] || '?'}
                            </div>
                          ))}
                          {room.participantCount > 4 && (
                            <div className="w-11 h-11 rounded-2xl bg-primary/20 border-2 border-[#121212] flex items-center justify-center text-[10px] font-black text-primary shadow-xl">
                              +{room.participantCount - 4}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                           <button className="px-8 py-3.5 border border-white/10 hover:bg-white/5 text-foreground/40 hover:text-white font-extrabold rounded-2xl text-[10px] uppercase tracking-[0.2em] transition-all">
                              إدارة
                           </button>
                           <button 
                            onClick={() => handleEndRoom(room.name)}
                            className="p-3.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-2xl transition-all shadow-lg hover:shadow-rose-900/40"
                            title="إنهاء الجلسة فوراً"
                           >
                              <ShieldAlert size={20} />
                           </button>
                        </div>
                      </div>
                      
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-all" />
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </Card>
        </div>

        <div className="space-y-8">
          <Card title="مؤشرات الاتصال" className="border-none bg-black/40 shadow-2xl">
            <div className="space-y-8 pt-4">
              <MetricItem label="ضغط المعالج" value="12%" percentage={12} icon={Activity} color="text-emerald-500" />
              <MetricItem label="ذاكرة الوصول" value="1.4 / 4 GB" percentage={35} icon={Server} color="text-primary" />
              <MetricItem label="سرعة النبض" value="4.2 Mbps" percentage={60} icon={Signal} color="text-primary" />
              <MetricItem label="العقد الروحية" value="2 Nodes" percentage={100} icon={BarChart3} color="text-primary/40" />
            </div>
          </Card>
          
          <div className="grid grid-cols-2 gap-4">
            <button className="p-6 bg-white/5 hover:bg-white/10 rounded-3xl flex flex-col items-center gap-4 transition-all group border border-white/5 hover:border-primary/40 shadow-xl overflow-hidden relative">
              <Zap size={32} className="text-primary transition-transform group-hover:scale-110 relative z-10" strokeWidth={2.5} />
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40 group-hover:text-primary transition-colors relative z-10">بث طقسي</span>
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button className="p-6 bg-white/5 hover:bg-rose-500/10 rounded-3xl flex flex-col items-center gap-4 transition-all group border border-white/5 hover:border-rose-500/40 shadow-xl overflow-hidden relative">
              <ShieldAlert size={32} className="text-rose-500 transition-transform group-hover:rotate-12 relative z-10" strokeWidth={2.5} />
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40 group-hover:text-rose-500 transition-colors relative z-10">إعادة تعميد</span>
              <div className="absolute inset-0 bg-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MetricItem({ label, value, icon: Icon, color, percentage }: any) {
  return (
    <div className="space-y-3">
       <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className={cn("p-2 rounded-lg bg-white/5", color.replace('text-', 'bg-').replace('500', '500/10'))}>
                <Icon size={16} className={cn(color)} />
             </div>
             <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest spiritual-text">{label}</span>
          </div>
          <span className="text-xs font-black text-foreground">{value}</span>
       </div>
       <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            className={cn("h-full", color.includes('primary') ? 'gold-gradient' : color.replace('text-', 'bg-'))} 
          />
       </div>
    </div>
  );
}

