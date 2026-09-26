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
        onClick={() => {
          setForm(values);
          setOpen(true);
        }}
        className="admin-secondary-button min-h-9 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={"تعديل " + title}
      >
        <PencilLine size={15} />
        تعديل
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/25 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[var(--border)] bg-white p-5 shadow-2xl sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="admin-kicker">تحرير المحتوى الظاهر للمستخدم</p>
                <h2 className="mt-2 text-xl font-bold text-[var(--foreground)]">{title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--secondary)]"
                aria-label="إغلاق"
              >
                <X size={17} />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map((field) => {
                const value = form[field.key] ?? "";

                return (
                  <label
                    key={field.key}
                    className={field.type === "textarea" ? "block text-sm font-medium text-[var(--foreground)] sm:col-span-2" : "block text-sm font-medium text-[var(--foreground)]"}
                  >
                    {field.label}
                    {field.required ? " *" : ""}
                    {field.type === "textarea" ? (
                      <textarea
                        rows={5}
                        value={String(value)}
                        onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))}
                        className="admin-field mt-2 min-h-32 resize-y"
                      />
                    ) : field.type === "select" ? (
                      <select
                        value={String(value)}
                        onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))}
                        className="admin-field mt-2"
                      >
                        {field.options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type || "text"}
                        min={field.min}
                        value={value}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            [field.key]: field.type === "number" ? Number(event.target.value) : event.target.value,
                          }))
                        }
                        className="admin-field mt-2"
                        dir={field.type === "url" ? "ltr" : undefined}
                      />
                    )}
                  </label>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row">
              <button type="button" onClick={() => setOpen(false)} className="admin-secondary-button">
                إلغاء
              </button>
              <button type="button" disabled={saving} onClick={submit} className="admin-primary-button flex-1 disabled:opacity-60">
                {saving ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}
                حفظ التغييرات
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
