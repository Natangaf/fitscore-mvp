"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function LoginPage() {
  const s = supabaseBrowser();
  const router = useRouter();
  const sp = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [err, setErr] = useState("");
  const [loadingPwd, setLoadingPwd] = useState(false);

  const redirectTo = sp.get("redirect") || "/dashboard";

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoadingPwd(true);
    const { error } = await s.auth.signInWithPassword({ email, password });
    setLoadingPwd(false);
    if (error) return setErr(error.message);
    router.refresh();
    router.replace(redirectTo);
  }

  return (
    <main className="min-h-screen grid place-items-center bg-slate-900 text-white p-6">
      <section className="w-full max-w-sm grid gap-4 bg-white/10 p-6 rounded-2xl border border-white/10">
        <h1 className="text-2xl font-bold">Entrar</h1>
        <p className="text-sm opacity-80">Use seu e-mail e senha para acessar o dashboard.</p>

        {err && (
          <div className="text-rose-300 text-sm rounded-xl bg-rose-500/10 border border-rose-400/30 p-2">
            ❌ {err}
          </div>
        )}

        <form onSubmit={onLogin} className="grid gap-3">
          <input
            className="rounded-xl bg-white/10 px-3 py-2 outline-none"
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <label className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2">
            <input
              className="bg-transparent outline-none flex-1"
              type={showPass ? "text" : "password"}
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              className="text-xs opacity-80 hover:opacity-100"
              aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
              title={showPass ? "Ocultar" : "Mostrar"}
            >
              {showPass ? "🙈" : "👁️"}
            </button>
          </label>

          <button
            disabled={loadingPwd}
            className="rounded-2xl bg-white text-slate-900 py-2 font-semibold hover:opacity-90 transition"
          >
            {loadingPwd ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <div className="flex items-center justify-between text-xs opacity-80">
          <a
            href={`/create-contact?redirect=${encodeURIComponent(redirectTo)}`}
            className="underline underline-offset-4"
          >
            Criar Conta
          </a>
          <a href="/reset-password" className="underline underline-offset-4">
            Esqueci minha senha
          </a>
        </div>
      </section>
    </main>
  );
}
