"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Radio,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "react-hot-toast";
import { Card } from "@/components/Card";
import { ConnectionNotice } from "@/components/ConnectionNotice";
import { StatusBadge } from "@/components/StatusBadge";
import { useAdminSession } from "@/hooks/useAdminSession";
import {
  adminRequest,
  DashboardResponse,
  formatCompactNumber,
  formatDate,
} from "@/lib/api";

const overviewCards = [
  {
    key: "totalUsers",
    label: "إجمالي المستخدمين",
    icon: Users,
    tone: "primary",
  },
  {
    key: "pendingApprovals",
    label: "بانتظار الاعتماد",
    icon: AlertTriangle,
    tone: "warning",
  },
  {
    key: "totalCourses",
    label: "دورات المدربين",
    icon: BookOpen,
    tone: "success",
  },
  {
    key: "totalLiveRooms",
    label: "غرف مباشرة الآن",
    icon: Radio,
    tone: "info",
  },
] as const;

const iconToneClass = {
  primary: "bg-[var(--primary-soft)] text-[var(--primary)]",
  warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
  success: "bg-[var(--success-soft)] text-[var(--success)]",
  info: "bg-[var(--info-soft)] text-[var(--info)]",
};

export default function DashboardPage() {
  const session = useAdminSession();
  const [stats, setStats] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session.token) {
      setStats(null);
      return;
    }

    async function loadStats() {
      try {
        setLoading(true);
        const response = await adminRequest<DashboardResponse>("/stats");
        setStats(response);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "تعذر تحميل الإحصاءات.");
      } finally {
        setLoading(false);
      }
    }

    void loadStats();
  }, [session.token]);

  if (!session.isAuthenticated) return <ConnectionNotice />;

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="admin-kicker">
            <ShieldCheck size={13} />
            نظرة تنفيذية
          </div>
          <h1 className="admin-page-title mt-2">لوحة إدارة المدرسة الترتيلية</h1>
          <p className="admin-page-description">
            متابعة الحسابات والمحتوى والمجتمع والاعتمادات من لوحة واحدة متصلة مباشرة بالـ Backend.
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-white px-4 py-3">
          <p className="text-xs text-[var(--muted)]">المستخدم الحالي</p>
          <p className="mt-1 max-w-[260px] truncate text-sm font-bold text-[var(--foreground)]">
            {session.user?.full_name || session.user?.email || "غير معروف"}
          </p>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {overviewCards.map((card) => (
          <Card key={card.key}>
            <div className="flex items-start justify-between gap-3">
              <div className={"flex h-10 w-10 items-center justify-center rounded-[9px] " + iconToneClass[card.tone]}>
                <card.icon size={18} />
              </div>
              {card.key === "pendingApprovals" && (stats?.overview.pendingApprovals || 0) > 0 ? (
                <StatusBadge label="مراجعة" tone="warning" />
              ) : null}
            </div>

            <div className="mt-5">
              <p className="text-xs font-semibold text-[var(--muted)] sm:text-sm">{card.label}</p>
              <p className="mt-1 text-3xl font-bold text-[var(--foreground)] sm:text-4xl">
                {loading || !stats ? "..." : formatCompactNumber(stats.overview[card.key])}
              </p>
            </div>
          </Card>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
        <Card title="التسجيلات خلال آخر 7 أيام">
          <div className="h-72 pt-3 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.trends.dailySignups ?? []}>
                <defs>
                  <linearGradient id="signupGradientAdminV2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4a2c1d" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#4a2c1d" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#eee8df" vertical={false} />
                <XAxis dataKey="label" stroke="#8b8078" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis stroke="#8b8078" tickLine={false} axisLine={false} fontSize={11} width={32} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#e3ddd5",
                    borderRadius: "10px",
                    color: "#241c17",
                    boxShadow: "0 8px 24px rgba(65,46,35,0.08)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#4a2c1d"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#signupGradientAdminV2)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="توزيع أنواع المحتوى">
          <div className="h-72 pt-3 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.trends.contentDistribution ?? []}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={62}
                  outerRadius={98}
                  paddingAngle={4}
                >
                  {(stats?.trends.contentDistribution ?? []).map((entry, index) => (
                    <Cell
                      key={entry.name + "-" + index}
                      fill={["#4a2c1d", "#b58a35", "#4f755f"][index % 3]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#e3ddd5",
                    borderRadius: "10px",
                    color: "#241c17",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Card title="آخر النشاطات">
          <div className="space-y-3">
            {(stats?.recentActivity ?? []).map((item) => (
              <div
                key={item.entity_type + "-" + item.created_at + "-" + item.title}
                className="rounded-xl border border-[var(--border)] bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-[var(--foreground)]">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted-strong)]">{item.description}</p>
                  </div>
                  <StatusBadge label={item.entity_type} tone="info" />
                </div>
                <p className="mt-2 text-xs text-[var(--muted)]">{formatDate(item.created_at)}</p>
              </div>
            ))}

            {!loading && (stats?.recentActivity.length ?? 0) === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--muted)]">
                لا توجد نشاطات حديثة.
              </div>
            ) : null}
          </div>
        </Card>

        <Card title="المراجعة السريعة">
          <div className="space-y-3">
            {(stats?.pendingApprovals ?? []).map((item) => (
              <div
                key={item.entity_type + "-" + item.id}
                className="rounded-xl border border-[color:rgba(154,106,29,0.16)] bg-[var(--warning-soft)] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-[var(--foreground)]">{item.title}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">{formatDate(item.created_at)}</p>
                  </div>
                  <StatusBadge label={item.entity_type} tone="warning" />
                </div>
              </div>
            ))}

            {!loading && (stats?.pendingApprovals.length ?? 0) === 0 ? (
              <div className="rounded-xl border border-[color:rgba(79,117,95,0.18)] bg-[var(--success-soft)] p-5 text-sm text-[var(--success)]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={17} />
                  لا توجد عناصر معلقة حاليًا.
                </div>
              </div>
            ) : null}
          </div>
        </Card>
      </section>
    </div>
  );
}
