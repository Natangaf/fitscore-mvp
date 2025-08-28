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
  const [err, setErr] = useState(""); 
  const [loading, setLoading] = useState(false);

  const redirectTo = sp.get("redirect") || "/dashboard";

  async function onLogin(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setLoading(true);
    const { error } = await s.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setErr(error.message);
    router.replace(redirectTo);
  }

  async function onSignup(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setLoading(true);
    const { error } = await s.auth.signUp({ email, password });
    setLoading(false);
    if (error) return setErr(error.message);
    router.replace(redirectTo);
  }

  return (
    <main className="min-h-screen grid place-items-center bg-slate-900 text-white p-6">
      <form onSubmit={onLogin} className="w-full max-w-sm grid gap-3 bg-white/10 p-5 rounded-2xl">
        <h1 className="text-2xl font-bold">Entrar</h1>
        {err && <div className="text-rose-300 text-sm">❌ {err}</div>}
        <input className="rounded-xl bg-white/10 px-3 py-2" type="email" placeholder="E-mail"
          value={email} onChange={e=>setEmail(e.target.value)} required />
        <input className="rounded-xl bg-white/10 px-3 py-2" type="password" placeholder="Senha"
          value={password} onChange={e=>setPassword(e.target.value)} required />
        <button disabled={loading} className="rounded-2xl bg-white text-slate-900 py-2 font-semibold">
          {loading ? "Entrando..." : "Entrar"}
        </button>
        <button onClick={onSignup} className="rounded-2xl border border-white/30 py-2">
          Criar conta
        </button>
      </form>
    </main>
  );
}
