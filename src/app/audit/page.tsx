"use client";

import { useEffect, useState } from "react";
import { FileSearch, LoaderCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { Card } from "@/components/Card";
import { ConnectionNotice } from "@/components/ConnectionNotice";
import { StatusBadge } from "@/components/StatusBadge";
import { useAdminSession } from "@/hooks/useAdminSession";
import { adminRequest, AdminAuditLog, formatDate } from "@/lib/api";

export default function AuditPage() {
  const session = useAdminSession();
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session.token) {
      setLogs([]);
      return;
    }

    async function loadAuditLogs() {
      try {
        setLoading(true);
        const response = await adminRequest<{ audit_logs: AdminAuditLog[] }>("/audit");
        setLogs(response.audit_logs);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "تعذر تحميل سجل التدقيق.");
      } finally {
        setLoading(false);
      }
    }

    void loadAuditLogs();
  }, [session.token]);

  if (!session.isAuthenticated) {
    return <ConnectionNotice />;
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-3xl font-black text-white">سجل التدقيق الإداري</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">
          كل تعديل إداري مهم يُسجَّل هنا مع نوع العملية والكيان والفاعل وعنوان الطلب.
        </p>
      </section>

      <Card title="آخر العمليات">
        <div className="space-y-4">
          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-center text-sm text-slate-400">
              <span className="inline-flex items-center gap-3">
                <LoaderCircle size={16} className="animate-spin" />
                جارٍ تحميل السجل...
              </span>
            </div>
          ) : logs.length === 0 ? (
            <p className="text-sm text-slate-400">لا توجد عمليات تدقيق مسجلة بعد.</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-100">
                      <FileSearch size={18} />
                    </div>
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-white">{log.action}</p>
                        <StatusBadge label={log.entity_type} tone="info" />
                        {log.actor_role ? <StatusBadge label={log.actor_role} tone="neutral" /> : null}
                      </div>
                      <div className="text-sm leading-7 text-slate-300">
                        <p>الفاعل: {log.actor_name || log.actor_email || "غير معروف"}</p>
                        <p>الكيان: {log.entity_id || "غير محدد"}</p>
                        <p>عنوان الطلب: {log.request_ip || "غير متوفر"}</p>
                      </div>
                      <details className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-xs text-slate-300">
                        <summary className="cursor-pointer font-semibold text-slate-200">تفاصيل العملية</summary>
                        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words">
                          {JSON.stringify(log.details || {}, null, 2)}
                        </pre>
                      </details>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500">{formatDate(log.created_at)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
