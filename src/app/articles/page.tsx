"use client";

import { useEffect, useState } from 'react';
import { Card } from '@/components/Card';
import { 
  Plus, 
  FileText, 
  Edit2, 
  Trash2, 
  ExternalLink,
  Search
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useUI } from '@/context/UIContext';

export default function ArticlesPage() {
  const { t } = useUI();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newArticle, setNewArticle] = useState({
    title: '',
    description: '',
    type: 'article',
    content_url: '',
    thumbnail_url: ''
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    setLoading(true);
    try {
      const res = await fetch('/api/content?type=article');
      const data = await res.json();
      if (data.success) {
        setArticles(data.content || []);
      } else {
        toast.error('Failed to fetch articles');
      }
    } catch (e) {
      toast.error('حدث خطأ أثناء الاتصال بالخادم');
    }
    setLoading(false);
  }

  async function handleAddArticle() {
    if (!newArticle.title) {
      toast.error('Please fill in the title');
      return;
    }

    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newArticle)
      });
      const data = await res.json();

      if (data.success) {
        toast.success('Article added successfully');
        setShowAddModal(false);
        setNewArticle({
          title: '',
          description: '',
          type: 'article',
          content_url: '',
          thumbnail_url: ''
        });
        fetchArticles();
      } else {
        toast.error(data.error || 'Failed to add article');
      }
    } catch (e) {
      toast.error('حدث خطأ أثناء الاتصال بالخادم');
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">المقالات</h2>
          <p className="text-foreground/50">إدارة المقالات المنشورة والمحتوى المكتوب على المنصة.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-primary hover:bg-primary/80 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          <span>إضافة مقال جديد</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-64 glass animate-pulse rounded-2xl" />
          ))
        ) : articles.length === 0 ? (
          <div className="col-span-full py-20 text-center">
             <FileText size={48} className="mx-auto text-foreground/10 mb-4" />
             <p className="text-foreground/40 font-bold">لا يوجد مقالات حالياً</p>
          </div>
        ) : (
          articles.map((item) => (
            <Card key={item.id} className="group p-0 overflow-hidden border-border hover:border-primary/50 transition-all bg-card shadow-sm">
              <div className="p-6">
                <div className="flex items-center gap-2 text-primary mb-4">
                  <FileText size={18} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">مقال</span>
                </div>
                <h4 className="font-bold text-lg text-foreground mb-3 line-clamp-2">{item.title}</h4>
                <p className="text-sm text-foreground/50 mb-6 line-clamp-3 leading-relaxed">
                  {item.description || 'لا يوجد وصف متاح لهذا المقال.'}
                </p>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider pt-4 border-t border-border">
                  <span className="text-foreground/30">{new Date(item.created_at).toLocaleDateString('ar-EG')}</span>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-primary/10 rounded-lg text-foreground/40 hover:text-primary transition-all">
                      <Edit2 size={16} />
                    </button>
                    <button className="p-2 hover:bg-red-500/10 rounded-lg text-foreground/40 hover:text-red-500 transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-xl shadow-2xl p-8 bg-card border-border" title="إضافة مقال">
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-foreground/60 mb-2 uppercase tracking-wider">عنوان المقال</label>
                <input 
                  type="text" 
                  className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all text-sm"
                  value={newArticle.title}
                  onChange={(e) => setNewArticle({...newArticle, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground/60 mb-2 uppercase tracking-wider">محتوى المقال أو الوصف</label>
                <textarea 
                  className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all h-40 text-sm resize-none"
                  value={newArticle.description}
                  onChange={(e) => setNewArticle({...newArticle, description: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground/60 mb-2 uppercase tracking-wider">رابط المقال (إن وجد)</label>
                <input 
                  type="text" 
                  className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all text-xs"
                  value={newArticle.content_url}
                  onChange={(e) => setNewArticle({...newArticle, content_url: e.target.value})}
                  placeholder="https://..."
                />
              </div>
              <div className="flex gap-4 pt-6">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl bg-foreground/5 hover:bg-foreground/10 transition-colors font-bold text-sm"
                >
                  إلغاء
                </button>
                <button 
                  onClick={handleAddArticle}
                  className="flex-1 px-6 py-3 rounded-xl bg-primary hover:bg-primary/80 text-white transition-colors font-bold text-sm shadow-lg shadow-primary/20"
                >
                  نشر المقال
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
