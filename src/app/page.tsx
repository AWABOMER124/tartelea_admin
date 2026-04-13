"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Radio,
  Shield,
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
    color: "text-cyan-200 bg-cyan-500/10",
  },
  {
    key: "pendingApprovals",
    label: "طلبات بانتظار الاعتماد",
    icon: AlertTriangle,
    color: "text-amber-200 bg-amber-500/10",
  },
  {
    key: "totalCourses",
    label: "دورات المدربين",
    icon: BookOpen,
    color: "text-emerald-200 bg-emerald-500/10",
  },
  {
    key: "totalLiveRooms",
    label: "غرف مباشرة نشطة",
    icon: Radio,
    color: "text-violet-200 bg-violet-500/10",
  },
] as const;

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

  if (!session.isAuthenticated) {
    return <ConnectionNotice />;
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-100">
            <Shield size={14} />
            تحكم مركزي موحد
          </div>
          <div>
            <h2 className="text-3xl font-black text-white lg:text-4xl">نظرة تنفيذية على المنصة</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">
              جميع الأرقام هنا صادرة من الـ Backend API مباشرة، بما في ذلك الأدوار، الاعتمادات،
              المحتوى، والغرف النشطة.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm text-slate-300">
          <p>المستخدم المتصل: {session.user?.full_name || session.user?.email || "غير معروف"}</p>
          <p className="mt-1 text-xs text-slate-400">نقطة الاتصال: {session.baseUrl}</p>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map((card) => (
          <Card key={card.key}>
            <div className="flex items-start justify-between gap-4">
              <div className={`rounded-2xl p-3 ${card.color}`}>
                <card.icon size={22} />
              </div>
              <StatusBadge
                label={card.key === "pendingApprovals" ? "مراجعة" : "مباشر"}
                tone={card.key === "pendingApprovals" ? "warning" : "info"}
              />
            </div>
            <div className="mt-6">
              <p className="text-sm text-slate-400">{card.label}</p>
              <p className="mt-2 text-4xl font-black text-white">
                {loading || !stats ? "..." : formatCompactNumber(stats.overview[card.key])}
              </p>
            </div>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card title="منحنى التسجيلات خلال 7 أيام">
          <div className="h-80 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.trends.dailySignups ?? []}>
                <defs>
                  <linearGradient id="signupGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="label" stroke="rgba(203,213,225,0.7)" tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(203,213,225,0.7)" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#07131c",
                    borderColor: "rgba(255,255,255,0.08)",
                    borderRadius: "16px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#38bdf8"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#signupGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="توزيع أنواع المحتوى">
          <div className="h-80 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.trends.contentDistribution ?? []}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={105}
                  paddingAngle={4}
                >
                  {(stats?.trends.contentDistribution ?? []).map((entry, index) => (
                    <Cell
                      key={`${entry.name}-${index}`}
                      fill={["#38bdf8", "#10b981", "#f59e0b"][index % 3]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#07131c",
                    borderColor: "rgba(255,255,255,0.08)",
                    borderRadius: "16px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card title="آخر النشاطات">
          <div className="space-y-4">
            {(stats?.recentActivity ?? []).map((item) => (
              <div
                key={`${item.entity_type}-${item.created_at}-${item.title}`}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-sm leading-7 text-slate-300">{item.description}</p>
                  </div>
                  <StatusBadge label={item.entity_type} tone="info" />
                </div>
                <p className="mt-3 text-xs text-slate-500">{formatDate(item.created_at)}</p>
              </div>
            ))}

            {!loading && (stats?.recentActivity.length ?? 0) === 0 ? (
              <p className="text-sm text-slate-400">لا توجد نشاطات حديثة لعرضها.</p>
            ) : null}
          </div>
        </Card>

        <Card title="قائمة المراجعة السريعة">
          <div className="space-y-4">
            {(stats?.pendingApprovals ?? []).map((item) => (
              <div
                key={`${item.entity_type}-${item.id}`}
                className="rounded-3xl border border-amber-400/10 bg-amber-500/5 p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="mt-2 text-xs text-slate-400">{formatDate(item.created_at)}</p>
                  </div>
                  <StatusBadge label={item.entity_type} tone="warning" />
                </div>
              </div>
            ))}

            {!loading && (stats?.pendingApprovals.length ?? 0) === 0 ? (
              <div className="rounded-3xl border border-emerald-400/15 bg-emerald-500/5 p-5 text-sm text-emerald-100">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={18} />
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
