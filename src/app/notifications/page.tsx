"use client";

import { useEffect, useState } from 'react';
import { Card } from '@/components/Card';
import { 
  Bell, 
  Send, 
  MessageSquare, 
  Volume2, 
  Info,
  History,
  Trash2,
  Users,
  Shield
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { useUI } from '@/context/UIContext';

export default function NotificationsPage() {
  const { t } = useUI();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    body: '',
    type: 'system',
    target: 'all' // all, students, trainers
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
      } else {
        console.error('Fetch notifications error:', data.error);
      }
    } catch (e) {
      console.error('Fetch error:', e);
    }
    setLoading(false);
  }

  async function handleSendNotification() {
    if (!newNotification.title || !newNotification.body) {
      toast.error('أدخل العنوان والنص أولاً');
      return;
    }

    setSending(true);
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNotification)
      });
      const data = await res.json();

      if (data.success) {
        toast.success('تم إرسال التنبيه بنجاح!');
        setNewNotification({ ...newNotification, title: '', body: '' });
        fetchNotifications();
      } else {
        toast.error('فشل إرسال التنبيه');
      }
    } catch {
      toast.error('حدث خطأ أثناء الاتصال بالخادم');
    }
    setSending(false);
  }

  return (
    <div className="space-y-8 text-start">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">{t('notifications')}</h2>
        <p className="text-foreground/50">Send real-time alerts and updates to all Tartelea users.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="إنشاء تنبيه جديد" className="border-border bg-card shadow-lg">
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-foreground/50 mb-2 uppercase tracking-widest ps-1">العنوان</label>
              <input 
                type="text" 
                placeholder="مثال: دورة جديدة متاحة الآن!"
                className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all text-sm font-bold"
                value={newNotification.title}
                onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-bold text-foreground/50 mb-2 uppercase tracking-widest ps-1">نص التنبيه</label>
              <textarea 
                placeholder="اكتب تفاصيل التنبيه هنا..."
                className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary h-36 text-sm resize-none"
                value={newNotification.body}
                onChange={(e) => setNewNotification({...newNotification, body: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-foreground/50 mb-3 uppercase tracking-widest ps-1">نوع التنبيه</label>
                <div className="flex gap-2">
                  {[
                    { id: 'system', icon: Info, color: 'text-blue-500' },
                    { id: 'room', icon: Volume2, color: 'text-emerald-500' },
                    { id: 'msg', icon: MessageSquare, color: 'text-purple-500' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setNewNotification({...newNotification, type: t.id})}
                      className={cn(
                        'flex-1 p-3 rounded-xl border transition-all flex flex-col items-center gap-2',
                        newNotification.type === t.id ? 'bg-primary/10 border-primary text-primary shadow-sm' : 'bg-foreground/5 border-border text-foreground/40 hover:bg-foreground/10'
                      )}
                    >
                      <t.icon size={20} className={newNotification.type === t.id ? 'text-primary' : 'text-foreground/40'} />
                      <span className="text-[9px] font-black uppercase tracking-tighter">{t.id}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-foreground/50 mb-3 uppercase tracking-widest ps-1">الفئة المستهدفة</label>
                <div className="flex gap-2">
                  {[
                    { id: 'all', label: 'الكل', icon: Users },
                    { id: 'trainer', label: 'المدربين', icon: Shield }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setNewNotification({...newNotification, target: t.id})}
                      className={cn(
                        'flex-1 p-3 rounded-xl border transition-all flex flex-col items-center gap-2',
                        newNotification.target === t.id ? 'bg-primary/10 border-primary text-primary shadow-sm' : 'bg-foreground/5 border-border text-foreground/40 hover:bg-foreground/10'
                      )}
                    >
                      <t.icon size={20} />
                      <span className="text-[9px] font-black uppercase tracking-tighter">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={handleSendNotification}
              disabled={sending}
              className="w-full bg-primary hover:bg-primary/80 disabled:opacity-50 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-primary/20 mt-4 group uppercase tracking-widest text-sm"
            >
              <Send size={20} className={cn(sending ? 'animate-bounce' : 'group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform')} />
              <span>{sending ? 'جاري الإرسال...' : 'بث التنبيه الآن'}</span>
            </button>
          </div>
        </Card>

        <Card title="آخر التنبيهات المرسلة" className="border-border bg-card shadow-lg">
          <div className="space-y-4">
            {loading ? (
              [1, 2, 3, 4].map(i => <div key={i} className="h-20 glass animate-pulse rounded-2xl" />)
            ) : notifications.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-foreground/20 gap-3 border-2 border-dashed border-border rounded-2xl bg-foreground/[0.01]">
                <History size={48} className="opacity-10" />
                <p className="font-bold text-foreground/30 uppercase tracking-widest">لا يوجد سجل تنبيهات</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} className="p-4 rounded-2xl bg-foreground/[0.01] border border-border flex items-start justify-between group hover:bg-foreground/[0.02] transition-colors">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 shadow-sm">
                      <Bell size={20} className="text-primary" />
                    </div>
                    <div>
                      <h5 className="font-bold text-foreground text-sm leading-tight">{notif.title}</h5>
                      <p className="text-xs text-foreground/50 line-clamp-1 mt-1 leading-relaxed">{notif.body}</p>
                      <p className="text-[10px] text-foreground/30 mt-3 font-bold uppercase tracking-widest">
                        {new Date(notif.created_at).toLocaleString('ar-EG')} • {notif.type}
                      </p>
                    </div>
                  </div>
                  <button className="p-2.5 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 hover:bg-red-500/10 rounded-xl">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
