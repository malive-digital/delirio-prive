"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function AuthNavLink() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setIsLoggedIn(Boolean(data.session));
      }
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session));
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return (
    <Link className="login-link" href={isLoggedIn ? "/dashboard" : "/login"}>
      {isLoggedIn ? "Dashboard" : "Login"}
    </Link>
  );
}
