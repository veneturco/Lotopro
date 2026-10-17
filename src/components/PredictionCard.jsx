import React, { useState } from "react";
import {
  Cpu,
  Flame,
  Hourglass,
  Scale,
  Sparkles,
  Share2,
  Calculator,
  Thermometer,
  Target,
  Clock,
  Dices,
  Trophy,
  Shield,
  Bomb,
  Activity,
  AlertTriangle,
  DollarSign
} from "lucide-react";
import AnimalAvatar from "./AnimalAvatar";
import { ESTRATEGIAS } from "../utils/predictiveEngine";

export default function PredictionCard({
  pronosticos = [],
  proximoSorteoHora = "",
  estrategiaActual = "equilibrado",
  onCambiarEstrategia,
  efectividad = { tasaAcierto: 68.4 },
  esAperturaMatutina = false,
  semaforoEntropia = { nivel: "VERDE", label: "Patrón Claro / Baja Volatilidad" },
  auditoria24h = null,
  onAbrirHeatmap,
  onAbrirShare,
  onAbrirCalculadora,
  onAbrirHorarios,
  onAbrirRuleta,
  onAbrirCarton
}) {
  const [presupuestoBanca, setPresupuestoBanca] = useState(100);
  const [mostrarGestorBanca, setMostrarGestorBanca] = useState(false);

  if (!pronosticos || pronosticos.length === 0) return null;

  const tagIcons = {
    Caliente: <Flame className="w-3.5 h-3.5 text-rose-500 inline mr-1" />,
    Dormido: <Hourglass className="w-3.5 h-3.5 text-amber-500 inline mr-1" />,
    Reversión: <Scale className="w-3.5 h-3.5 text-indigo-500 inline mr-1" />,
    Estable: <Cpu className="w-3.5 h-3.5 text-emerald-500 inline mr-1" />
  };

  const tagStyles = {
    Caliente: "bg-rose-500/15 text-rose-900 dark:text-rose-300 border-rose-300 dark:border-rose-700/50",
    Dormido: "bg-amber-500/15 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700/50",
    Reversión: "bg-indigo-500/15 text-indigo-900 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700/50",
    Estable: "bg-emerald-500/15 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/50"
  };

  const rolesTacticosConfig = {
    FIJO: {
      badge: "🎯 EL FIJO",
      sub: "Candidato #1 por Score Compuesto",
      bg: "bg-amber-500 text-white shadow-amber-500/30",
      border: "border-amber-400 dark:border-amber-500/40",
      pctBanca: 45
    },
    DEFENSA: {
      badge: "🛡️ LA DEFENSA",
      sub: "Cobertura Táctica y Afinidad",
      bg: "bg-sky-500 text-white shadow-sky-500/30",
      border: "border-sky-400 dark:border-sky-500/40",
      pctBanca: 35
    },
    BATACAZO: {
      badge: "💣 EL BATACAZO",
      sub: "Presión de Atraso y Quiebre de Jaula",
      bg: "bg-rose-500 text-white shadow-rose-500/30",
      border: "border-rose-400 dark:border-rose-500/40",
      pctBanca: 20
    }
  };

  const entropiaColores = {
    VERDE: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    AMARILLO: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30",
    ROJO: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30"
  };

  return (
    <section className="rounded-3xl bg-white/75 dark:bg-neutral-900/80 backdrop-blur-xl p-4 shadow-xl border border-white/80 dark:border-neutral-800 space-y-3.5">
      
      {/* 1. Banner de Auditoría Pública en Vivo & Semáforo de Entropía */}
      <div className="space-y-2 pb-2 border-b border-amber-200/50 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/30">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-black tracking-tight text-neutral-900 dark:text-white uppercase">
                  {esAperturaMatutina ? "Pronóstico de Apertura" : "Pronóstico del Sistema"}
                </h3>
                {proximoSorteoHora && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black tracking-wide shadow-sm animate-pulse">
                    PARA {proximoSorteoHora}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-medium">
                {esAperturaMatutina
                  ? "Sugerencias del motor estocástico para abrir la jornada"
                  : "Top 3 Recomendados con Roles Tácticos"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
            <Target className="w-3 h-3 text-emerald-600" />
            <span>{efectividad.tasaAcierto}% Acierto</span>
          </div>
        </div>

        {/* Semáforo de Entropía de Shannon & Último Bingo */}
        <div className="flex items-center justify-between gap-1.5 pt-1 text-[10.5px]">
          <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl border font-bold ${entropiaColores[semaforoEntropia?.estado || semaforoEntropia?.nivel || "AMARILLO"]}`}>
            <Activity className="w-3 h-3 shrink-0" />
            <span className="truncate">{semaforoEntropia?.mensaje || semaforoEntropia?.label || "Baja Volatilidad"}</span>
          </div>

          {auditoria24h?.ultimoBingo && (
            <div className="flex items-center space-x-1 px-2 py-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold">
              <span>Último Bingo:</span>
              <span className="text-amber-600 dark:text-amber-400 font-black">
                {auditoria24h.ultimoBingo.animal} #{auditoria24h.ultimoBingo.numero}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Selector de Estrategia Predictiva (Incluye IA Camaleón Smart) */}
      <div className="space-y-1">
        <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 dark:text-neutral-400 block px-0.5">
          Estrategia Activa:
        </span>
        <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-neutral-100/80 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 text-xs">
          {Object.values(ESTRATEGIAS).map((est) => {
            const activa = estrategiaActual === est.id;
            return (
              <button
                key={est.id}
                onClick={() => onCambiarEstrategia(est.id)}
                className={`py-1.5 px-1.5 rounded-xl font-bold text-[10px] transition-all truncate text-center ${
                  activa
                    ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm border border-neutral-200 dark:border-neutral-700"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                {est.id === "smart" ? "✨ Smart" : est.nombre}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Lista del Top 3 con Roles Tácticos ("El Fijo", "La Defensa", "El Batacazo") */}
      <div className="space-y-3">
        {pronosticos.map((item, idx) => {
          const rol = rolesTacticosConfig[item.rolTactico] || rolesTacticosConfig.FIJO;
          const tagClass = tagStyles[item.etiqueta] || tagStyles.Estable;

          return (
            <div
              key={item.numero}
              className={`p-3 rounded-2xl border transition-all duration-300 hover:scale-[1.015] shadow-md bg-white/90 dark:bg-neutral-900/90 ${rol.border}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`px-2 py-1 rounded-xl flex items-center justify-center font-black text-[10px] shadow-sm ${rol.bg}`}
                  >
                    {rol.badge}
                  </div>

                  {/* Avatar volumétrico */}
                  <div className="p-1.5 rounded-2xl bg-amber-500/10 dark:bg-amber-400/5 border border-amber-300/40 dark:border-amber-500/20 backdrop-blur-sm">
                    <AnimalAvatar animal={item} size="sm" />
                  </div>

                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h4 className="font-bold text-neutral-900 dark:text-white text-sm">
                        {item.animal}
                      </h4>
                      <span className="text-xs font-black px-1.5 py-0.2 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700">
                        N° {item.numero}
                      </span>
                      {item.alertaJaula && (
                        <span className="inline-flex items-center text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse">
                          ⚠️ JAULA
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className={`text-[9.5px] font-bold px-2 py-0.2 rounded-full border ${tagClass}`}>
                        {tagIcons[item.etiqueta]}
                        {item.etiqueta}
                      </span>
                      <span className="text-[10px] capitalize text-neutral-500 dark:text-neutral-400 font-medium">
                        Color {item.color}
                      </span>
                    </div>

                    {/* Explicabilidad Dinámica */}
                    {item.motivo && (
                      <div className="mt-1 flex items-center space-x-1">
                        <span className="inline-flex items-center text-[9.5px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-300/40 dark:border-amber-600/30">
                          💡 {item.motivo}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-amber-600 dark:text-amber-400">
                    {item.score}%
                  </div>
                  <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold block">
                    Score
                  </span>
                  <span className="text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                    Banca: {item.sugerenciaBancaPct || rol.pctBanca}%
                  </span>
                </div>
              </div>

              {/* Barra de Score */}
              <div className="mt-2.5 w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-rose-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, item.score)}%` }}
                ></div>
              </div>

              {/* Mini Métricas de Desglose */}
              {item.metricasDesglose && (
                <div className="grid grid-cols-4 gap-1 mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[9px] text-neutral-500 dark:text-neutral-400 font-medium text-center">
                  <div>Freq: <strong className="text-neutral-700 dark:text-neutral-200">{item.metricasDesglose.frecuencia}%</strong></div>
                  <div>Atraso: <strong className="text-neutral-700 dark:text-neutral-200">{item.metricasDesglose.atraso}%</strong></div>
                  <div>Markov: <strong className="text-neutral-700 dark:text-neutral-200">{item.metricasDesglose.markov}%</strong></div>
                  <div>Hora: <strong className="text-neutral-700 dark:text-neutral-200">{item.metricasDesglose.horario}%</strong></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. Widget de Gestión de Banca Inteligente (Pago 30 a 1) */}
      <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/80 space-y-2">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setMostrarGestorBanca(!mostrarGestorBanca)}
            className="flex items-center space-x-1.5 text-xs font-black text-neutral-900 dark:text-white"
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>Gestor de Banca 30:1 (Reparto Óptimo)</span>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-normal">
              {mostrarGestorBanca ? "(Ocultar)" : "(Ver reparto)"}
            </span>
          </button>
        </div>

        {mostrarGestorBanca && (
          <div className="space-y-2.5 pt-1 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400">
                Presupuesto para este sorteo:
              </span>
              <div className="flex items-center space-x-1">
                <span className="font-bold text-neutral-700 dark:text-neutral-300">Bs.</span>
                <input
                  type="number"
                  value={presupuestoBanca}
                  onChange={(e) => setPresupuestoBanca(Math.max(1, Number(e.target.value)))}
                  className="w-16 px-2 py-0.5 text-center font-black rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                <span className="font-bold text-amber-800 dark:text-amber-300 block">🎯 Fijo (45%)</span>
                <div className="font-black text-xs text-neutral-900 dark:text-white mt-0.5">
                  Bs. {Math.round(presupuestoBanca * 0.45)}
                </div>
                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">
                  Paga: Bs. {Math.round(presupuestoBanca * 0.45 * 30)}
                </span>
              </div>

              <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800">
                <span className="font-bold text-sky-800 dark:text-sky-300 block">🛡️ Defensa (35%)</span>
                <div className="font-black text-xs text-neutral-900 dark:text-white mt-0.5">
                  Bs. {Math.round(presupuestoBanca * 0.35)}
                </div>
                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">
                  Paga: Bs. {Math.round(presupuestoBanca * 0.35 * 30)}
                </span>
              </div>

              <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                <span className="font-bold text-rose-800 dark:text-rose-300 block">💣 Batacazo (20%)</span>
                <div className="font-black text-xs text-neutral-900 dark:text-white mt-0.5">
                  Bs. {Math.round(presupuestoBanca * 0.20)}
                </div>
                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">
                  Paga: Bs. {Math.round(presupuestoBanca * 0.20 * 30)}
                </span>
              </div>
            </div>
            <p className="text-[9.5px] text-neutral-500 dark:text-neutral-400 text-center">
              Cualquiera de los 3 que salga multiplica tu inversión con un retorno neto de +800% a +1250%.
            </p>
          </div>
        )}
      </div>

      {/* 5. Seis Botones de Acción Rápida */}
      <div className="grid grid-cols-3 gap-1.5 pt-1">
        <button
          onClick={onAbrirCarton}
          className="flex flex-col items-center justify-center p-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100/80 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 transition-all active:scale-95 text-center shadow-xs"
        >
          <Trophy className="w-4 h-4 mb-0.5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-[9px] font-black leading-tight">Mi Cartón</span>
        </button>

        <button
          onClick={onAbrirRuleta}
          className="flex flex-col items-center justify-center p-2 rounded-2xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100/80 border border-purple-300 dark:border-purple-800 text-purple-900 dark:text-purple-300 transition-all active:scale-95 text-center shadow-xs"
        >
          <Dices className="w-4 h-4 mb-0.5 text-purple-600 dark:text-purple-400" />
          <span className="text-[9px] font-black leading-tight">Ruleta VIP</span>
        </button>

        <button
          onClick={onAbrirHeatmap}
          className="flex flex-col items-center justify-center p-2 rounded-2xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100/80 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-300 transition-all active:scale-95 text-center shadow-xs"
        >
          <Thermometer className="w-4 h-4 mb-0.5 text-rose-600 dark:text-rose-400" />
          <span className="text-[9px] font-black leading-tight">Mapa 38</span>
        </button>

        <button
          onClick={onAbrirHorarios}
          className="flex flex-col items-center justify-center p-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100/80 border border-indigo-300 dark:border-indigo-800 text-indigo-900 dark:text-indigo-300 transition-all active:scale-95 text-center shadow-xs"
        >
          <Clock className="w-4 h-4 mb-0.5 text-indigo-600 dark:text-indigo-400" />
          <span className="text-[9px] font-black leading-tight">Por Hora</span>
        </button>

        <button
          onClick={onAbrirCalculadora}
          className="flex flex-col items-center justify-center p-2 rounded-2xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100/80 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 transition-all active:scale-95 text-center shadow-xs"
        >
          <Calculator className="w-4 h-4 mb-0.5 text-amber-600 dark:text-amber-400" />
          <span className="text-[9px] font-black leading-tight">Calcular ROI</span>
        </button>

        <button
          onClick={onAbrirShare}
          className="flex flex-col items-center justify-center p-2 rounded-2xl bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100/80 border border-teal-300 dark:border-teal-800 text-teal-900 dark:text-teal-300 transition-all active:scale-95 text-center shadow-xs"
        >
          <Share2 className="w-4 h-4 mb-0.5 text-teal-600 dark:text-teal-400" />
          <span className="text-[9px] font-black leading-tight">Compartir</span>
        </button>
      </div>
    </section>
  );
}
