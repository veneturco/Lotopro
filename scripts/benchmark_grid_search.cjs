/**
 * benchmark_grid_search.cjs
 * Grid Search Exhaustivo & Optimización Bayesiana / Coordenadas
 * para encontrar la combinación matemática con el máximo rendimiento estadístico
 */

const { evaluarConfiguracion } = require('./test_advanced_architectures.cjs');

console.log("=== INICIANDO GRID SEARCH DE HIPERPARÁMETROS ===");

const bestResults = [];

// Rango de búsqueda
const w_freq_vals = [0.20, 0.25, 0.30, 0.35];
const w_atraso_vals = [0.10, 0.15, 0.20, 0.25];
const w_markov_vals = [0.20, 0.25, 0.30, 0.35];
const m2_weights = [0.50, 0.65, 0.80];
const ventanas = [0, 57, 76, 114];
const batacazo_modes = ["pura", "resonancia_madura"];
const pen_hoy_vals = [0.30, 0.50, 0.70];

let totalComb = 0;

for (const w_f of w_freq_vals) {
  for (const w_a of w_atraso_vals) {
    for (const w_m of w_markov_vals) {
      for (const m2_w of m2_weights) {
        for (const vent of ventanas) {
          for (const bat_m of batacazo_modes) {
            for (const pen_h of pen_hoy_vals) {
              totalComb++;
              
              const m1_w = Math.max(0.05, (1 - m2_w) * 0.5);
              const m12_w = (1 - m2_w - m1_w) * 0.5;
              const m24_w = m12_w;

              const cfg = {
                w_freq: w_f,
                w_atraso: w_a,
                w_markov: w_m,
                w_cross: 0.08,
                w_hora: 0.06,
                w_geom: 0.06,
                m1_w,
                m2_w,
                m12_w,
                m24_w,
                pen_lag0: 0.05,
                pen_hoy: pen_h,
                ventana_memoria: vent,
                defensa_mode: "pura",
                batacazo_mode: bat_m
              };

              const res = evaluarConfiguracion(cfg);
              const pTop3 = parseFloat(res.pTop3);

              if (pTop3 >= 8.8) {
                bestResults.push({
                  pTop3,
                  edge: res.edge,
                  lift: res.lift,
                  hitsFijo: res.hitsFijo,
                  hitsDef: res.hitsDef,
                  hitsBat: res.hitsBat,
                  cfg
                });
              }
            }
          }
        }
      }
    }
  }
}

console.log(`Total combinaciones evaluadas: ${totalComb}`);
console.log(`Configuraciones destacadas (>= 8.8% Top 3): ${bestResults.length}`);

bestResults.sort((a, b) => b.pTop3 - a.pTop3);

console.log("\n=== TOP 10 MEJORES CONFIGURACIONES ENCONTRADAS ===");
bestResults.slice(0, 10).forEach((item, idx) => {
  console.log(`\n#${idx + 1} -> Top3: ${item.pTop3}% (Edge: +${item.edge}%, Lift: ${item.lift}x) | Fijo: ${item.hitsFijo}, Def: ${item.hitsDef}, Bat: ${item.hitsBat}`);
  console.log(`Parámetros:`, JSON.stringify(item.cfg, null, 2));
});
