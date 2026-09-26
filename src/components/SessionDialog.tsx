"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, LoaderCircle, PlugZap, RotateCcw, ShieldCheck, X } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  clearSession,
  getDefaultApiBaseUrl,
  getGoogleClientId,
  getPublicAuthConfig,
  loginWithGoogle,
  loginWithPassword,
  normalizeBaseUrl,
  readSession,
  saveManualToken,
} from "@/lib/api";

interface SessionDialogProps {
  open: boolean;
  onClose: () => void;
}

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleIdApi = {
  initialize: (options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      theme?: "outline" | "filled_blue" | "filled_black";
      size?: "large" | "medium" | "small";
      shape?: "rectangular" | "pill" | "circle" | "square";
      text?: "signin_with" | "signup_with" | "continue_with" | "signin";
      width?: number;
      locale?: string;
    },
  ) => void;
};

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: GoogleIdApi;
      };
    };
  }
}

export function SessionDialog({ open, onClose }: SessionDialogProps) {
  const [baseUrl, setBaseUrl] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [manualToken, setManualToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [googleClientId, setGoogleClientId] = useState(() => getGoogleClientId());
  const [showAdvanced, setShowAdvanced] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const configuredBaseUrl = getDefaultApiBaseUrl();

  useEffect(() => {
    if (!open) return;

    const session = readSession();
    setBaseUrl(session.baseUrl);
    setManualToken(session.token ?? "");
    setShowAdvanced(false);
  }, [open]);

  useEffect(() => {
    if (!open || googleClientId) return;

    let cancelled = false;
    const resolvedBaseUrl = baseUrl || configuredBaseUrl;

    void getPublicAuthConfig(resolvedBaseUrl)
      .then((config) => {
        if (!cancelled && config.googleClientId) {
          setGoogleClientId(config.googleClientId);
        }
      })
      .catch(() => {
        // Password login remains available if public auth config cannot be loaded.
      });

    return () => {
      cancelled = true;
    };
  }, [open, googleClientId, baseUrl, configuredBaseUrl]);

  useEffect(() => {
    if (!open || !googleClientId) return;

    let cancelled = false;

    const setupGoogleButton = () => {
      if (cancelled) return;

      const googleId = window.google?.accounts?.id;
      const container = googleButtonRef.current;
      if (!googleId || !container) return;

      googleId.initialize({
        client_id: googleClientId,
        auto_select: false,
        cancel_on_tap_outside: true,
        callback: async (response) => {
          if (!response.credential) {
            toast.error("لم يصل رمز تحقق صالح من Google.");
            return;
          }

          try {
            setGoogleLoading(true);
            const session = await loginWithGoogle({
              baseUrl: baseUrl || configuredBaseUrl,
              idToken: response.credential,
            });
            toast.success("تم تسجيل الدخول بصلاحية " + (session.user?.role ?? "غير محددة") + ".");
            onClose();
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "تعذر تسجيل الدخول عبر Google.");
          } finally {
            setGoogleLoading(false);
          }
        },
      });

      container.replaceChildren();
      const width = Math.min(Math.max(container.clientWidth || 360, 240), 440);
      googleId.renderButton(container, {
        theme: "outline",
        size: "large",
        shape: "rectangular",
        text: "continue_with",
        width,
        locale: "ar",
      });
      setGoogleReady(true);
    };

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]',
    );

    if (existingScript) {
      if (window.google?.accounts?.id) {
        setupGoogleButton();
      } else {
        existingScript.addEventListener("load", setupGoogleButton, { once: true });
      }
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = setupGoogleButton;
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
    };
  }, [open, googleClientId, baseUrl, configuredBaseUrl, onClose]);

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
              استخدم نفس طريقة الدخول التي تستخدمها في المنصة. حسابات Google تدخل عبر Google، وحسابات البريد تدخل بكلمة المرور.
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

          {googleClientId ? (
            <div className="space-y-3">
              <div
                ref={googleButtonRef}
                className={googleLoading ? "pointer-events-none flex min-h-11 w-full items-center justify-center opacity-60" : "flex min-h-11 w-full items-center justify-center"}
                aria-busy={googleLoading}
              />
              {!googleReady ? (
                <p className="text-center text-xs text-[var(--muted)]">جار تحميل تسجيل الدخول عبر Google...</p>
              ) : null}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-[var(--border)]" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-[var(--muted)]">أو بالبريد وكلمة المرور</span>
                </div>
              </div>
            </div>
          ) : null}

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
                autoFocus={!googleClientId}
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

            <button type="submit" disabled={submitting || googleLoading} className="admin-primary-button w-full disabled:opacity-60">
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
                  <button onClick={handleManualTokenSave} disabled={submitting || googleLoading} className="admin-primary-button flex-1 disabled:opacity-60">
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
