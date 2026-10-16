import React from "react";
import { Cpu, Flame, Hourglass, Scale, Info, Share2, Calculator, Thermometer, Target, Clock, Dices, Trophy } from "lucide-react";
import AnimalAvatar from "./AnimalAvatar";
import { ESTRATEGIAS } from "../utils/predictiveEngine";

export default function PredictionCard({
  pronosticos = [],
  proximoSorteoHora = "",
  estrategiaActual = "equilibrado",
  onCambiarEstrategia,
  efectividad = { tasaAcierto: 68.4 },
  esAperturaMatutina = false,
  onAbrirHeatmap,
  onAbrirShare,
  onAbrirCalculadora,
  onAbrirHorarios,
  onAbrirRuleta,
  onAbrirCarton
}) {
  if (!pronosticos || pronosticos.length === 0) return null;

  const tagIcons = {
    Caliente: <Flame className="w-3.5 h-3.5 text-rose-500 inline mr-1" />,
    Dormido: <Hourglass className="w-3.5 h-3.5 text-amber-500 inline mr-1" />,
    Reversión: <Scale className="w-3.5 h-3.5 text-indigo-500 inline mr-1" />,
    Estable: <Cpu className="w-3.5 h-3.5 text-emerald-500 inline mr-1" />
  };

  const tagStyles = {
    Caliente: "bg-rose-500/15 text-rose-900 border-rose-300",
    Dormido: "bg-amber-500/15 text-amber-900 border-amber-300",
    Reversión: "bg-indigo-500/15 text-indigo-900 border-indigo-300",
    Estable: "bg-emerald-500/15 text-emerald-900 border-emerald-300"
  };

  const medalStyles = [
    "bg-gradient-to-r from-amber-400 to-yellow-500 text-neutral-900 shadow-amber-500/30",
    "bg-gradient-to-r from-slate-300 to-slate-400 text-neutral-900 shadow-slate-400/30",
    "bg-gradient-to-r from-amber-700 to-amber-800 text-white shadow-amber-800/30"
  ];

  return (
    <section className="rounded-3xl bg-white/75 dark:bg-neutral-900/80 backdrop-blur-xl p-4 shadow-xl border border-white/80 dark:border-neutral-800 space-y-3.5">
      {/* Encabezado con Efectividad en Vivo */}
      <div className="flex items-center justify-between pb-2 border-b border-amber-200/50 dark:border-neutral-800">
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
                : "Top 3 Recomendados para la próxima jugada"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
          <Target className="w-3 h-3 text-emerald-600" />
          <span>{efectividad.tasaAcierto}% Acierto</span>
        </div>
      </div>

      {/* Selector de Estrategia Predictiva */}
      <div className="space-y-1">
        <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 dark:text-neutral-400 block px-0.5">
          Estrategia Activa:
        </span>
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-neutral-100/80 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 text-xs">
          {Object.values(ESTRATEGIAS).map((est) => {
            const activa = estrategiaActual === est.id;
            return (
              <button
                key={est.id}
                onClick={() => onCambiarEstrategia(est.id)}
                className={`py-1.5 px-2 rounded-xl font-bold text-[11px] transition-all truncate text-center ${
                  activa
                    ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm border border-neutral-200 dark:border-neutral-700"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                {est.nombre}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista del Top 3 con Rayo de Luz Recorriendo el Borde (Border Beam) */}
      <div className="space-y-3">
        {pronosticos.map((item, idx) => {
          const medal = medalStyles[idx] || medalStyles[2];
          const tagClass = tagStyles[item.etiqueta] || tagStyles.Estable;

          return (
            <div
              key={item.numero}
              className="border-beam-glow p-[2px] transition-all duration-300 hover:scale-[1.015] shadow-lg shadow-amber-500/10"
            >
              <div className="border-beam-inner p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shadow-md ${medal}`}
                    >
                      #{item.posicion}
                    </div>

                    {/* Contenedor del animal con bordes suaves curvados */}
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
                      </div>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${tagClass}`}
                        >
                          {tagIcons[item.etiqueta]}
                          {item.etiqueta}
                        </span>
                        <span className="text-[10px] capitalize text-neutral-500 dark:text-neutral-400 font-medium">
                          Color {item.color}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-black text-amber-600 dark:text-amber-400">
                      {item.score}%
                    </div>
                    <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold block">
                      Score
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-rose-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, item.score)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 6 Botones de Acción Rápida */}
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
          className="flex flex-col items-center justify-center p-2 rounded-2xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100/80 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 transition-all active:scale-95 text-center shadow-xs"
        >
          <Dices className="w-4 h-4 mb-0.5 text-amber-600 dark:text-amber-400" />
          <span className="text-[9px] font-black leading-tight">Ruleta Suerte</span>
        </button>

        <button
          onClick={onAbrirHeatmap}
          className="flex flex-col items-center justify-center p-2 rounded-2xl bg-amber-50 dark:bg-neutral-800 hover:bg-amber-100/80 border border-amber-200/70 dark:border-neutral-700 text-amber-900 dark:text-amber-300 transition-all active:scale-95 text-center shadow-xs"
        >
          <Thermometer className="w-4 h-4 mb-0.5 text-amber-600" />
          <span className="text-[9px] font-black leading-tight">Termómetro</span>
        </button>

        <button
          onClick={onAbrirHorarios}
          className="flex flex-col items-center justify-center p-2 rounded-2xl bg-sky-50 dark:bg-neutral-800 hover:bg-sky-100/80 border border-sky-200/70 dark:border-neutral-700 text-sky-900 dark:text-sky-300 transition-all active:scale-95 text-center shadow-xs"
        >
          <Clock className="w-4 h-4 mb-0.5 text-sky-600" />
          <span className="text-[9px] font-black leading-tight">Por Horas</span>
        </button>

        <button
          onClick={onAbrirShare}
          className="flex flex-col items-center justify-center p-2 rounded-2xl bg-emerald-50 dark:bg-neutral-800 hover:bg-emerald-100/80 border border-emerald-200/70 dark:border-neutral-700 text-emerald-900 dark:text-emerald-300 transition-all active:scale-95 text-center shadow-xs"
        >
          <Share2 className="w-4 h-4 mb-0.5 text-emerald-600" />
          <span className="text-[9px] font-black leading-tight">Compartir</span>
        </button>

        <button
          onClick={onAbrirCalculadora}
          className="flex flex-col items-center justify-center p-2 rounded-2xl bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 border border-neutral-200/70 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 transition-all active:scale-95 text-center shadow-xs"
        >
          <Calculator className="w-4 h-4 mb-0.5 text-neutral-600 dark:text-neutral-400" />
          <span className="text-[9px] font-black leading-tight">Calculadora</span>
        </button>
      </div>

      <div className="flex items-start space-x-1.5 pt-1 text-[10px] text-neutral-600 dark:text-neutral-400 leading-tight">
        <Info className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
        <p>
          Algoritmo estocástico calibrado. El acierto pasado no garantiza resultados futuros.
        </p>
      </div>
    </section>
  );
}
