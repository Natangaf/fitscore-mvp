"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function CreateContactPage() {
  const s = supabaseBrowser();
  const router = useRouter();
  const sp = useSearchParams();

  const [email, setEmail] = useState("");
  const [email2, setEmail2] = useState("");
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectTo = sp.get("redirect") || "/dashboard";
  const isEmailMatch = useMemo(
    () => email.trim() !== "" && email === email2,
    [email, email2]
  );
  const isPassMatch = useMemo(
    () => pass.trim() !== "" && pass === pass2,
    [pass, pass2]
  );

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setOk("");

    if (!isEmailMatch) return setErr("E-mails não conferem.");
    if (!isPassMatch) return setErr("Senhas não conferem.");
    if (pass.length < 6) return setErr("A senha deve ter pelo menos 6 caracteres.");

    try {
      setLoading(true);
      const { error } = await s.auth.signUp({ email, password: pass });
      if (error) return setErr(error.message);

      // Se confirmação de e-mail estiver ativa, o usuário receberá um link.
      setOk("Conta criada! Verifique seu e-mail (se exigido) ou prossiga.");
      // Redireciona após 1.5s
      setTimeout(() => router.replace(redirectTo), 1500);
    } catch (e: any) {
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen grid place-items-center bg-slate-900 text-white p-6">
      <form
        onSubmit={onCreate}
        className="w-full max-w-sm grid gap-3 bg-white/10 p-6 rounded-2xl border border-white/10"
      >
        <h1 className="text-2xl font-bold">createContact</h1>
        <p className="text-sm opacity-80">
          Crie sua conta usando e-mail e senha.
        </p>

        {err && (
          <div className="text-rose-300 text-sm rounded-xl bg-rose-500/10 border border-rose-400/30 p-2">
            ❌ {err}
          </div>
        )}
        {ok && (
          <div className="text-emerald-300 text-sm rounded-xl bg-emerald-500/10 border border-emerald-400/30 p-2">
            ✅ {ok}
          </div>
        )}

        <input
          className="rounded-xl bg-white/10 px-3 py-2"
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className={`rounded-xl px-3 py-2 ${
            isEmailMatch || email2 === "" ? "bg-white/10" : "bg-rose-500/10"
          }`}
          type="email"
          placeholder="Confirmar e-mail"
          value={email2}
          onChange={(e) => setEmail2(e.target.value)}
          required
        />

        <PasswordInput
          label="Senha"
          value={pass}
          onChange={setPass}
          show={showPass}
          setShow={setShowPass}
        />
        <PasswordInput
          label="Confirmar senha"
          value={pass2}
          onChange={setPass2}
          show={showPass2}
          setShow={setShowPass2}
          invalid={!isPassMatch && pass2 !== ""}
        />

        <button
          disabled={loading}
          className="rounded-2xl bg-white text-slate-900 py-2 font-semibold hover:opacity-90 transition"
        >
          {loading ? "Criando..." : "Criar conta"}
        </button>

        <p className="text-sm text-center mt-2">
          Já tem conta?{" "}
          <a
            href={`/login?redirect=${encodeURIComponent(redirectTo)}`}
            className="underline underline-offset-4"
          >
            Entrar
          </a>
        </p>
      </form>
    </main>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
  show,
  setShow,
  invalid,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  setShow: (v: boolean) => void;
  invalid?: boolean;
}) {
  return (
    <label
      className={`flex items-center gap-2 rounded-xl px-3 py-2 ${
        invalid ? "bg-rose-500/10" : "bg-white/10"
      }`}
    >
      <input
        className="bg-transparent outline-none flex-1"
        type={show ? "text" : "password"}
        placeholder={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="text-xs opacity-80 hover:opacity-100"
        aria-label={show ? "Ocultar senha" : "Mostrar senha"}
        title={show ? "Ocultar" : "Mostrar"}
      >
        {show ? "🙈" : "👁️"}
      </button>
    </label>
  );
}
