const { ejecutarWalkForward } = require('./benchmark_walkforward.cjs');

console.log("=== ANÁLISIS DE ROLES Y SELECCIÓN TÁCTICA ===");

const configs = [
  { label: "Baseline (ortogonal + atraso_critico pool 12)", params: {} },
  { label: "Defensa Prob Pura (Top 2 puro) + Batacazo Atraso", params: { tactica_defensa: "prob_pura" } },
  { label: "Top 3 Prob Pura (Rank 1, 2, 3 puros por score)", params: { tactica_defensa: "prob_pura", tactica_batacazo: "prob_pura" } },
  { label: "Defensa Ortogonal + Batacazo Prob Pura (Rank 3)", params: { tactica_defensa: "ortogonal", tactica_batacazo: "prob_pura" } },
  { label: "Batacazo Jaula Híbrida (pool 8)", params: { tactica_batacazo: "jaula_hibrida", batacazo_pool_size: 8 } },
  { label: "Batacazo Atraso Crítico Pool 6", params: { tactica_batacazo: "atraso_critico", batacazo_pool_size: 6 } }
];

configs.forEach(c => {
  const res = ejecutarWalkForward(c.params);
  console.log(`[${c.label}] -> Top3: ${res.pTop3}% (Edge: ${res.edge}%, Lift: ${res.lift}x) | Fijo: ${res.hitsFijo}, Def: ${res.hitsDefensa}, Bat: ${res.hitsBatacazo}`);
});
