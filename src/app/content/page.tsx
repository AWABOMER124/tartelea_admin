"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, PencilLine, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { Card } from "@/components/Card";
import { ConnectionNotice } from "@/components/ConnectionNotice";
import { StatusBadge } from "@/components/StatusBadge";
import { useAdminSession } from "@/hooks/useAdminSession";
import { adminRequest, AdminContent, formatDate } from "@/lib/api";

const typeOptions = [
  { value: "video", label: "فيديو" },
  { value: "audio", label: "صوتي" },
  { value: "article", label: "مقال" },
];

const categoryOptions = [
  { value: "general", label: "عام" },
  { value: "quran", label: "القرآن" },
  { value: "values", label: "القيم" },
  { value: "community", label: "المجتمع" },
  { value: "tahliya", label: "تحلية" },
  { value: "takhliya", label: "تخلية" },
  { value: "tajalli", label: "تجلّي" },
  { value: "psychological", label: "نفسي" },
  { value: "sudan", label: "السودان" },
  { value: "sudan_awareness", label: "الوعي السوداني" },
  { value: "arab_awareness", label: "الوعي العربي" },
  { value: "islamic_awareness", label: "الوعي الإسلامي" },
];

type ContentFormState = {
  title: string;
  description: string;
  content: string;
  type: string;
  category: string;
  media_url: string;
  thumbnail_url: string;
  duration: string;
  depth_level: number;
};

type ContentFilters = {
  search: string;
  type: string;
  category: string;
};

function createInitialForm(): ContentFormState {
  return {
    title: "",
    description: "",
    content: "",
    type: "video",
    category: "general",
    media_url: "",
    thumbnail_url: "",
    duration: "",
    depth_level: 1,
  };
}

function mapContentToForm(content: AdminContent): ContentFormState {
  return {
    title: content.title || "",
    description: content.description || "",
    content: content.content || "",
    type: content.type || "video",
    category: content.category || "general",
    media_url: content.media_url || "",
    thumbnail_url: content.thumbnail_url || "",
    duration: content.duration || "",
    depth_level: content.depth_level ?? 1,
  };
}

async function fetchContents(filters: ContentFilters) {
  const params = new URLSearchParams();
  if (filters.search.trim()) {
    params.set("search", filters.search.trim());
  }
  if (filters.type !== "all") {
    params.set("type", filters.type);
  }
  if (filters.category !== "all") {
    params.set("category", filters.category);
  }

  const query = params.toString();
  const response = await adminRequest<{ contents: AdminContent[] }>(
    `/contents${query ? `?${query}` : ""}`,
  );

  return response.contents;
}

export default function ContentPage() {
  const session = useAdminSession();
  const [contents, setContents] = useState<AdminContent[]>([]);
  const [form, setForm] = useState<ContentFormState>(() => createInitialForm());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);

  async function refreshContents() {
    try {
      setLoading(true);
      const response = await fetchContents({
        search,
        type: typeFilter,
        category: categoryFilter,
      });
      setContents(response);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر تحميل المحتوى.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!session.token) {
      setContents([]);
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        setLoading(true);
        const response = await fetchContents({
          search,
          type: typeFilter,
          category: categoryFilter,
        });
        setContents(response);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "تعذر تحميل المحتوى.");
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [categoryFilter, search, session.token, typeFilter]);

  function resetForm() {
    setForm(createInitialForm());
    setEditingId(null);
  }

  async function handleSaveContent() {
    if (!form.title.trim()) {
      toast.error("عنوان المادة مطلوب.");
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        await adminRequest(`/contents/${editingId}`, {
          method: "PUT",
          body: form,
        });
        toast.success("تم تحديث المادة بنجاح.");
      } else {
        await adminRequest("/contents", {
          method: "POST",
          body: form,
        });
        toast.success("تمت إضافة المادة بنجاح.");
      }

      resetForm();
      await refreshContents();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : editingId
            ? "تعذر تحديث المادة."
            : "تعذر إنشاء المادة.",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleEditContent(content: AdminContent) {
    setEditingId(content.id);
    setForm(mapContentToForm(content));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDeleteContent(id: string) {
    try {
      await adminRequest(`/contents/${id}`, { method: "DELETE" });
      setContents((current) => current.filter((item) => item.id !== id));
      if (editingId === id) {
        resetForm();
      }
      toast.success("تم حذف المادة.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر حذف المادة.");
    }
  }

  if (!session.isAuthenticated) {
    return <ConnectionNotice />;
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-3xl font-black text-[var(--foreground)]">مكتبة المحتوى</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--muted-strong)]">
          إضافة وتحرير وحذف عناصر المحتوى أصبحت تمر عبر الـ Backend API بدل أي اتصال مباشر مع
          قاعدة البيانات من الواجهة.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.6fr]">
        <Card title={editingId ? "تعديل مادة" : "إضافة مادة جديدة"}>
          <div className="space-y-4">
            {editingId ? (
              <div className="rounded-[9px] border border-[color:rgba(74,44,29,0.16)] bg-[var(--primary-soft)] p-4 text-sm text-[var(--primary)]">
                أنت الآن تعدّل مادة موجودة. يمكنك حفظ التغييرات أو إلغاء التعديل والعودة لنموذج
                الإضافة.
              </div>
            ) : null}

            <label className="block text-sm text-[var(--muted-strong)]">
              العنوان
              <input
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                className="mt-2 w-full rounded-[9px] border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-[color:rgba(74,44,29,0.32)]"
              />
            </label>

            <label className="block text-sm text-[var(--muted-strong)]">
              الوصف
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
                className="mt-2 h-28 w-full rounded-[9px] border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-[color:rgba(74,44,29,0.32)]"
              />
            </label>

            <label className="block text-sm text-[var(--muted-strong)]">
              النص الكامل الذي سيظهر للمستخدم
              <textarea
                value={form.content}
                onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
                className="mt-2 h-56 w-full rounded-[9px] border border-[var(--border)] bg-white px-4 py-3 text-sm leading-7 outline-none focus:border-[color:rgba(74,44,29,0.32)]"
                placeholder="اكتب نص المقال أو المادة كاملاً..."
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm text-[var(--muted-strong)]">
                النوع
                <select
                  value={form.type}
                  onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
                  className="mt-2 w-full rounded-[9px] border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-[color:rgba(74,44,29,0.32)]"
                >
                  {typeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm text-[var(--muted-strong)]">
                التصنيف
                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, category: event.target.value }))
                  }
                  className="mt-2 w-full rounded-[9px] border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-[color:rgba(74,44,29,0.32)]"
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block text-sm text-[var(--muted-strong)]">
              رابط الوسيط أو الملف
              <input
                value={form.media_url}
                onChange={(event) =>
                  setForm((current) => ({ ...current, media_url: event.target.value }))
                }
                className="mt-2 w-full rounded-[9px] border border-[var(--border)] bg-white px-4 py-3 text-left text-sm outline-none focus:border-[color:rgba(74,44,29,0.32)]"
                dir="ltr"
              />
            </label>

            <label className="block text-sm text-[var(--muted-strong)]">
              رابط الصورة المصغرة
              <input
                value={form.thumbnail_url}
                onChange={(event) =>
                  setForm((current) => ({ ...current, thumbnail_url: event.target.value }))
                }
                className="mt-2 w-full rounded-[9px] border border-[var(--border)] bg-white px-4 py-3 text-left text-sm outline-none focus:border-[color:rgba(74,44,29,0.32)]"
                dir="ltr"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm text-[var(--muted-strong)]">
                المدة
                <input
                  value={form.duration}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, duration: event.target.value }))
                  }
                  className="mt-2 w-full rounded-[9px] border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-[color:rgba(74,44,29,0.32)]"
                />
              </label>

              <label className="block text-sm text-[var(--muted-strong)]">
                مستوى العمق
                <input
                  type="number"
                  min={1}
                  value={form.depth_level}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      depth_level: Number.parseInt(event.target.value || "1", 10),
                    }))
                  }
                  className="mt-2 w-full rounded-[9px] border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-[color:rgba(74,44,29,0.32)]"
                />
              </label>
            </div>

            <button
              onClick={handleSaveContent}
              disabled={saving || session.user?.role !== "admin"}
              className="inline-flex w-full items-center justify-center gap-3 rounded-[9px] bg-[var(--primary)] px-4 py-3 font-semibold text-white transition hover:bg-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <LoaderCircle size={18} className="animate-spin" /> : <Plus size={18} />}
              {editingId ? "حفظ التعديلات" : "إضافة المادة"}
            </button>

            {editingId ? (
              <button
                onClick={resetForm}
                type="button"
                className="inline-flex w-full items-center justify-center gap-3 rounded-[9px] border border-[var(--border)] bg-white px-4 py-3 font-semibold text-[var(--foreground)] transition hover:bg-white/[0.08]"
              >
                <X size={18} />
                إلغاء التعديل
              </button>
            ) : null}
          </div>
        </Card>

        <Card title="العناصر المنشورة">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
              <label className="relative block text-sm text-[var(--muted-strong)]">
                البحث
                <Search
                  className="pointer-events-none absolute right-4 top-[3.25rem] -translate-y-1/2 text-[var(--muted)]"
                  size={18}
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="ابحث بالعنوان أو الوصف..."
                  className="mt-2 w-full rounded-[9px] border border-[var(--border)] bg-white py-3 pr-12 pl-4 text-sm outline-none focus:border-[color:rgba(74,44,29,0.32)]"
                />
              </label>

              <label className="block text-sm text-[var(--muted-strong)]">
                تصفية النوع
                <select
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value)}
                  className="mt-2 w-full rounded-[9px] border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-[color:rgba(74,44,29,0.32)]"
                >
                  <option value="all">كل الأنواع</option>
                  {typeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm text-[var(--muted-strong)]">
                تصفية التصنيف
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="mt-2 w-full rounded-[9px] border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-[color:rgba(74,44,29,0.32)]"
                >
                  <option value="all">كل التصنيفات</option>
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {loading ? (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-6 text-center text-sm text-[var(--muted)]">
                <span className="inline-flex items-center gap-3">
                  <LoaderCircle size={16} className="animate-spin" />
                  جارٍ تحميل المكتبة...
                </span>
              </div>
            ) : contents.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">لا توجد عناصر محتوى بعد.</p>
            ) : (
              contents.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge
                          label={typeOptions.find((type) => type.value === item.type)?.label || item.type}
                          tone="info"
                        />
                        <StatusBadge
                          label={
                            categoryOptions.find((category) => category.value === item.category)?.label ||
                            item.category
                          }
                          tone="neutral"
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[var(--foreground)]">{item.title}</h3>
                        <p className="mt-2 text-sm leading-7 text-[var(--muted-strong)]">
                          {item.description || "بدون وصف تفصيلي."}
                        </p>
                        {item.content ? <p className="mt-2 line-clamp-3 text-xs leading-6 text-[var(--muted)]">{item.content}</p> : null}
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-[var(--muted)]">
                        <span>التاريخ: {formatDate(item.created_at)}</span>
                        <span>العمق: {item.depth_level ?? 1}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditContent(item)}
                        disabled={session.user?.role !== "admin"}
                        className="rounded-[9px] border border-[color:rgba(74,44,29,0.16)] bg-[var(--primary-soft)] p-3 text-[var(--primary)] transition hover:bg-[var(--primary)]/20"
                      >
                        <PencilLine size={16} />
                      </button>

                      <button
                        onClick={() => handleDeleteContent(item.id)}
                        disabled={session.user?.role !== "admin"}
                        className="rounded-[9px] border border-[color:rgba(181,75,75,0.18)] bg-[var(--danger-soft)] p-3 text-[var(--danger)] transition hover:bg-rose-500/20"
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
