"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, PencilLine, Pin, Trash2, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { Card } from "@/components/Card";
import { ConnectionNotice } from "@/components/ConnectionNotice";
import { StatusBadge } from "@/components/StatusBadge";
import { useAdminSession } from "@/hooks/useAdminSession";
import { adminRequest, formatDate, PinnedItem } from "@/lib/api";

type PinnedFormState = {
  entity_type: string;
  entity_id: string;
  title: string;
  subtitle: string;
  thumbnail_url: string;
  sort_order: number;
};

function createInitialForm(): PinnedFormState {
  return {
    entity_type: "content",
    entity_id: "",
    title: "",
    subtitle: "",
    thumbnail_url: "",
    sort_order: 0,
  };
}

function mapPinnedToForm(item: PinnedItem): PinnedFormState {
  return {
    entity_type: item.entity_type,
    entity_id: item.entity_id,
    title: item.title,
    subtitle: item.subtitle || "",
    thumbnail_url: item.thumbnail_url || "",
    sort_order: item.sort_order ?? 0,
  };
}

export default function PinnedPage() {
  const session = useAdminSession();
  const [items, setItems] = useState<PinnedItem[]>([]);
  const [form, setForm] = useState<PinnedFormState>(() => createInitialForm());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function loadPinned() {
    try {
      setLoading(true);
      const response = await adminRequest<{ pinned: PinnedItem[] }>("/pinned");
      setItems(response.pinned);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر تحميل المثبتات.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm(createInitialForm());
    setEditingId(null);
  }

  useEffect(() => {
    if (!session.token) {
      setItems([]);
      return;
    }

    void loadPinned();
  }, [session.token]);

  async function handleSavePinned() {
    if (!form.entity_id.trim() || !form.title.trim()) {
      toast.error("المعرف والعنوان مطلوبان.");
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        await adminRequest(`/pinned/${editingId}`, {
          method: "PATCH",
          body: form,
        });
        toast.success("تم تحديث العنصر المثبت.");
      } else {
        await adminRequest("/pinned", {
          method: "POST",
          body: form,
        });
        toast.success("تم إنشاء العنصر المثبت.");
      }

      resetForm();
      await loadPinned();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : editingId
            ? "تعذر تحديث العنصر المثبت."
            : "تعذر إنشاء العنصر المثبت.",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleEditPinned(item: PinnedItem) {
    setEditingId(item.id);
    setForm(mapPinnedToForm(item));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDeletePinned(id: string) {
    try {
      await adminRequest(`/pinned/${id}`, { method: "DELETE" });
      setItems((current) => current.filter((item) => item.id !== id));
      if (editingId === id) {
        resetForm();
      }
      toast.success("تم حذف المثبت.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر حذف المثبت.");
    }
  }

  if (!session.isAuthenticated) {
    return <ConnectionNotice />;
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-3xl font-black text-white">المحتوى المثبّت</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">
          إدارة العناصر المثبتة تمتد الآن لعدة كيانات: محتوى، منشورات، ورش، غرف، أو دورات.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.3fr]">
        <Card title={editingId ? "تعديل عنصر مثبت" : "إضافة عنصر مثبت"}>
          <div className="space-y-4">
            {editingId ? (
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4 text-sm text-cyan-100">
                يمكنك الآن تعديل بيانات العنصر المثبت ثم حفظها أو إلغاء التعديل.
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm text-slate-300">
                نوع الكيان
                <select
                  value={form.entity_type}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, entity_type: event.target.value }))
                  }
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-cyan-400/30"
                >
                  <option value="content">محتوى</option>
                  <option value="post">منشور</option>
                  <option value="workshop">ورشة</option>
                  <option value="room">غرفة</option>
                  <option value="course">دورة</option>
                </select>
              </label>

              <label className="block text-sm text-slate-300">
                المعرف
                <input
                  value={form.entity_id}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, entity_id: event.target.value }))
                  }
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-left text-sm outline-none focus:border-cyan-400/30"
                  dir="ltr"
                />
              </label>
            </div>

            <label className="block text-sm text-slate-300">
              العنوان
              <input
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-cyan-400/30"
              />
            </label>

            <label className="block text-sm text-slate-300">
              وصف قصير
              <textarea
                value={form.subtitle}
                onChange={(event) =>
                  setForm((current) => ({ ...current, subtitle: event.target.value }))
                }
                className="mt-2 h-28 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-cyan-400/30"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm text-slate-300">
                رابط الصورة
                <input
                  value={form.thumbnail_url}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, thumbnail_url: event.target.value }))
                  }
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-left text-sm outline-none focus:border-cyan-400/30"
                  dir="ltr"
                />
              </label>

              <label className="block text-sm text-slate-300">
                ترتيب العرض
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      sort_order: Number.parseInt(event.target.value || "0", 10),
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-cyan-400/30"
                />
              </label>
            </div>

            <button
              onClick={handleSavePinned}
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <LoaderCircle size={18} className="animate-spin" /> : <Pin size={18} />}
              {editingId ? "حفظ التعديلات" : "تثبيت العنصر"}
            </button>

            {editingId ? (
              <button
                onClick={resetForm}
                type="button"
                className="inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 font-semibold text-white transition hover:bg-white/[0.08]"
              >
                <X size={18} />
                إلغاء التعديل
              </button>
            ) : null}
          </div>
        </Card>

        <Card title="العناصر المثبتة الحالية">
          <div className="space-y-4">
            {loading ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-center text-sm text-slate-400">
                <span className="inline-flex items-center gap-3">
                  <LoaderCircle size={16} className="animate-spin" />
                  جارٍ تحميل المثبتات...
                </span>
              </div>
            ) : items.length === 0 ? (
              <p className="text-sm text-slate-400">لا توجد عناصر مثبتة بعد.</p>
            ) : (
              items.map((item) => (
                <div key={item.id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                        <StatusBadge label={item.entity_type} tone="info" />
                        <StatusBadge label={`ترتيب ${item.sort_order ?? 0}`} tone="neutral" />
                      </div>
                      <p className="text-sm leading-7 text-slate-300">
                        {item.subtitle || "لا يوجد وصف مختصر."}
                      </p>
                      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                        <span>الكيان: {item.entity_id}</span>
                        <span>{formatDate(item.created_at)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditPinned(item)}
                        className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-3 text-cyan-100 transition hover:bg-cyan-500/20"
                      >
                        <PencilLine size={16} />
                      </button>

                      <button
                        onClick={() => handleDeletePinned(item.id)}
                        className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 text-rose-200 transition hover:bg-rose-500/20"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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
