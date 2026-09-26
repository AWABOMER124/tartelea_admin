"use client";

import { useEffect, useState } from "react";
import {
  ArchiveRestore,
  EyeOff,
  LoaderCircle,
  Lock,
  LockOpen,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Card } from "@/components/Card";
import { ConnectionNotice } from "@/components/ConnectionNotice";
import { EntityEditDialog, type EditorValue } from "@/components/EntityEditDialog";
import { StatusBadge } from "@/components/StatusBadge";
import { useAdminSession } from "@/hooks/useAdminSession";
import { adminRequest, formatDate } from "@/lib/api";

type PostStatus = "published" | "hidden" | "deleted" | "archived";

type CommunityPost = {
  id: string;
  title?: string | null;
  body?: string | null;
  kind?: string | null;
  status: PostStatus;
  is_locked?: boolean;
  primary_context?: { id: string; title: string } | null;
  author?: { id: string; name?: string | null } | null;
  counts?: { comments?: number; reactions?: number; attachments?: number };
  pending_reports_count?: number;
  pin?: { id: string; sort_order?: number } | null;
  created_at: string;
};

type CommunityReport = {
  id: string;
  target_type: string;
  reason_code: string;
  note?: string | null;
  target_preview?: string | null;
  reporter_name?: string | null;
  created_at: string;
};

const statusLabels: Record<PostStatus, string> = {
  published: "منشور",
  hidden: "مخفي",
  deleted: "محذوف",
  archived: "مؤرشف",
};

const statusTone: Record<PostStatus, "success" | "warning" | "danger" | "neutral"> = {
  published: "success",
  hidden: "warning",
  deleted: "danger",
  archived: "neutral",
};

const reasonLabels: Record<string, string> = {
  spam: "محتوى مزعج",
  abuse: "إساءة",
  off_topic: "خارج الموضوع",
  misinformation: "معلومات مضللة",
  copyright: "حقوق نشر",
  other: "سبب آخر",
};

const postFields = [
  { key: "title", label: "عنوان المنشور" },
  { key: "body", label: "نص المنشور الكامل", type: "textarea" as const, required: true },
];

export default function PostsPage() {
  const session = useAdminSession();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | PostStatus>("all");
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actioning, setActioning] = useState<string | null>(null);

  async function loadData() {
    if (!session.token) return;

    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: "60", offset: "0" });
      if (statusFilter !== "all") params.set("status", statusFilter);

      const [postsResponse, reportsResponse] = await Promise.all([
        adminRequest<{ items: CommunityPost[]; total: number }>(
          "/community/posts?" + params.toString(),
        ),
        adminRequest<{ reports: CommunityReport[] }>(
          "/community/reports?status=pending&target_type=post&limit=12&offset=0",
        ),
      ]);

      setPosts(postsResponse.items || []);
      setTotal(postsResponse.total || 0);
      setReports(reportsResponse.reports || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر تحميل إدارة المجتمع.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!session.token) {
      setPosts([]);
      setReports([]);
      return;
    }

    void loadData();
  }, [session.token, statusFilter]);

  async function applyAction(
    postId: string,
    actionType: "hide" | "unhide" | "delete" | "restore" | "lock" | "unlock",
  ) {
    try {
      setActioning(actionType + ":" + postId);
      await adminRequest("/community/moderation-actions", {
        method: "POST",
        body: {
          action_type: actionType,
          target_type: "post",
          target_id: postId,
        },
      });
      toast.success("تم تنفيذ إجراء الإشراف.");
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر تنفيذ الإجراء.");
    } finally {
      setActioning(null);
    }
  }

  async function updatePost(postId: string, values: Record<string, EditorValue>) {
    try {
      await adminRequest("/posts/" + postId, {
        method: "PUT",
        body: values,
      });
      toast.success("تم تحديث نص المنشور.");
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر تحديث المنشور.");
      throw error;
    }
  }

  if (!session.isAuthenticated) return <ConnectionNotice />;

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="admin-kicker">
            <ShieldAlert size={13} />
            المجتمع والإشراف
          </div>
          <h1 className="admin-page-title mt-2">إدارة منشورات المجتمع</h1>
          <p className="admin-page-description">
            المنشورات والبلاغات وإجراءات الإخفاء والقفل والحذف أصبحت هنا على Community Admin API الفعلية.
          </p>
        </div>

        <div className="w-full sm:w-48">
          <label className="text-xs font-semibold text-[var(--muted)]">
            حالة المنشور
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as "all" | PostStatus)}
              className="admin-field mt-2"
            >
              <option value="all">كل الحالات</option>
              <option value="published">المنشورة</option>
              <option value="hidden">المخفية</option>
              <option value="deleted">المحذوفة</option>
              <option value="archived">المؤرشفة</option>
            </select>
          </label>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs font-semibold text-[var(--muted)]">النتائج الحالية</p>
          <p className="mt-2 text-3xl font-bold text-[var(--foreground)]">{total}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold text-[var(--muted)]">بلاغات معلقة</p>
          <p className="mt-2 text-3xl font-bold text-[var(--warning)]">{reports.length}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold text-[var(--muted)]">منشورات مثبتة بالقائمة</p>
          <p className="mt-2 text-3xl font-bold text-[var(--foreground)]">
            {posts.filter((post) => Boolean(post.pin)).length}
          </p>
        </Card>
      </div>

      <Card title="المنشورات">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-[var(--muted)]">
            <LoaderCircle size={16} className="animate-spin" />
            جارٍ تحميل المنشورات...
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--muted)]">
            لا توجد منشورات مطابقة لهذا الفلتر.
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => {
              const busy = (action: string) => actioning === action + ":" + post.id;

              return (
                <article key={post.id} className="rounded-xl border border-[var(--border)] bg-white p-4">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="max-w-2xl truncate font-bold text-[var(--foreground)]">
                          {post.title || post.body || "منشور مجتمع"}
                        </h3>
                        <StatusBadge label={statusLabels[post.status] || post.status} tone={statusTone[post.status] || "neutral"} />
                        {post.is_locked ? <StatusBadge label="مقفل" tone="warning" /> : null}
                        {post.pin ? <StatusBadge label="مثبت" tone="info" /> : null}
                        {(post.pending_reports_count || 0) > 0 ? (
                          <StatusBadge label={String(post.pending_reports_count) + " بلاغ"} tone="danger" />
                        ) : null}
                      </div>

                      <p className="mt-2 max-w-4xl text-sm leading-7 text-[var(--muted-strong)]">
                        {post.body || "بدون نص إضافي."}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted)]">
                        <span>السياق: {post.primary_context?.title || "المجتمع"}</span>
                        <span>الكاتب: {post.author?.name || "غير معروف"}</span>
                        <span>تعليقات: {post.counts?.comments || 0}</span>
                        <span>تفاعلات: {post.counts?.reactions || 0}</span>
                        <span>{formatDate(post.created_at)}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {session.user?.role === "admin" && post.status !== "deleted" ? (
                        <EntityEditDialog
                          title={post.title || "المنشور"}
                          fields={postFields}
                          values={{ title: post.title || "", body: post.body || "" }}
                          onSave={(values) => updatePost(post.id, values)}
                        />
                      ) : null}

                      {post.status === "deleted" ? (
                        <button
                          type="button"
                          onClick={() => void applyAction(post.id, "restore")}
                          disabled={Boolean(actioning)}
                          className="admin-secondary-button min-h-9 px-3 py-2"
                        >
                          {busy("restore") ? <LoaderCircle size={15} className="animate-spin" /> : <ArchiveRestore size={15} />}
                          استعادة
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => void applyAction(post.id, post.status === "hidden" ? "unhide" : "hide")}
                            disabled={Boolean(actioning)}
                            className="admin-secondary-button min-h-9 px-3 py-2"
                          >
                            {busy(post.status === "hidden" ? "unhide" : "hide") ? (
                              <LoaderCircle size={15} className="animate-spin" />
                            ) : (
                              <EyeOff size={15} />
                            )}
                            {post.status === "hidden" ? "إظهار" : "إخفاء"}
                          </button>

                          <button
                            type="button"
                            onClick={() => void applyAction(post.id, post.is_locked ? "unlock" : "lock")}
                            disabled={Boolean(actioning)}
                            className="admin-secondary-button min-h-9 px-3 py-2"
                          >
                            {busy(post.is_locked ? "unlock" : "lock") ? (
                              <LoaderCircle size={15} className="animate-spin" />
                            ) : post.is_locked ? (
                              <LockOpen size={15} />
                            ) : (
                              <Lock size={15} />
                            )}
                            {post.is_locked ? "فتح" : "قفل"}
                          </button>

                          <button
                            type="button"
                            onClick={() => void applyAction(post.id, "delete")}
                            disabled={Boolean(actioning)}
                            className="inline-flex min-h-9 items-center gap-2 rounded-[8px] border border-[color:rgba(181,75,75,0.18)] bg-[var(--danger-soft)] px-3 py-2 text-xs font-bold text-[var(--danger)] disabled:opacity-50"
                          >
                            {busy("delete") ? <LoaderCircle size={15} className="animate-spin" /> : <Trash2 size={15} />}
                            حذف
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Card>

      <Card title="أحدث البلاغات المعلقة">
        {reports.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">لا توجد بلاغات معلقة على منشورات المجتمع.</p>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {reports.map((report) => (
              <div key={report.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge label={reasonLabels[report.reason_code] || report.reason_code} tone="warning" />
                  <span className="text-xs text-[var(--muted)]">{formatDate(report.created_at)}</span>
                </div>
                <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">
                  {report.target_preview || "بدون معاينة"}
                </p>
                <p className="mt-2 text-xs text-[var(--muted)]">
                  المبلّغ: {report.reporter_name || "عضو المجتمع"}
                </p>
                {report.note ? (
                  <p className="mt-2 text-xs leading-6 text-[var(--muted-strong)]">ملاحظة: {report.note}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
