"use client";

import * as React from "react";
import { useAuthStore } from "@/lib/stores/auth-store";

export function AuthInitializer() {
  const { login, isAuthenticated } = useAuthStore();

  React.useEffect(() => {
    const autoLogin = async () => {
      if (isAuthenticated) return;

      let email = localStorage.getItem("anonymous_email");
      if (!email) {
        email = `anon_${crypto.randomUUID().slice(0, 8)}@plancraft.app`;
        localStorage.setItem("anonymous_email", email);
      }

      await login(email, "");
    };

    autoLogin();
  }, [isAuthenticated, login]);

  return null;
}
