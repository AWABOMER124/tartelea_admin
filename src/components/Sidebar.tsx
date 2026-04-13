"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileSearch,
  Bell,
  BookOpen,
  CalendarDays,
  GalleryVerticalEnd,
  LayoutDashboard,
  MessageSquareText,
  Pin,
  Radio,
  Users,
  Waypoints,
} from "lucide-react";
import { twMerge } from "tailwind-merge";

const menuItems = [
  { icon: LayoutDashboard, label: "الرئيسية", href: "/" },
  { icon: Users, label: "المستخدمون", href: "/users" },
  { icon: GalleryVerticalEnd, label: "المحتوى", href: "/content" },
  { icon: MessageSquareText, label: "المنشورات", href: "/posts" },
  { icon: BookOpen, label: "دورات المدربين", href: "/courses" },
  { icon: CalendarDays, label: "الورش", href: "/workshops" },
  { icon: Radio, label: "الغرف", href: "/rooms" },
  { icon: Pin, label: "المثبتات", href: "/pinned" },
  { icon: Bell, label: "الإشعارات", href: "/notifications" },
  { icon: FileSearch, label: "سجل التدقيق", href: "/audit" },
  { icon: Waypoints, label: "التقارير", href: "/reports" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed right-0 top-20 z-40 h-[calc(100vh-5rem)] w-72 border-l border-white/10 bg-slate-950/70 p-5 backdrop-blur-xl">
      <div className="mb-5">
        <p className="text-xs font-semibold tracking-[0.25em] text-slate-500">التنقل</p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={twMerge(
                "nav-link",
                isActive && "active",
              )}
            >
              <item.icon size={18} />
              <span className="font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
