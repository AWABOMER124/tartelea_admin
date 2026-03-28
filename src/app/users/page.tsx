"use client";

import { useEffect, useState } from 'react';
import { Card } from '@/components/Card';
import { 
  User, 
  UserPlus, 
  UserMinus, 
  Shield, 
  MoreVertical,
  Search,
  Filter,
  CheckCircle2,
  Sparkles,
  Compass,
  ArrowUpRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { useUI } from '@/context/UIContext';
import { motion } from 'framer-motion';

export default function UsersPage() {
  const { t } = useUI();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
      } else {
        toast.error('فشل في جلب قائمة المستخدمين');
      }
    } catch (e) {
      toast.error('حدث خطأ أثناء الاتصال بالخادم');
    }
    setLoading(false);
  }

  async function handleToggleRole(userId: string, currentRole: string) {
    const newRole = currentRole === 'student' ? 'trainer' : 'student';
    
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        body: JSON.stringify({ userId, role: newRole })
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(`تم تغيير رتبة المستخدم إلى ${newRole}`);
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      } else {
        toast.error('فشل في تحديث الرتبة');
      }
    } catch (e) {
      toast.error('حدث خطأ أثناء الاتصال بالخادم');
    }
  }


  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.id.includes(searchQuery)
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-3 flex items-center gap-3">
             مركز إدارة المستخدمين 
            <Compass className="text-primary inline" size={24} />
          </h1>
          <p className="text-foreground/50 spiritual-text text-lg italic">مراقبة ورعاية رحلة الطلاب في دروب التزكية والارتقاء.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80 group">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-foreground/30 group-focus-within:text-primary transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="البحث عن مستخدم باسمه أو معرّفه..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 ps-12 pe-4 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all text-sm"
            />
          </div>
          <button className="bg-white/5 border border-white/10 p-3.5 rounded-2xl hover:bg-white/10 transition-all text-primary shadow-lg shadow-black/20">
            <Filter size={24} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <Card className="p-0 border-none overflow-hidden bg-black/40 shadow-2xl backdrop-blur-xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-start border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 text-start">المستخدم</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 text-start">الرتبة الروحية</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 text-start">تقدم الرحلة</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 text-start">الحالة</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 text-end">تدابير</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-6"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-white/5 rounded-2xl" /><div className="space-y-2"><div className="h-4 w-32 bg-white/5 rounded" /><div className="h-3 w-20 bg-white/5 rounded" /></div></div></td>
                    <td className="px-8 py-6"><div className="h-6 w-20 bg-white/5 rounded-full" /></td>
                    <td className="px-8 py-6"><div className="h-2 w-32 bg-white/5 rounded-full" /></td>
                    <td className="px-8 py-6"><div className="h-6 w-16 bg-white/5 rounded-full" /></td>
                    <td className="px-8 py-6 text-end"><div className="h-10 w-10 bg-white/5 rounded-xl ms-auto" /></td>
                  </tr>
                ))
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group cursor-default">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-700/30 to-yellow-400/30 flex items-center justify-center text-primary font-bold border border-primary/20 overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-500">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="spiritual-text text-xl">{(user.full_name || 'U')[0]}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">{user.full_name || 'مستخدم مجهول'}</p>
                          <p className="text-[10px] text-foreground/30 uppercase font-black tracking-widest mt-1 flex items-center gap-1">
                             <Sparkles size={8} className="text-primary/40" />
                             {user.country || 'أرض الله'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        'px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border shadow-lg',
                        user.role === 'admin' ? 'bg-rose-500/10 text-rose-500 border-rose-500/30 shadow-rose-900/5' :
                        user.role === 'trainer' ? 'bg-primary/10 text-primary border-primary/30 shadow-yellow-900/5' :
                        'bg-white/5 text-foreground/50 border-white/10'
                      )}>
                        {user.role || 'student'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                       <div className="w-48">
                          <div className="flex items-center justify-between mb-2">
                             <span className="text-[10px] text-foreground/40 font-bold uppercase tracking-tighter">مستوى الارتقاء</span>
                             <span className="text-[10px] text-primary font-black">65%</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-px">
                             <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: '65%' }}
                              className="h-full gold-gradient rounded-full" 
                             />
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40 animate-pulse" />
                        <span className="text-xs font-bold text-foreground/70 spiritual-text">نشط الآن</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-end">
                      <div className="flex justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleToggleRole(user.id, user.role)}
                          className="p-3 bg-white/5 hover:bg-primary/10 rounded-xl text-foreground/40 hover:text-primary transition-all border border-transparent hover:border-primary/20"
                          title="تعديل الرتبة"
                        >
                          <Shield size={20} />
                        </button>
                        <button 
                          className="p-3 bg-white/5 hover:bg-rose-500/10 rounded-xl text-foreground/40 hover:text-rose-500 transition-all border border-transparent hover:border-rose-500/20"
                          title="حظر المستخدم"
                        >
                          <UserMinus size={20} />
                        </button>
                        <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-foreground/40 hover:text-white transition-all">
                          <MoreVertical size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-8 border-t border-white/5 bg-white/2 flex justify-between items-center">
           <p className="text-xs text-foreground/30 font-bold">عرض {filteredUsers.length} من أصل {users.length} مستخدم نشط في المنصة</p>
           <div className="flex gap-4">
              <button className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2 hover:underline">
                 تصدير البيانات <ArrowUpRight size={14} />
              </button>
           </div>
        </div>
      </Card>
    </motion.div>
  );
}

