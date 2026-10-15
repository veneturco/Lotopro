import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBNplvOMkRFXO9cFeVJS3fcA6vZyoMQYUc",
  authDomain: "activopro-42efb.firebaseapp.com",
  projectId: "activopro-42efb",
  storageBucket: "activopro-42efb.firebasestorage.app",
  messagingSenderId: "104561590544",
  appId: "1:104561590544:web:eb7de534a3c0599274a595"
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);

const CACHE_KEY = "lotopro_offline_cache_v1";

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

export function obtenerDeCacheLocal() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("No se pudo leer el caché local", e);
  }
  return null;
}

export function guardarEnCacheLocal(datos) {
  try {
    if (Array.isArray(datos) && datos.length > 0) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(datos));
    }
  } catch (e) {
    console.warn("No se pudo guardar en el caché local", e);
  }
}

/**
 * Suscripción con política "Cache-First & Live-Sync"
 */
export function suscribirUltimosResultados(onUpdate, onError) {
  // 1. Emitir inmediatamente el caché offline si existe
  const enCache = obtenerDeCacheLocal();
  if (enCache) {
    onUpdate({ resultados: enCache, isLive: false, source: "offline_cache" });
  }

  try {
    const docRef = doc(db, "stats", "latest");
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const list = Array.isArray(data?.resultados) ? data.resultados : [];
          guardarEnCacheLocal(list);
          onUpdate({ resultados: list, isLive: true, source: "firestore" });
        } else {
          console.warn("Documento 'stats/latest' no existe aún. Usando dataset mock.");
          const fallback = enCache || MOCK_RESULTADOS;
          onUpdate({ resultados: fallback, isLive: false, source: "mock_initial" });
        }
      },
      (error) => {
        console.error("Error en conexión Firestore:", error);
        if (onError) onError(error);
        const fallback = enCache || MOCK_RESULTADOS;
        onUpdate({ resultados: fallback, isLive: false, source: "mock_error" });
      }
    );
  } catch (err) {
    console.error("Excepción al suscribir a Firestore:", err);
    if (onError) onError(err);
    const fallback = enCache || MOCK_RESULTADOS;
    onUpdate({ resultados: fallback, isLive: false, source: "mock_error" });
    return () => {};
  }
}
