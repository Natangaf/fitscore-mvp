"use client";
import { useEffect, useMemo, useState } from "react";
import { computeFitScore } from "@/lib/score";
import { supabaseBrowser } from "@/lib/supabase-browser";
const supabase = supabaseBrowser();

type Row = {
  id: string; name: string; email: string;
  p_experiencia: number; p_entregas: number; p_habilidades: number;
  e_disponibilidade: number; e_prazos: number; e_pressao: number; e_proatividade: number;
  c_valores: number; c_comunicacao: number; c_colaboracao: number;
  fitscore: number; fit_class: string;
};

export default function CandidateDashboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [flt, setFlt] = useState("all");
  const [state, setState] = useState<"loading"|"ready"|"empty"|"error">("loading");

  useEffect(() => {
    (async () => {
      setState("loading");
      const { data, error } = await supabase
        .from("candidates")
        .select(`
          id,name,email,fitscore,fit_class,
          p_experiencia,p_entregas,p_habilidades,
          e_disponibilidade,e_prazos,e_pressao,e_proatividade,
          c_valores,c_comunicacao,c_colaboracao
        `)
        .order("created_at", { ascending: false });

      if (error) { setState("error"); return; }
      if (!data || data.length === 0) { setRows([]); setState("empty"); return; }
      setRows(data as any); setState("ready");
    })();
  }, []);

  const list = useMemo(
    () => rows
      .map(r => {
        const { breakdown } = computeFitScore({
          p_experiencia: r.p_experiencia, p_entregas: r.p_entregas, p_habilidades: r.p_habilidades,
          e_disponibilidade: r.e_disponibilidade, e_prazos: r.e_prazos, e_pressao: r.e_pressao, e_proatividade: r.e_proatividade,
          c_valores: r.c_valores, c_comunicacao: r.c_comunicacao, c_colaboracao: r.c_colaboracao,
        } as any);
        return { ...r, breakdown };
      })
      .filter(r => flt === "all" ? true : r.fit_class === flt),
    [rows, flt]
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl p-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Candidatos</h1>
          <select value={flt} onChange={e=>setFlt(e.target.value)} className="rounded-xl border px-3 py-2 bg-white">
            <option value="all">Todos</option>
            <option>Fit Altíssimo</option>
            <option>Fit Aprovado</option>
            <option>Fit Questionável</option>
            <option>Fora do Perfil</option>
          </select>
        </header>

        {state === "loading" && <Skeleton />}
        {state === "error" && <StateBox kind="error" text="Erro ao carregar. Tente novamente." />}
        {state === "empty" && <StateBox kind="empty" text="Nenhum candidato ainda." />}

        {state === "ready" && (
          <div className="overflow-auto rounded-2xl border bg-white">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-600">
                  <Th>Nome</Th><Th>E-mail</Th><Th>FitScore</Th><Th>Classificação</Th><Th>Breakdown P/E/C</Th>
                </tr>
              </thead>
              <tbody>
                {list.map(r => (
                  <tr key={r.id} className="border-t align-top hover:bg-slate-50">
                    <Td>{r.name}</Td>
                    <Td>{r.email}</Td>
                    <Td>{r.fitscore.toFixed(2)}</Td>
                    <Td><Badge cls={r.fit_class} /></Td>
                    <Td>
                      <Bars p={r.breakdown.P} e={r.breakdown.E} c={r.breakdown.C} />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
            {list.length === 0 && <div className="p-6 text-sm text-slate-500">Sem resultados com esse filtro.</div>}
          </div>
        )}
      </div>
    </main>
  );
}

function Th({ children }: { children: any }) { return <th className="px-4 py-3 text-left font-semibold">{children}</th>; }
function Td({ children }: { children: any }) { return <td className="px-4 py-3">{children}</td>; }
function Skeleton(){ return <div className="grid gap-3">{[...Array(4)].map((_,i)=><div key={i} className="h-12 rounded-xl bg-slate-200 animate-pulse"/>)}</div>; }
function StateBox({kind,text}:{kind:"error"|"empty";text:string}){ return <div className={`rounded-2xl border p-4 ${kind==="error"?"bg-rose-50 border-rose-200":"bg-slate-50 border-slate-200"}`}>{text}</div>; }
function Badge({cls}:{cls:string}){ const s=cls==="Fit Altíssimo"?"bg-emerald-50 text-emerald-700 border border-emerald-200":cls==="Fit Aprovado"?"bg-sky-50 text-sky-700 border border-sky-200":cls==="Fit Questionável"?"bg-amber-50 text-amber-800 border border-amber-200":"bg-rose-50 text-rose-700 border border-rose-200"; return <span className={`inline-flex items-center gap-2 rounded-full px-2 py-1 ${s}`}>{cls}</span>; }

function Bars({ p, e, c }: { p: number; e: number; c: number }) {
  return (
    <div className="min-w-[220px] grid gap-2">
      <Bar label="P" value={p} />
      <Bar label="E" value={e} />
      <Bar label="C" value={c} />
    </div>
  );
}
function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-4 text-xs font-semibold text-slate-600">{label}</span>
      <div className="h-2 flex-1 rounded bg-slate-200 overflow-hidden">
        <div className="h-full" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
      <span className="w-12 text-right text-xs text-slate-600">{value.toFixed(0)}%</span>
    </div>
  );
}
