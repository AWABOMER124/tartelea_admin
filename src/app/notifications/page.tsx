"use client";

import { useEffect, useState } from "react";
import { BellRing, LoaderCircle, Megaphone, Send } from "lucide-react";
import { toast } from "react-hot-toast";
import { Card } from "@/components/Card";
import { ConnectionNotice } from "@/components/ConnectionNotice";
import { StatusBadge } from "@/components/StatusBadge";
import { useAdminSession } from "@/hooks/useAdminSession";
import { adminRequest, AdminNotification, formatDate } from "@/lib/api";

const audienceOptions = [
  { value: "all", label: "الجميع" },
  { value: "admin", label: "المديرون" },
  { value: "moderator", label: "المشرفون" },
  { value: "trainer", label: "المدربون" },
  { value: "student", label: "الطلاب" },
];

export default function NotificationsPage() {
  const session = useAdminSession();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    title: "",
    message: "",
    type: "system",
    target_role: "all",
  });

  async function loadNotifications() {
    try {
      setLoading(true);
      const response = await adminRequest<{ notifications: AdminNotification[] }>("/notifications");
      setNotifications(response.notifications);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر تحميل سجل الإشعارات.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!session.token) {
      setNotifications([]);
      return;
    }

    void loadNotifications();
  }, [session.token]);

  async function handleBroadcast() {
    if (!form.title.trim() || !form.message.trim()) {
      toast.error("العنوان والنص مطلوبان.");
      return;
    }

    try {
      setSending(true);
      const response = await adminRequest<{ delivered: number; audience: string }>(
        "/notifications/broadcast",
        {
          method: "POST",
          body: form,
        },
      );
      toast.success(`تم إرسال ${response.delivered} إشعار إلى ${response.audience}.`);
      setForm({ title: "", message: "", type: "system", target_role: "all" });
      await loadNotifications();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر إرسال الإشعار.");
    } finally {
      setSending(false);
    }
  }

  if (!session.isAuthenticated) {
    return <ConnectionNotice />;
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-3xl font-black text-white">الإشعارات والبث الجماعي</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">
          يتم الآن إنشاء إشعارات البث من خلال الـ Backend نفسه مع احترام الأدوار المستهدفة وسجل
          مركزي لكل عملية إرسال.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.3fr]">
        <Card title="إرسال إشعار جديد">
          <div className="space-y-4">
            <label className="block text-sm text-slate-300">
              العنوان
              <input
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-cyan-400/30"
              />
            </label>

            <label className="block text-sm text-slate-300">
              الرسالة
              <textarea
                value={form.message}
                onChange={(event) =>
                  setForm((current) => ({ ...current, message: event.target.value }))
                }
                className="mt-2 h-32 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-cyan-400/30"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm text-slate-300">
                النوع
                <select
                  value={form.type}
                  onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-cyan-400/30"
                >
                  <option value="system">نظامي</option>
                  <option value="room">غرفة</option>
                  <option value="message">رسالة</option>
                </select>
              </label>

              <label className="block text-sm text-slate-300">
                الجمهور المستهدف
                <select
                  value={form.target_role}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, target_role: event.target.value }))
                  }
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-cyan-400/30"
                >
                  {audienceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <button
              onClick={handleBroadcast}
              disabled={sending}
              className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sending ? <LoaderCircle size={18} className="animate-spin" /> : <Send size={18} />}
              إرسال البث
            </button>
          </div>
        </Card>

        <Card title="السجل الأخير">
          <div className="space-y-4">
            {loading ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-center text-sm text-slate-400">
                <span className="inline-flex items-center gap-3">
                  <LoaderCircle size={16} className="animate-spin" />
                  جارٍ تحميل السجل...
                </span>
              </div>
            ) : notifications.length === 0 ? (
              <p className="text-sm text-slate-400">لا يوجد سجل إشعارات حتى الآن.</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-100">
                        {notification.type === "system" ? <Megaphone size={18} /> : <BellRing size={18} />}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-white">{notification.title}</p>
                          <StatusBadge label={notification.type} tone="info" />
                        </div>
                        <p className="mt-2 text-sm leading-7 text-slate-300">
                          {notification.message || "بدون رسالة نصية."}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                          <span>المرسل: {notification.actor_name || "النظام"}</span>
                          <span>المستلمون: {notification.delivered_count ?? 0}</span>
                          <span>{formatDate(notification.created_at)}</span>
                        </div>
                      </div>
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
