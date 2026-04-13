"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, LoaderCircle } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
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
import { useAdminSession } from "@/hooks/useAdminSession";
import { adminRequest, DashboardResponse, formatCompactNumber } from "@/lib/api";

export default function ReportsPage() {
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
        toast.error(error instanceof Error ? error.message : "تعذر تحميل التقارير.");
      } finally {
        setLoading(false);
      }
    }

    void loadStats();
  }, [session.token]);

  const executiveCards = useMemo(
    () =>
      stats
        ? [
            { label: "مستخدمون موثقون", value: stats.overview.verifiedUsers },
            { label: "ورش معروضة", value: stats.overview.totalWorkshops },
            { label: "محتوى منشور", value: stats.overview.totalContents },
          ]
        : [],
    [stats],
  );

  if (!session.isAuthenticated) {
    return <ConnectionNotice />;
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white">التقارير والتحليلات</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">
            قراءة سريعة لمؤشرات المنصة من نفس بيانات لوحة الإدارة، بدون أي طبقة بيانات منفصلة أو
            استدعاءات مباشرة من الواجهة إلى قاعدة البيانات.
        </p>
        </div>

        <button className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10">
          <Download size={16} />
          تصدير يدوي قريبًا
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {executiveCards.map((card) => (
          <Card key={card.label}>
            <p className="text-sm text-slate-400">{card.label}</p>
            <p className="mt-3 text-4xl font-black text-white">{formatCompactNumber(card.value)}</p>
          </Card>
        ))}
      </section>

      {loading && !stats ? (
        <Card>
          <div className="flex items-center justify-center gap-3 py-12 text-sm text-slate-400">
            <LoaderCircle size={16} className="animate-spin" />
            جارٍ تحميل لوحة التحليلات...
          </div>
        </Card>
      ) : null}

      {stats ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <Card title="تطور التسجيلات اليومية">
            <div className="h-80 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.trends.dailySignups}>
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
                  <Legend />
                  <Bar dataKey="total" name="تسجيلات" radius={[12, 12, 0, 0]} fill="#38bdf8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="توزيع المحتوى حسب النوع">
            <div className="h-80 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.trends.contentDistribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={65}
                    outerRadius={110}
                    paddingAngle={5}
                  >
                    {stats.trends.contentDistribution.map((entry, index) => (
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

          <Card title="مؤشر الإنتاجية الإدارية">
            <div className="h-80 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { label: "محتوى", value: stats.overview.totalContents },
                    { label: "ورش", value: stats.overview.totalWorkshops },
                    { label: "غرف", value: stats.overview.totalRooms },
                    { label: "دورات", value: stats.overview.totalCourses },
                    { label: "مثبتات", value: stats.overview.totalPinned },
                  ]}
                >
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
                  <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="حجم المراجعات المعلقة">
            <div className="space-y-4 pt-3">
              {stats.pendingApprovals.map((item) => (
                <div
                  key={`${item.entity_type}-${item.id}`}
                  className="rounded-3xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">{item.title}</p>
                      <p className="mt-2 text-xs text-slate-500">{item.entity_type}</p>
                    </div>
                    <p className="text-sm font-semibold text-amber-200">معلّق</p>
                  </div>
                </div>
              ))}

              {stats.pendingApprovals.length === 0 ? (
                <p className="text-sm text-slate-400">لا توجد عناصر قيد الانتظار.</p>
              ) : null}
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
