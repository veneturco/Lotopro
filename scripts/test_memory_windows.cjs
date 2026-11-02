const { ejecutarWalkForward } = require('./benchmark_walkforward.cjs');

console.log("=== ANÁLISIS DE VENTANAS DINÁMICAS DE MEMORIA ===");

const windows = [38, 57, 76, 114, 152, 228, 300, 500, 0];

windows.forEach(w => {
  const label = w === 0 ? "Todo el histórico (1416)" : `Últimos ${w} sorteos`;
  const res = ejecutarWalkForward({
    ventana_memoria: w,
    tactica_defensa: "prob_pura",
    tactica_batacazo: "prob_pura"
  });
  console.log(`[${label}] -> Top3: ${res.pTop3}% (Edge: ${res.edge}%, Lift: ${res.lift}x) | Fijo: ${res.hitsFijo}, Def: ${res.hitsDefensa}, Bat: ${res.hitsBatacazo}`);
});
