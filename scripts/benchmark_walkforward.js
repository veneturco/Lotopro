/**
 * benchmark_walkforward.js
 * Framework de evaluación Walk-Forward riguroso y optimización masiva de hiperparámetros
 */

const fs = require('fs');
const path = require('path');

// Cargar catálogo y ruleta
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

// Asignaciones canónicas
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

// Cargar dataset histórico
const rawData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/constants/historicoBase.json'), 'utf8'));

// Ordenar cronológicamente y normalizar
const dataset = rawData.map(item => {
  const laId = normalizarId(item.number_animal);
  const grId = normalizarId(item.gr);
  return {
    la: laId,
    gr: grId,
    hora: item.time_s,
    fecha: item.date_result,
    schedule: item.time_schedule
  };
}).filter(x => Boolean(x.la));

console.log(`Dataset cargado: ${dataset.length} sorteos válidos.`);

/**
 * Función predictiva configurable para Walk-Forward
 */
function predecirSorteo(historial, params) {
  const N = historial.length;
  if (N === 0) return ["0", "00", "1"];

  // Parámetros configurables
  const {
    w_freq = 0.22,
    w_atraso = 0.22,
    w_markov = 0.20,
    w_granjita = 0.10,
    w_tercio = 0.10,
    w_color = 0.08,
    w_horario = 0.08,
    
    // Markov weights
    m1_weight = 0.50,
    m2_weight = 0.25,
    m12_weight = 0.25,
    m24_weight = 0.0,
    alpha_dirichlet = 6.0,
    
    // Intra-day penalty
    intra_penalty_lag0 = 0.28,
    intra_penalty_today = 0.48, // lag 1..8
    intra_penalty_lag8_11 = 0.82,
    
    // Resonancia y ciclos
    bono_resonancia_24 = 0.14,
    bono_ciclo_38 = 0.12,
    bono_trigrama = 0.22,
    
    // Ventana de memoria
    ventana_memoria = 0, // 0 = todo el histórico, >0 = subconjunto
    
    // Selección táctica
    tactica_defensa = "ortogonal", // "ortogonal" (cilindro >= 3) o "prob_pura" (rank 2)
    tactica_batacazo = "atraso_critico", // "atraso_critico", "prob_pura" (rank 3), o "jaula_hibrida"
    batacazo_pool_size = 12
  } = params;

  const startIdx = ventana_memoria > 0 ? Math.max(0, N - ventana_memoria) : 0;
  const subHist = startIdx > 0 ? historial.slice(startIdx) : historial;
  const subN = subHist.length;

  const ultimoRec = subHist[subN - 1];
  const ultimoLA = ultimoRec.la;
  const penultimoLA = subN >= 2 ? subHist[subN - 2].la : null;
  const lag12LA = subN >= 12 ? subHist[subN - 12].la : null;
  const lag24LA = subN >= 24 ? subHist[subN - 24].la : null;
  const ultimoGR = ultimoRec.gr;
  const ultimaFecha = ultimoRec.fecha;

  // Estadísticas
  const freq = {};
  const ultimoVisto = {};
  const salidasC38 = {};
  const salidasC114 = {};
  const m1 = {};
  const m2 = {};
  const m12 = {};
  const m24 = {};
  const mCross = {};
  const mTrigrama = {};
  const salidosHoy = new Set();
  const salidasMismaHora = {};

  CATALOGO_KEYS.forEach(k => {
    freq[k] = 0;
    ultimoVisto[k] = -1;
    salidasC38[k] = 0;
    salidasC114[k] = 0;
    m1[k] = 0;
    m2[k] = 0;
    m12[k] = 0;
    m24[k] = 0;
    mCross[k] = 0;
    mTrigrama[k] = 0;
    salidasMismaHora[k] = 0;
  });

  const targetHora = historial[N - 1].hora; // Turno correlativo (aproximación)

  let totalM1 = 0;
  let totalM2 = 0;
  let totalM12 = 0;
  let totalM24 = 0;
  let totalCross = 0;
  let totalTrigrama = 0;

  for (let i = 0; i < subN; i++) {
    const r = subHist[i];
    const id = r.la;
    freq[id]++;
    ultimoVisto[id] = i;

    if (i >= subN - 38) salidasC38[id]++;
    if (i >= subN - 114) salidasC114[id]++;

    if (r.fecha === ultimaFecha && (subN - 1 - i) <= 11) {
      salidosHoy.add(id);
    }

    if (i > 0 && subHist[i - 1].la === ultimoLA) {
      m1[id]++;
      totalM1++;
    }
    if (i > 1 && penultimoLA && subHist[i - 2].la === penultimoLA) {
      m2[id]++;
      totalM2++;
    }
    if (i >= 12 && lag12LA && subHist[i - 12].la === lag12LA) {
      m12[id]++;
      totalM12++;
    }
    if (i >= 24 && lag24LA && subHist[i - 24].la === lag24LA) {
      m24[id]++;
      totalM24++;
    }
    if (i > 0 && ultimoGR && subHist[i - 1].gr === ultimoGR) {
      mCross[id]++;
      totalCross++;
    }
    if (i > 1 && penultimoLA && ultimoLA && subHist[i - 2].la === penultimoLA && subHist[i - 1].la === ultimoLA) {
      mTrigrama[id]++;
      totalTrigrama++;
    }
    if (r.hora === targetHora) {
      salidasMismaHora[id]++;
    }
  }

  const scores = CATALOGO_KEYS.map(k => {
    const atraso = ultimoVisto[k] === -1 ? subN : subN - 1 - ultimoVisto[k];

    // 1. Atraso Score
    const cdfGeom = 1 - Math.pow(1 - P_UNIFORME, atraso);
    let hazard = 0;
    if (atraso > 55) hazard = Math.min(0.16, 0.045 * Math.log1p((atraso - 55) / 22));
    const scoreAtraso = Math.min(0.99, cdfGeom + hazard);

    // 2. Frecuencia Score
    const pDecay = freq[k] / Math.max(1, subN);
    let sFreq = 1 / (1 + Math.exp(-1.5 * ((pDecay / P_UNIFORME) - 1)));
    if (atraso >= 12 && atraso <= 23) sFreq += bono_resonancia_24;
    else if (atraso >= 35 && atraso <= 38) sFreq += bono_ciclo_38;
    const scoreFreq = Math.min(0.99, sFreq);

    // 3. Ley del Tercio
    const c38 = salidasC38[k];
    let scoreTercio = 0.50;
    if (c38 === 1 && atraso >= 10 && atraso <= 28) scoreTercio = 0.86;
    else if (c38 === 2 && atraso >= 8 && atraso <= 22) scoreTercio = 0.78;
    else if (c38 === 0 && atraso >= 44) scoreTercio = 0.89;
    else if (c38 >= 4) scoreTercio = 0.22;

    // 4. Markov Multi-Orden
    const pM1 = (m1[k] + alpha_dirichlet * P_UNIFORME) / (totalM1 + alpha_dirichlet);
    const pM2 = (m2[k] + (alpha_dirichlet + 2.5) * P_UNIFORME) / (totalM2 + alpha_dirichlet + 2.5);
    const pM12 = (m12[k] + (alpha_dirichlet + 1.5) * P_UNIFORME) / (totalM12 + alpha_dirichlet + 1.5);
    const pM24 = (m24[k] + (alpha_dirichlet + 1.5) * P_UNIFORME) / (totalM24 + alpha_dirichlet + 1.5);

    const pMarkovComb = m1_weight * pM1 + m2_weight * pM2 + m12_weight * pM12 + m24_weight * pM24;
    const liftM = pMarkovComb / P_UNIFORME;
    const trigBonus = mTrigrama[k] > 0 ? Math.min(bono_trigrama, mTrigrama[k] * 0.11) : 0;
    const scoreMarkov = Math.min(0.99, (1 / (1 + Math.exp(-3.4 * (liftM - 1.0)))) + trigBonus);

    // 5. Cruce La Granjita
    let scoreCruce = 0.50;
    if (ultimoGR) {
      const pCross = (mCross[k] + 9.0 * P_UNIFORME) / (totalCross + 9.0);
      const liftCross = pCross / P_UNIFORME;
      scoreCruce = 1 / (1 + Math.exp(-3.2 * (liftCross - 1.0)));
      if (distanciaEnCilindro(ultimoGR, k) <= 3 && ultimoGR !== k && atraso >= 4) {
        scoreCruce = Math.min(0.95, scoreCruce + 0.19);
      }
      if (PARES_ESPEJO[ultimoGR] === k && atraso >= 3) {
        scoreCruce = Math.min(0.92, scoreCruce + 0.16);
      }
    }

    // 6. Horario
    const sHora = salidasMismaHora[k] / Math.max(1, subN / 12);
    const scoreHorario = 1 / (1 + Math.exp(-2.5 * (sHora - 1.0)));

    // 7. Color / Familia / Cilindro
    let scoreGeom = 0.50;
    if (ultimoLA) {
      if (COLORES[k] === COLORES[ultimoLA]) scoreGeom += 0.14;
      if (FAMILIAS[k] === FAMILIAS[ultimoLA]) scoreGeom += 0.16;
      const distCil = distanciaEnCilindro(ultimoLA, k);
      if (distCil <= 2 && ultimoLA !== k) scoreGeom += 0.18;
      else if (distCil === 3) scoreGeom += 0.10;
      if (PARES_ESPEJO[ultimoLA] === k) scoreGeom += 0.12;
    }
    const scoreColor = Math.min(0.99, scoreGeom);

    // Score Base
    const base = w_freq * scoreFreq +
                 w_atraso * scoreAtraso +
                 w_markov * scoreMarkov +
                 w_granjita * scoreCruce +
                 w_tercio * scoreTercio +
                 w_color * scoreColor +
                 w_horario * scoreHorario;

    // Penalización intra-jornada
    let pen = 1.0;
    if (atraso === 0) {
      pen = intra_penalty_lag0;
    } else if (salidosHoy.has(k) || atraso <= 7) {
      pen = intra_penalty_today;
    } else if (atraso >= 8 && atraso <= 11) {
      pen = intra_penalty_lag8_11;
    }

    const finalScore = base * pen;
    return { numero: k, score: finalScore, atraso };
  });

  // Ordenar por score descendente
  scores.sort((a, b) => b.score - a.score);

  // Selección de Top 3
  const fijo = scores[0];

  let defensa;
  if (tactica_defensa === "ortogonal") {
    defensa = scores.slice(1, 6).find(c => distanciaEnCilindro(fijo.numero, c.numero) >= 3) || scores[1];
  } else {
    defensa = scores[1];
  }

  let batacazo;
  if (tactica_batacazo === "atraso_critico") {
    const pool = scores.slice(1, batacazo_pool_size).filter(c => c.numero !== fijo.numero && c.numero !== defensa.numero);
    pool.sort((a, b) => b.atraso - a.atraso);
    batacazo = pool[0] || scores[2];
  } else if (tactica_batacazo === "jaula_hibrida") {
    // Balance entre atraso y score latente
    const pool = scores.slice(1, batacazo_pool_size).filter(c => c.numero !== fijo.numero && c.numero !== defensa.numero);
    pool.sort((a, b) => (b.atraso * 0.7 + b.score * 50 * 0.3) - (a.atraso * 0.7 + a.score * 50 * 0.3));
    batacazo = pool[0] || scores[2];
  } else {
    // prob_pura
    const cand = scores.filter(c => c.numero !== fijo.numero && c.numero !== defensa.numero);
    batacazo = cand[0] || scores[2];
  }

  return [fijo.numero, defensa.numero, batacazo.numero];
}

/**
 * Motor Walk-Forward Backtester
 */
function ejecutarWalkForward(params, startIdx = 100) {
  const total = dataset.length - startIdx;
  let hitsTop1 = 0;
  let hitsTop3 = 0;
  let hitsFijo = 0;
  let hitsDefensa = 0;
  let hitsBatacazo = 0;

  for (let i = startIdx; i < dataset.length; i++) {
    const slice = dataset.slice(0, i);
    const top3 = predecirSorteo(slice, params);
    const actual = dataset[i].la;

    if (top3[0] === actual) hitsFijo++;
    if (top3[1] === actual) hitsDefensa++;
    if (top3[2] === actual) hitsBatacazo++;

    if (top3[0] === actual) hitsTop1++;
    if (top3.includes(actual)) hitsTop3++;
  }

  const pTop1 = (hitsTop1 / total) * 100;
  const pTop3 = (hitsTop3 / total) * 100;
  const azarTop3 = (3 / 38) * 100; // 7.8947%
  const edge = pTop3 - azarTop3;
  const lift = pTop3 / azarTop3;

  return {
    total,
    hitsTop3,
    pTop3: pTop3.toFixed(2),
    pTop1: pTop1.toFixed(2),
    hitsFijo,
    hitsDefensa,
    hitsBatacazo,
    edge: edge.toFixed(2),
    lift: lift.toFixed(2)
  };
}

module.exports = {
  ejecutarWalkForward,
  predecirSorteo,
  dataset
};

if (require.main === module) {
  console.log("Probando baseline actual equilibrado...");
  const baseRes = ejecutarWalkForward({});
  console.log("Baseline Resultado:", baseRes);
}
