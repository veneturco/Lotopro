import React, { useState, useMemo } from "react";
import { X, Clock, Flame, Calendar } from "lucide-react";
import AnimalAvatar from "./AnimalAvatar";
import { HORARIOS_OFICIALES } from "../utils/schedule";
import { resolverAnimal } from "../constants/catalogo";

export default function TimeFilterModal({ isOpen, onClose, resultados = [] }) {
  const [horarioSeleccionado, setHorarioSeleccionado] = useState(
    HORARIOS_OFICIALES[0].label
  );

  const resultadosPorHorario = useMemo(() => {
    return resultados.filter((item) => {
      if (!item.time_s) return false;
      return item.time_s.toLowerCase().includes(horarioSeleccionado.toLowerCase()) ||
        item.time_s.replace(/\s+/g, "").toLowerCase() === horarioSeleccionado.replace(/\s+/g, "").toLowerCase();
    });
  }, [resultados, horarioSeleccionado]);

  // Ranking de animales más salidores a esta hora
  const rankingHorario = useMemo(() => {
    const conteo = {};
    resultadosPorHorario.forEach((item) => {
      const fig = resolverAnimal(item);
      if (fig) {
        conteo[fig.numero] = (conteo[fig.numero] || 0) + 1;
      }
    });

    return Object.entries(conteo)
      .map(([num, veces]) => ({
        figura: resolverAnimal(num),
        veces
      }))
      .sort((a, b) => b.veces - a.veces);
  }, [resultadosPorHorario]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Cabecera */}
        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-neutral-900 dark:to-neutral-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/30">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-neutral-900 dark:text-white text-base">
                Tendencia por Horarios
              </h3>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-medium">
                Descubre qué animales dominan cada sorteo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-200/60 dark:hover:bg-neutral-800 text-neutral-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Carrusel de Selección de Horas Oficiales */}
        <div className="p-3 bg-neutral-50 dark:bg-neutral-950/50 border-b border-neutral-100 dark:border-neutral-800">
          <span className="text-[10px] uppercase font-bold text-neutral-500 block mb-2 px-1">
            Selecciona la franja horaria oficial:
          </span>
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {HORARIOS_OFICIALES.map((h) => (
              <button
                key={h.label}
                onClick={() => setHorarioSeleccionado(h.label)}
                className={`py-1.5 px-3 rounded-full font-bold whitespace-nowrap transition-all ${
                  horarioSeleccionado === h.label
                    ? "bg-amber-500 text-white shadow-sm"
                    : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
                }`}
              >
                {h.label}
              </button>
            ))}
          </div>
        </div>

        {/* Resultados para esta hora */}
        <div className="p-4 overflow-y-auto max-h-[50vh] space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-700 dark:text-neutral-300">
            <span>Historial a las {horarioSeleccionado}</span>
            <span className="text-amber-600 dark:text-amber-400">
              {resultadosPorHorario.length} registros
            </span>
          </div>

          {rankingHorario.length === 0 ? (
            <div className="text-center py-8 text-neutral-400 text-xs font-semibold">
              No hay sorteos registrados a esta hora todavía.
            </div>
          ) : (
            <div className="space-y-2">
              {rankingHorario.map((item, idx) => (
                <div
                  key={item.figura?.numero || idx}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-5 text-center font-black text-xs text-amber-600">
                      #{idx + 1}
                    </span>
                    <AnimalAvatar animal={item.figura} size="sm" />
                    <div>
                      <span className="text-xs font-bold text-neutral-900 dark:text-white block">
                        {item.figura?.animal}
                      </span>
                      <span className="text-[10px] text-neutral-500 capitalize">
                        N° {item.figura?.numero} · Color {item.figura?.color}
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-900 dark:text-amber-300 text-xs font-black">
                    {item.veces} {item.veces === 1 ? "salida" : "salidas"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pie */}
        <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950 font-bold text-xs"
          >
            Cerrar análisis por horas
          </button>
        </div>
      </div>
    </div>
  );
}
