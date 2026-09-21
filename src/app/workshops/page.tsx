"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Check, LoaderCircle, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { Card } from "@/components/Card";
import { ConnectionNotice } from "@/components/ConnectionNotice";
import { StatusBadge } from "@/components/StatusBadge";
import { useAdminSession } from "@/hooks/useAdminSession";
import { adminRequest, AdminWorkshop, formatDate } from "@/lib/api";

export default function WorkshopsPage() {
  const session = useAdminSession();
  const [workshops, setWorkshops] = useState<AdminWorkshop[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadWorkshops() {
    try {
      setLoading(true);
      const response = await adminRequest<{ workshops: AdminWorkshop[] }>("/workshops");
      setWorkshops(response.workshops);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر تحميل الورش.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!session.token) {
      setWorkshops([]);
      return;
    }

    void loadWorkshops();
  }, [session.token]);

  async function updateApproval(workshopId: string, isApproved: boolean) {
    try {
      setUpdatingId(workshopId);
      const response = await adminRequest<{ workshop: AdminWorkshop }>(
        `/workshops/${workshopId}/approval`,
        {
          method: "PATCH",
          body: { is_approved: isApproved },
        },
      );

      setWorkshops((current) =>
        current.map((workshop) => (workshop.id === workshopId ? response.workshop : workshop)),
      );
      toast.success(isApproved ? "تم اعتماد الورشة." : "تم إرجاع الورشة للمراجعة.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر تحديث الاعتماد.");
    } finally {
      setUpdatingId(null);
    }
  }

  if (!session.isAuthenticated) {
    return <ConnectionNotice />;
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-3xl font-black text-white">الورش والاعتمادات</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">
          إدارة الورش أصبحت تمر عبر مسار إداري واحد في الـ Backend مع حالة اعتماد واضحة لكل ورشة.
        </p>
      </section>

      <Card title="قائمة الورش">
        <div className="space-y-4">
          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-center text-sm text-slate-400">
              <span className="inline-flex items-center gap-3">
                <LoaderCircle size={16} className="animate-spin" />
                جارٍ تحميل الورش...
              </span>
            </div>
          ) : workshops.length === 0 ? (
            <p className="text-sm text-slate-400">لا توجد ورش متاحة حاليًا.</p>
          ) : (
            workshops.map((workshop) => (
              <div
                key={workshop.id}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-100">
                      <CalendarDays size={20} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-white">{workshop.title}</h3>
                        <StatusBadge
                          label={workshop.is_approved ? "معتمدة" : "بانتظار الاعتماد"}
                          tone={workshop.is_approved ? "success" : "warning"}
                        />
                        {workshop.is_live ? <StatusBadge label="مباشرة" tone="danger" /> : null}
                      </div>
                      <p className="mt-2 text-sm leading-7 text-slate-300">
                        {workshop.description || "لا يوجد وصف لهذه الورشة."}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                        <span>المدرب: {workshop.trainer_name || "غير محدد"}</span>
                        <span>الموعد: {formatDate(workshop.scheduled_at || workshop.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      disabled={updatingId === workshop.id || session.user?.role !== "admin"}
                      onClick={() => updateApproval(workshop.id, true)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/20 disabled:opacity-60"
                    >
                      <Check size={16} />
                      اعتماد
                    </button>
                    <button
                      disabled={updatingId === workshop.id || session.user?.role !== "admin"}
                      onClick={() => updateApproval(workshop.id, false)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/20 disabled:opacity-60"
                    >
                      <X size={16} />
                      تعليق
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
