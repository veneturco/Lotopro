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

function evaluateSplit(cfg, trainStart, trainEnd, testStart, testEnd) {
  const countsLA = new Int32Array(K);
  const lastSeen = new Int32Array(K).fill(-1);
  const transM1 = new Int32Array(K * K);
  const transM2 = new Int32Array(K * K);
  const transCross = new Int32Array(K * K);
  const totalM1 = new Int32Array(K);
  const totalM2 = new Int32Array(K);
  const totalCross = new Int32Array(K);

  // Calentar hasta testStart
  for (let i = 0; i < testStart; i++) {
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

  let currentDate = dataset[testStart - 1].fecha;
  const seenToday = new Uint8Array(K);
  const scores = new Float32Array(K);
  const order = new Int32Array(K);
  const atrasos = new Int32Array(K);

  let hitsTop3 = 0;
  let hitsFijo = 0;
  let hitsDef = 0;
  let hitsBat = 0;
  const total = testEnd - testStart;

  for (let idx = testStart; idx < testEnd; idx++) {
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

      const sFreq = (countsLA[k] / subN) / P_UNIF;

      let sAtr = 0.50;
      if (atr >= 9 && atr <= 24) sAtr = 1.0;
      else if (atr >= 25 && atr <= 42) sAtr = 0.72;
      else if (atr > 42 && atr <= 65) sAtr = 0.50;
      else if (atr > 65) sAtr = 0.35;
      else if (atr >= 1 && atr <= 8) sAtr = 0.20;
      else sAtr = 0.02;

      const sM1 = ((transM1[offM1 + k] + 1) / (totM1_p1 + K)) / P_UNIF;
      const sM2 = ((transM2[offM2 + k] + 1) / (totM2_p2 + K)) / P_UNIF;

      let sCross = 1.0;
      if (offCross >= 0) {
        sCross = ((transCross[offCross + k] + 1) / (totCross_g + K)) / P_UNIF;
      }

      let sc = cfg.w_f * sFreq + cfg.w_a * sAtr + cfg.w_m1 * sM1 + cfg.w_m2 * sM2 + cfg.w_c * sCross;
      if (seenToday[k]) sc *= cfg.p_h;
      if (k === p1) sc *= 0.05;

      scores[k] = sc;
      order[k] = k;
    }

    order.sort((a, b) => scores[b] - scores[a]);

    const fijo = order[0];
    const defensa = order[1];
    let batacazo;
    if (cfg.b_m === 1) {
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
    hitsTop3,
    total,
    fijo: hitsFijo,
    def: hitsDef,
    bat: hitsBat
  };
}

// Probar candidatos líderes en Validación Cruzada Temporal (50% Train, 50% Test Ciego)
const midPoint = Math.floor(N_DATA / 2); // 708
console.log(`=== VALIDACIÓN OUT-OF-SAMPLE (CIEGA) ===`);
console.log(`Mitad 1 (Sorteos 100 a 708 - 608 sorteos) | Mitad 2 (Sorteos 708 a 1416 - 708 sorteos ciegos)`);

const testCandidates = [
  { name: "Config #1 (Frecuencia 0.36, Atraso 0.20, M2 0.22, Pura)", cfg: { w_f: 0.36, w_a: 0.20, w_m1: 0.04, w_m2: 0.22, w_c: 0.04, p_h: 0.50, b_m: 0 } },
  { name: "Config #4 (Frecuencia 0.36, Atraso 0.26, M2 0.46, Resonancia)", cfg: { w_f: 0.36, w_a: 0.26, w_m1: 0.04, w_m2: 0.46, w_c: 0.08, p_h: 0.50, b_m: 1 } },
  { name: "Config #7 (Frecuencia 0.30, Atraso 0.26, M2 0.46, Resonancia)", cfg: { w_f: 0.30, w_a: 0.26, w_m1: 0.04, w_m2: 0.46, w_c: 0.08, p_h: 0.50, b_m: 1 } },
  { name: "Config Equilibrada Robusta (w_f: 0.32, w_a: 0.24, w_m2: 0.36, w_m1: 0.06, w_c: 0.06)", cfg: { w_f: 0.32, w_a: 0.24, w_m1: 0.06, w_m2: 0.36, w_c: 0.06, p_h: 0.50, b_m: 1 } }
];

testCandidates.forEach(tc => {
  const rPart1 = evaluateSplit(tc.cfg, 0, midPoint, 100, midPoint);
  const rPart2 = evaluateSplit(tc.cfg, 0, midPoint, midPoint, N_DATA);
  const rFull = evaluateSplit(tc.cfg, 0, 100, 100, N_DATA);

  console.log(`\n[${tc.name}]`);
  console.log(`  -> Mitad 1 (In-Sample):  Top 3 = ${rPart1.pTop3}% (${rPart1.hitsTop3}/${rPart1.total}) [Fijo:${rPart1.fijo}, Def:${rPart1.def}, Bat:${rPart1.bat}]`);
  console.log(`  -> Mitad 2 (Out-Sample): Top 3 = ${rPart2.pTop3}% (${rPart2.hitsTop3}/${rPart2.total}) [Fijo:${rPart2.fijo}, Def:${rPart2.def}, Bat:${rPart2.bat}]`);
  console.log(`  -> Histórico Completo:   Top 3 = ${rFull.pTop3}% (${rFull.hitsTop3}/${rFull.total}) [Edge: +${(rFull.pTop3 - 7.89).toFixed(2)}%, Lift: ${(rFull.pTop3 / 7.89).toFixed(2)}x]`);
});
