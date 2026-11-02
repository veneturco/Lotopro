const { ejecutarWalkForward } = require('./benchmark_walkforward.cjs');

console.log("=== ANÁLISIS DE FILTRADO Y PENALIZACIÓN INTRA-JORNADA ===");

const penalties = [
  { label: "Sin penalización (todos 1.0)", params: { intra_penalty_lag0: 1.0, intra_penalty_today: 1.0, intra_penalty_lag8_11: 1.0 } },
  { label: "Solo castigo Lag 0 (0.1) y Today (1.0)", params: { intra_penalty_lag0: 0.10, intra_penalty_today: 1.0, intra_penalty_lag8_11: 1.0 } },
  { label: "Baseline actual (lag0: 0.28, today: 0.48, lag8-11: 0.82)", params: { intra_penalty_lag0: 0.28, intra_penalty_today: 0.48, intra_penalty_lag8_11: 0.82 } },
  { label: "Bloqueo duro Lag 0 (0.01) y Today (0.20)", params: { intra_penalty_lag0: 0.01, intra_penalty_today: 0.20, intra_penalty_lag8_11: 0.70 } },
  { label: "Bloqueo estricto intra-día (lag0: 0.0, today: 0.10, lag8-11: 0.50)", params: { intra_penalty_lag0: 0.00, intra_penalty_today: 0.10, intra_penalty_lag8_11: 0.50 } },
  { label: "Bloqueo total absoluto intra-día (lag0: 0.0, today: 0.0, lag8-11: 0.80)", params: { intra_penalty_lag0: 0.00, intra_penalty_today: 0.00, intra_penalty_lag8_11: 0.80 } },
  { label: "Bloqueo total intra-día con Rank 1-2-3 puro", params: { intra_penalty_lag0: 0.00, intra_penalty_today: 0.00, intra_penalty_lag8_11: 0.80, tactica_defensa: "prob_pura", tactica_batacazo: "prob_pura" } },
  { label: "Castigo moderado (lag0: 0.05, today: 0.30) con Rank 1-2-3 puro", params: { intra_penalty_lag0: 0.05, intra_penalty_today: 0.30, intra_penalty_lag8_11: 0.80, tactica_defensa: "prob_pura", tactica_batacazo: "prob_pura" } },
  { label: "Sin penalización alguna con Rank 1-2-3 puro", params: { intra_penalty_lag0: 1.0, intra_penalty_today: 1.0, intra_penalty_lag8_11: 1.0, tactica_defensa: "prob_pura", tactica_batacazo: "prob_pura" } }
];

penalties.forEach(p => {
  const res = ejecutarWalkForward(p.params);
  console.log(`[${p.label}] -> Top3: ${res.pTop3}% (Edge: ${res.edge}%, Lift: ${res.lift}x) | Fijo: ${res.hitsFijo}, Def: ${res.hitsDefensa}, Bat: ${res.hitsBatacazo}`);
});
