"use client";

import { useEffect, useState } from 'react';
import { Card } from '@/components/Card';
import { 
  Calendar, 
  Clock, 
  User, 
  Video, 
  MoreVertical, 
  Plus,
  Sparkles,
  Link as LinkIcon,
  PlayCircle,
  X,
  CheckCircle2,
  AlertCircle,
  Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { useUI } from '@/context/UIContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function WorkshopsPage() {
  const { t } = useUI();
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [newWorkshop, setNewWorkshop] = useState({
    title: '',
    description: '',
    trainer_id: '',
    scheduled_at: '',
    meeting_link: '',
    status: 'upcoming'
  });

  useEffect(() => {
    fetchWorkshops();
  }, []);

  async function fetchWorkshops() {
    setLoading(true);
    try {
      const res = await fetch('/api/workshops');
      const data = await res.json();
      if (data.success) {
        setWorkshops(data.workshops || []);
      } else {
        toast.error('فشل في جلب الورش');
      }
    } catch (e) {
      toast.error('حدث خطأ أثناء الاتصال بالخادم');
    }
    setLoading(false);
  }

  async function handleStartLive(workshop: any) {
    try {
      // 1. Generate token
      const res = await fetch('/api/token', {
        method: 'POST',
        body: JSON.stringify({
          roomName: workshop.id,
          participantName: 'Admin',
          role: 'admin'
        })
      });
      const { token, wsUrl } = await res.json();
      
      // 2. Update workshop status via Local API
      const statusRes = await fetch('/api/workshops', {
        method: 'PUT',
        body: JSON.stringify({ id: workshop.id, status: 'live' })
      });
      const statusData = await statusRes.json();

      if (!statusData.success) {
         throw new Error(statusData.error || 'Failed to update status');
      }

      toast.success('تم إطلاق الجلسة المباشرة!');
      fetchWorkshops();

      // Open LiveKit chamber or redirect (Dummy link for now)
      window.open(`https://livekit.io/rooms/${workshop.id}?token=${token}`, '_blank');
    } catch (e: any) {
      toast.error(`خطأ في إطلاق الجلسة: ${e.message}`);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-3 flex items-center gap-3">
             إدارة الورش التفاعلية
            <Sparkles className="text-primary inline" size={24} />
          </h1>
          <p className="text-foreground/50 spiritual-text text-lg italic">جدولة وإدارة الورش التفاعلية المباشرة مع المتدربين.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="gold-gradient text-black px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all hover:scale-105 shadow-xl shadow-yellow-900/20"
        >
          <Plus size={24} strokeWidth={3} />
          <span>جدولة ورشة جديدة</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-32 premium-card animate-pulse" />)
        ) : workshops.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center text-foreground/20 gap-4">
             <div className="w-20 h-20 rounded-full border-2 border-dashed border-foreground/10 flex items-center justify-center">
                <Calendar size={32} />
             </div>
             <p className="font-bold spiritual-text text-xl">لا توجد ورش عمل في الأفق القريب</p>
          </div>
        ) : (
          workshops.map((workshop, i) => (
            <motion.div
              key={workshop.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="p-0 overflow-hidden border-none hover:translate-x-1 transition-all cursor-default">
                <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex gap-8 items-start">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-yellow-700/20 to-yellow-400/10 flex flex-col items-center justify-center shrink-0 border border-primary/20 shadow-inner group-hover:border-primary transition-all">
                      <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-1">
                        {new Date(workshop.scheduled_at).toLocaleString('ar-EG', { month: 'short' })}
                      </span>
                      <span className="text-3xl font-black text-primary -mt-1 leading-none">
                        {new Date(workshop.scheduled_at).getDate()}
                      </span>
                      <Sparkles className="text-primary/20 mt-1" size={10} />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <h4 className="text-2xl font-bold spiritual-text">{workshop.title}</h4>
                        <div className={cn(
                          'px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-2',
                          workshop.status === 'live' ? 'bg-rose-500/10 text-rose-500 border-rose-500/30 animate-pulse' :
                          workshop.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' :
                          'bg-primary/5 text-primary/70 border-primary/20'
                        )}>
                          <div className={cn("w-2 h-2 rounded-full", workshop.status === 'live' ? 'bg-rose-500' : workshop.status === 'completed' ? 'bg-emerald-500' : 'bg-primary')} />
                          {workshop.status}
                        </div>
                      </div>
                      
                      <p className="text-sm text-foreground/40 max-w-2xl line-clamp-1 leading-relaxed italic">{workshop.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-x-10 gap-y-3 pt-2">
                        <div className="flex items-center gap-3 text-xs font-bold text-foreground/60 uppercase tracking-widest">
                          <Clock size={16} className="text-primary" />
                          <span className="text-foreground/90">{new Date(workshop.scheduled_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-bold text-foreground/60 uppercase tracking-widest">
                          <User size={16} className="text-primary" />
                          <span className="text-foreground/90">{workshop.trainer?.full_name || 'Coach Unknown'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-bold text-foreground/60 uppercase tracking-widest">
                          <Video size={16} className="text-primary" />
                          <span className="text-foreground/90">بث مباشر</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-6 md:mt-0">
                    {workshop.meeting_link && (
                       <a 
                        href={workshop.meeting_link} target="_blank"
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-primary transition-all group/link relative"
                        title="انضم للجلسة"
                       >
                         <LinkIcon size={20} />
                         <span className="absolute -top-10 scale-0 group-hover/link:scale-100 transition-transform bg-primary text-black text-[10px] font-bold px-3 py-1.5 rounded-lg whitespace-nowrap -start-1/2">رابط الاجتماع</span>
                       </a>
                    )}
                    {workshop.status === 'upcoming' && (
                       <button 
                        onClick={() => handleStartLive(workshop)}
                        className="px-8 py-3 gold-gradient text-black rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 shadow-xl shadow-yellow-900/20 flex items-center gap-2"
                       >
                          <Zap size={14} className="fill-black" />
                          أطلق الجلسة الآن
                       </button>
                    )}
                    <button className="px-8 py-3 bg-white/5 hover:bg-primary hover:text-black rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 hover:border-primary shadow-lg shadow-black/40">
                      إدارة المحتوى
                    </button>
                    <button className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-foreground/20 hover:text-white transition-all">
                      <MoreVertical size={20} />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Workshop Modal Placeholder */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-2xl bg-[#0a0a0a] border border-primary/20 rounded-[32px] overflow-hidden shadow-2xl shadow-yellow-900/10"
            >
              <div className="p-8 border-b border-white/5 flex justify-between items-center">
                <div>
                   <h2 className="text-2xl font-bold spiritual-text gradient-text">جدولة جلسة تفاعلية</h2>
                   <p className="text-xs text-foreground/40 mt-1 uppercase tracking-widest">Schedule New Workshop</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-3 hover:bg-white/5 rounded-2xl text-foreground/20 hover:text-white transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div>
                   <label className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-2 block">عنوان الورشة</label>
                   <input 
                    type="text" 
                    placeholder="مثال: التدبر النفسي في سورة الفاتحة..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-primary/40 transition-all"
                    value={newWorkshop.title}
                    onChange={(e) => setNewWorkshop({...newWorkshop, title: e.target.value})}
                   />
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div>
                      <label className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-2 block">التاريخ والوقت</label>
                      <input 
                        type="datetime-local" 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-primary/40 transition-all text-sm"
                        value={newWorkshop.scheduled_at}
                        onChange={(e) => setNewWorkshop({...newWorkshop, scheduled_at: e.target.value})}
                      />
                   </div>
                   <div>
                      <label className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-2 block">رابط الجلسة (Zoom/Meet)</label>
                      <input 
                        type="url" 
                        placeholder="https://zoom.us/j/..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-primary/40 transition-all text-sm"
                        value={newWorkshop.meeting_link}
                        onChange={(e) => setNewWorkshop({...newWorkshop, meeting_link: e.target.value})}
                      />
                   </div>
                </div>

                <div>
                   <label className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-2 block">نبذة روحانية</label>
                   <textarea 
                     rows={3}
                     className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-primary/40 transition-all resize-none"
                     placeholder="ماذا سيستفيد المتدرب من حضور هذه الورشة؟"
                     value={newWorkshop.description}
                     onChange={(e) => setNewWorkshop({...newWorkshop, description: e.target.value})}
                   />
                </div>
              </div>

              <div className="p-8 bg-white/5 flex gap-4">
                 <button 
                  onClick={() => setShowAddModal(false)}
                  className="px-8 py-4 rounded-2xl border border-white/10 font-bold hover:bg-white/10 transition-all flex-1"
                >
                  إلغاء
                </button>
                <button 
                  className="px-8 py-4 rounded-2xl gold-gradient text-black font-extrabold shadow-xl shadow-yellow-900/20 transition-all hover:scale-[1.02] flex-1 flex items-center justify-center gap-2"
                >
                   <Sparkles size={20} />
                   أرسل الدعوة للمتدربين
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

