"use client";

import { useEffect, useState } from "react";
import { ADMIN_SESSION_EVENT, AdminSession, readSession } from "@/lib/api";

export function useAdminSession() {
  const [session, setSession] = useState<AdminSession>(() => readSession());

  useEffect(() => {
    const updateSession = () => setSession(readSession());

    updateSession();
    window.addEventListener(ADMIN_SESSION_EVENT, updateSession);
    return () => window.removeEventListener(ADMIN_SESSION_EVENT, updateSession);
  }, []);

  return {
    ...session,
    isAuthenticated: Boolean(session.token),
  };
}
