"use client";

import { useEffect, useState } from "react";
import { BookOpen, Check, LoaderCircle, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { Card } from "@/components/Card";
import { ConnectionNotice } from "@/components/ConnectionNotice";
import { StatusBadge } from "@/components/StatusBadge";
import { useAdminSession } from "@/hooks/useAdminSession";
import { adminRequest, AdminCourse, formatDate } from "@/lib/api";

export default function CoursesPage() {
  const session = useAdminSession();
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadCourses() {
    try {
      setLoading(true);
      const response = await adminRequest<{ courses: AdminCourse[] }>("/courses");
      setCourses(response.courses);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر تحميل الدورات.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!session.token) {
      setCourses([]);
      return;
    }

    void loadCourses();
  }, [session.token]);

  async function updateApproval(courseId: string, isApproved: boolean) {
    try {
      setUpdatingId(courseId);
      const response = await adminRequest<{ course: AdminCourse }>(`/courses/${courseId}/approval`, {
        method: "PATCH",
        body: { is_approved: isApproved },
      });
      setCourses((current) => current.map((course) => (course.id === courseId ? response.course : course)));
      toast.success(isApproved ? "تم اعتماد الدورة." : "تم تعليق الدورة.");
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
        <h2 className="text-3xl font-black text-white">دورات المدربين</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">
          مسار اعتماد واضح لكل دورة مدرب داخل قاعدة البيانات الموحدة.
        </p>
      </section>

      <Card title="طلبات الدورات">
        <div className="space-y-4">
          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-center text-sm text-slate-400">
              <span className="inline-flex items-center gap-3">
                <LoaderCircle size={16} className="animate-spin" />
                جارٍ تحميل الدورات...
              </span>
            </div>
          ) : courses.length === 0 ? (
            <p className="text-sm text-slate-400">لا توجد دورات مدربين بعد.</p>
          ) : (
            courses.map((course) => (
              <div key={course.id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-100">
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-white">{course.title}</h3>
                        <StatusBadge
                          label={course.is_approved ? "معتمدة" : "بانتظار الاعتماد"}
                          tone={course.is_approved ? "success" : "warning"}
                        />
                        <StatusBadge label={course.category || "general"} tone="info" />
                      </div>
                      <p className="mt-2 text-sm leading-7 text-slate-300">
                        {course.description || "بدون وصف تفصيلي."}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                        <span>المدرب: {course.trainer_name || "غير معروف"}</span>
                        <span>التاريخ: {formatDate(course.created_at)}</span>
                        <span>السعر: {course.price ?? 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      disabled={updatingId === course.id}
                      onClick={() => updateApproval(course.id, true)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/20 disabled:opacity-60"
                    >
                      <Check size={16} />
                      اعتماد
                    </button>
                    <button
                      disabled={updatingId === course.id}
                      onClick={() => updateApproval(course.id, false)}
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
