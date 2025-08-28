"use client";
export const dynamic = "force-dynamic";
import { useEffect, useMemo, useState } from "react";
import { computeFitScore } from "@/lib/score";
import { supabaseBrowser } from "@/lib/supabase-browser";
const supabase = supabaseBrowser();

type Row = {
  id: string;
  name: string;
  email: string;
  p_experiencia: number;
  p_entregas: number;
  p_habilidades: number;
  e_disponibilidade: number;
  e_prazos: number;
  e_pressao: number;
  e_proatividade: number;
  c_valores: number;
  c_comunicacao: number;
  c_colaboracao: number;
  fitscore: number;
  fit_class: string;
};

type Dist = {
  total: number;
  altissimo: number;
  aprovado: number;
  questionavel: number;
  fora: number;
};

export default function CandidateDashboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [flt, setFlt] = useState("all");
  const [state, setState] = useState<"loading" | "ready" | "empty" | "error">(
    "loading"
  );

  useEffect(() => {
    (async () => {
      setState("loading");
      const { data, error } = await supabase
        .from("candidates")
        .select(
          `
          id,name,email,fitscore,fit_class,
          p_experiencia,p_entregas,p_habilidades,
          e_disponibilidade,e_prazos,e_pressao,e_proatividade,
          c_valores,c_comunicacao,c_colaboracao
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        setState("error");
        return;
      }
      if (!data || data.length === 0) {
        setRows([]);
        setState("empty");
        return;
      }
      setRows(data as any);
      setState("ready");
    })();
  }, []);

  // Enriquecer com breakdown P/E/C calculado no cliente
  const enriched = useMemo(
    () =>
      rows.map((r) => {
        const { breakdown } = computeFitScore({
          p_experiencia: r.p_experiencia,
          p_entregas: r.p_entregas,
          p_habilidades: r.p_habilidades,
          e_disponibilidade: r.e_disponibilidade,
          e_prazos: r.e_prazos,
          e_pressao: r.e_pressao,
          e_proatividade: r.e_proatividade,
          c_valores: r.c_valores,
          c_comunicacao: r.c_comunicacao,
          c_colaboracao: r.c_colaboracao,
        } as any);
        return { ...r, breakdown };
      }),
    [rows]
  );

  const list = useMemo(
    () => enriched.filter((r) => (flt === "all" ? true : r.fit_class === flt)),
    [enriched, flt]
  );

  const dist: Dist = useMemo(() => {
    const d = {
      total: enriched.length,
      altissimo: 0,
      aprovado: 0,
      questionavel: 0,
      fora: 0,
    };
    for (const r of enriched) {
      if (r.fit_class === "Fit Altíssimo") d.altissimo++;
      else if (r.fit_class === "Fit Aprovado") d.aprovado++;
      else if (r.fit_class === "Fit Questionável") d.questionavel++;
      else d.fora++;
    }
    return d;
  }, [enriched]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white">
      <div className="mx-auto max-w-7xl p-6 space-y-6">
        <header
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4
  bg-slate-800 border border-white/10 rounded-2xl px-5 py-4"
        >
          <h1 className="text-3xl font-bold text-white">Candidatos</h1>
          <div className="relative">
            <select
              value={flt}
              onChange={(e) => setFlt(e.target.value)}
              className="appearance-none rounded-xl border border-white/10 bg-slate-900 text-white px-3 py-2 pr-8
               focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
            >
              <option value="all">Todos</option>
              <option>Fit Altíssimo</option>
              <option>Fit Aprovado</option>
              <option>Fit Questionável</option>
              <option>Fora do Perfil</option>
            </select>

            {/* seta custom */}
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              ▼
            </span>
          </div>
        </header>

        {state === "loading" && <Skeleton />}
        {state === "error" && (
          <StateBox kind="error" text="Erro ao carregar. Tente novamente." />
        )}
        {state === "empty" && (
          <StateBox kind="empty" text="Nenhum candidato ainda." />
        )}

        {state === "ready" && (
          <>
            <section className="grid md:grid-cols-5 gap-4">
              <KpiCard title="Total" value={dist.total} />
              <KpiCard
                title="Fit Altíssimo"
                value={dist.altissimo}
                tone="emerald"
              />
              <KpiCard title="Fit Aprovado" value={dist.aprovado} tone="sky" />
              <KpiCard
                title="Fit Questionável"
                value={dist.questionavel}
                tone="amber"
              />
              <KpiCard title="Fora do Perfil" value={dist.fora} tone="rose" />
            </section>

            <section className="grid lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1 rounded-2xl border border-white/10 bg-white/5 p-4">
                <h2 className="font-semibold mb-2">Distribuição por Classe</h2>
                <Donut dist={dist} />
                <Legend dist={dist} />
              </div>

              <div className="lg:col-span-2 overflow-auto rounded-2xl border border-white/10 bg-white/5">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-white/5 text-slate-300">
                      <Th>Nome</Th>
                      <Th>E-mail</Th>
                      <Th>FitScore</Th>
                      <Th>Classificação</Th>
                      <Th>Breakdown P/E/C</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((r) => (
                      <tr
                        key={r.id}
                        className="border-t border-white/10 align-top hover:bg-white/5"
                      >
                        <Td>{r.name}</Td>
                        <Td className="text-slate-300">{r.email}</Td>
                        <Td className="font-semibold">
                          {r.fitscore.toFixed(2)}
                        </Td>
                        <Td>
                          <Badge cls={r.fit_class} />
                        </Td>
                        <Td>
                          <Bars
                            p={r.breakdown.P}
                            e={r.breakdown.E}
                            c={r.breakdown.C}
                            withDot
                          />
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {list.length === 0 && (
                  <div className="p-6 text-sm text-slate-400">
                    Sem resultados com esse filtro.
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

/* ---------- UI Helpers ---------- */

function Th({ children }: { children: any }) {
  return <th className="px-4 py-3 text-left font-semibold">{children}</th>;
}
function Td({ children, className }: { children: any; className?: string }) {
  return <td className={`px-4 py-3 ${className ?? ""}`}>{children}</td>;
}
function Skeleton() {
  return (
    <div className="grid gap-3">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="h-14 rounded-2xl bg-white/5 border border-white/10 animate-pulse"
        />
      ))}
    </div>
  );
}
function StateBox({ kind, text }: { kind: "error" | "empty"; text: string }) {
  const cls =
    kind === "error"
      ? "bg-rose-500/10 border-rose-400/30 text-rose-200"
      : "bg-white/5 border-white/10 text-slate-200";
  return <div className={`rounded-2xl border p-4 ${cls}`}>{text}</div>;
}
function Badge({ cls }: { cls: string }) {
  const s = cls === "Fit Altíssimo"
    ? "bg-emerald-500/10 text-emerald-300 border-emerald-400/30"
    : cls === "Fit Aprovado"
    ? "bg-sky-500/10 text-sky-300 border-sky-400/30"
    : cls === "Fit Questionável"
    ? "bg-amber-500/10 text-amber-200 border-amber-400/30"
    : "bg-rose-500/10 text-rose-200 border-rose-400/30";

  return <span className={`inline-flex items-center gap-2 rounded-full px-2 py-1 border ${s}`}>{cls}</span>;
}


/* ---------- KPIs & Donut ---------- */

function KpiCard({
  title,
  value,
  tone,
}: {
  title: string;
  value: number | string;
  tone?: "emerald" | "sky" | "amber" | "rose";
}) {
  const ring =
    tone === "emerald"
      ? "ring-emerald-400/40"
      : tone === "sky"
      ? "ring-sky-400/40"
      : tone === "amber"
      ? "ring-amber-400/40"
      : tone === "rose"
      ? "ring-rose-400/40"
      : "ring-white/20";
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/5 p-4 ring-1 ${ring}`}
    >
      <div className="text-slate-300 text-xs">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function Donut({ dist }: { dist: Dist }) {
  const total = Math.max(1, dist.total);
  const segs = [
    { label: "Altíssimo", value: dist.altissimo, color: "#10b981" }, // emerald-500
    { label: "Aprovado", value: dist.aprovado, color: "#0ea5e9" }, // sky-500
    { label: "Questionável", value: dist.questionavel, color: "#f59e0b" }, // amber-500
    { label: "Fora", value: dist.fora, color: "#f43f5e" }, // rose-500
  ];
  // Constrói os arcos em um círculo (SVG) simples
  const circumference = 2 * Math.PI * 42; // r=42
  let offset = 0;
  const arcs = segs.map((s, i) => {
    const frac = s.value / total;
    const len = circumference * frac;
    const dasharray = `${len} ${circumference - len}`;
    const strokeDashoffset = offset;
    offset -= len;
    return (
      <circle
        key={i}
        r="42"
        cx="50"
        cy="50"
        stroke={s.color}
        strokeWidth="12"
        fill="none"
        strokeDasharray={dasharray}
        strokeDashoffset={strokeDashoffset}
        transform="rotate(-90 50 50)"
        opacity={frac === 0 ? 0 : 1}
      />
    );
  });

  return (
    <div className="grid place-items-center py-2">
      <svg
        width="160"
        height="160"
        viewBox="0 0 100 100"
        className="drop-shadow"
      >
        <circle
          r="42"
          cx="50"
          cy="50"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="12"
          fill="none"
        />
        {arcs}
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="14"
          fill="#e5e7eb"
        >
          {total}
        </text>
      </svg>
    </div>
  );
}

function Legend({ dist }: { dist: Dist }) {
  const total = Math.max(1, dist.total);
  const items = [
    { label: "Fit Altíssimo", value: dist.altissimo, color: "bg-emerald-500" },
    { label: "Fit Aprovado", value: dist.aprovado, color: "bg-sky-500" },
    {
      label: "Fit Questionável",
      value: dist.questionavel,
      color: "bg-amber-500",
    },
    { label: "Fora do Perfil", value: dist.fora, color: "bg-rose-500" },
  ];
  return (
    <ul className="mt-3 grid gap-2 text-sm">
      {items.map((it) => (
        <li key={it.label} className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2">
            <span className={`inline-block h-3 w-3 rounded-sm ${it.color}`} />
            <span className="text-slate-300">{it.label}</span>
          </span>
          <span className="text-slate-200 font-medium">
            {it.value}{" "}
            <span className="text-slate-400">
              ({Math.round((it.value * 100) / total)}%)
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/* ---------- Barras com “pontinho” (marker) ---------- */

function Bars({
  p,
  e,
  c,
  withDot,
}: {
  p: number;
  e: number;
  c: number;
  withDot?: boolean;
}) {
  return (
    <div className="min-w-[260px] grid gap-3">
      <Bar label="P" value={p} color="bg-sky-500" withDot={withDot} />
      <Bar label="E" value={e} color="bg-emerald-500" withDot={withDot} />
      <Bar label="C" value={c} color="bg-amber-500" withDot={withDot} />
    </div>
  );
}

function Bar({
  label,
  value,
  color,
  withDot,
}: {
  label: string;
  value: number;
  color: string;
  withDot?: boolean;
}) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center gap-3">
      <span className="w-5 text-xs font-semibold text-slate-300">{label}</span>
      <div className="relative h-2 rounded bg-white/10 flex-1 overflow-visible">
        <div className={`h-full ${color}`} style={{ width: `${v}%` }} />
        {withDot && (
          <span
            className="absolute -top-1 h-4 w-4 rounded-full ring-2 ring-white/60 bg-white translate-x-[-50%]"
            style={{ left: `${v}%` }}
            title={`${v.toFixed(0)}%`}
          />
        )}
      </div>
      <span className="w-12 text-right text-xs text-slate-300">
        {v.toFixed(0)}%
      </span>
    </div>
  );
}
