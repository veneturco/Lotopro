import React from "react";
import { Clock } from "lucide-react";
import AnimalAvatar from "./AnimalAvatar";
import { resolverAnimal } from "../constants/catalogo";

export default function ResultsGrid({ resultados = [] }) {
  if (!resultados || resultados.length === 0) {
    return (
      <div className="rounded-3xl bg-white/40 dark:bg-neutral-900/50 border border-white/50 dark:border-neutral-800 p-6 text-center space-y-2.5 backdrop-blur-md shadow-lg">
        <div className="inline-flex p-3 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
          <Clock className="w-6 h-6 animate-pulse" />
        </div>
        <h4 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
          Esperando el 1.er Sorteo Oficial de Hoy
        </h4>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-xs mx-auto leading-relaxed">
          La jornada abre con el sorteo de las <strong className="text-neutral-800 dark:text-neutral-200 font-extrabold">08:00 AM</strong>. Consulta el pronóstico del sistema arriba para armar tu jugada.
        </p>
      </div>
    );
  }

  // Estilos de los círculos con números flotantes
  const colorBadgeStyles = {
    rojo: "bg-rose-600 text-white border-rose-300 shadow-rose-900/30",
    negro: "bg-neutral-900 text-white border-neutral-700 shadow-black/40",
    azul: "bg-sky-600 text-white border-sky-300 shadow-sky-900/30"
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-black uppercase tracking-wider text-neutral-800">
          Sorteos del Día ({resultados.length})
        </h3>
        <span className="text-[11px] text-neutral-600 font-semibold">
          Más reciente arriba
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        {resultados.map((item, index) => {
          const animal = resolverAnimal(item);
          const badgeColorClass =
            colorBadgeStyles[animal?.color] || "bg-neutral-800 text-white";

          return (
            <div
              key={`${item.time_schedule || item.time_s}-${index}`}
              className="group relative flex flex-col items-center justify-between rounded-3xl bg-yellow-500 p-3.5 shadow-lg border-2 border-yellow-300/80 hover:bg-yellow-400 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
            >
              {/* Círculo con el número flotando en la esquina superior izquierda */}
              <div
                className={`absolute top-2.5 left-2.5 z-20 w-8 h-8 rounded-full flex items-center justify-center font-black text-xs border shadow-md transform group-hover:scale-110 transition-transform ${badgeColorClass}`}
              >
                {animal?.numero ?? "??"}
              </div>

              {/* Hora flotando en la esquina superior derecha */}
              <div className="absolute top-2.5 right-2.5 z-20 flex items-center space-x-1 px-2 py-0.5 rounded-full bg-black/25 backdrop-blur-sm text-white text-[10px] font-bold">
                <Clock className="w-2.5 h-2.5" />
                <span>{item.time_s || "Reciente"}</span>
              </div>

              {/* Espacio Central Grande con Podio de Bordes Suaves y Luz Difusa */}
              <div className="my-3.5 w-full flex items-center justify-center">
                <div className="animal-podium p-3 w-28 h-28 flex items-center justify-center transform group-hover:scale-105 transition-all duration-300">
                  <AnimalAvatar
                    animal={animal}
                    size="md"
                  />
                </div>
              </div>

              {/* Nombre del animal debajo de la tarjeta */}
              <div className="w-full text-center z-10">
                <span className="block text-xs font-black uppercase tracking-wide text-neutral-900 drop-shadow-sm truncate">
                  {animal?.animal || item?.name_animal || "Sorteo"}
                </span>
                <span className="text-[10px] capitalize font-bold text-neutral-700/80">
                  {animal?.color}
                </span>
              </div>

              {/* Efecto de brillo de fondo */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/20 pointer-events-none rounded-3xl"></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
