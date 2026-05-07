import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const authStorage = {
  getItem(key: string) {
    if (typeof window === "undefined") return null;

    const persistence = window.localStorage.getItem("delirioSessionPersistence");
    if (persistence === "session") {
      return window.sessionStorage.getItem(key);
    }

    return window.localStorage.getItem(key) || window.sessionStorage.getItem(key);
  },
  setItem(key: string, value: string) {
    if (typeof window === "undefined") return;

    const persistence = window.localStorage.getItem("delirioSessionPersistence");
    if (persistence === "session") {
      window.sessionStorage.setItem(key, value);
      window.localStorage.removeItem(key);
      return;
    }

    window.localStorage.setItem(key, value);
    window.sessionStorage.removeItem(key);
  },
  removeItem(key: string) {
    if (typeof window === "undefined") return;

    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: authStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
