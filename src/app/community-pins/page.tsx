"use client";

import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, Pin, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { Card } from "@/components/Card";
import { ConnectionNotice } from "@/components/ConnectionNotice";
import { StatusBadge } from "@/components/StatusBadge";
import { useAdminSession } from "@/hooks/useAdminSession";
import { adminRequest, formatDate } from "@/lib/api";

type CommunityContext = {
  id: string;
  title: string;
};

type CommunityPost = {
  id: string;
  title?: string | null;
  body?: string | null;
  status: string;
  primary_context?: { id: string; title: string } | null;
  author?: { name?: string | null } | null;
};

type CommunityPin = {
  id: string;
  context_id: string;
  context_title: string;
  post_id: string;
  post_title?: string | null;
  reason?: string | null;
  sort_order: number;
  created_at: string;
};

export default function CommunityPinsPage() {
  const session = useAdminSession();
  const [contexts, setContexts] = useState<CommunityContext[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [pins, setPins] = useState<CommunityPin[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [contextId, setContextId] = useState("");
  const [postId, setPostId] = useState("");
  const [reason, setReason] = useState("");
  const [sortOrder, setSortOrder] = useState(0);

  async function loadContexts() {
    const response = await adminRequest<{ contexts: CommunityContext[] }>("/community/contexts");
    setContexts(response.contexts || []);
    const nextContextId = contextId || response.contexts?.[0]?.id || "";
    if (!contextId && nextContextId) setContextId(nextContextId);
    return nextContextId;
  }

  async function loadPins() {
    const response = await adminRequest<{ items: CommunityPin[] }>("/community/pins?limit=100&offset=0");
    setPins(response.items || []);
  }

  async function loadPosts(selectedContextId: string) {
    const params = new URLSearchParams({
      status: "published",
      limit: "100",
      offset: "0",
    });
    if (selectedContextId) params.set("context_id", selectedContextId);

    const response = await adminRequest<{ items: CommunityPost[] }>(
      "/community/posts?" + params.toString(),
    );
    setPosts(response.items || []);
  }

  async function loadAll() {
    if (!session.token) return;

    try {
      setLoading(true);
      const selectedContext = await loadContexts();
      await Promise.all([loadPins(), loadPosts(selectedContext)]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر تحميل تثبيت المجتمع.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAll();
  }, [session.token]);

  useEffect(() => {
    if (!session.token || !contextId) return;
    void loadPosts(contextId).catch((error) => {
      toast.error(error instanceof Error ? error.message : "تعذر تحميل منشورات السياق.");
    });
  }, [contextId, session.token]);

  const availablePosts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return posts.filter((post) => {
      const alreadyPinned = pins.some(
        (pin) => pin.post_id === post.id && pin.context_id === contextId,
      );
      if (alreadyPinned) return false;
      if (!term) return true;

      return ((post.title || "") + " " + (post.body || "")).toLowerCase().includes(term);
    });
  }, [posts, pins, contextId, search]);

  async function createPin() {
    if (!contextId || !postId) {
      toast.error("اختر السياق والمنشور أولًا.");
      return;
    }

    try {
      setSaving(true);
      await adminRequest("/community/pins", {
        method: "POST",
        body: {
          context_id: contextId,
          post_id: postId,
          reason: reason.trim() || undefined,
          sort_order: sortOrder,
        },
      });
      toast.success("تم تثبيت المنشور في المجتمع.");
      setPostId("");
      setReason("");
      setSortOrder(0);
      await loadPins();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر تثبيت المنشور.");
    } finally {
      setSaving(false);
    }
  }

  async function deletePin(pinId: string) {
    try {
      await adminRequest("/community/pins/" + pinId, { method: "DELETE" });
      setPins((current) => current.filter((pin) => pin.id !== pinId));
      toast.success("تمت إزالة التثبيت.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر إزالة التثبيت.");
    }
  }

  if (!session.isAuthenticated) return <ConnectionNotice />;

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="admin-kicker">
            <Pin size={13} />
            المجتمع
          </div>
          <h1 className="admin-page-title mt-2">تثبيت منشورات المجتمع</h1>
          <p className="admin-page-description">
            إدارة المنشورات المثبتة داخل كل سياق من نظام المجتمع الحقيقي، وليس جدول المثبتات العام القديم.
          </p>
        </div>
        <StatusBadge label={String(pins.length) + " مثبت"} tone="info" />
      </section>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.4fr]">
        <Card title="تثبيت منشور جديد">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-[var(--foreground)]">
              السياق
              <select
                value={contextId}
                onChange={(event) => {
                  setContextId(event.target.value);
                  setPostId("");
                }}
                className="admin-field mt-2"
              >
                {contexts.map((context) => (
                  <option key={context.id} value={context.id}>
                    {context.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-[var(--foreground)]">
              ابحث عن منشور
              <div className="relative mt-2">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="admin-field pr-10"
                  placeholder="العنوان أو نص المنشور"
                />
              </div>
            </label>

            <div className="max-h-64 overflow-y-auto rounded-xl border border-[var(--border)]">
              {loading ? (
                <div className="flex items-center justify-center gap-2 p-5 text-sm text-[var(--muted)]">
                  <LoaderCircle size={15} className="animate-spin" />
                  جارٍ التحميل...
                </div>
              ) : availablePosts.length === 0 ? (
                <p className="p-5 text-sm text-[var(--muted)]">لا توجد منشورات متاحة للتثبيت في هذا السياق.</p>
              ) : (
                availablePosts.map((post) => (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => setPostId(post.id)}
                    className={
                      "block w-full border-b border-[var(--border)] px-4 py-3 text-right last:border-b-0 hover:bg-[var(--surface-soft)] " +
                      (postId === post.id ? "bg-[var(--primary-soft)]" : "")
                    }
                  >
                    <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                      {post.title || post.body || "منشور مجتمع"}
                    </p>
                    {post.body ? (
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--muted)]">{post.body}</p>
                    ) : null}
                  </button>
                ))
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-medium text-[var(--foreground)]">
                سبب التثبيت
                <input
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  className="admin-field mt-2"
                  placeholder="اختياري"
                />
              </label>

              <label className="block text-sm font-medium text-[var(--foreground)]">
                ترتيب العرض
                <input
                  type="number"
                  min={0}
                  value={sortOrder}
                  onChange={(event) => setSortOrder(Number(event.target.value || 0))}
                  className="admin-field mt-2"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={createPin}
              disabled={saving || !postId}
              className="admin-primary-button w-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? <LoaderCircle size={16} className="animate-spin" /> : <Plus size={16} />}
              تثبيت المنشور
            </button>
          </div>
        </Card>

        <Card title="المثبتات الحالية">
          <div className="space-y-3">
            {pins.length === 0 && !loading ? (
              <div className="rounded-xl border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--muted)]">
                لا توجد منشورات مثبتة حاليًا.
              </div>
            ) : (
              pins.map((pin) => (
                <div key={pin.id} className="rounded-xl border border-[var(--border)] bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-bold text-[var(--foreground)]">
                          {pin.post_title || "منشور مجتمع"}
                        </p>
                        <StatusBadge label={pin.context_title} tone="info" />
                        <StatusBadge label={"ترتيب " + pin.sort_order} />
                      </div>
                      <p className="mt-2 text-sm text-[var(--muted)]">
                        {pin.reason || "بدون سبب تثبيت مضاف."}
                      </p>
                      <p className="mt-2 text-xs text-[var(--muted)]">{formatDate(pin.created_at)}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => void deletePin(pin.id)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border border-[color:rgba(181,75,75,0.18)] bg-[var(--danger-soft)] text-[var(--danger)]"
                      aria-label="إزالة التثبيت"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
