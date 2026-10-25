import React, { useState, useEffect, useMemo, useRef } from "react";
import Header from "./components/Header";
import HeroCard from "./components/HeroCard";
import CountdownTimer from "./components/CountdownTimer";
import PredictionCard from "./components/PredictionCard";
import ResultsGrid from "./components/ResultsGrid";
import SkeletonLoader from "./components/SkeletonLoader";
import HeatmapModal from "./components/HeatmapModal";
import ShareTicketModal from "./components/ShareTicketModal";
import BetCalculatorModal from "./components/BetCalculatorModal";
import TimeFilterModal from "./components/TimeFilterModal";
import RouletteModal from "./components/RouletteModal";
import MyPlaysModal from "./components/MyPlaysModal";
import FamiliesWidget from "./components/FamiliesWidget";
import PWAInstallBanner from "./components/PWAInstallBanner";
import { suscribirUltimosResultados, MOCK_RESULTADOS } from "./services/firebase";
import HISTORICO_BASE from "./constants/historicoBase.json";
import {
  calcularPronostico,
  obtenerAnalisisCompleto,
  generarMapaDeCalor,
  calcularEfectividadHistorica,
  ESTRATEGIAS
} from "./utils/predictiveEngine";
import { narrarResultado } from "./utils/speech";
import { resolverAnimal } from "./constants/catalogo";
import { obtenerMinutosDelDia, calcularTiempoProximoSorteo } from "./utils/schedule";
import { WifiOff, PartyPopper } from "lucide-react";

export default function App() {
  const [resultados, setResultados] = useState([]);
  const [historico, setHistorico] = useState(MOCK_RESULTADOS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [estrategia, setEstrategia] = useState("equilibrado");

  // Preferencias de Usuario: Tema Oscuro y Voz Narradora
  const [temaOscuro, setTemaOscuro] = useState(() => {
    return localStorage.getItem("lotopro_theme") === "dark";
  });
  const [vozHabilitada, setVozHabilitada] = useState(() => {
    return localStorage.getItem("lotopro_voice") === "true";
  });

  // Referencia mutable para la voz para evitar re-suscripciones a Firestore
  const vozHabilitadaRef = useRef(vozHabilitada);
  useEffect(() => {
    vozHabilitadaRef.current = vozHabilitada;
  }, [vozHabilitada]);

  // Estados de Modales
  const [isHeatmapOpen, setIsHeatmapOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [isHorariosOpen, setIsHorariosOpen] = useState(false);
  const [isRuletaOpen, setIsRuletaOpen] = useState(false);
  const [isCartonOpen, setIsCartonOpen] = useState(false);

  const prevUltimoSorteoRef = useRef(null);

  // Manejo de clase 'dark' en el elemento HTML
  useEffect(() => {
    if (temaOscuro) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("lotopro_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("lotopro_theme", "light");
    }
  }, [temaOscuro]);

  const handleToggleTema = () => {
    setTemaOscuro((prev) => !prev);
  };

  const handleToggleVoz = () => {
    setVozHabilitada((prev) => {
      const nuevo = !prev;
      localStorage.setItem("lotopro_voice", String(nuevo));
      return nuevo;
    });
  };

  // 1. Suscripción en tiempo real estabilizada (sin parpadeo)
  useEffect(() => {
    setLoading(true);
    const unsubscribe = suscribirUltimosResultados(
      ({ resultados: data, historico: histData, isLive: liveStatus }) => {
        setResultados(data || []);
        if (Array.isArray(histData) && histData.length > 0) {
          setHistorico(histData);
        }
        setIsLive(liveStatus);
        setLoading(false);
        setError(null);

        // Si llega un nuevo sorteo y la voz está habilitada, narrar el más reciente cronológicamente
        if (Array.isArray(data) && data.length > 0) {
          const sorted = [...data].sort((a, b) => obtenerMinutosDelDia(b) - obtenerMinutosDelDia(a));
          const masReciente = sorted[0];
          const claveActual = `${masReciente.time_s}-${masReciente.name_animal || masReciente.numero}`;
          if (
            prevUltimoSorteoRef.current &&
            prevUltimoSorteoRef.current !== claveActual &&
            vozHabilitadaRef.current
          ) {
            const fig = resolverAnimal(masReciente);
            narrarResultado(fig, masReciente.time_s);
          }
          prevUltimoSorteoRef.current = claveActual;
        }
      },
      (err) => {
        console.error("Firestore listener error:", err);
        setError("Modo sin conexión. Mostrando datos locales optimizados.");
        setLoading(false);
      }
    );

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []); // Montaje único: nunca re-suscribe al conmutar voz

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // 2. Ordenamiento cronológico para la UI (Más reciente arriba / Descendente)
  const resultadosUI = useMemo(() => {
    if (!resultados || resultados.length === 0) return [];

    return [...resultados].sort((a, b) => {
      const minA = obtenerMinutosDelDia(a);
      const minB = obtenerMinutosDelDia(b);
      if (minA !== minB) return minB - minA;
      return 0;
    });
  }, [resultados]);

  // Base de datos completa para el motor predictivo:
  // Combina el histórico real base (468 sorteos) + los sorteos en vivo de hoy sin duplicados
  const datosParaPronostico = useMemo(() => {
    const sorteosHoy = Array.isArray(resultados) ? resultados : [];
    const base = Array.isArray(HISTORICO_BASE) && HISTORICO_BASE.length > 0
      ? HISTORICO_BASE
      : (Array.isArray(historico) && historico.length > 0 ? historico : MOCK_RESULTADOS);

    if (sorteosHoy.length === 0) {
      return base;
    }

    // Deduplicación por clave única time_schedule (fecha + hora)
    const vistos = new Set(base.map(item => item.time_schedule).filter(Boolean));
    const nuevos = sorteosHoy.filter(item => !item.time_schedule || !vistos.has(item.time_schedule));

    return [...base, ...nuevos];
  }, [resultados, historico]);

  // Información del próximo sorteo en base a la hora actual (actualizado dinámicamente)
  const [infoProximo, setInfoProximo] = useState(() => calcularTiempoProximoSorteo());
  useEffect(() => {
    const timer = setInterval(() => {
      setInfoProximo(calcularTiempoProximoSorteo());
    }, 10000); // Re-evalúa cada 10s el horario próximo
    return () => clearInterval(timer);
  }, []);

  // 3. Pronóstico Estocástico reactivo v2.0 (con Roles Tácticos, Entropía y Auditoría)
  const analisisPredictivo = useMemo(() => {
    const horaObjetivo = infoProximo?.proximoHorario || infoProximo?.proximoSorteo || null;
    return obtenerAnalisisCompleto(datosParaPronostico, estrategia, horaObjetivo);
  }, [datosParaPronostico, estrategia, infoProximo?.proximoHorario, infoProximo?.proximoSorteo]);

  const pronosticos = analisisPredictivo.top3;
  const semaforoEntropia = analisisPredictivo.semaforoEntropia;
  const auditoria24h = analisisPredictivo.auditoria24h;

  // 4. Datos del Mapa de Calor completo (38 animales)
  const heatmapData = useMemo(() => {
    return generarMapaDeCalor(datosParaPronostico);
  }, [datosParaPronostico]);

  // 5. Métrica de Efectividad Histórica (Backtesting)
  const efectividad = useMemo(() => {
    return calcularEfectividadHistorica(datosParaPronostico);
  }, [datosParaPronostico]);

  const ultimoSorteo = resultadosUI[0] || null;
  const ultimoSorteoReferencia = ultimoSorteo || historico[0] || MOCK_RESULTADOS[0];
  const esAperturaMatutina = resultadosUI.length === 0;

  // Verificamos si el último ganador coincide con el pronóstico previo
  const fueAciertoReciente = useMemo(() => {
    if (!ultimoSorteo || pronosticos.length === 0) return false;
    const numGanador = String(ultimoSorteo.numero || "");
    return pronosticos.some((p) => String(p.numero) === numGanador);
  }, [ultimoSorteo, pronosticos]);

  const nombreEstrategia = ESTRATEGIAS[estrategia]?.nombre || "Equilibrado";

  return (
    <div
      className={`min-h-screen py-4 px-3 sm:px-4 transition-colors duration-500 ${
        temaOscuro
          ? "bg-gradient-to-br from-neutral-950 via-neutral-900 to-black text-neutral-100"
          : "bg-gradient-to-br from-yellow-400 via-amber-400 to-yellow-500 text-slate-800"
      }`}
    >
      <main
        className={`max-w-md mx-auto rounded-[2.5rem] p-4 sm:p-5 space-y-4 shadow-2xl transition-all duration-300 ${
          temaOscuro
            ? "bg-neutral-900/60 backdrop-blur-2xl border border-neutral-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.7)]"
            : "bg-white/40 backdrop-blur-2xl border border-white/50 shadow-premium"
        }`}
      >
        {/* Cabecera PWA con Toggles de Tema y Voz */}
        <Header
          isLive={isLive}
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
          vozHabilitada={vozHabilitada}
          onToggleVoz={handleToggleVoz}
          temaOscuro={temaOscuro}
          onToggleTema={handleToggleTema}
        />

        {/* Alerta de Error / Modo Offline */}
        {error && (
          <div className="flex items-center space-x-2 p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-950 dark:text-amber-300 text-xs font-semibold">
            <WifiOff className="w-4 h-4 shrink-0 text-amber-800 dark:text-amber-400" />
            <p className="flex-1">{error}</p>
          </div>
        )}

        {/* Banner de Celebración si hubo acierto en el último sorteo */}
        {fueAciertoReciente && (
          <div className="flex items-center space-x-2 p-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md text-xs font-bold animate-bounce">
            <PartyPopper className="w-4 h-4 text-yellow-200" />
            <span>¡Acierto registrado! El último ganador estaba en el Top 3.</span>
          </div>
        )}

        {/* Contenido Principal */}
        {loading ? (
          <SkeletonLoader />
        ) : (
          <>
            {/* Sección Hero: Último Sorteo Oficial o Referencia de Cierre */}
            {ultimoSorteo ? (
              <HeroCard resultado={ultimoSorteo} />
            ) : (
              <HeroCard resultado={ultimoSorteoReferencia} esCierreAnterior={true} />
            )}

            {/* Cronómetro al Próximo Sorteo Oficial */}
            <CountdownTimer />

            {/* Sección Predictiva con Selector de Estrategia, Roles Tácticos y Gestor de Banca */}
            <PredictionCard
              pronosticos={pronosticos}
              proximoSorteoHora={infoProximo?.proximoSorteo}
              estrategiaActual={estrategia}
              onCambiarEstrategia={setEstrategia}
              efectividad={efectividad}
              esAperturaMatutina={esAperturaMatutina}
              semaforoEntropia={semaforoEntropia}
              auditoria24h={auditoria24h}
              onAbrirHeatmap={() => setIsHeatmapOpen(true)}
              onAbrirHorarios={() => setIsHorariosOpen(true)}
              onAbrirShare={() => setIsShareOpen(true)}
              onAbrirCalculadora={() => setIsCalcOpen(true)}
              onAbrirRuleta={() => setIsRuletaOpen(true)}
              onAbrirCarton={() => setIsCartonOpen(true)}
            />

            {/* Radar de Familias y Linajes Tradicionales */}
            <FamiliesWidget resultados={datosParaPronostico} />

            {/* Sección Histórica: Sorteos del Día */}
            <ResultsGrid resultados={resultadosUI} />
          </>
        )}

        {/* Footer Minimalista */}
        <footer className="pt-3 pb-1 text-center text-[11px] text-neutral-700/80 dark:text-neutral-400 font-semibold border-t border-white/20 dark:border-neutral-800">
          <p>LotoPro PWA · Inteligencia Predictiva y Estadísticas en Vivo</p>
          <p className="text-[10px] text-neutral-600/70 dark:text-neutral-500 font-normal mt-0.5">
            Sincronizado vía Firebase Firestore · v1.4.1 (Estable)
          </p>
        </footer>
      </main>

      {/* Banner Flotante de Instalación PWA (1-Tap) */}
      <PWAInstallBanner />

      {/* Modales Interactivos */}
      <HeatmapModal
        isOpen={isHeatmapOpen}
        onClose={() => setIsHeatmapOpen(false)}
        heatmapData={heatmapData}
      />

      <TimeFilterModal
        isOpen={isHorariosOpen}
        onClose={() => setIsHorariosOpen(false)}
        resultados={datosParaPronostico}
      />

      <ShareTicketModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        pronosticos={pronosticos}
        estrategiaNombre={nombreEstrategia}
        semaforoEntropia={semaforoEntropia}
      />

      <BetCalculatorModal
        isOpen={isCalcOpen}
        onClose={() => setIsCalcOpen(false)}
        pronosticos={pronosticos}
      />

      <RouletteModal
        isOpen={isRuletaOpen}
        onClose={() => setIsRuletaOpen(false)}
        pronosticos={pronosticos}
      />

      <MyPlaysModal
        isOpen={isCartonOpen}
        onClose={() => setIsCartonOpen(false)}
        resultados={datosParaPronostico}
      />
    </div>
  );
}
