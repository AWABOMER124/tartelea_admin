"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { Card } from "@/components/Card";
import { ConnectionNotice } from "@/components/ConnectionNotice";
import { StatusBadge } from "@/components/StatusBadge";
import { useAdminSession } from "@/hooks/useAdminSession";
import { adminRequest, AdminPost, formatDate } from "@/lib/api";

export default function PostsPage() {
  const session = useAdminSession();
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadPosts() {
    try {
      setLoading(true);
      const response = await adminRequest<{ posts: AdminPost[] }>("/posts");
      setPosts(response.posts);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر تحميل المنشورات.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!session.token) {
      setPosts([]);
      return;
    }

    void loadPosts();
  }, [session.token]);

  async function handleDelete(postId: string) {
    try {
      await adminRequest(`/posts/${postId}`, { method: "DELETE" });
      setPosts((current) => current.filter((post) => post.id !== postId));
      toast.success("تم حذف المنشور.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر حذف المنشور.");
    }
  }

  if (!session.isAuthenticated) {
    return <ConnectionNotice />;
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-3xl font-black text-white">إدارة المنشورات المجتمعية</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">
          مراجعة منشورات المجتمع وإزالة غير المناسب منها عبر نقطة إدارة موحدة.
        </p>
      </section>

      <Card title="آخر المنشورات">
        <div className="space-y-4">
          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-center text-sm text-slate-400">
              <span className="inline-flex items-center gap-3">
                <LoaderCircle size={16} className="animate-spin" />
                جارٍ تحميل المنشورات...
              </span>
            </div>
          ) : posts.length === 0 ? (
            <p className="text-sm text-slate-400">لا توجد منشورات معروضة حاليًا.</p>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-white">{post.title}</h3>
                      <StatusBadge label={post.category || "general"} tone="info" />
                    </div>
                    <p className="text-sm leading-7 text-slate-300">{post.body || "بدون نص إضافي."}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                      <span>الكاتب: {post.author_name || "غير معروف"}</span>
                      <span>التعليقات: {post.comments_count ?? 0}</span>
                      <span>الإعجابات: {post.likes_count ?? 0}</span>
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(post.id)}
                    className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 text-rose-200 transition hover:bg-rose-500/20"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
