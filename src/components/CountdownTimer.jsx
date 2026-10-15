import React, { useState, useEffect } from "react";
import { Timer, AlertCircle } from "lucide-react";
import { calcularTiempoProximoSorteo } from "../utils/schedule";

export default function CountdownTimer() {
  const [tiempo, setTiempo] = useState(calcularTiempoProximoSorteo());

  useEffect(() => {
    const intervalo = setInterval(() => {
      setTiempo(calcularTiempoProximoSorteo());
    }, 1000);

    return () => clearInterval(intervalo);
  }, []);

  const formatDigito = (num) => String(num).padStart(2, "0");

  const minutos = formatDigito(tiempo.minutos);
  const segundos = formatDigito(tiempo.segundos);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-3 shadow-md border transition-all duration-300 ${
        tiempo.esCierreInminente
          ? "bg-rose-500/20 border-rose-500/40 text-rose-950 animate-pulse"
          : "bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md border-white/60 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div
            className={`p-1.5 rounded-xl ${
              tiempo.esCierreInminente
                ? "bg-rose-600 text-white shadow-rose-600/30"
                : "bg-amber-500 text-white shadow-amber-500/30"
            } shadow-md`}
          >
            <Timer className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
              Próximo Sorteo
            </span>
            <span className="text-xs font-black tracking-tight text-neutral-900 dark:text-white">
              {tiempo.proximoSorteo}
            </span>
          </div>
        </div>

        {/* Cronómetro Digital */}
        <div className="flex items-center space-x-1 font-mono font-black text-lg">
          <div className="px-2 py-0.5 rounded-lg bg-neutral-900 text-white shadow-inner">
            {minutos}
          </div>
          <span className="text-neutral-700 dark:text-neutral-300 animate-pulse">:</span>
          <div className="px-2 py-0.5 rounded-lg bg-neutral-900 text-white shadow-inner">
            {segundos}
          </div>
        </div>
      </div>

      {/* Alerta de Cierre Inminente (< 5 min) */}
      {tiempo.esCierreInminente && (
        <div className="mt-2 pt-1.5 border-t border-rose-300/60 flex items-center space-x-1.5 text-[11px] font-bold text-rose-800 dark:text-rose-300">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>¡Cierre de jugadas inminente! Quedan menos de 5 minutos.</span>
        </div>
      )}
    </div>
  );
}
