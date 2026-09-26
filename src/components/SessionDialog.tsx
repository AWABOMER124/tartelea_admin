"use client";

import { useEffect, useState } from "react";
import { ChevronDown, LoaderCircle, PlugZap, RotateCcw, ShieldCheck, X } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  clearSession,
  getDefaultApiBaseUrl,
  loginWithPassword,
  normalizeBaseUrl,
  readSession,
  saveManualToken,
} from "@/lib/api";

interface SessionDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SessionDialog({ open, onClose }: SessionDialogProps) {
  const [baseUrl, setBaseUrl] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [manualToken, setManualToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const configuredBaseUrl = getDefaultApiBaseUrl();

  useEffect(() => {
    if (!open) return;

    const session = readSession();
    setBaseUrl(session.baseUrl);
    setManualToken(session.token ?? "");
    setShowAdvanced(false);
  }, [open]);

  if (!open) return null;

  async function handlePasswordLogin() {
    if (!email.trim() || !password.trim()) {
      toast.error("أدخل البريد وكلمة المرور أولًا.");
      return;
    }

    try {
      setSubmitting(true);
      const session = await loginWithPassword({ baseUrl, email, password });
      toast.success("تم تسجيل الدخول بصلاحية " + (session.user?.role ?? "غير محددة") + ".");
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر تسجيل الدخول.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleManualTokenSave() {
    if (!manualToken.trim()) {
      toast.error("أدخل رمز JWT صالح.");
      return;
    }

    try {
      setSubmitting(true);
      const session = await saveManualToken({ baseUrl, token: manualToken.trim() });
      toast.success("تم حفظ الجلسة لـ " + (session.user?.email ?? "المستخدم الحالي") + ".");
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر التحقق من الرمز.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleLogout() {
    clearSession();
    toast.success("تم مسح الجلسة الحالية.");
    onClose();
  }

  const activeBaseUrl = baseUrl || configuredBaseUrl;
  const usingConfiguredBaseUrl =
    normalizeBaseUrl(activeBaseUrl) === normalizeBaseUrl(configuredBaseUrl);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/25 p-4 backdrop-blur-[2px]">
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[var(--border)] bg-white p-5 shadow-2xl sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="admin-kicker">
              <PlugZap size={13} />
              دخول الإدارة
            </div>
            <h3 className="mt-2 text-xl font-bold text-[var(--foreground)]">تسجيل الدخول إلى لوحة الإدارة</h3>
            <p className="mt-1 max-w-lg text-sm leading-7 text-[var(--muted)]">
              استخدم حساب مدير أو مشرف للوصول إلى أدوات الإدارة.
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--secondary)]"
            aria-label="إغلاق"
          >
            <X size={17} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-sm">
            <p className="font-bold text-[var(--foreground)]">الخادم الحالي</p>
            <p className="mt-1 break-all font-mono text-xs text-[var(--muted)]" dir="ltr">
              {activeBaseUrl}
            </p>
            {!usingConfiguredBaseUrl ? (
              <p className="mt-2 text-xs text-[var(--warning)]">
                يتم استخدام رابط مخصص محفوظ سابقًا.
              </p>
            ) : null}
          </div>

          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void handlePasswordLogin();
            }}
          >
            <label className="block text-sm font-medium text-[var(--foreground)]">
              البريد الإلكتروني
              <input
                autoFocus
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="admin-field mt-2 text-left"
                dir="ltr"
                placeholder="admin@tartelea.com"
              />
            </label>

            <label className="block text-sm font-medium text-[var(--foreground)]">
              كلمة المرور
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="admin-field mt-2 text-left"
                dir="ltr"
                placeholder="••••••••"
              />
            </label>

            <button type="submit" disabled={submitting} className="admin-primary-button w-full disabled:opacity-60">
              {submitting ? <LoaderCircle size={17} className="animate-spin" /> : <ShieldCheck size={17} />}
              دخول
            </button>
          </form>

          <div className="rounded-xl border border-[var(--border)] bg-white p-4">
            <button
              type="button"
              onClick={() => setShowAdvanced((current) => !current)}
              className="flex w-full items-center justify-between gap-4 text-right"
            >
              <div>
                <h4 className="text-sm font-bold text-[var(--foreground)]">خيارات متقدمة</h4>
                <p className="mt-1 text-xs leading-6 text-[var(--muted)]">تغيير رابط الـ API أو استخدام JWT يدوي.</p>
              </div>
              <ChevronDown size={17} className={showAdvanced ? "rotate-180 text-[var(--muted)]" : "text-[var(--muted)]"} />
            </button>

            {showAdvanced ? (
              <div className="mt-4 space-y-4 border-t border-[var(--border)] pt-4">
                <label className="block text-sm font-medium text-[var(--foreground)]">
                  عنوان الـ API
                  <input
                    value={baseUrl}
                    onChange={(event) => setBaseUrl(event.target.value)}
                    className="admin-field mt-2 text-left"
                    dir="ltr"
                  />
                </label>

                <button type="button" onClick={() => setBaseUrl(configuredBaseUrl)} className="admin-secondary-button">
                  <RotateCcw size={15} />
                  استخدام الخادم المضبوط
                </button>

                <label className="block text-sm font-medium text-[var(--foreground)]">
                  رمز JWT
                  <textarea
                    value={manualToken}
                    onChange={(event) => setManualToken(event.target.value)}
                    className="admin-field mt-2 h-32 text-left"
                    dir="ltr"
                  />
                </label>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button onClick={handleManualTokenSave} disabled={submitting} className="admin-primary-button flex-1 disabled:opacity-60">
                    {submitting ? <LoaderCircle size={17} className="animate-spin" /> : <PlugZap size={17} />}
                    حفظ الرمز
                  </button>
                  <button onClick={handleLogout} type="button" className="admin-secondary-button">
                    مسح الجلسة
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
