"use client";

import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, Search, ShieldCheck } from "lucide-react";
import { toast } from "react-hot-toast";
import { Card } from "@/components/Card";
import { ConnectionNotice } from "@/components/ConnectionNotice";
import { StatusBadge } from "@/components/StatusBadge";
import { useAdminSession } from "@/hooks/useAdminSession";
import { adminRequest, AdminRole, AdminUser, formatDate } from "@/lib/api";

const roleOptions: { value: AdminRole; label: string }[] = [
  { value: "admin", label: "مدير" },
  { value: "moderator", label: "مشرف" },
  { value: "trainer", label: "مدرب" },
  { value: "student", label: "طالب" },
];

const roleTone: Record<AdminRole, "danger" | "warning" | "info" | "neutral"> = {
  admin: "danger",
  moderator: "warning",
  trainer: "info",
  student: "neutral",
};

export default function UsersPage() {
  const session = useAdminSession();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!session.token) {
      setUsers([]);
      return;
    }

    async function loadUsers() {
      try {
        setLoading(true);
        const response = await adminRequest<{ users: AdminUser[] }>(
          `/users?search=${encodeURIComponent(search)}`,
        );
        setUsers(response.users);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "تعذر تحميل المستخدمين.");
      } finally {
        setLoading(false);
      }
    }

    const timeout = window.setTimeout(() => void loadUsers(), 250);
    return () => window.clearTimeout(timeout);
  }, [search, session.token]);

  const summary = useMemo(() => {
    return users.reduce<Record<AdminRole, number>>(
      (accumulator, user) => {
        accumulator[user.role] += 1;
        return accumulator;
      },
      { admin: 0, moderator: 0, trainer: 0, student: 0 },
    );
  }, [users]);

  async function handleRoleChange(userId: string, role: AdminRole) {
    try {
      setUpdatingId(userId);
      const response = await adminRequest<{ user: AdminUser }>(`/users/${userId}/role`, {
        method: "PATCH",
        body: { role },
      });
      setUsers((current) => current.map((user) => (user.id === userId ? response.user : user)));
      toast.success("تم تحديث الدور بنجاح.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر تحديث الدور.");
    } finally {
      setUpdatingId(null);
    }
  }

  if (!session.isAuthenticated) {
    return <ConnectionNotice />;
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white">إدارة المستخدمين والصلاحيات</h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">
            يتم تحديث الدور الأساسي مباشرة داخل الـ Backend، مع دعم موحد للأدوار: مدير، مشرف،
            مدرب، وطالب.
          </p>
        </div>

        <div className="relative w-full max-w-md">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ابحث بالاسم أو البريد..."
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3 pr-12 pl-4 text-sm outline-none focus:border-cyan-400/30"
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {roleOptions.map((role) => (
          <Card key={role.value}>
            <p className="text-sm text-slate-400">{role.label}</p>
            <p className="mt-3 text-3xl font-black text-white">{summary[role.value]}</p>
          </Card>
        ))}
      </section>

      <Card title="قائمة الحسابات">
        <div className="overflow-x-auto">
          <table className="min-w-full text-right">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-[0.2em] text-slate-500">
                <th className="px-4 py-4">المستخدم</th>
                <th className="px-4 py-4">الدور الحالي</th>
                <th className="px-4 py-4">الحالة</th>
                <th className="px-4 py-4">تاريخ الإنشاء</th>
                <th className="px-4 py-4">تعديل الدور</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400">
                    <span className="inline-flex items-center gap-3">
                      <LoaderCircle size={16} className="animate-spin" />
                      جارٍ تحميل المستخدمين...
                    </span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400">
                    لا توجد حسابات مطابقة لبحثك الحالي.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-white/6">
                    <td className="px-4 py-5">
                      <div className="flex items-center justify-end gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200">
                          <ShieldCheck size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{user.full_name || "بدون اسم"}</p>
                          <p className="text-sm text-slate-400">{user.email}</p>
                          <p className="text-xs text-slate-500">{user.country || "دون بلد"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <StatusBadge
                        label={roleOptions.find((role) => role.value === user.role)?.label || user.role}
                        tone={roleTone[user.role]}
                      />
                    </td>
                    <td className="px-4 py-5">
                      <StatusBadge
                        label={user.is_verified ? "موثق" : "غير موثق"}
                        tone={user.is_verified ? "success" : "warning"}
                      />
                    </td>
                    <td className="px-4 py-5 text-sm text-slate-300">{formatDate(user.created_at)}</td>
                    <td className="px-4 py-5">
                      <select
                        value={user.role}
                        disabled={updatingId === user.id}
                        onChange={(event) => handleRoleChange(user.id, event.target.value as AdminRole)}
                        className="w-40 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-cyan-400/30"
                      >
                        {roleOptions.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
