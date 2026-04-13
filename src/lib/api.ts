"use client";

export const ADMIN_SESSION_EVENT = "tartelea-admin-session-change";

const STORAGE_KEYS = {
  baseUrl: "tartelea.admin.base-url",
  token: "tartelea.admin.token",
  user: "tartelea.admin.user",
};

const DEFAULT_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "http://localhost:3001/api/v1";

export type AdminRole = "admin" | "moderator" | "trainer" | "student";

export interface SessionUser {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  role?: AdminRole | null;
  roles?: string[];
}

export interface AdminSession {
  baseUrl: string;
  token: string | null;
  user: SessionUser | null;
}

export interface DashboardResponse {
  overview: {
    totalUsers: number;
    verifiedUsers: number;
    admins: number;
    moderators: number;
    trainers: number;
    students: number;
    totalContents: number;
    totalWorkshops: number;
    totalRooms: number;
    totalLiveRooms: number;
    totalCourses: number;
    totalPinned: number;
    pendingApprovals: number;
  };
  trends: {
    dailySignups: { label: string; total: number }[];
    contentDistribution: { name: string; value: number }[];
  };
  recentActivity: {
    created_at: string;
    entity_type: string;
    title: string;
    description: string;
  }[];
  pendingApprovals: {
    id: string;
    title: string;
    entity_type: string;
    created_at: string;
  }[];
}

export interface AdminUser {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  country?: string | null;
  created_at: string;
  is_verified: boolean;
  role: AdminRole;
  roles: string[];
}

export interface AdminContent {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  category: string;
  media_url?: string | null;
  thumbnail_url?: string | null;
  content?: string | null;
  duration?: string | null;
  depth_level?: number | null;
  is_sudan_awareness?: boolean;
  created_at: string;
}

export interface AdminPost {
  id: string;
  title: string;
  body?: string | null;
  category?: string | null;
  image_url?: string | null;
  author_name?: string | null;
  comments_count?: number;
  likes_count?: number;
  created_at: string;
}

export interface AdminCourse {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  thumbnail_url?: string | null;
  media_url?: string | null;
  price?: number | null;
  is_approved: boolean;
  trainer_name?: string | null;
  created_at: string;
}

export interface AdminWorkshop {
  id: string;
  title: string;
  description?: string | null;
  trainer_name?: string | null;
  scheduled_at?: string | null;
  is_approved: boolean;
  is_live?: boolean;
  created_at: string;
}

export interface AdminRoom {
  id: string;
  title: string;
  description?: string | null;
  host_name?: string | null;
  is_approved?: boolean;
  is_live?: boolean;
  participants_count?: number;
  max_participants?: number;
  status?: string | null;
  scheduled_at?: string | null;
  created_at: string;
}

export interface PinnedItem {
  id: string;
  entity_type: string;
  entity_id: string;
  title: string;
  subtitle?: string | null;
  thumbnail_url?: string | null;
  sort_order?: number;
  created_at: string;
}

export interface AdminNotification {
  id: string;
  batch_id?: string;
  title: string;
  message?: string | null;
  type: string;
  actor_name?: string | null;
  created_at: string;
  delivered_count?: number;
}

export interface AdminAuditLog {
  id: string;
  actor_id?: string | null;
  actor_role?: string | null;
  actor_name?: string | null;
  actor_email?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  request_ip?: string | null;
  details?: Record<string, unknown> | null;
  created_at: string;
}

export function normalizeBaseUrl(value?: string | null) {
  const base = (value || DEFAULT_API_BASE_URL).trim();
  return base.replace(/\/+$/, "");
}

export function readSession(): AdminSession {
  if (typeof window === "undefined") {
    return {
      baseUrl: normalizeBaseUrl(DEFAULT_API_BASE_URL),
      token: null,
      user: null,
    };
  }

  const baseUrl = normalizeBaseUrl(window.localStorage.getItem(STORAGE_KEYS.baseUrl));
  const token = window.localStorage.getItem(STORAGE_KEYS.token);
  const rawUser = window.localStorage.getItem(STORAGE_KEYS.user);

  let user: SessionUser | null = null;
  if (rawUser) {
    try {
      user = JSON.parse(rawUser) as SessionUser;
    } catch {
      user = null;
    }
  }

  return { baseUrl, token, user };
}

function emitSessionChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(ADMIN_SESSION_EVENT));
  }
}

export function saveSession(session: AdminSession) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.baseUrl, normalizeBaseUrl(session.baseUrl));

  if (session.token) {
    window.localStorage.setItem(STORAGE_KEYS.token, session.token);
  } else {
    window.localStorage.removeItem(STORAGE_KEYS.token);
  }

  if (session.user) {
    window.localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(session.user));
  } else {
    window.localStorage.removeItem(STORAGE_KEYS.user);
  }

  emitSessionChange();
}

export function clearSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEYS.token);
  window.localStorage.removeItem(STORAGE_KEYS.user);
  emitSessionChange();
}

function ensureAdminAccess(user: SessionUser | null) {
  if (!user?.role || !["admin", "moderator"].includes(user.role)) {
    throw new Error("هذا الحساب لا يملك صلاحية الدخول إلى لوحة الإدارة.");
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const json = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  const message =
    typeof json.message === "string"
      ? json.message
      : response.ok
        ? "تم تنفيذ الطلب بنجاح."
        : "تعذر تنفيذ الطلب.";

  if (!response.ok || json.success === false) {
    if (response.status === 401 || response.status === 403) {
      clearSession();
    }

    throw new Error(message);
  }

  return json as T;
}

export async function resolveCurrentUser(baseUrl: string, token: string) {
  const response = await fetch(`${normalizeBaseUrl(baseUrl)}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const json = await parseResponse<{ data?: SessionUser; user?: SessionUser }>(response);
  return json.data ?? json.user ?? null;
}

export async function loginWithPassword({
  baseUrl,
  email,
  password,
}: {
  baseUrl: string;
  email: string;
  password: string;
}) {
  const response = await fetch(`${normalizeBaseUrl(baseUrl)}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      password,
    }),
  });

  const json = await parseResponse<{ data?: { token?: string; user?: SessionUser } }>(response);
  const payload = json.data;

  if (!payload?.token) {
    throw new Error("الخادم لم يرجع رمز جلسة صالح.");
  }

  ensureAdminAccess(payload.user ?? null);

  const session: AdminSession = {
    baseUrl: normalizeBaseUrl(baseUrl),
    token: payload.token,
    user: payload.user ?? null,
  };

  saveSession(session);
  return session;
}

export async function saveManualToken({
  baseUrl,
  token,
}: {
  baseUrl: string;
  token: string;
}) {
  const user = await resolveCurrentUser(baseUrl, token);
  ensureAdminAccess(user);
  const session: AdminSession = {
    baseUrl: normalizeBaseUrl(baseUrl),
    token,
    user,
  };

  saveSession(session);
  return session;
}

type AdminRequestInit = Omit<RequestInit, "body"> & { body?: unknown };

export async function adminRequest<T>(
  path: string,
  init: AdminRequestInit = {},
): Promise<T> {
  const session = readSession();

  if (!session.token) {
    throw new Error("يرجى تسجيل الدخول إلى الـ Backend أولًا.");
  }

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${session.token}`);

  let body = init.body;
  if (body !== undefined && body !== null && !(body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(body);
  }

  const response = await fetch(`${session.baseUrl}/admin${path}`, {
    ...init,
    headers,
    body: body as BodyInit | null | undefined,
    cache: "no-store",
  });

  return parseResponse<T>(response);
}

export function formatDate(value?: string | null) {
  if (!value) {
    return "غير متوفر";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "غير متوفر";
  }

  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("ar-SA", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}
