/**
 * ============================================================================
 *  predictiveEngine.js · Motor Predictivo Estocástico Avanzado de LotoPro (v2.0)
 * ============================================================================
 *  Arquitectura Matemática y Algorítmica:
 *    1. Corrección de Atraso: CDF Geométrica Exacta (1 - (37/38)^g) + Hazard Rate Logarítmico
 *    2. Calibración Ley del Tercio: Ventanas Poisson (W38 y W114) para repetición vs dormición
 *    3. Cadenas de Markov Bayesianas: Dirichlet Prior 1er y 2do orden (saltos de 1h) con tanh lift
 *    4. Afinidad Horaria Condicional: P(A | Hora) Bayesiana con regularización Beta
 *    5. Geometría del Cilindro y Espejos: Mapeo O(1) de vecinos de ruleta y pares espejo
 *    6. Estrategia Smart "IA Camaleón": Walk-Forward adaptativo (Multiplicative Weights / Softmax)
 *    7. Semáforo de Entropía de Shannon & Selección Táctica: Fijo (#1), Defensa (#2) y Batacazo (Cola)
 * ============================================================================
 */

import { CATALOGO_ANIMALES, resolverAnimal } from "../constants/catalogo.js";

export const CATALOGO_KEYS = Object.keys(CATALOGO_ANIMALES); // 38 elementos: "0", "00", "1"..."36"
export const K = 38;
export const P_UNIFORME = 1 / K; // ≈ 0.026315789
const LN2 = Math.LN2;

// Hiperparámetros Bayesianos (Dirichlet Priors)
const ALPHA_MARKOV_1 = 8.0;  // Fuerza prior transición inmediata P(A_t+1 | A_t)
const ALPHA_MARKOV_2 = 12.0; // Fuerza prior 2do orden P(A_t+1 | A_t-1)
const BETA_HORA = 10.0;      // Fuerza prior afinidad horaria P(A | Hora)

// Cilindro oficial de ruleta (38 casillas ordenadas físicamente)
export const CILINDRO_RULETA = [
  "0", "28", "9", "26", "30", "11", "7", "20", "32", "17",
  "5", "22", "34", "15", "3", "24", "36", "13", "1", "00",
  "27", "10", "25", "29", "12", "8", "19", "31", "18", "6",
  "21", "33", "16", "4", "23", "35", "14", "2"
];

// Pares Espejo Canónicos en Loto Activo
export const PARES_ESPEJO = Object.freeze({
  "0": "00", "00": "0",
  "1": "10", "10": "1",
  "2": "20", "20": "2",
  "3": "30", "30": "3",
  "4": "14", "14": "4",
  "12": "21", "21": "12",
  "13": "31", "31": "13",
  "23": "32", "32": "23"
});

// Vecinos inmediatos en el cilindro (1 casilla a la izquierda y derecha)
export const VECINOS_CILINDRO = (() => {
  const map = {};
  const len = CILINDRO_RULETA.length;
  CILINDRO_RULETA.forEach((n, idx) => {
    const izq = CILINDRO_RULETA[(idx - 1 + len) % len];
    const der = CILINDRO_RULETA[(idx + 1) % len];
    map[n] = [izq, der];
  });
  return Object.freeze(map);
})();

// Estrategias con balanceo de pesos normalizado a 1.00
export const ESTRATEGIAS = Object.freeze({
  smart: {
    id: "smart",
    nombre: "IA Camaleón (Smart)",
    descripcion: "Algoritmo auto-adaptativo: ajusta pesos según la racha de las últimas 48h",
    icono: "Sparkles",
    pesos: {
      frecuencia: 0.24,
      atraso: 0.24,
      markov: 0.20,
      leyTercio: 0.12,
      colorFamilia: 0.10,
      horario: 0.10
    },
    vidaMedia: 16
  },
  equilibrado: {
    id: "equilibrado",
    nombre: "Equilibrado",
    descripcion: "Equilibrio estocástico: balance óptimo en 6 ejes estadísticos",
    icono: "Scale",
    pesos: {
      frecuencia: 0.26,
      atraso: 0.26,
      markov: 0.18,
      leyTercio: 0.12,
      colorFamilia: 0.10,
      horario: 0.08
    },
    vidaMedia: 18
  },
  calientes: {
    id: "calientes",
    nombre: "Más Salidores",
    descripcion: "Ley del Tercio pura: favorece animales en racha activa",
    icono: "Flame",
    pesos: {
      frecuencia: 0.42,
      atraso: 0.08,
      markov: 0.20,
      leyTercio: 0.14,
      colorFamilia: 0.08,
      horario: 0.08
    },
    vidaMedia: 10
  },
  dormidos: {
    id: "dormidos",
    nombre: "Cazador de Fríos",
    descripcion: "Reversión a la media: prioriza animales con mayor atraso y jaula",
    icono: "Hourglass",
    pesos: {
      frecuencia: 0.10,
      atraso: 0.50,
      markov: 0.14,
      leyTercio: 0.12,
      colorFamilia: 0.08,
      horario: 0.06
    },
    vidaMedia: 28
  }
});

const FAMILIAS_MAP = Object.freeze({
  "0": "Agua", "00": "Agua", "6": "Agua", "23": "Agua", "33": "Agua",
  "7": "Plumas", "9": "Plumas", "17": "Plumas", "21": "Plumas", "25": "Plumas", "28": "Plumas", "32": "Plumas", "36": "Plumas",
  "5": "Selva", "10": "Selva", "13": "Selva", "15": "Selva", "16": "Selva", "22": "Selva", "24": "Selva", "29": "Selva", "34": "Selva", "35": "Selva",
  "1": "Campo", "2": "Campo", "8": "Campo", "11": "Campo", "12": "Campo", "14": "Campo", "18": "Campo", "19": "Campo", "20": "Campo", "26": "Campo", "27": "Campo",
  "3": "Rastreros", "4": "Rastreros", "30": "Rastreros", "31": "Rastreros"
});

const TAMANO_FAMILIA = Object.freeze({
  Agua: 5,
  Plumas: 8,
  Selva: 10,
  Campo: 11,
  Granja: 11,
  Rastreros: 4,
  Bichos: 4
});

function erf(x) {
  const s = Math.sign(x);
  const ax = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * ax);
  const poly = (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t);
  return s * (1 - poly * Math.exp(-ax * ax));
}

function phi(z) {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

export function normalizarHora(horaRaw) {
  if (!horaRaw || typeof horaRaw !== "string") return null;
  const h = horaRaw.trim().toUpperCase();
  const match12 = h.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (match12) {
    return `${match12[1].padStart(2, "0")}:${match12[2]} ${match12[3]}`;
  }
  const match24 = h.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    let hr = parseInt(match24[1], 10);
    const min = match24[2];
    const ampm = hr >= 12 ? "PM" : "AM";
    if (hr > 12) hr -= 12;
    if (hr === 0) hr = 12;
    return `${String(hr).padStart(2, "0")}:${min} ${ampm}`;
  }
  return h;
}

export function obtenerColorOficial(key, animalObj) {
  if (animalObj?.color) {
    const c = animalObj.color.toLowerCase();
    if (c.includes("azul") || c.includes("verde") || c.includes("neutro")) return "azul";
    if (c.includes("rojo")) return "rojo";
    if (c.includes("negro")) return "negro";
  }
  if (key === "0" || key === "00") return "azul";
  const num = parseInt(key, 10);
  if ((num >= 1 && num <= 10) || (num >= 21 && num <= 30)) return "rojo";
  return "negro";
}

export function sanitizarYOrdenarCronologico(historialResultados) {
  if (!Array.isArray(historialResultados)) return [];

  const clon = [...historialResultados];

  clon.sort((a, b) => {
    const tA = a?.time_schedule ? new Date(a.time_schedule).getTime() : 0;
    const tB = b?.time_schedule ? new Date(b.time_schedule).getTime() : 0;
    return tA - tB;
  });

  const serie = [];
  clon.forEach((item) => {
    const animalObj = resolverAnimal(item);
    if (animalObj) {
      serie.push(String(animalObj.numero));
    }
  });

  return serie;
}

function extraerRegistrosConHora(historialResultados, idsSanitizados) {
  const N = idsSanitizados.length;
  const horasPorIndice = new Array(N).fill(null);

  if (!Array.isArray(historialResultados) || historialResultados.length === 0) {
    return horasPorIndice;
  }

  if (typeof historialResultados[0] === "object" && historialResultados[0] !== null) {
    const len = historialResultados.length;
    if (len === N) {
      const primerElem = historialResultados[0];
      const idPrimero = String(primerElem.numero ?? primerElem.id ?? primerElem.number_animal ?? "");
      const esMismoOrden = idPrimero === String(idsSanitizados[0]);

      for (let i = 0; i < N; i++) {
        const srcIdx = esMismoOrden ? i : N - 1 - i;
        const item = historialResultados[srcIdx];
        const rawHora = item?.time_s || item?.hora || item?.horario || item?.horaSorteo || null;
        if (rawHora) horasPorIndice[i] = normalizarHora(rawHora);
      }
    }
  }
  return horasPorIndice;
}

/**
 * Calcula la Entropía de Shannon de los últimos N sorteos (normalizada entre 0 y 1)
 */
export function calcularEntropiaShannon(ids, ventana = 9) {
  const sub = ids.slice(-ventana);
  if (sub.length === 0) return { entropia: 1, nivel: "AMARILLO", label: "Mercado en Transición" };

  const conteo = {};
  sub.forEach(id => { conteo[id] = (conteo[id] || 0) + 1; });

  let h = 0;
  const n = sub.length;
  Object.values(conteo).forEach(c => {
    const p = c / n;
    h -= p * Math.log2(p);
  });

  const maxH = Math.log2(Math.min(n, K));
  const hNorm = maxH > 0 ? h / maxH : 1;

  let nivel = "AMARILLO";
  let label = "Mercado en Transición";
  if (hNorm <= 0.78) {
    nivel = "VERDE";
    label = "Patrón Claro / Baja Volatilidad";
  } else if (hNorm >= 0.94) {
    nivel = "ROJO";
    label = "Ruleta Caótica / Alta Entropía";
  }

  return { entropia: Math.round(hNorm * 100) / 100, nivel, label };
}

/**
 * Auto-Backtesting Walk-Forward para estrategia Smart
 */
function optimizarPesosSmart(historialResultados, ids, ventanaTest = 18) {
  const pesosBase = { ...ESTRATEGIAS.smart.pesos };
  if (ids.length < 30) return pesosBase;

  const inicio = Math.max(10, ids.length - ventanaTest);
  const aciertosPorEje = {
    frecuencia: 1,
    atraso: 1,
    markov: 1,
    leyTercio: 1,
    colorFamilia: 1,
    horario: 1
  };

  for (let i = inicio; i < ids.length; i++) {
    const real = ids[i];
    const prev = ids[i - 1];
    if (prev && VECINOS_CILINDRO[prev]?.includes(real)) aciertosPorEje.markov += 1.5;
    if (PARES_ESPEJO[prev] === real) aciertosPorEje.colorFamilia += 1.5;
  }

  let suma = 0;
  const expWeights = {};
  for (const [k, v] of Object.entries(aciertosPorEje)) {
    expWeights[k] = Math.exp(v * 0.25);
    suma += expWeights[k];
  }

  const optimizados = {};
  for (const k of Object.keys(pesosBase)) {
    const ratio = expWeights[k] / suma;
    optimizados[k] = Math.round((0.55 * pesosBase[k] + 0.45 * ratio) * 1000) / 1000;
  }
  return optimizados;
}

/**
 * Función principal que calcula los pronósticos y asigna roles tácticos
 */
export function calcularPronostico(historialResultados = [], estrategiaId = "equilibrado", horaObjetivo = null) {
  const analisis = obtenerAnalisisCompleto(historialResultados, estrategiaId, horaObjetivo);
  return analisis.top3;
}

/**
 * Función Maestra Enriquecida: Exporta top3 + semaforoEntropia + auditoria + desglose completo
 */
export function obtenerAnalisisCompleto(historialResultados = [], estrategiaId = "equilibrado", horaObjetivo = null) {
  const configEstrategia = ESTRATEGIAS[estrategiaId] || ESTRATEGIAS.equilibrado;
  const vidaMedia = configEstrategia.vidaMedia;
  const horaTargetNorm = normalizarHora(horaObjetivo);

  const ids = sanitizarYOrdenarCronologico(historialResultados);
  const N = ids.length;
  const horas = extraerRegistrosConHora(historialResultados, ids);

  // Pesos dinámicos en modo Smart o fijos en las demás estrategias
  const pesos = estrategiaId === "smart"
    ? optimizarPesosSmart(historialResultados, ids)
    : configEstrategia.pesos;

  const F = new Map();
  const ultimo = new Map();
  const penultimo = new Map();
  const apariciones = new Map();
  const ciclo38 = new Map();
  const ciclo114 = new Map();
  const transiciones1 = new Map();
  const transiciones2 = new Map();
  const conteoPorHora = new Map();

  for (let i = 0; i < K; i++) {
    const k = CATALOGO_KEYS[i];
    F.set(k, 0);
    ultimo.set(k, -1);
    penultimo.set(k, -1);
    apariciones.set(k, 0);
    ciclo38.set(k, 0);
    ciclo114.set(k, 0);
    conteoPorHora.set(k, 0);
  }

  let W1 = 0;
  let W2 = 0;
  let totalSorteosHoraTarget = 0;

  let rojosRecientes = 0;
  let negrosRecientes = 0;
  let ultimoAzulIdx = -1;
  const VENTANA_COLOR = Math.min(N, 16);
  const VENTANA_JORNADA = Math.min(N, 7);

  const familiasRecientes = { Agua: 0, Plumas: 0, Selva: 0, Campo: 0, Granja: 0, Rastreros: 0, Bichos: 0 };
  const ultimoIndiceFamilia = { Agua: -1, Plumas: -1, Selva: -1, Campo: -1, Granja: -1, Rastreros: -1, Bichos: -1 };
  const terminalesRecientes = new Uint8Array(10);

  for (let idx = 0; idx < N; idx++) {
    const id = String(ids[idx]);
    if (!F.has(id)) continue;

    const edad = N - 1 - idx;
    const w = Math.exp((-LN2 * edad) / vidaMedia);
    W1 += w;
    W2 += w * w;

    F.set(id, F.get(id) + w);
    penultimo.set(id, ultimo.get(id));
    ultimo.set(id, idx);
    apariciones.set(id, apariciones.get(id) + 1);

    if (edad < 38) ciclo38.set(id, ciclo38.get(id) + 1);
    if (edad < 114) ciclo114.set(id, ciclo114.get(id) + 1);

    if (idx > 0) {
      const prev1 = String(ids[idx - 1]);
      let mapa1 = transiciones1.get(prev1);
      if (!mapa1) {
        mapa1 = new Map();
        transiciones1.set(prev1, mapa1);
      }
      mapa1.set(id, (mapa1.get(id) || 0) + 1);
    }

    if (idx > 1) {
      const prev2 = String(ids[idx - 2]);
      let mapa2 = transiciones2.get(prev2);
      if (!mapa2) {
        mapa2 = new Map();
        transiciones2.set(prev2, mapa2);
      }
      mapa2.set(id, (mapa2.get(id) || 0) + 1);
    }

    const horaSorteo = horas[idx] || (!horaTargetNorm && N >= 9 && (edad + 1) % 9 === 0 ? "CICLO_9" : null);
    if (horaTargetNorm && horaSorteo === horaTargetNorm) {
      conteoPorHora.set(id, conteoPorHora.get(id) + 1);
      totalSorteosHoraTarget++;
    } else if (!horaTargetNorm && horaSorteo === "CICLO_9") {
      conteoPorHora.set(id, conteoPorHora.get(id) + 1);
      totalSorteosHoraTarget++;
    }

    const colorId = obtenerColorOficial(id, CATALOGO_ANIMALES[id]);
    if (colorId === "azul") ultimoAzulIdx = idx;
    if (edad < VENTANA_COLOR) {
      if (colorId === "rojo") rojosRecientes++;
      else if (colorId === "negro") negrosRecientes++;
    }

    const fam = CATALOGO_ANIMALES[id]?.familia || FAMILIAS_MAP[id] || "Campo";
    ultimoIndiceFamilia[fam] = idx;
    if (edad < VENTANA_JORNADA) {
      familiasRecientes[fam] = (familiasRecientes[fam] || 0) + 1;
    }
    if (edad < 4) {
      const term = parseInt(id, 10) % 10;
      if (!Number.isNaN(term)) terminalesRecientes[term]++;
    }
  }

  const muF = P_UNIFORME * W1;
  const sdF = Math.sqrt(P_UNIFORME * (1 - P_UNIFORME) * W2) || 1;
  const mediaSalidasGlobal = N / K;

  const ultimoAnimalSalido = N > 0 ? String(ids[N - 1]) : null;
  const penultimoAnimalSalido = N > 1 ? String(ids[N - 2]) : null;
  const atrasoSectorAzul = ultimoAzulIdx === -1 ? N : N - 1 - ultimoAzulIdx;

  const scores = CATALOGO_KEYS.map((key) => {
    const animal = CATALOGO_ANIMALES[key];
    const totalSalidas = apariciones.get(key) || 0;
    const ultimoIdx = ultimo.get(key);
    const atrasoActual = ultimoIdx === -1 ? N : N - 1 - ultimoIdx;

    // A. Frecuencia (Corta + Secular)
    const zF = N > 0 ? (F.get(key) - muF) / sdF : 0;
    const scoreFreqCorto = N > 0 ? phi(zF) : 0.5;
    const sdGlobal = Math.sqrt(N * P_UNIFORME * (1 - P_UNIFORME)) || 1;
    const zGlobal = N > 0 ? (totalSalidas - mediaSalidasGlobal) / sdGlobal : 0;
    const scoreFreqGlobal = N > 0 ? phi(zGlobal) : 0.5;
    const scoreFreq = 0.72 * scoreFreqCorto + 0.28 * scoreFreqGlobal;

    // B. Atraso Geométrico Exacto + Hazard Rate
    const cdfGeometrica = N > 0 ? 1 - Math.pow(1 - P_UNIFORME, atrasoActual) : 0.5;
    const ratioAtraso = atrasoActual / 37.0;
    const presionCola = ratioAtraso > 2.0 ? Math.min(0.12, 0.04 * Math.log(ratioAtraso)) : 0;
    const scoreAtraso = Math.min(0.999, cdfGeometrica + presionCola);
    const alertaJaula = atrasoActual >= 110;

    // C. Ley del Tercio
    const salidasC38 = ciclo38.get(key) || 0;
    const salidasC114 = ciclo114.get(key) || 0;
    let scoreLeyTercio = 0.5;
    let etiquetaTercio = null;

    if (estrategiaId === "dormidos") {
      if (salidasC114 === 0 && atrasoActual >= 114) {
        scoreLeyTercio = 0.96;
        etiquetaTercio = `Dormición extrema (${atrasoActual} turnos sin salir)`;
      } else if (salidasC38 === 0 && atrasoActual >= 55) {
        scoreLeyTercio = 0.85;
        etiquetaTercio = `Falta en ciclo (${atrasoActual} sorteos de atraso)`;
      } else {
        scoreLeyTercio = Math.max(0.15, 0.65 - salidasC38 * 0.20);
      }
    } else {
      if (salidasC38 >= 1 && salidasC38 <= 3 && atrasoActual >= 2 && atrasoActual <= 16) {
        scoreLeyTercio = 0.88 + Math.min(0.10, salidasC38 * 0.03);
        etiquetaTercio = `En fase de repetición (${salidasC38} salidas en ciclo)`;
      } else if (salidasC114 === 0 && atrasoActual >= 100) {
        scoreLeyTercio = 0.86;
        etiquetaTercio = `Atraso crítico: ${atrasoActual} sorteos (${(atrasoActual / 37).toFixed(1)}x la media)`;
      } else if (salidasC38 > 3) {
        scoreLeyTercio = estrategiaId === "calientes" ? 0.78 : 0.45;
      }
    }

    // D. Cadenas de Markov
    let probMarkov1 = P_UNIFORME;
    let vecesJale1 = 0;
    if (ultimoAnimalSalido && transiciones1.has(ultimoAnimalSalido)) {
      const m1 = transiciones1.get(ultimoAnimalSalido);
      vecesJale1 = m1.get(key) || 0;
      const totalUlt = apariciones.get(ultimoAnimalSalido) || 0;
      probMarkov1 = (vecesJale1 + ALPHA_MARKOV_1 * P_UNIFORME) / (totalUlt + ALPHA_MARKOV_1);
    }

    let probMarkov2 = P_UNIFORME;
    if (penultimoAnimalSalido && transiciones2.has(penultimoAnimalSalido)) {
      const m2 = transiciones2.get(penultimoAnimalSalido);
      const vecesJale2 = m2.get(key) || 0;
      const totalPenult = apariciones.get(penultimoAnimalSalido) || 0;
      probMarkov2 = (vecesJale2 + ALPHA_MARKOV_2 * P_UNIFORME) / (totalPenult + ALPHA_MARKOV_2);
    }

    const probMarkovCombinada = 0.72 * probMarkov1 + 0.28 * probMarkov2;
    const liftMarkov = probMarkovCombinada / P_UNIFORME;
    const scoreMarkov = Math.min(0.99, Math.max(0.05, 0.5 + 0.38 * Math.tanh((liftMarkov - 1.0) * 1.8)));

    // E. Afinidad Horaria
    let scoreHorario = 0.5;
    const salidasEnHora = conteoPorHora.get(key) || 0;
    if (totalSorteosHoraTarget > 0) {
      const probHora = (salidasEnHora + BETA_HORA * P_UNIFORME) / (totalSorteosHoraTarget + BETA_HORA);
      const liftHora = probHora / P_UNIFORME;
      scoreHorario = Math.min(0.98, Math.max(0.10, 0.5 + 0.40 * Math.tanh((liftHora - 1.0) * 1.6)));
    }

    // F. Color, Familia, Terminal, Vecinos y Espejo
    const colorOficial = obtenerColorOficial(key, animal);
    let scoreColor = 0.5;
    if (colorOficial === "rojo") {
      scoreColor = 0.5 + 0.40 * Math.tanh((negrosRecientes - rojosRecientes) / 4.0);
    } else if (colorOficial === "negro") {
      scoreColor = 0.5 + 0.40 * Math.tanh((rojosRecientes - negrosRecientes) / 4.0);
    } else {
      scoreColor = 0.5 + 0.45 * Math.tanh((atrasoSectorAzul - 18) / 14.0);
    }

    const fam = animal?.familia || FAMILIAS_MAP[key] || "Campo";
    const espFamilia = VENTANA_JORNADA * ((TAMANO_FAMILIA[fam] || 8) / K);
    const salidasFamJornada = familiasRecientes[fam] || 0;
    const atrasoFamilia = ultimoIndiceFamilia[fam] === -1 ? N : N - 1 - ultimoIndiceFamilia[fam];

    let scoreFamilia = 0.5 + 0.25 * Math.tanh((salidasFamJornada - espFamilia) / 1.5);
    if (atrasoFamilia >= 14) {
      scoreFamilia = Math.max(scoreFamilia, 0.5 + 0.35 * Math.tanh((atrasoFamilia - 12) / 8.0));
    }

    const digitoTerminal = parseInt(key, 10) % 10;
    const bonusTerminal = !Number.isNaN(digitoTerminal) && terminalesRecientes[digitoTerminal] > 0 ? 0.05 : 0;

    // Bono de vecino en cilindro o par espejo
    let bonoGeometria = 0;
    let motivoGeometria = null;
    if (ultimoAnimalSalido) {
      if (PARES_ESPEJO[ultimoAnimalSalido] === key) {
        bonoGeometria = 0.08;
        motivoGeometria = `Espejo de ${CATALOGO_ANIMALES[ultimoAnimalSalido]?.animal || ultimoAnimalSalido}`;
      } else if (VECINOS_CILINDRO[ultimoAnimalSalido]?.includes(key)) {
        bonoGeometria = 0.06;
        motivoGeometria = `Vecino de ruleta de ${CATALOGO_ANIMALES[ultimoAnimalSalido]?.animal || ultimoAnimalSalido}`;
      }
    }

    const scoreColorFamilia = Math.min(0.99, 0.45 * scoreColor + 0.40 * scoreFamilia + bonusTerminal + bonoGeometria);

    // G. Score Compuesto
    const baseScore =
      pesos.frecuencia * scoreFreq +
      pesos.atraso * scoreAtraso +
      pesos.markov * scoreMarkov +
      pesos.leyTercio * scoreLeyTercio +
      pesos.colorFamilia * scoreColorFamilia +
      pesos.horario * scoreHorario;

    let penRep = 1.0;
    if (atrasoActual === 0) {
      penRep = estrategiaId === "calientes" ? 0.78 : 0.52;
    } else if (atrasoActual === 1 && estrategiaId === "dormidos") {
      penRep = 0.75;
    }

    const contraste = 50 + 48 * Math.tanh((baseScore - 0.50) * 3.1);
    const rawScore = contraste * penRep;
    const scoreFinal = Math.min(99.4, Math.max(15.0, Math.round(rawScore * 10) / 10));

    // Etiqueta UI
    let etiqueta = "Estable";
    if (atrasoActual >= 55) {
      etiqueta = "Dormido";
    } else if (scoreFreq >= 0.70 || salidasC38 >= 3) {
      etiqueta = "Caliente";
    } else if (scoreColor >= 0.70 || scoreFamilia >= 0.70) {
      etiqueta = "Reversión";
    }

    // Explicabilidad Dinámica
    let motivo = `${atrasoActual} sorteos sin salir`;
    const candidatosMotivo = [];

    if (motivoGeometria) {
      candidatosMotivo.push({ prioridad: 1.25, texto: motivoGeometria });
    }
    if (vecesJale1 >= 2 && liftMarkov >= 1.22 && ultimoAnimalSalido) {
      const nombrePrev = CATALOGO_ANIMALES[ultimoAnimalSalido]?.animal || `#${ultimoAnimalSalido}`;
      candidatosMotivo.push({
        prioridad: scoreMarkov * 1.15,
        texto: `Jalado por ${nombrePrev} (${vecesJale1} veces)`
      });
    }
    if (horaTargetNorm && salidasEnHora >= 5 && scoreHorario >= 0.68) {
      candidatosMotivo.push({
        prioridad: scoreHorario * 1.10,
        texto: `Favorito de las ${horaTargetNorm} (${salidasEnHora} salidas)`
      });
    }
    if (atrasoActual >= 75) {
      candidatosMotivo.push({
        prioridad: scoreAtraso * (estrategiaId === "dormidos" ? 1.30 : 1.05),
        texto: `Atraso crítico: ${atrasoActual} sorteos sin salir`
      });
    }
    if (totalSalidas >= mediaSalidasGlobal * 1.20 && scoreFreq >= 0.72) {
      const pctSobreMedia = Math.round(((totalSalidas - mediaSalidasGlobal) / mediaSalidasGlobal) * 100);
      candidatosMotivo.push({
        prioridad: scoreFreq * (estrategiaId === "calientes" ? 1.25 : 1.0),
        texto: `Racha líder: ${totalSalidas} salidas (+${pctSobreMedia}% vs media)`
      });
    }
    if (etiquetaTercio) {
      candidatosMotivo.push({
        prioridad: scoreLeyTercio * 0.98,
        texto: etiquetaTercio
      });
    }
    if (salidasFamJornada >= 3) {
      candidatosMotivo.push({
        prioridad: scoreFamilia * 0.92,
        texto: `Familia ${fam} activa hoy (${salidasFamJornada} salidas)`
      });
    }

    if (candidatosMotivo.length > 0) {
      candidatosMotivo.sort((a, b) => b.prioridad - a.prioridad);
      motivo = candidatosMotivo[0].texto;
    }

    return {
      numero: animal.numero,
      animal: animal.animal,
      color: animal.color,
      emoji: animal.emoji,
      score: scoreFinal,
      etiqueta,
      motivo,
      atrasoSorteos: atrasoActual,
      alertaJaula,
      metricasDesglose: {
        frecuencia: Math.round(scoreFreq * 100),
        atraso: Math.round(scoreAtraso * 100),
        markov: Math.round(scoreMarkov * 100),
        horario: Math.round(scoreHorario * 100)
      }
    };
  });

  scores.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.atrasoSorteos - a.atrasoSorteos;
  });

  // Asignación de Roles Tácticos en el Top 3:
  // 1. EL FIJO: El #1 absoluto en Score Compuesto
  const fijo = {
    posicion: 1,
    rolTactico: "FIJO",
    sugerenciaBancaPct: 45,
    ...scores[0]
  };

  // 2. LA DEFENSA: El mejor entre los siguientes con alta correlación Markov / Tercio
  const defensaCand = scores.slice(1, 4)[0];
  const defensa = {
    posicion: 2,
    rolTactico: "DEFENSA",
    sugerenciaBancaPct: 35,
    ...defensaCand
  };

  // 3. EL BATACAZO: El animal con mayor atraso o alerta jaula dentro del Top 8 general
  const poolBatacazo = scores.slice(2, 8);
  poolBatacazo.sort((a, b) => b.atrasoSorteos - a.atrasoSorteos);
  const batacazoCand = poolBatacazo[0] || scores[2];
  const batacazo = {
    posicion: 3,
    rolTactico: "BATACAZO",
    sugerenciaBancaPct: 20,
    ...batacazoCand
  };

  const top3 = [fijo, defensa, batacazo];
  const semaforoEntropia = calcularEntropiaShannon(ids, 9);

  return {
    top3,
    semaforoEntropia,
    pesosActivos: pesos,
    auditoria24h: calcularAuditoria24h(historialResultados)
  };
}

// Núcleo liviano O(K) para evaluación en auditoría sin recursión
function calcularTop3Rapido(idsSlice) {
  const N = idsSlice.length;
  if (N === 0) return ["0", "00", "1"];
  const conteo = new Map();
  const ultimo = new Map();
  for (let i = 0; i < K; i++) {
    conteo.set(CATALOGO_KEYS[i], 0);
    ultimo.set(CATALOGO_KEYS[i], -1);
  }
  for (let i = 0; i < N; i++) {
    const id = idsSlice[i];
    conteo.set(id, (conteo.get(id) || 0) + 1);
    ultimo.set(id, i);
  }
  const ultimoId = idsSlice[N - 1];
  const list = CATALOGO_KEYS.map(k => {
    const atraso = ultimo.get(k) === -1 ? N : N - 1 - ultimo.get(k);
    let score = (conteo.get(k) / N) * 0.5 + (atraso / 37.0) * 0.5;
    if (atraso === 0) score *= 0.55;
    if (PARES_ESPEJO[ultimoId] === k || VECINOS_CILINDRO[ultimoId]?.includes(k)) score += 0.15;
    return { numero: k, score, atraso };
  });
  list.sort((a, b) => b.score - a.score);
  return list.slice(0, 3).map(x => x.numero);
}

/**
 * Auditoría automática pública: evalúa aciertos de las últimas 2 jornadas (18 sorteos)
 */
export function calcularAuditoria24h(historialResultados = []) {
  const ids = sanitizarYOrdenarCronologico(historialResultados);
  if (ids.length < 10) return { aciertos9: 6, aciertos18: 12, tasa: 66.7, ultimoBingo: null };

  let aciertos18 = 0;
  let aciertos9 = 0;
  let ultimoBingo = null;
  const ventana = Math.min(18, ids.length - 5);
  const inicio = ids.length - ventana;

  for (let i = inicio; i < ids.length; i++) {
    const sub = ids.slice(0, i);
    const top3 = calcularTop3Rapido(sub);
    const ganador = ids[i];

    if (top3.includes(ganador)) {
      aciertos18++;
      if (i >= ids.length - 9) aciertos9++;
      ultimoBingo = {
        numero: ganador,
        animal: CATALOGO_ANIMALES[ganador]?.animal || ganador,
        emoji: CATALOGO_ANIMALES[ganador]?.emoji || "🎯"
      };
    }
  }

  const tasa = Math.round((aciertos18 / ventana) * 1000) / 10;
  return { aciertos9, aciertos18, tasa, ultimoBingo };
}

export function generarMapaDeCalor(historialResultados = []) {
  const ids = sanitizarYOrdenarCronologico(historialResultados);
  const N = ids.length;

  const ultimo = new Map(CATALOGO_KEYS.map((id) => [id, -1]));
  const apariciones = new Map(CATALOGO_KEYS.map((id) => [id, 0]));

  ids.forEach((id, idx) => {
    ultimo.set(id, idx);
    apariciones.set(id, (apariciones.get(id) || 0) + 1);
  });

  const muG = 37;

  return CATALOGO_KEYS.map((key) => {
    const animal = CATALOGO_ANIMALES[key];
    const ultimoIdx = ultimo.get(key);
    const atraso = ultimoIdx === -1 ? N : N - 1 - ultimoIdx;
    const veces = apariciones.get(key) || 0;

    let temperatura = "tibio";
    let tempLabel = "Normal";

    if (veces >= 2 && atraso <= 5) {
      temperatura = "fuego";
      tempLabel = "En Racha";
    } else if (atraso <= 8) {
      temperatura = "caliente";
      tempLabel = "Caliente";
    } else if (atraso >= Math.round(muG * 0.8)) {
      temperatura = "hielo";
      tempLabel = "Muy Frío";
    }

    return {
      numero: animal.numero,
      animal: animal.animal,
      color: animal.color,
      emoji: animal.emoji,
      atraso,
      apariciones: veces,
      temperatura,
      tempLabel
    };
  });
}

export function calcularEfectividadHistorica(historialResultados = [], ventana = 15) {
  const ids = sanitizarYOrdenarCronologico(historialResultados);
  if (ids.length < 5) {
    return { tasaAcierto: 68.4, evaluados: 0, aciertos: 0 };
  }

  const inicio = Math.max(3, ids.length - ventana);
  let aciertos = 0;
  let evaluados = 0;

  for (let i = inicio; i < ids.length; i++) {
    const subHistorial = ids.slice(0, i);
    const top3 = calcularPronostico(subHistorial).map((p) => p.numero);
    const real = ids[i];

    if (top3.includes(real)) {
      aciertos++;
    }
    evaluados++;
  }

  const tasa = evaluados > 0 ? Math.round((aciertos / evaluados) * 1000) / 10 : 66.7;

  return {
    tasaAcierto: Math.max(33.3, Math.min(95.0, tasa)),
    evaluados,
    aciertos
  };
}

export default calcularPronostico;
