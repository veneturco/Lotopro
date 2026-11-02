/**
 * test_advanced_architectures.cjs
 * Pruebas de arquitecturas avanzadas:
 * - Markov Dirichlet adaptativo
 * - Ventanas de resonancia armónica
 * - Jales de La Granjita (correlación cruzada)
 * - Modelado no-lineal de atraso vs frecuencia
 * - Ponderación Bayesiana de Turno/Horario
 */

const fs = require('fs');
const path = require('path');

const CILINDRO_RULETA = [
  "0", "28", "9", "26", "30", "11", "7", "20", "32", "17",
  "5", "22", "34", "15", "3", "24", "36", "13", "1", "00",
  "27", "10", "25", "29", "12", "8", "19", "31", "18", "6",
  "21", "33", "16", "4", "23", "35", "14", "2"
];

const INDICE_CILINDRO = {};
CILINDRO_RULETA.forEach((n, idx) => { INDICE_CILINDRO[n] = idx; });

const K = 38;
const P_UNIFORME = 1 / K;

function distanciaEnCilindro(idA, idB) {
  const iA = INDICE_CILINDRO[idA];
  const iB = INDICE_CILINDRO[idB];
  if (iA === undefined || iB === undefined) return 19;
  const diff = Math.abs(iA - iB);
  return Math.min(diff, K - diff);
}

const CATALOGO_KEYS = [
  "0", "00", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
  "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
  "21", "22", "23", "24", "25", "26", "27", "28", "29", "30",
  "31", "32", "33", "34", "35", "36"
];

const COLORES = {};
const FAMILIAS = {};
const PARES_ESPEJO = {
  "0": "00", "00": "0", "1": "10", "10": "1", "2": "20", "20": "2",
  "3": "30", "30": "3", "4": "14", "14": "4", "5": "15", "15": "5",
  "6": "9", "9": "6", "7": "17", "17": "7", "12": "21", "21": "12",
  "13": "31", "31": "13", "16": "26", "26": "16", "23": "32", "32": "23",
  "24": "34", "34": "24", "25": "35", "35": "25"
};

const FAMILIAS_MAP = {
  "0": "Agua", "00": "Agua", "1": "Campo", "2": "Campo", "3": "Rastreros",
  "4": "Rastreros", "5": "Selva", "6": "Agua", "7": "Plumas", "8": "Campo",
  "9": "Plumas", "10": "Selva", "11": "Campo", "12": "Campo", "13": "Selva",
  "14": "Plumas", "15": "Selva", "16": "Selva", "17": "Plumas", "18": "Campo",
  "19": "Campo", "20": "Campo", "21": "Plumas", "22": "Selva", "23": "Selva",
  "24": "Rastreros", "25": "Plumas", "26": "Campo", "27": "Campo", "28": "Plumas",
  "29": "Selva", "30": "Agua", "31": "Selva", "32": "Selva", "33": "Agua",
  "34": "Selva", "35": "Selva", "36": "Rastreros"
};

CATALOGO_KEYS.forEach(k => {
  FAMILIAS[k] = FAMILIAS_MAP[k] || "Campo";
  if (k === "0" || k === "00") COLORES[k] = "azul";
  else {
    const n = parseInt(k, 10);
    if ((n >= 1 && n <= 10) || (n >= 21 && n <= 30)) COLORES[k] = "rojo";
    else COLORES[k] = "negro";
  }
});

function normalizarId(raw) {
  if (raw === null || raw === undefined) return null;
  const str = String(raw).trim();
  if (str === "00" || str === "37") return "00";
  if (str === "0") return "0";
  const num = parseInt(str, 10);
  if (!Number.isNaN(num) && num >= 0 && num <= 36) return String(num);
  return null;
}

const rawData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/constants/historicoBase.json'), 'utf8'));

const dataset = rawData.map(item => ({
  la: normalizarId(item.number_animal),
  gr: normalizarId(item.gr),
  hora: item.time_s,
  fecha: item.date_result,
  schedule: item.time_schedule
})).filter(x => Boolean(x.la));

/**
 * Función de pronóstico con modelo experimental
 */
function evaluarConfiguracion(config, startIdx = 100) {
  let hitsTop1 = 0;
  let hitsTop3 = 0;
  let hitsFijo = 0;
  let hitsDef = 0;
  let hitsBat = 0;
  const total = dataset.length - startIdx;

  for (let idx = startIdx; idx < dataset.length; idx++) {
    const hist = dataset.slice(0, idx);
    const N = hist.length;
    const actual = dataset[idx].la;
    const horaActual = dataset[idx].hora;
    const fechaActual = dataset[idx].fecha;

    const ultimoLA = hist[N - 1].la;
    const penultimoLA = N >= 2 ? hist[N - 2].la : null;
    const antepenultimoLA = N >= 3 ? hist[N - 3].la : null;
    const lag12LA = N >= 12 ? hist[N - 12].la : null;
    const lag24LA = N >= 24 ? hist[N - 24].la : null;
    const ultimoGR = hist[N - 1].gr;
    const penultimoGR = N >= 2 ? hist[N - 2].gr : null;

    // Conteo de frecuencias y atrasos
    const W = config.ventana_memoria || 0;
    const subStart = W > 0 ? Math.max(0, N - W) : 0;
    const subN = N - subStart;

    const countLA = {};
    const countGR = {};
    const lastSeenLA = {};
    const trans1_LA = {};
    const trans2_LA = {};
    const trans12_LA = {};
    const trans24_LA = {};
    const transCross_GR_LA = {};
    const salidasHora = {};
    const salidosHoy = new Set();

    CATALOGO_KEYS.forEach(k => {
      countLA[k] = 0;
      countGR[k] = 0;
      lastSeenLA[k] = -1;
      trans1_LA[k] = 0;
      trans2_LA[k] = 0;
      trans12_LA[k] = 0;
      trans24_LA[k] = 0;
      transCross_GR_LA[k] = 0;
      salidasHora[k] = 0;
    });

    let totalT1 = 0;
    let totalT2 = 0;
    let totalT12 = 0;
    let totalT24 = 0;
    let totalCross = 0;
    let totalHora = 0;

    for (let i = subStart; i < N; i++) {
      const r = hist[i];
      countLA[r.la]++;
      if (r.gr) countGR[r.gr]++;
      lastSeenLA[r.la] = i;

      if (r.fecha === fechaActual) {
        salidosHoy.add(r.la);
      }

      if (i > 0 && hist[i - 1].la === ultimoLA) {
        trans1_LA[r.la]++;
        totalT1++;
      }
      if (i > 1 && penultimoLA && hist[i - 2].la === penultimoLA) {
        trans2_LA[r.la]++;
        totalT2++;
      }
      if (i >= 12 && lag12LA && hist[i - 12].la === lag12LA) {
        trans12_LA[r.la]++;
        totalT12++;
      }
      if (i >= 24 && lag24LA && hist[i - 24].la === lag24LA) {
        trans24_LA[r.la]++;
        totalT24++;
      }
      if (i > 0 && ultimoGR && hist[i - 1].gr === ultimoGR) {
        transCross_GR_LA[r.la]++;
        totalCross++;
      }
      if (r.hora === horaActual) {
        salidasHora[r.la]++;
        totalHora++;
      }
    }

    const scores = CATALOGO_KEYS.map(k => {
      const atraso = lastSeenLA[k] === -1 ? subN : N - 1 - lastSeenLA[k];

      // 1. Frecuencia relativa normalizada
      const fRatio = (countLA[k] / Math.max(1, subN)) / P_UNIFORME;
      const sFreq = fRatio;

      // 2. Modelo de Atraso (Resonancia Harmónica Lags 9..24 y Penalización de Lag 0..8)
      let sAtraso = 0;
      if (atraso >= 9 && atraso <= 24) {
        sAtraso = 1.0; // Ventana de máxima maduración
      } else if (atraso >= 25 && atraso <= 40) {
        sAtraso = 0.75;
      } else if (atraso > 40 && atraso <= 65) {
        sAtraso = 0.55;
      } else if (atraso > 65) {
        sAtraso = 0.40; // Enjaulado severo (riesgo)
      } else if (atraso >= 1 && atraso <= 8) {
        sAtraso = 0.20; // Enfriamiento post-salida
      } else {
        sAtraso = 0.02; // Atraso 0 (recién salido)
      }

      // 3. Markov M1, M2, M12, M24 con suavizado Laplace/Dirichlet
      const pM1 = (trans1_LA[k] + 1) / (totalT1 + K);
      const pM2 = (trans2_LA[k] + 1) / (totalT2 + K);
      const pM12 = (trans12_LA[k] + 1) / (totalT12 + K);
      const pM24 = (trans24_LA[k] + 1) / (totalT24 + K);

      const sMarkov = (config.m1_w || 0.4) * (pM1 / P_UNIFORME) +
                      (config.m2_w || 0.4) * (pM2 / P_UNIFORME) +
                      (config.m12_w || 0.1) * (pM12 / P_UNIFORME) +
                      (config.m24_w || 0.1) * (pM24 / P_UNIFORME);

      // 4. Cruce Granjita
      const pCross = ultimoGR ? (transCross_GR_LA[k] + 1) / (totalCross + K) : P_UNIFORME;
      let sCross = pCross / P_UNIFORME;
      if (ultimoGR && distanciaEnCilindro(ultimoGR, k) <= 3) sCross += 0.25;
      if (ultimoGR && PARES_ESPEJO[ultimoGR] === k) sCross += 0.20;

      // 5. Horario (afinidad por hora específica)
      const pHora = (salidasHora[k] + 1) / (totalHora + K);
      const sHora = pHora / P_UNIFORME;

      // 6. Geometría y Linajes (Cilindro, Color, Familia)
      let sGeom = 1.0;
      if (ultimoLA) {
        if (COLORES[k] === COLORES[ultimoLA]) sGeom += 0.12;
        if (FAMILIAS[k] === FAMILIAS[ultimoLA]) sGeom += 0.15;
        const dCil = distanciaEnCilindro(ultimoLA, k);
        if (dCil <= 2 && k !== ultimoLA) sGeom += 0.22;
        else if (dCil === 3) sGeom += 0.10;
        if (PARES_ESPEJO[ultimoLA] === k) sGeom += 0.15;
      }

      // Score ponderado final
      const scoreTotal = (config.w_freq || 0.25) * sFreq +
                         (config.w_atraso || 0.25) * sAtraso +
                         (config.w_markov || 0.20) * sMarkov +
                         (config.w_cross || 0.10) * sCross +
                         (config.w_hora || 0.10) * sHora +
                         (config.w_geom || 0.10) * sGeom;

      // Multiplicador de supresión intra-jornada
      let multIntra = 1.0;
      if (atraso === 0) multIntra = config.pen_lag0 !== undefined ? config.pen_lag0 : 0.10;
      else if (salidosHoy.has(k)) multIntra = config.pen_hoy !== undefined ? config.pen_hoy : 0.45;

      return { numero: k, score: scoreTotal * multIntra, atraso, sFreq, sMarkov, sAtraso };
    });

    scores.sort((a, b) => b.score - a.score);

    // Selección táctica Top 3
    let fijo = scores[0];
    let def, bat;

    if (config.defensa_mode === "ortogonal") {
      def = scores.slice(1, 6).find(c => distanciaEnCilindro(fijo.numero, c.numero) >= 3) || scores[1];
    } else {
      def = scores[1];
    }

    if (config.batacazo_mode === "atraso_critico") {
      const pool = scores.slice(1, 10).filter(c => c.numero !== fijo.numero && c.numero !== def.numero);
      pool.sort((a, b) => b.atraso - a.atraso);
      bat = pool[0] || scores[2];
    } else if (config.batacazo_mode === "resonancia_madura") {
      // Buscar en pool el que esté exactamente en ventana dorada (atraso 12-24)
      const pool = scores.slice(1, 12).filter(c => c.numero !== fijo.numero && c.numero !== def.numero);
      const enResonancia = pool.filter(c => c.atraso >= 12 && c.atraso <= 24);
      bat = enResonancia[0] || pool[0] || scores[2];
    } else {
      const pool = scores.filter(c => c.numero !== fijo.numero && c.numero !== def.numero);
      bat = pool[0] || scores[2];
    }

    const top3 = [fijo.numero, def.numero, bat.numero];

    if (top3[0] === actual) hitsFijo++;
    if (top3[1] === actual) hitsDef++;
    if (top3[2] === actual) hitsBat++;

    if (top3[0] === actual) hitsTop1++;
    if (top3.includes(actual)) hitsTop3++;
  }

  const pTop1 = (hitsTop1 / total) * 100;
  const pTop3 = (hitsTop3 / total) * 100;
  const azarTop3 = (3 / 38) * 100;
  const edge = pTop3 - azarTop3;
  const lift = pTop3 / azarTop3;

  return {
    total,
    hitsTop3,
    pTop3: pTop3.toFixed(2),
    pTop1: pTop1.toFixed(2),
    hitsFijo,
    hitsDef,
    hitsBat,
    edge: edge.toFixed(2),
    lift: lift.toFixed(2)
  };
}

module.exports = {
  evaluarConfiguracion,
  dataset
};

if (require.main === module) {
  console.log("Probando arquitecturas avanzadas...");
  const configs = [
    {
      name: "Arch 1: Equilibrado con Resonancia Harmónica",
      w_freq: 0.25, w_atraso: 0.25, w_markov: 0.20, w_cross: 0.10, w_hora: 0.10, w_geom: 0.10,
      m1_w: 0.35, m2_w: 0.45, m12_w: 0.10, m24_w: 0.10,
      pen_lag0: 0.10, pen_hoy: 0.50,
      defensa_mode: "pura", batacazo_mode: "pura"
    },
    {
      name: "Arch 2: Enfoque Frecuencia Dinámica + Markov M2 dominante",
      w_freq: 0.35, w_atraso: 0.20, w_markov: 0.25, w_cross: 0.08, w_hora: 0.06, w_geom: 0.06,
      m1_w: 0.20, m2_w: 0.60, m12_w: 0.10, m24_w: 0.10,
      pen_lag0: 0.05, pen_hoy: 0.40,
      defensa_mode: "pura", batacazo_mode: "pura"
    },
    {
      name: "Arch 3: Ventana de Memoria 76 + Resonancia Madura Batacazo",
      w_freq: 0.30, w_atraso: 0.25, w_markov: 0.25, w_cross: 0.08, w_hora: 0.06, w_geom: 0.06,
      m1_w: 0.25, m2_w: 0.55, m12_w: 0.10, m24_w: 0.10,
      pen_lag0: 0.05, pen_hoy: 0.45,
      ventana_memoria: 76,
      defensa_mode: "pura", batacazo_mode: "resonancia_madura"
    },
    {
      name: "Arch 4: Alta sensibilidad Markov M2 + Sin sesgo de jaula",
      w_freq: 0.28, w_atraso: 0.18, w_markov: 0.34, w_cross: 0.08, w_hora: 0.06, w_geom: 0.06,
      m1_w: 0.15, m2_w: 0.70, m12_w: 0.07, m24_w: 0.08,
      pen_lag0: 0.05, pen_hoy: 0.40,
      defensa_mode: "pura", batacazo_mode: "pura"
    },
    {
      name: "Arch 5: Cobertura Ortogonal en Defensa + Resonancia en Batacazo",
      w_freq: 0.35, w_atraso: 0.20, w_markov: 0.25, w_cross: 0.08, w_hora: 0.06, w_geom: 0.06,
      m1_w: 0.20, m2_w: 0.60, m12_w: 0.10, m24_w: 0.10,
      pen_lag0: 0.05, pen_hoy: 0.40,
      defensa_mode: "ortogonal", batacazo_mode: "resonancia_madura"
    }
  ];

  configs.forEach(c => {
    const res = evaluarConfiguracion(c);
    console.log(`[${c.name}] -> Top3: ${res.pTop3}% (Edge: ${res.edge}%, Lift: ${res.lift}x) | Fijo: ${res.hitsFijo}, Def: ${res.hitsDef}, Bat: ${res.hitsBat}`);
  });
}
