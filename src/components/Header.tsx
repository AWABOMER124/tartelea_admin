"use client";

import { useMemo, useState } from "react";
import { Bell, LogOut, PlugZap, Shield, User } from "lucide-react";
import { clearSession } from "@/lib/api";
import { useAdminSession } from "@/hooks/useAdminSession";
import { SessionDialog } from "@/components/SessionDialog";

const roleLabels: Record<string, string> = {
  admin: "مدير النظام",
  moderator: "مشرف",
  trainer: "مدرب",
  student: "طالب",
};

export function Header() {
  const session = useAdminSession();
  const [dialogOpen, setDialogOpen] = useState(false);

  const userLabel = useMemo(() => {
    if (!session.user) {
      return "غير متصل";
    }

    return session.user.full_name || session.user.email;
  }, [session.user]);

  function handleLogout() {
    clearSession();
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-950/85 px-6 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-3 text-cyan-200">
              <Shield size={22} />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-black tracking-tight text-white">بوابة إدارة ترتيلة</h1>
              <p className="text-sm text-slate-300">لوحة موحدة لإدارة المنصة عبر الـ Backend API</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setDialogOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
            >
              <PlugZap size={16} />
              {session.isAuthenticated ? "إدارة الاتصال" : "تسجيل الدخول"}
            </button>

            <button className="relative rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-200 transition hover:bg-white/10">
              <Bell size={18} />
              <span className="absolute -left-1 -top-1 h-5 min-w-5 rounded-full bg-amber-400 px-1 text-center text-[10px] font-bold leading-5 text-slate-950">
                0
              </span>
            </button>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-white">{userLabel}</p>
                <p className="text-xs text-slate-400">
                  {roleLabels[session.user?.role ?? ""] || "لم يتم التحقق من الصلاحية"}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-slate-900 text-slate-200">
                <User size={18} />
              </div>
            </div>

            {session.isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
              >
                <LogOut size={16} />
                خروج
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <SessionDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  );
}
