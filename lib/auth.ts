import { supabase } from "./supabase";

export type Acesso = "ok" | "sem-login" | "nao-autorizado";

/** Mesma regra do monitoramento: precisa estar logado e ativo na lista de usuários autorizados. */
export async function verificarAcesso(): Promise<Acesso> {
  const { data } = await supabase.auth.getSession();
  if (!data.session) return "sem-login";

  const { data: autorizado } = await supabase.rpc("usuario_autorizado");
  if (autorizado !== true) {
    await supabase.auth.signOut();
    return "nao-autorizado";
  }

  return "ok";
}

export function irParaLogin() {
  window.location.replace("/login");
}

export async function sair() {
  await supabase.auth.signOut();
  irParaLogin();
}
