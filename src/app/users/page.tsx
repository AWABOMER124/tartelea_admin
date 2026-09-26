"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Crown,
  GraduationCap,
  LoaderCircle,
  Search,
  Shield,
  UserCheck,
  UserRound,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Card } from "@/components/Card";
import { ConnectionNotice } from "@/components/ConnectionNotice";
import { StatusBadge } from "@/components/StatusBadge";
import { useAdminSession } from "@/hooks/useAdminSession";
import { adminRequest, AdminRole, AdminUser, formatDate } from "@/lib/api";

const roleOptions: { value: AdminRole; label: string; icon: typeof Shield }[] = [
  { value: "admin", label: "مدير", icon: Crown },
  { value: "moderator", label: "مشرف", icon: Shield },
  { value: "trainer", label: "مدرب", icon: GraduationCap },
  { value: "member", label: "عضو", icon: UserCheck },
  { value: "guest", label: "زائر", icon: UserRound },
];

const roleTone: Record<AdminRole, "danger" | "warning" | "info" | "neutral" | "success"> = {
  admin: "danger",
  moderator: "warning",
  trainer: "info",
  member: "success",
  guest: "neutral",
};

export default function UsersPage() {
  const session = useAdminSession();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadUsers() {
    if (!session.token) return;

    try {
      setLoading(true);
      const response = await adminRequest<{ users: AdminUser[] }>(
        "/users?search=" + encodeURIComponent(search),
      );
      setUsers(response.users || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر تحميل المستخدمين.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!session.token) {
      setUsers([]);
      return;
    }

    const timeout = window.setTimeout(() => void loadUsers(), 250);
    return () => window.clearTimeout(timeout);
  }, [search, session.token]);

  const summary = useMemo(() => {
    const result: Record<AdminRole, number> = {
      admin: 0,
      moderator: 0,
      trainer: 0,
      member: 0,
      guest: 0,
    };

    for (const user of users) {
      const roles = user.roles?.length ? user.roles : [user.role];
      for (const role of roles) {
        if (role in result) result[role] += 1;
      }
    }

    return result;
  }, [users]);

  async function toggleRole(user: AdminUser, role: AdminRole) {
    if (session.user?.role !== "admin") return;

    const currentRoles = user.roles?.length ? user.roles : [user.role];
    const hasRole = currentRoles.includes(role);
    let nextRoles = hasRole
      ? currentRoles.filter((currentRole) => currentRole !== role)
      : [...currentRoles, role];

    if (nextRoles.length === 0) nextRoles = ["member"];
    if (nextRoles.some((item) => item !== "guest")) {
      nextRoles = nextRoles.filter((item) => item !== "guest");
    }

    const confirmed = window.confirm(
      "تأكيد تحديث صلاحيات " + (user.full_name || user.email || "المستخدم") + "؟",
    );
    if (!confirmed) return;

    try {
      setUpdatingId(user.id);
      const response = await adminRequest<{ user: AdminUser }>("/users/" + user.id + "/roles", {
        method: "PUT",
        body: { roles: nextRoles },
      });
      setUsers((current) => current.map((item) => (item.id === user.id ? response.user : item)));
      toast.success("تم تحديث الصلاحيات.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر تحديث الصلاحيات.");
    } finally {
      setUpdatingId(null);
    }
  }

  if (!session.isAuthenticated) return <ConnectionNotice />;

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="admin-kicker">
            <UsersIcon />
            الحسابات والصلاحيات
          </div>
          <h1 className="admin-page-title mt-2">إدارة المستخدمين</h1>
          <p className="admin-page-description">
            الصلاحيات متعددة الأدوار تعمل هنا كما كانت في لوحة الإدارة داخل التطبيق القديم، مع بقاء كل التغييرات عبر Backend API.
          </p>
        </div>

        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ابحث بالاسم أو البريد..."
            className="admin-field pr-10"
          />
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {roleOptions.map((role) => (
          <Card key={role.value}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-[var(--muted)]">{role.label}</p>
                <p className="mt-1 text-3xl font-bold text-[var(--foreground)]">{summary[role.value]}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[var(--surface-soft)] text-[var(--muted-strong)]">
                <role.icon size={16} />
              </div>
            </div>
          </Card>
        ))}
      </section>

      <Card title="الحسابات والصلاحيات">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-[var(--muted)]">
            <LoaderCircle size={16} className="animate-spin" />
            جارٍ تحميل المستخدمين...
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--muted)]">
            لا توجد حسابات مطابقة.
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((user) => {
              const roles = user.roles?.length ? user.roles : [user.role];

              return (
                <article key={user.id} className="rounded-xl border border-[var(--border)] bg-white p-4">
                  <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-center">
                    <div className="min-w-0">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">
                          <UserRound size={18} />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate font-bold text-[var(--foreground)]">
                              {user.full_name || "بدون اسم"}
                            </h3>
                            <StatusBadge
                              label={user.is_verified ? "موثق" : "غير موثق"}
                              tone={user.is_verified ? "success" : "warning"}
                            />
                          </div>
                          <p className="mt-1 break-all text-sm text-[var(--muted-strong)]">{user.email}</p>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted)]">
                            <span>{user.country || "البلد غير محدد"}</span>
                            <span>{formatDate(user.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {roles.map((role) => (
                          <StatusBadge
                            key={role}
                            label={roleOptions.find((item) => item.value === role)?.label || role}
                            tone={roleTone[role] || "neutral"}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3">
                      <p className="mb-2 text-xs font-bold text-[var(--muted-strong)]">الصلاحيات</p>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
                        {roleOptions.map((role) => {
                          const checked = roles.includes(role.value);
                          const RoleIcon = role.icon;

                          return (
                            <label
                              key={role.value}
                              className={
                                "flex cursor-pointer items-center gap-2 rounded-[8px] border px-3 py-2 text-xs font-semibold " +
                                (checked
                                  ? "border-[color:rgba(74,44,29,0.18)] bg-[var(--primary-soft)] text-[var(--primary)]"
                                  : "border-[var(--border)] bg-white text-[var(--muted-strong)]")
                              }
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                disabled={updatingId === user.id || session.user?.role !== "admin"}
                                onChange={() => void toggleRole(user, role.value)}
                                className="h-4 w-4 accent-[var(--primary)]"
                              />
                              <RoleIcon size={14} />
                              {role.label}
                            </label>
                          );
                        })}
                      </div>

                      {updatingId === user.id ? (
                        <div className="mt-2 flex items-center gap-2 text-xs text-[var(--muted)]">
                          <LoaderCircle size={13} className="animate-spin" />
                          يتم حفظ الصلاحيات...
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

function UsersIcon() {
  return <UserCheck size={13} />;
}
