import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ojtdpnrjulrlhxvbmsnr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable__wHVCP34l1kq_GzfdVme6A_8ml6AfYJ";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      // Login com os mesmos usuários do monitoramento: a sessão fica salva no navegador.
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storageKey: "simulador-audiencia-sp-auth"
    }
  }
);
