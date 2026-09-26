"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  FileSearch,
  GalleryVerticalEnd,
  Home,
  LayoutGrid,
  MessageSquareText,
  MoreHorizontal,
  Pin,
  Radio,
  Users,
  Waypoints,
  X,
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import { useAdminSession } from "@/hooks/useAdminSession";

type MenuItem = {
  icon: typeof Home;
  label: string;
  href: string;
  adminOnly?: boolean;
};

const operationItems: MenuItem[] = [
  { icon: Home, label: "الرئيسية", href: "/" },
  { icon: Users, label: "المستخدمون", href: "/users" },
  { icon: GalleryVerticalEnd, label: "المحتوى", href: "/content" },
  { icon: BookOpen, label: "دورات المدربين", href: "/courses" },
  { icon: CalendarDays, label: "الورش", href: "/workshops" },
  { icon: Radio, label: "الغرف", href: "/rooms" },
];

const communityItems: MenuItem[] = [
  { icon: MessageSquareText, label: "إدارة المجتمع", href: "/posts" },
  { icon: Pin, label: "تثبيت المجتمع", href: "/community-pins" },
  { icon: LayoutGrid, label: "المحتوى المثبت", href: "/pinned" },
  { icon: Waypoints, label: "البلاغات والتقارير", href: "/reports" },
  { icon: Bell, label: "الإشعارات", href: "/notifications" },
  { icon: FileSearch, label: "سجل التدقيق", href: "/audit", adminOnly: true },
];

const mobilePrimary = ["/", "/users", "/content", "/posts"];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAdminSession();
  const [moreOpen, setMoreOpen] = useState(false);

  const filterVisible = (items: MenuItem[]) =>
    items.filter((item) => !item.adminOnly || user?.role === "admin");

  const visibleOperation = filterVisible(operationItems);
  const visibleCommunity = filterVisible(communityItems);
  const allItems = [...visibleOperation, ...visibleCommunity];
  const remainingMobile = allItems.filter((item) => !mobilePrimary.includes(item.href));
  const moreIsActive = remainingMobile.some((item) => isActivePath(pathname, item.href));

  const renderDesktopItem = (item: MenuItem) => {
    const active = isActivePath(pathname, item.href);
    return (
      <Link key={item.href} href={item.href} className={twMerge("nav-link", active && "active")}>
        <item.icon size={17} />
        <span className="font-semibold">{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      <aside className="fixed right-0 top-0 z-50 hidden h-screen w-60 border-l border-[var(--border)] bg-[#fcfbf8] lg:flex lg:flex-col">
        <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-4">
          <Image
            src="/images/logo.png"
            alt="شعار المدرسة الترتيلية"
            width={42}
            height={42}
            className="h-10 w-10 rounded-[9px] object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-[var(--foreground)]">المدرسة الترتيلية</p>
            <p className="mt-0.5 text-xs text-[var(--muted)]">بوابة الإدارة</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <p className="mb-2 px-3 text-[11px] font-bold text-[var(--muted)]">إدارة المنصة</p>
          <nav className="space-y-1" aria-label="إدارة المنصة">
            {visibleOperation.map(renderDesktopItem)}
          </nav>

          <div className="my-4 border-t border-[var(--border)]" />

          <p className="mb-2 px-3 text-[11px] font-bold text-[var(--muted)]">المجتمع والتشغيل</p>
          <nav className="space-y-1" aria-label="المجتمع والتشغيل">
            {visibleCommunity.map(renderDesktopItem)}
          </nav>
        </div>
      </aside>

      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border)] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
        aria-label="التنقل الرئيسي للإدارة"
      >
        <div className="mx-auto flex max-w-xl items-center justify-around px-2 py-1.5">
          {allItems
            .filter((item) => mobilePrimary.includes(item.href))
            .map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={twMerge(
                    "relative flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] text-[var(--muted)]",
                    active && "font-bold text-[var(--primary)]",
                  )}
                >
                  {active ? <span className="absolute -top-1.5 h-0.5 w-6 rounded-full bg-[var(--primary)]" /> : null}
                  <span className={twMerge("rounded-lg p-1.5", active && "bg-[var(--primary-soft)]")}>
                    <item.icon size={18} />
                  </span>
                  <span className="truncate">{item.label === "إدارة المجتمع" ? "المجتمع" : item.label}</span>
                </Link>
              );
            })}

          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={twMerge(
              "relative flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] text-[var(--muted)]",
              moreIsActive && "font-bold text-[var(--primary)]",
            )}
            aria-label="المزيد من صفحات الإدارة"
          >
            {moreIsActive ? <span className="absolute -top-1.5 h-0.5 w-6 rounded-full bg-[var(--primary)]" /> : null}
            <span className={twMerge("rounded-lg p-1.5", moreIsActive && "bg-[var(--primary-soft)]")}>
              <MoreHorizontal size={18} />
            </span>
            <span>المزيد</span>
          </button>
        </div>
      </nav>

      {moreOpen ? (
        <div className="fixed inset-0 z-[80] bg-black/20 backdrop-blur-[2px] lg:hidden" onClick={() => setMoreOpen(false)}>
          <section
            className="absolute inset-x-0 bottom-0 max-h-[78vh] overflow-y-auto rounded-t-[22px] border-t border-[var(--border)] bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
            aria-label="المزيد من صفحات الإدارة"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-base font-bold text-[var(--foreground)]">كل أقسام الإدارة</p>
                <p className="mt-1 text-xs text-[var(--muted)]">اختر القسم الذي تريد إدارته</p>
              </div>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-[var(--border)] text-[var(--muted)]"
                aria-label="إغلاق"
              >
                <X size={17} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {remainingMobile.map((item) => {
                const active = isActivePath(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={twMerge(
                      "flex min-h-20 flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--foreground)]",
                      active && "border-[color:rgba(74,44,29,0.18)] bg-[var(--primary-soft)] text-[var(--primary)]",
                    )}
                  >
                    <item.icon size={18} />
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{item.label}</span>
                      <ChevronLeft size={14} className="opacity-50" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
