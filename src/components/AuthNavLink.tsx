"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function AuthNavLink() {
  const [navTarget, setNavTarget] = useState({ href: "/login", label: "Login" });

  useEffect(() => {
    let isMounted = true;

    const resolveNavTarget = async (userId?: string, userEmail?: string | null) => {
      if (!userId) {
        if (isMounted) setNavTarget({ href: "/login", label: "Login" });
        return;
      }

      const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "admin@delirioprive.com")
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);
      const [roleResult, legacyAdminResult] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle(),
        supabase.from("admin_users").select("user_id").eq("user_id", userId).maybeSingle(),
      ]);
      const isAdmin =
        roleResult.data?.role === "admin" ||
        Boolean(legacyAdminResult.data) ||
        adminEmails.includes((userEmail || "").toLowerCase());

      if (isMounted) {
        setNavTarget({ href: isAdmin ? "/admin" : "/dashboard", label: "Dashboard" });
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      resolveNavTarget(data.session?.user.id, data.session?.user.email);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      resolveNavTarget(session?.user.id, session?.user.email);
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return (
    <Link className="login-link" href={navTarget.href}>
      {navTarget.label}
    </Link>
  );
}
