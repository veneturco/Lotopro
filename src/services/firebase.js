import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBNplvOMkRFXO9cFeVJS3fcA6vZyoMQYUc",
  authDomain: "activopro-42efb.firebaseapp.com",
  projectId: "activopro-42efb",
  storageBucket: "activopro-42efb.firebasestorage.app",
  messagingSenderId: "104561590544",
  appId: "1:104561590544:web:eb7de534a3c0599274a595",
  measurementId: "G-4V1S5D2XYD"
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);

const CACHE_KEY_V2 = "lotopro_offline_cache_v2";

export const MOCK_RESULTADOS = [
  { name_animal: "Jirafa", numero: "35", time_s: "07:00 PM", time_schedule: "2026-10-14 19:00:00" },
  { name_animal: "Perro", numero: "27", time_s: "06:00 PM", time_schedule: "2026-10-14 18:00:00" },
  { name_animal: "Delfín", numero: "0", time_s: "05:00 PM", time_schedule: "2026-10-14 17:00:00" },
  { name_animal: "Tigre", numero: "10", time_s: "04:00 PM", time_schedule: "2026-10-14 16:00:00" },
  { name_animal: "Gallo", numero: "21", time_s: "01:00 PM", time_schedule: "2026-10-14 13:00:00" },
  { name_animal: "Caballo", numero: "12", time_s: "12:00 PM", time_schedule: "2026-10-14 12:00:00" },
  { name_animal: "León", numero: "5", time_s: "11:00 AM", time_schedule: "2026-10-14 11:00:00" },
  { name_animal: "Ballena", numero: "00", time_s: "10:00 AM", time_schedule: "2026-10-14 10:00:00" },
  { name_animal: "Águila", numero: "9", time_s: "09:00 AM", time_schedule: "2026-10-14 09:00:00" }
];

export function obtenerFechaHoyString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function obtenerDeCacheLocal() {
  try {
    const raw = localStorage.getItem(CACHE_KEY_V2);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("No se pudo leer el caché local v2", e);
  }
  return null;
}

export function guardarEnCacheLocal(cacheData) {
  try {
    if (cacheData && typeof cacheData === "object") {
      localStorage.setItem(CACHE_KEY_V2, JSON.stringify(cacheData));
    }
  } catch (e) {
    console.warn("No se pudo guardar en el caché local v2", e);
  }
}

/**
 * Suscripción con política "Date-Aware Cache & Smooth Sync"
 * Evita el parpadeo de datos viejos de ayer contra listas vacías de hoy.
 */
export function suscribirUltimosResultados(onUpdate, onError) {
  const hoy = obtenerFechaHoyString();
  const cache = obtenerDeCacheLocal();

  // 1. Emisión inicial controlada (sin parpadeo)
  if (cache) {
    if (cache.fecha === hoy && Array.isArray(cache.resultadosHoy)) {
      // El caché pertenece al día de hoy
      onUpdate({
        resultados: cache.resultadosHoy,
        historico: (cache.historicoReciente && cache.historicoReciente.length > 0)
          ? cache.historicoReciente
          : (cache.resultadosHoy.length > 0 ? cache.resultadosHoy : MOCK_RESULTADOS),
        isLive: false,
        source: "cache_today"
      });
    } else {
      // El caché es de ayer o previo: hoy arranca vacío, pero preservamos el histórico previo para el pronóstico matutino
      const prevDraws = (cache.resultadosHoy && cache.resultadosHoy.length > 0)
        ? cache.resultadosHoy
        : (cache.historicoReciente || MOCK_RESULTADOS);

      onUpdate({
        resultados: [],
        historico: prevDraws,
        isLive: false,
        source: "cache_previous_day"
      });
    }
  } else {
    // Primera carga sin caché previo
    onUpdate({
      resultados: [],
      historico: MOCK_RESULTADOS,
      isLive: false,
      source: "initial_empty"
    });
  }

  // 2. Conexión en tiempo real con Firestore
  try {
    const docRef = doc(db, "stats", "latest");
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const fechaDoc = data?.fecha || "";
          const esDeHoy = fechaDoc === hoy;
          const list = Array.isArray(data?.resultados) ? data.resultados : [];

          // Preservar el histórico de referencia para el pronóstico
          const cacheActual = obtenerDeCacheLocal();
          let baseHistorica = MOCK_RESULTADOS;

          if (list.length > 0) {
            baseHistorica = list;
          } else if (cacheActual?.historicoReciente?.length > 0) {
            baseHistorica = cacheActual.historicoReciente;
          }

          // Si el documento en Firestore es de ayer, para la UI hoy arranca limpio (esperando aperturas)
          const sorteosHoyParaUI = esDeHoy ? list : [];

          // Guardar estado consolidado del día
          guardarEnCacheLocal({
            fecha: hoy,
            resultadosHoy: sorteosHoyParaUI,
            historicoReciente: baseHistorica
          });

          onUpdate({
            resultados: sorteosHoyParaUI,
            historico: baseHistorica,
            isLive: true,
            source: esDeHoy ? "firestore_today" : "firestore_previous_day"
          });
        } else {
          console.warn("Documento 'stats/latest' no existe aún. Usando histórico de respaldo.");
          const cacheActual = obtenerDeCacheLocal();
          const hist = cacheActual?.historicoReciente || MOCK_RESULTADOS;
          onUpdate({
            resultados: [],
            historico: hist,
            isLive: false,
            source: "firestore_not_found"
          });
        }
      },
      (error) => {
        console.error("Error en conexión Firestore:", error);
        if (onError) onError(error);
        const cacheActual = obtenerDeCacheLocal();
        const hist = cacheActual?.historicoReciente || MOCK_RESULTADOS;
        onUpdate({
          resultados: cacheActual?.resultadosHoy || [],
          historico: hist,
          isLive: false,
          source: "firestore_error"
        });
      }
    );
  } catch (err) {
    console.error("Excepción al suscribir a Firestore:", err);
    if (onError) onError(err);
    const cacheActual = obtenerDeCacheLocal();
    onUpdate({
      resultados: cacheActual?.resultadosHoy || [],
      historico: cacheActual?.historicoReciente || MOCK_RESULTADOS,
      isLive: false,
      source: "exception"
    });
    return () => {};
  }
}
