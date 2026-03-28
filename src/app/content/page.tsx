"use client";

import { useEffect, useState } from 'react';
import { Card } from '@/components/Card';
import { 
  Plus, 
  Video, 
  Music, 
  BookOpen, 
  Edit2, 
  Trash2, 
  ExternalLink,
  Image as ImageIcon,
  X,
  Sparkles,
  Filter,
  CheckCircle2,
  PlayCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useUI } from '@/context/UIContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type ContentCategory = 'مهارات' | 'تطوير' | 'ثقافة';

export default function ContentPage() {
  const { t } = useUI();
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState<ContentCategory | 'all'>('all');
  
  const [newContent, setNewContent] = useState({
    title: '',
    description: '',
    type: 'video',
    category: 'تطوير' as ContentCategory,
    thumbnail_url: '',
    content_url: ''
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  async function fetchContent() {
    setLoading(true);
    try {
      const res = await fetch('/api/content');
      const data = await res.json();
      if (data.success) {
        setContent(data.content || []);
      } else {
        toast.error('فشل في جلب المحتوى');
      }
    } catch {
      toast.error('حدث خطأ أثناء الاتصال بالخادم');
    }
    setLoading(false);
  }

  async function handleAddContent() {
    if (!newContent.title) {
      toast.error('يرجى إدخال العنوان');
      return;
    }

    setUploading(true);
    let finalUrl = newContent.content_url;

    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        const uploadData = await uploadRes.json();
        
        if (!uploadData.success) throw new Error(uploadData.error);
        finalUrl = uploadData.url;
      } catch (e: any) {
        toast.error('فشل الرفع محلياً: ' + e.message);
        setUploading(false);
        return;
      }
    }

    try {
      const dbRes = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newContent, content_url: finalUrl })
      });
      const dbData = await dbRes.json();

      if (dbData.success) {
        toast.success('تمت إضافة المحتوى المختار بنجاح');
        setShowAddModal(false);
        setFile(null);
        setNewContent({ title: '', description: '', type: 'video', category: 'تطوير', thumbnail_url: '', content_url: '' });
        fetchContent();
      } else {
        toast.error('فشل حفظ المحتوى في قاعدة البيانات');
      }
    } catch {
      toast.error('فشل الاتصال بالخادم');
    }
    setUploading(false);
  }

  const categoryColors = {
    'مهارات': 'from-blue-600/20 to-indigo-600/20 text-blue-400 border-blue-500/30',
    'تطوير': 'from-amber-600/20 to-yellow-600/20 text-amber-400 border-amber-500/30',
    'ثقافة': 'from-emerald-600/20 to-teal-600/20 text-emerald-400 border-emerald-500/30'
  };

  const filteredContent = filter === 'all' 
    ? content 
    : content.filter(item => item.category === filter);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-3 flex items-center gap-3">
            إدارة المحتوى 
            <Sparkles className="text-primary inline" size={24} />
          </h1>
          <p className="text-foreground/50 spiritual-text text-lg italic">مكتبة المحتوى التعليمي للمستخدمين على المنصة.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="gold-gradient text-black px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all hover:scale-105 shadow-xl shadow-yellow-900/20"
        >
          <Plus size={24} strokeWidth={3} />
          <span>إضافة محتوى جديد</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10 w-fit">
        {[
          { id: 'all', label: 'الكل', icon: Filter },
          { id: 'مهارات', label: 'مهارات', icon: Sparkles },
          { id: 'تطوير', label: 'تطوير', icon: BookOpen },
          { id: 'ثقافة', label: 'ثقافة عامة', icon: Music }
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => setFilter(btn.id as any)}
            className={cn(
               "px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
               filter === btn.id ? "bg-primary text-black" : "text-foreground/40 hover:text-foreground hover:bg-white/5"
            )}
          >
            <btn.icon size={16} />
            {btn.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {loading ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="h-80 premium-card animate-pulse" />
          ))
        ) : filteredContent.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-32 text-foreground/20">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-foreground/20 flex items-center justify-center mb-6">
               <ImageIcon size={32} />
            </div>
            <p className="font-bold spiritual-text text-xl">لا يوجد محتوى في هذا المسار بعد</p>
          </div>
        ) : (
          filteredContent.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="p-0 border-none h-full hover:border-primary/30 transition-all cursor-default">
                <div className="relative group">
                   <div className="aspect-video overflow-hidden rounded-t-2xl">
                     {item.thumbnail_url ? (
                       <img src={item.thumbnail_url} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                     ) : (
                       <div className="w-full h-full bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center">
                         <PlayCircle size={48} className="text-white/20" />
                       </div>
                     )}
                   </div>
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <button className="p-3 bg-white/10 backdrop-blur-md rounded-xl hover:bg-primary hover:text-black transition-all border border-white/20">
                         <Edit2 size={20} />
                      </button>
                      <button className="p-3 bg-white/10 backdrop-blur-md rounded-xl hover:bg-red-500 transition-all border border-white/20">
                         <Trash2 size={20} />
                      </button>
                   </div>
                   <div className={cn(
                     "absolute top-4 ps-4 pe-6 py-1 -start-1 rounded-e-full border-y border-e backdrop-blur-xl font-black text-[10px] uppercase shadow-lg shadow-black/50",
                     categoryColors[item.category as ContentCategory] || categoryColors['تطوير']
                   )}>
                     {item.category || 'تطوير'}
                   </div>
                   <div className="absolute top-4 end-4">
                      <div className="w-8 h-8 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 text-primary">
                        {item.type === 'video' ? <Video size={16} /> : <Music size={16} />}
                      </div>
                   </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-bold mb-2 line-clamp-1 spiritual-text">{item.title}</h3>
                  <p className="text-xs text-foreground/40 mb-6 line-clamp-2 leading-relaxed h-8">{item.description || 'وصف روحاني لم يكتب بعد...'}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
                          <CheckCircle2 size={12} className="text-primary" />
                       </div>
                       <span className="text-[10px] font-bold text-foreground/30">{new Date(item.created_at).toLocaleDateString('ar-EG')}</span>
                    </div>
                    <a 
                      href={item.content_url} 
                      target="_blank" 
                      className="text-[10px] font-black uppercase text-primary tracking-widest hover:underline flex items-center gap-1"
                    >
                      معاينة <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Modern Add Modal */}
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
                   <h2 className="text-2xl font-bold spiritual-text gradient-text">إضافة محتوى جديد</h2>
                   <p className="text-xs text-foreground/40 mt-1 uppercase tracking-widest">Add New Content</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-3 hover:bg-white/5 rounded-2xl text-foreground/20 hover:text-white transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                   <div className="col-span-2">
                      <label className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-2 block">عنوان المحتوى</label>
                      <input 
                        type="text" 
                        placeholder="أدخل عنواناً ملهماً..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 focus:outline-none transition-all placeholder:text-foreground/20"
                        value={newContent.title}
                        onChange={(e) => setNewContent({...newContent, title: e.target.value})}
                      />
                   </div>

                   <div>
                      <label className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-2 block">تصنيف المحتوى</label>
                      <select 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-primary/40 transition-all appearance-none cursor-pointer"
                        value={newContent.category}
                        onChange={(e) => setNewContent({...newContent, category: e.target.value as any})}
                      >
                        <option value="مهارات">مهارات</option>
                        <option value="تطوير">تطوير الأعمال</option>
                        <option value="ثقافة">ثقافة عامة</option>
                      </select>
                   </div>

                   <div>
                      <label className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-2 block">نوع الوسائط</label>
                      <div className="flex gap-2">
                        {['video', 'audio'].map((t) => (
                          <button
                            key={t}
                            onClick={() => setNewContent({...newContent, type: t})}
                            className={cn(
                               "flex-1 py-3.5 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2 transition-all",
                               newContent.type === t ? "bg-primary text-black border-primary shadow-lg shadow-yellow-900/20" : "bg-white/5 border-white/10 text-foreground/40 hover:bg-white/10"
                            )}
                          >
                             {t === 'video' ? <Video size={16} /> : <Music size={16} />}
                             {t === 'video' ? 'فيديو' : 'صوت'}
                          </button>
                        ))}
                      </div>
                   </div>
                </div>

                <div>
                   <label className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-2 block">وصف المحتوى</label>
                   <textarea 
                     rows={3}
                     className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-primary/40 transition-all resize-none placeholder:text-foreground/20"
                     placeholder="وصف موضوع المادة التعليمية..."
                     value={newContent.description}
                     onChange={(e) => setNewContent({...newContent, description: e.target.value})}
                   />
                </div>

                <div className="p-6 border-2 border-dashed border-white/10 rounded-[28px] text-center hover:border-primary/20 transition-all group">
                   <input 
                      type="file" id="file-upload" className="hidden"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                       <PlayCircle size={40} className="mx-auto mb-3 text-foreground/20 group-hover:text-primary transition-colors" />
                       <p className="text-sm font-bold">{file ? file.name : 'اسحب الملف هنا أو اضغط للرفع'}</p>
                       <p className="text-[10px] text-foreground/30 mt-1 uppercase tracking-tighter">MP4, MP3 up to 500MB</p>
                    </label>
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
                  onClick={handleAddContent}
                  disabled={uploading}
                  className="px-8 py-4 rounded-2xl gold-gradient text-black font-extrabold shadow-xl shadow-yellow-900/20 transition-all hover:scale-[1.02] flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {uploading ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Sparkles size={20} />}
                  {uploading ? 'جاري الرفع...' : 'نشر المحتوى للمستخدمين'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

