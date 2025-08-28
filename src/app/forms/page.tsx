"use client";
import { useState } from "react";
import { computeFitScore } from "@/lib/score";
import { supabaseBrowser } from "@/lib/supabase-browser";
const supabase = supabaseBrowser();

type State = "idle" | "loading" | "success" | "error";

const likert = [
  { v: 1, t: "Discordo totalmente" },
  { v: 2, t: "Discordo parcialmente" },
  { v: 3, t: "Neutro / depende" },
  { v: 4, t: "Concordo" },
  { v: 5, t: "Concordo totalmente" },
];

export default function FitScoreForm() {
  const [state, setState] = useState<State>("idle");
  const [err, setErr] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setState("loading"); setErr("");
    const fd = new FormData(e.currentTarget);

    const payload = {
      name: String(fd.get("name") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      p_experiencia: Number(fd.get("p_experiencia")),
      p_entregas: Number(fd.get("p_entregas")),
      p_habilidades: Number(fd.get("p_habilidades")),
      e_disponibilidade: Number(fd.get("e_disponibilidade")),
      e_prazos: Number(fd.get("e_prazos")),
      e_pressao: Number(fd.get("e_pressao")),
      e_proatividade: Number(fd.get("e_proatividade")),
      c_valores: Number(fd.get("c_valores")),
      c_comunicacao: Number(fd.get("c_comunicacao")),
      c_colaboracao: Number(fd.get("c_colaboracao")),
    };

    const { score, fit_class } = computeFitScore(payload as any);

    const { error } = await supabase.from("candidates").insert({
      ...payload, fitscore: score, fit_class,
    });
    if (error) { setErr(error.message); setState("error"); return; }

    const webhook = process.env.NEXT_PUBLIC_N8N_WEBHOOK_ONSUBMIT;
    if (webhook) {
      fetch(webhook, { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, fitscore: score, fit_class }) }).catch(()=>{});
    }

    setState("success"); (e.target as HTMLFormElement).reset();
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white">
      <div className="mx-auto max-w-3xl p-6">
        <h1 className="text-3xl font-bold mb-2">Formulário FitScore</h1>
        <p className="text-slate-300 mb-6">Avaliação preditiva — Performance • Energia • Cultura</p>

        {state === "loading" && <div className="mb-4 animate-pulse">Enviando…</div>}
        {state === "success" && <div className="mb-4 rounded-xl border border-emerald-400/40 bg-emerald-500/10 p-3">✅ Respostas enviadas!</div>}
        {state === "error" && <div className="mb-4 rounded-xl border border-rose-400/40 bg-rose-500/10 p-3">❌ {err}</div>}

        <form onSubmit={onSubmit} className="space-y-6">
          <Card title="Dados">
            <input name="name" placeholder="Nome" required className="rounded-xl bg-white/10 px-3 py-2 outline-none" />
            <input type="email" name="email" placeholder="E-mail" required className="rounded-xl bg-white/10 px-3 py-2 outline-none" />
          </Card>

          <Card title="Performance">
            <Likert name="p_experiencia" label="Tenho experiência prática relevante para esta vaga/stack." />
            <Likert name="p_entregas" label="Costumo conduzir entregas de ponta a ponta, com autonomia e qualidade." />
            <Likert name="p_habilidades" label="Tenho profundidade técnica para tomar decisões de arquitetura e trade-offs." />
          </Card>

          <Card title="Energia">
            <Likert name="e_disponibilidade" label="Tenho disponibilidade e mantenho um ritmo consistente de trabalho." />
            <Likert name="e_prazos" label="Cumpro prazos e combinados com disciplina." />
            <Likert name="e_pressao" label="Mantenho qualidade sob pressão e prazos apertados." />
            <Likert name="e_proatividade" label="Sou proativo: antecipo riscos e comunico cedo." />
          </Card>

          <Card title="Cultura (LEGAL)">
            <Likert name="c_valores" label="Me identifico com os valores e a cultura LEGAL." />
            <Likert name="c_comunicacao" label="Comunico com clareza e busco alinhamento." />
            <Likert name="c_colaboracao" label="Colaboro ativamente e valorizo feedbacks." />
          </Card>

          <button className="w-full rounded-2xl bg-white text-slate-900 font-semibold py-3 hover:opacity-90 transition" disabled={state === "loading"}>
            Enviar respostas
          </button>
        </form>
      </div>
    </main>
  );
}

function Card({ title, children }: { title: string; children: any }) {
  return (
    <section className="grid gap-3 rounded-2xl p-4 bg-white/5 border border-white/10">
      <h2 className="font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Likert({ name, label }: { name: string; label: string }) {
  return (
    <fieldset className="grid gap-2">
      <legend className="text-sm">{label}</legend>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        {likert.map(opt => (
          <label key={opt.v} className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 cursor-pointer">
            <input type="radio" name={name} value={opt.v} required />
            <span className="text-sm">{opt.t}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
