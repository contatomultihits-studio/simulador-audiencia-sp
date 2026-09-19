import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ojtdpnrjulrlhxvbmsnr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable__wHVCP34l1kq_GzfdVme6A_8ml6AfYJ";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    global: {
      fetch: (input, init = {}) =>
        fetch(input, {
          ...init,
          cache: "no-store",
          headers: {
            ...(init.headers ?? {}),
            "Cache-Control": "no-cache",
            "Pragma": "no-cache"
          }
        })
    }
  }
);
