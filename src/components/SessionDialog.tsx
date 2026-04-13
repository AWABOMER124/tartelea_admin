"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, PlugZap, ShieldCheck, X } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  clearSession,
  loginWithPassword,
  readSession,
  saveManualToken,
} from "@/lib/api";

interface SessionDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SessionDialog({ open, onClose }: SessionDialogProps) {
  const [baseUrl, setBaseUrl] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [manualToken, setManualToken] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const session = readSession();
    setBaseUrl(session.baseUrl);
    setManualToken(session.token ?? "");
  }, [open]);

  if (!open) {
    return null;
  }

  async function handlePasswordLogin() {
    if (!email.trim() || !password.trim()) {
      toast.error("أدخل البريد وكلمة المرور أولًا.");
      return;
    }

    try {
      setSubmitting(true);
      const session = await loginWithPassword({ baseUrl, email, password });
      toast.success(`تم الربط بنجاح بصلاحية ${session.user?.role ?? "غير محددة"}.`);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر تسجيل الدخول.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleManualTokenSave() {
    if (!manualToken.trim()) {
      toast.error("أدخل رمز JWT صالح.");
      return;
    }

    try {
      setSubmitting(true);
      const session = await saveManualToken({ baseUrl, token: manualToken.trim() });
      toast.success(`تم حفظ الجلسة لـ ${session.user?.email ?? "المستخدم الحالي"}.`);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر التحقق من الرمز.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleLogout() {
    clearSession();
    toast.success("تم تسجيل الخروج من لوحة الإدارة.");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-[28px] border border-white/10 bg-slate-950 p-6 shadow-2xl shadow-black/50">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-200">
              <PlugZap size={14} />
              ربط لوحة الإدارة
            </div>
            <h3 className="text-2xl font-bold text-white">إعداد الاتصال مع Backend Tartelea</h3>
            <p className="max-w-2xl text-sm leading-7 text-slate-300">
              يمكنك تسجيل الدخول بحساب إداري مباشرة، أو إدخال رمز JWT يدويًا إذا كانت الجلسة صادرة من
              النظام الخلفي مسبقًا.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full border border-white/10 p-2 text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <h4 className="text-lg font-semibold text-white">تسجيل دخول مباشر</h4>
            <label className="block text-sm text-slate-300">
              عنوان الـ API
              <input
                value={baseUrl}
                onChange={(event) => setBaseUrl(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-left text-sm outline-none transition focus:border-cyan-400/40"
                dir="ltr"
                placeholder="http://localhost:3001/api/v1"
              />
            </label>
            <label className="block text-sm text-slate-300">
              البريد الإلكتروني
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-left text-sm outline-none transition focus:border-cyan-400/40"
                dir="ltr"
                placeholder="admin@tartelea.app"
              />
            </label>
            <label className="block text-sm text-slate-300">
              كلمة المرور
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-left text-sm outline-none transition focus:border-cyan-400/40"
                dir="ltr"
                placeholder="••••••••"
              />
            </label>

            <button
              onClick={handlePasswordLogin}
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? <LoaderCircle size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
              تسجيل الدخول وربط الجلسة
            </button>
          </div>

          <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <h4 className="text-lg font-semibold text-white">إدخال رمز يدوي</h4>
            <p className="text-sm leading-7 text-slate-300">
              استخدم هذا الخيار إذا كان لديك رمز JWT صادر من الـ Backend بالفعل.
            </p>
            <label className="block text-sm text-slate-300">
              الرمز
              <textarea
                value={manualToken}
                onChange={(event) => setManualToken(event.target.value)}
                className="mt-2 h-48 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-left text-sm outline-none transition focus:border-cyan-400/40"
                dir="ltr"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleManualTokenSave}
                disabled={submitting}
                className="inline-flex flex-1 items-center justify-center gap-3 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 font-semibold text-cyan-100 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? <LoaderCircle size={18} className="animate-spin" /> : <PlugZap size={18} />}
                حفظ الرمز والتحقق منه
              </button>

              <button
                onClick={handleLogout}
                className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
              >
                مسح الجلسة
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
