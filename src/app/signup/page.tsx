"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const s = supabaseBrowser();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSignup(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setLoading(true);
    const { error } = await s.auth.signUp({ email, password });
    setLoading(false);
    if (error) return setErr(error.message);
    router.replace("/dashboard"); // ou /login se quiser que faça login depois
  }

  return (
    <main className="min-h-screen grid place-items-center bg-slate-900 text-white p-6">
      <form onSubmit={onSignup} className="w-full max-w-sm grid gap-3 bg-white/10 p-5 rounded-2xl">
        <h1 className="text-2xl font-bold">Criar Conta</h1>
        {err && <div className="text-rose-300 text-sm">❌ {err}</div>}
        <input className="rounded-xl bg-white/10 px-3 py-2" type="email" placeholder="E-mail"
          value={email} onChange={e=>setEmail(e.target.value)} required />
        <input className="rounded-xl bg-white/10 px-3 py-2" type="password" placeholder="Senha"
          value={password} onChange={e=>setPassword(e.target.value)} required />
        <button disabled={loading} className="rounded-2xl bg-white text-slate-900 py-2 font-semibold bg-white/90 hover:bg-white">
          {loading ? "Criando..." : "Criar conta"}
        </button>
      </form>
    </main>
  );
}
