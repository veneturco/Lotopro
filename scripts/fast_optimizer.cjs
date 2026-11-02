const fs = require('fs');

const rawData = JSON.parse(fs.readFileSync('C:/Users/Personal/historicoBase.json', 'utf8'));

function normId(raw) {
  if (!raw) return null;
  const s = String(raw).trim();
  if (s === '00' || s === '37') return '00';
  if (s === '0') return '0';
  const n = parseInt(s, 10);
  return (!isNaN(n) && n >= 0 && n <= 36) ? String(n) : null;
}

const dataset = rawData.map(item => ({
  la: normId(item.number_animal),
  gr: normId(item.gr),
  hora: item.time_s,
  fecha: item.date_result
})).filter(x => Boolean(x.la));

const N_DATA = dataset.length;
const KEYS = [
  '0', '00', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
  '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
  '21', '22', '23', '24', '25', '26', '27', '28', '29', '30',
  '31', '32', '33', '34', '35', '36'
];
const K = 38;
const P_UNIF = 1.0 / K;
const KEY_TO_IDX = {};
KEYS.forEach((k, i) => { KEY_TO_IDX[k] = i; });

const laIndices = new Int32Array(N_DATA);
const grIndices = new Int32Array(N_DATA);
for (let i = 0; i < N_DATA; i++) {
  laIndices[i] = KEY_TO_IDX[dataset[i].la];
  grIndices[i] = dataset[i].gr && KEY_TO_IDX[dataset[i].gr] !== undefined ? KEY_TO_IDX[dataset[i].gr] : -1;
}

console.log('Precalentado en C:, sorteos:', N_DATA);

function runEval(w_freq, w_atraso, w_m1, w_m2, w_cross, pen_hoy, bat_mode) {
  const startIdx = 100;
  const total = N_DATA - startIdx;
  let hitsFijo = 0, hitsDef = 0, hitsBat = 0, hitsTop3 = 0;

  const countsLA = new Int32Array(K);
  const lastSeen = new Int32Array(K).fill(-1);
  const transM1 = new Int32Array(K * K);
  const transM2 = new Int32Array(K * K);
  const transCross = new Int32Array(K * K);
  const totalM1 = new Int32Array(K);
  const totalM2 = new Int32Array(K);
  const totalCross = new Int32Array(K);

  for (let i = 0; i < startIdx; i++) {
    const curr = laIndices[i];
    countsLA[curr]++;
    lastSeen[curr] = i;
    if (i >= 1) {
      const p1 = laIndices[i - 1];
      transM1[p1 * K + curr]++;
      totalM1[p1]++;
    }
    if (i >= 2) {
      const p2 = laIndices[i - 2];
      transM2[p2 * K + curr]++;
      totalM2[p2]++;
    }
    if (i >= 1 && grIndices[i - 1] >= 0) {
      const g = grIndices[i - 1];
      transCross[g * K + curr]++;
      totalCross[g]++;
    }
  }

  let currentDate = dataset[startIdx - 1].fecha;
  const seenToday = new Uint8Array(K);

  const scores = new Float32Array(K);
  const atrasos = new Int32Array(K);
  const order = new Int32Array(K);

  for (let idx = startIdx; idx < N_DATA; idx++) {
    const fecha = dataset[idx].fecha;
    if (fecha !== currentDate) {
      currentDate = fecha;
      seenToday.fill(0);
    }

    const p1 = laIndices[idx - 1];
    const p2 = laIndices[idx - 2];
    const g1 = grIndices[idx - 1];
    const subN = idx;

    const totM1_p1 = totalM1[p1];
    const totM2_p2 = totalM2[p2];
    const totCross_g = g1 >= 0 ? totalCross[g1] : 0;

    const offM1 = p1 * K;
    const offM2 = p2 * K;
    const offCross = g1 >= 0 ? g1 * K : -1;

    for (let k = 0; k < K; k++) {
      const atr = idx - 1 - lastSeen[k];
      atrasos[k] = atr;

      // Frecuencia
      const sFreq = (countsLA[k] / subN) / P_UNIF;

      // Atraso harmónico
      let sAtr = 0.50;
      if (atr >= 9 && atr <= 24) sAtr = 1.0;
      else if (atr >= 25 && atr <= 42) sAtr = 0.72;
      else if (atr > 42 && atr <= 65) sAtr = 0.50;
      else if (atr > 65) sAtr = 0.35;
      else if (atr >= 1 && atr <= 8) sAtr = 0.20;
      else sAtr = 0.02;

      // Markov 1 y 2
      const sM1 = ((transM1[offM1 + k] + 1) / (totM1_p1 + K)) / P_UNIF;
      const sM2 = ((transM2[offM2 + k] + 1) / (totM2_p2 + K)) / P_UNIF;

      // Cruce
      let sCross = 1.0;
      if (offCross >= 0) {
        sCross = ((transCross[offCross + k] + 1) / (totCross_g + K)) / P_UNIF;
      }

      let sc = w_freq * sFreq + w_atraso * sAtr + w_m1 * sM1 + w_m2 * sM2 + w_cross * sCross;
      if (seenToday[k]) sc *= pen_hoy;
      if (k === p1) sc *= 0.05;

      scores[k] = sc;
      order[k] = k;
    }

    // Ordenar top 3
    order.sort((a, b) => scores[b] - scores[a]);

    const fijo = order[0];
    const defensa = order[1];
    let batacazo;

    if (bat_mode === 1) { // resonancia madura
      batacazo = order[2];
      for (let i = 2; i < 10; i++) {
        const cand = order[i];
        if (atrasos[cand] >= 12 && atrasos[cand] <= 24) {
          batacazo = cand;
          break;
        }
      }
    } else {
      batacazo = order[2];
    }

    const actual = laIndices[idx];
    if (actual === fijo) hitsFijo++;
    if (actual === defensa) hitsDef++;
    if (actual === batacazo) hitsBat++;
    if (actual === fijo || actual === defensa || actual === batacazo) hitsTop3++;

    // Update
    countsLA[actual]++;
    lastSeen[actual] = idx;
    seenToday[actual] = 1;

    transM1[offM1 + actual]++;
    totalM1[p1]++;
    transM2[offM2 + actual]++;
    totalM2[p2]++;
    if (offCross >= 0) {
      transCross[offCross + actual]++;
      totalCross[g1]++;
    }
  }

  const pTop3 = (hitsTop3 / total) * 100;
  return {
    pTop3: pTop3.toFixed(2),
    edge: (pTop3 - (3 / 38 * 100)).toFixed(2),
    lift: (pTop3 / (3 / 38 * 100)).toFixed(2),
    fijo: hitsFijo,
    def: hitsDef,
    bat: hitsBat,
    hits: hitsTop3,
    total
  };
}

const t0 = Date.now();
const baseline = runEval(0.28, 0.20, 0.08, 0.28, 0.08, 0.45, 0);
console.log('Baseline en C: (ms: ' + (Date.now() - t0) + ')', baseline);

// Grid search exhaustivo
const results = [];
let count = 0;

for (let w_f of [0.18, 0.24, 0.30, 0.36]) {
  for (let w_a of [0.14, 0.20, 0.26]) {
    for (let w_m2 of [0.22, 0.30, 0.38, 0.46]) {
      for (let w_m1 of [0.04, 0.08, 0.12]) {
        for (let w_c of [0.04, 0.08, 0.12]) {
          for (let p_h of [0.35, 0.50, 0.65]) {
            for (let b_m of [0, 1]) {
              count++;
              const r = runEval(w_f, w_a, w_m1, w_m2, w_c, p_h, b_m);
              const p = parseFloat(r.pTop3);
              if (p >= 8.8) {
                results.push({ p, r, cfg: { w_f, w_a, w_m1, w_m2, w_c, p_h, b_m } });
              }
            }
          }
        }
      }
    }
  }
}

console.log('Evaluadas ' + count + ' combinaciones en ' + ((Date.now() - t0) / 1000).toFixed(2) + 's');
results.sort((a, b) => b.p - a.p);
console.log('Configuraciones con >= 8.8% Top 3: ' + results.length);
console.log('=== TOP 10 CONFIGURACIONES ÓPTIMAS ===');
results.slice(0, 10).forEach((x, i) => {
  console.log('#' + (i + 1) + ' -> Top3: ' + x.p + '% (Edge: +' + x.r.edge + '%, Lift: ' + x.r.lift + 'x) | F: ' + x.r.fijo + ', D: ' + x.r.def + ', B: ' + x.r.bat + ' | Cfg: ' + JSON.stringify(x.cfg));
});
