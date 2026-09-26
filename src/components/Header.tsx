"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Bell, LogOut, LogIn, UserRound } from "lucide-react";
import { clearSession } from "@/lib/api";
import { useAdminSession } from "@/hooks/useAdminSession";
import { SessionDialog } from "@/components/SessionDialog";

const roleLabels: Record<string, string> = {
  admin: "مدير النظام",
  moderator: "مشرف",
  trainer: "مدرب",
  member: "عضو",
};

export function Header() {
  const session = useAdminSession();
  const [dialogOpen, setDialogOpen] = useState(false);

  const userLabel = useMemo(() => {
    if (!session.user) return "غير متصل";
    return session.user.full_name || session.user.email;
  }, [session.user]);

  function handleLogout() {
    clearSession();
  }

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-40 border-b border-[var(--border)] bg-white/95 backdrop-blur-md lg:right-60">
        <div className="mx-auto flex h-[72px] max-w-[1480px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3 lg:hidden">
            <Image
              src="/images/logo.png"
              alt="شعار المدرسة الترتيلية"
              width={38}
              height={38}
              className="h-9 w-9 rounded-[9px] object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[var(--foreground)] sm:text-base">إدارة المدرسة الترتيلية</p>
              <p className="hidden text-xs text-[var(--muted)] sm:block">لوحة الإدارة المستقلة</p>
            </div>
          </div>

          <div className="hidden min-w-0 lg:block">
            <p className="text-sm font-bold text-[var(--foreground)]">لوحة الإدارة</p>
            <p className="mt-0.5 text-xs text-[var(--muted)]">إدارة المحتوى والمجتمع والتشغيل من مكان واحد</p>
          </div>

          <div className="mr-auto flex items-center gap-1.5 lg:mr-0">
            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-[8px] text-[var(--muted)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
              aria-label="الإشعارات"
            >
              <Bell size={17} />
              <span className="absolute left-1 top-1 h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            </button>

            {session.isAuthenticated ? (
              <div className="hidden items-center gap-2 border-r border-[var(--border)] pr-3 sm:flex">
                <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[var(--primary-soft)] text-[var(--primary)]">
                  <UserRound size={17} />
                </div>
                <div className="hidden max-w-[180px] md:block">
                  <p className="truncate text-xs font-bold text-[var(--foreground)]">{userLabel}</p>
                  <p className="mt-0.5 text-[11px] text-[var(--muted)]">
                    {roleLabels[session.user?.role ?? ""] || "صلاحية غير محددة"}
                  </p>
                </div>
              </div>
            ) : null}

            <button
              onClick={() => setDialogOpen(true)}
              className={session.isAuthenticated ? "admin-secondary-button h-9 min-h-9 px-3" : "admin-primary-button h-9 min-h-9 px-3"}
            >
              <LogIn size={15} />
              <span className="hidden sm:inline">{session.isAuthenticated ? "إدارة الجلسة" : "تسجيل الدخول"}</span>
            </button>

            {session.isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="hidden h-9 items-center gap-2 rounded-[8px] px-3 text-xs font-semibold text-[var(--muted)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)] xl:inline-flex"
              >
                <LogOut size={15} />
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
