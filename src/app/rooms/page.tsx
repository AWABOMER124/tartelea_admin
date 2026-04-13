"use client";

import { useEffect, useState } from "react";
import { Check, LoaderCircle, Radio, Users, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { Card } from "@/components/Card";
import { ConnectionNotice } from "@/components/ConnectionNotice";
import { StatusBadge } from "@/components/StatusBadge";
import { useAdminSession } from "@/hooks/useAdminSession";
import { adminRequest, AdminRoom, formatDate } from "@/lib/api";

export default function RoomsPage() {
  const session = useAdminSession();
  const [rooms, setRooms] = useState<AdminRoom[]>([]);
  const [liveRooms, setLiveRooms] = useState<AdminRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadRooms() {
    try {
      setLoading(true);
      const response = await adminRequest<{ rooms: AdminRoom[]; liveRooms: AdminRoom[] }>("/rooms");
      setRooms(response.rooms);
      setLiveRooms(response.liveRooms);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر تحميل الغرف.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!session.token) {
      setRooms([]);
      setLiveRooms([]);
      return;
    }

    void loadRooms();
  }, [session.token]);

  async function updateApproval(roomId: string, isApproved: boolean) {
    try {
      setUpdatingId(roomId);
      const response = await adminRequest<{ room: AdminRoom }>(`/rooms/${roomId}/approval`, {
        method: "PATCH",
        body: { is_approved: isApproved },
      });

      setRooms((current) => current.map((room) => (room.id === roomId ? response.room : room)));
      toast.success(isApproved ? "تم اعتماد الغرفة." : "تم تعليق الغرفة.");
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
        <h2 className="text-3xl font-black text-white">الغرف وجدول البث المباشر</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">
          شاشة موحدة تعرض الغرف المجدولة من قاعدة البيانات والغرف الصوتية المباشرة من نفس الـ Backend.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1.4fr]">
        <Card title="الغرف المباشرة الآن">
          <div className="space-y-4">
            {loading ? (
              <p className="text-sm text-slate-400">جارٍ تحميل البث المباشر...</p>
            ) : liveRooms.length === 0 ? (
              <p className="text-sm text-slate-400">لا توجد غرف مباشرة نشطة حاليًا.</p>
            ) : (
              liveRooms.map((room) => (
                <div
                  key={room.id}
                  className="rounded-3xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Radio size={18} className="text-rose-300" />
                        <p className="font-semibold text-white">{room.title}</p>
                      </div>
                      <p className="text-sm text-slate-300">المضيف: {room.host_name || "غير معروف"}</p>
                    </div>
                    <StatusBadge
                      label={`${room.participants_count ?? 0} مشارك`}
                      tone="danger"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card title="الغرف المجدولة والمراجعة">
          <div className="space-y-4">
            {loading ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-center text-sm text-slate-400">
                <span className="inline-flex items-center gap-3">
                  <LoaderCircle size={16} className="animate-spin" />
                  جارٍ تحميل الغرف...
                </span>
              </div>
            ) : rooms.length === 0 ? (
              <p className="text-sm text-slate-400">لا توجد غرف مجدولة بعد.</p>
            ) : (
              rooms.map((room) => (
                <div
                  key={room.id}
                  className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-5">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-white">{room.title}</h3>
                        <StatusBadge
                          label={room.is_approved ? "معتمدة" : "بانتظار الاعتماد"}
                          tone={room.is_approved ? "success" : "warning"}
                        />
                      </div>
                      <p className="mt-2 text-sm leading-7 text-slate-300">
                        {room.description || "لا يوجد وصف متوفر."}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <span>المضيف: {room.host_name || "غير معروف"}</span>
                        <span>الموعد: {formatDate(room.scheduled_at || room.created_at)}</span>
                        <span className="inline-flex items-center gap-1">
                          <Users size={13} />
                          {room.max_participants ?? 0} حد أقصى
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        disabled={updatingId === room.id}
                        onClick={() => updateApproval(room.id, true)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/20 disabled:opacity-60"
                      >
                        <Check size={16} />
                        اعتماد
                      </button>
                      <button
                        disabled={updatingId === room.id}
                        onClick={() => updateApproval(room.id, false)}
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
    </div>
  );
}
