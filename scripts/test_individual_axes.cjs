const { ejecutarWalkForward } = require('./benchmark_walkforward.cjs');

console.log("=== DESGLOSE DE IMPACTO DE CADA EJE INDIVIDUAL ===");

const axes = [
  { name: "1. Frecuencia pura", params: { w_freq: 1, w_atraso: 0, w_markov: 0, w_granjita: 0, w_tercio: 0, w_color: 0, w_horario: 0 } },
  { name: "2. Atraso puro", params: { w_freq: 0, w_atraso: 1, w_markov: 0, w_granjita: 0, w_tercio: 0, w_color: 0, w_horario: 0 } },
  { name: "3. Markov puro (M1, M2, M12)", params: { w_freq: 0, w_atraso: 0, w_markov: 1, w_granjita: 0, w_tercio: 0, w_color: 0, w_horario: 0 } },
  { name: "4. Cruce Granjita puro", params: { w_freq: 0, w_atraso: 0, w_markov: 0, w_granjita: 1, w_tercio: 0, w_color: 0, w_horario: 0 } },
  { name: "5. Ley del Tercio pura", params: { w_freq: 0, w_atraso: 0, w_markov: 0, w_granjita: 0, w_tercio: 1, w_color: 0, w_horario: 0 } },
  { name: "6. Color/Familia/Cilindro puro", params: { w_freq: 0, w_atraso: 0, w_markov: 0, w_granjita: 0, w_tercio: 0, w_color: 1, w_horario: 0 } },
  { name: "7. Horario puro", params: { w_freq: 0, w_atraso: 0, w_markov: 0, w_granjita: 0, w_tercio: 0, w_color: 0, w_horario: 1 } },
  { name: "Markov M1 inmediato puro", params: { w_freq: 0, w_atraso: 0, w_markov: 1, w_granjita: 0, w_tercio: 0, w_color: 0, w_horario: 0, m1_weight: 1, m2_weight: 0, m12_weight: 0, m24_weight: 0 } },
  { name: "Markov M2 (salto t-2) puro", params: { w_freq: 0, w_atraso: 0, w_markov: 1, w_granjita: 0, w_tercio: 0, w_color: 0, w_horario: 0, m1_weight: 0, m2_weight: 1, m12_weight: 0, m24_weight: 0 } },
  { name: "Markov M12 (24h circadiano) puro", params: { w_freq: 0, w_atraso: 0, w_markov: 1, w_granjita: 0, w_tercio: 0, w_color: 0, w_horario: 0, m1_weight: 0, m2_weight: 0, m12_weight: 1, m24_weight: 0 } },
  { name: "Markov M24 (48h) puro", params: { w_freq: 0, w_atraso: 0, w_markov: 1, w_granjita: 0, w_tercio: 0, w_color: 0, w_horario: 0, m1_weight: 0, m2_weight: 0, m12_weight: 0, m24_weight: 1 } }
];

axes.forEach(a => {
  const res = ejecutarWalkForward({
    ...a.params,
    tactica_defensa: "prob_pura",
    tactica_batacazo: "prob_pura",
    intra_penalty_lag0: 1.0,
    intra_penalty_today: 1.0,
    intra_penalty_lag8_11: 1.0
  });
  console.log(`[${a.name}] -> Top3: ${res.pTop3}% (Edge: ${res.edge}%, Lift: ${res.lift}x) | Fijo: ${res.hitsFijo}, Def: ${res.hitsDefensa}, Bat: ${res.hitsBatacazo}`);
});
