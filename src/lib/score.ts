export type Answers = {
  p_experiencia: number; p_entregas: number; p_habilidades: number;
  e_disponibilidade: number; e_prazos: number; e_pressao: number; e_proatividade: number;
  c_valores: number; c_comunicacao: number; c_colaboracao: number;
};

const mapLikertTo100 = (v: number) => {
  const n = Math.max(1, Math.min(5, Number(v) || 1));
  return (n - 1) * 25; // 1→0, 2→25, 3→50, 4→75, 5→100
};

export function computeFitScore(a: Answers) {
  const P = (mapLikertTo100(a.p_experiencia) + mapLikertTo100(a.p_entregas) + mapLikertTo100(a.p_habilidades)) / 3;
  const E = (mapLikertTo100(a.e_disponibilidade) + mapLikertTo100(a.e_prazos) + mapLikertTo100(a.e_pressao) + mapLikertTo100(a.e_proatividade)) / 4;
  const C = (mapLikertTo100(a.c_valores) + mapLikertTo100(a.c_comunicacao) + mapLikertTo100(a.c_colaboracao)) / 3;

  const score = Math.round((P * 0.4 + E * 0.3 + C * 0.3) * 100) / 100; // 0..100 (2 casas)
  const fit_class =
    score >= 80 ? "Fit Altíssimo" :
    score >= 60 ? "Fit Aprovado" :
    score >= 40 ? "Fit Questionável" : "Fora do Perfil";

  return { score, fit_class, breakdown: { P, E, C } };
}
