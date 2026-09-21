"use client";

import { useState } from "react";
import { LoaderCircle, PencilLine, Save, X } from "lucide-react";

export type EditorValue = string | number | null;
export type EditorField = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number" | "url" | "datetime-local" | "select";
  required?: boolean;
  min?: number;
  options?: Array<{ value: string; label: string }>;
};

export function EntityEditDialog({
  title,
  values,
  fields,
  disabled,
  onSave,
}: {
  title: string;
  values: Record<string, EditorValue>;
  fields: EditorField[];
  disabled?: boolean;
  onSave: (values: Record<string, EditorValue>) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(values);

  async function submit() {
    if (fields.some((field) => field.required && !String(form[field.key] ?? "").trim())) return;
    try {
      setSaving(true);
      await onSave(form);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => { setForm(values); setOpen(true); }}
        className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={`تعديل ${title}`}
      >
        <PencilLine size={16} /> تعديل
      </button>

      {open ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={title}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-950 p-5 shadow-2xl sm:p-7">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div><p className="text-xs font-semibold text-cyan-300">تحرير ما يراه المستخدم</p><h2 className="mt-1 text-xl font-black text-white">{title}</h2></div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-white/10 p-2 text-slate-300 hover:bg-white/5" aria-label="إغلاق"><X size={18} /></button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map((field) => {
                const shared = "mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/40";
                const value = form[field.key] ?? "";
                return (
                  <label key={field.key} className={field.type === "textarea" ? "block text-sm text-slate-300 sm:col-span-2" : "block text-sm text-slate-300"}>
                    {field.label}{field.required ? " *" : ""}
                    {field.type === "textarea" ? (
                      <textarea rows={5} value={String(value)} onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))} className={shared} />
                    ) : field.type === "select" ? (
                      <select value={String(value)} onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))} className={shared}>
                        {field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </select>
                    ) : (
                      <input
                        type={field.type || "text"}
                        min={field.min}
                        value={value}
                        onChange={(event) => setForm((current) => ({ ...current, [field.key]: field.type === "number" ? Number(event.target.value) : event.target.value }))}
                        className={shared}
                        dir={field.type === "url" ? "ltr" : undefined}
                      />
                    )}
                  </label>
                );
              })}
            </div>
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
              <button type="button" onClick={() => setOpen(false)} className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-white/5">إلغاء</button>
              <button type="button" disabled={saving} onClick={submit} className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 hover:bg-cyan-300 disabled:opacity-60">
                {saving ? <LoaderCircle size={17} className="animate-spin" /> : <Save size={17} />} حفظ كل التغييرات
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
