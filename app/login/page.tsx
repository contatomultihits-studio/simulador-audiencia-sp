"use client";

import { useEffect, useState } from "react";
import { verificarAcesso } from "../../lib/auth";
import { supabase } from "../../lib/supabase";

const MSG_NAO_AUTORIZADO = "❌ Acesso não autorizado. Fale com o administrador.";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Se já estiver logado e autorizado, vai direto para o simulador.
  useEffect(() => {
    verificarAcesso().then((acesso) => {
      if (acesso === "ok") window.location.replace("/");
    });
  }, []);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro("");

    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    if (error) {
      setEnviando(false);
      setErro("❌ E-mail ou senha incorretos. Tente novamente.");
      return;
    }

    const acesso = await verificarAcesso();
    if (acesso !== "ok") {
      setEnviando(false);
      setErro(MSG_NAO_AUTORIZADO);
      return;
    }

    window.location.replace("/");
  }

  return (
    <div className="login-page">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" precedence="default" />
      <div className="login-box">
        <div className="login-brand">
          <div className="login-logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D0FF03" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" /><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" /><circle cx="12" cy="12" r="2" /><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" /><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" /></svg>
          </div>
          <h1>IA NO RÁDIO</h1>
          <p>Audiência SP · Acesso Restrito</p>
        </div>

        <div className="login-card">
          <h2>Entrar na plataforma</h2>

          {erro ? <div className="login-alerta" role="alert">{erro}</div> : null}

          <form onSubmit={entrar} autoComplete="on">
            <label className="login-campo">
              <span>E-mail</span>
              <div className="login-input">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                <input type="email" autoComplete="email" placeholder="seu@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </label>
            <label className="login-campo">
              <span>Senha</span>
              <div className="login-input">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                <input type="password" autoComplete="current-password" placeholder="••••••••" required value={senha} onChange={(e) => setSenha(e.target.value)} />
              </div>
            </label>
            <button type="submit" className="login-botao" disabled={enviando}>
              {enviando ? (
                <><svg className="login-spin" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg> Entrando...</>
              ) : (
                <><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" x2="3" y1="12" y2="12" /></svg> Entrar</>
              )}
            </button>
          </form>
        </div>

        <p className="login-rodape">IA NO RÁDIO · Acesso autorizado apenas para usuários cadastrados</p>
      </div>
    </div>
  );
}
