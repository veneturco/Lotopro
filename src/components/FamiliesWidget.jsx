import React, { useMemo } from "react";
import { Users, TrendingUp, Sparkles } from "lucide-react";
import { CATALOGO_ANIMALES, FAMILIAS_TRADICIONALES, resolverAnimal } from "../constants/catalogo";

export default function FamiliesWidget({ resultados = [] }) {
  // Cuenta cuántos animales de cada familia han salido en los sorteos de hoy
  const estadisticas = useMemo(() => {
    const conteos = {
      Plumas: 0,
      Agua: 0,
      Selva: 0,
      Campo: 0,
      Rastreros: 0
    };

    resultados.forEach((res) => {
      const fig = resolverAnimal(res);
      if (fig && fig.familia && conteos[fig.familia] !== undefined) {
        conteos[fig.familia]++;
      }
    });

    const total = resultados.length || 1;
    let dominante = "Selva";
    let maxConteo = -1;

    const lista = Object.entries(FAMILIAS_TRADICIONALES).map(([id, info]) => {
      const cantidad = conteos[id] || 0;
      const porcentaje = Math.round((cantidad / total) * 100);
      if (cantidad > maxConteo) {
        maxConteo = cantidad;
        dominante = id;
      }
      return {
        id,
        ...info,
        cantidad,
        porcentaje
      };
    });

    return {
      lista,
      dominante: FAMILIAS_TRADICIONALES[dominante],
      totalSorteos: resultados.length
    };
  }, [resultados]);

  if (!resultados || resultados.length === 0) return null;

  return (
    <section className="rounded-3xl bg-white/75 dark:bg-neutral-900/80 backdrop-blur-xl p-4 shadow-xl border border-white/80 dark:border-neutral-800 space-y-3">
      {/* Encabezado */}
      <div className="flex items-center justify-between pb-2 border-b border-amber-200/50 dark:border-neutral-800">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-neutral-950 shadow-md">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black tracking-tight text-neutral-900 dark:text-white uppercase">
              Radar de Familias del Día
            </h3>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">
              Agrupación por linaje tradicional de Loto Activo
            </p>
          </div>
        </div>

        {estadisticas.totalSorteos > 0 && (
          <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-300 text-[10px] font-bold border border-amber-500/30">
            <Sparkles className="w-3 h-3" />
            <span>Familia {estadisticas.dominante.nombre.split(" ")[0]} Lidera</span>
          </div>
        )}
      </div>

      {/* Tarjetas de Familias con Iconos y Diseño de Alta Calidad */}
      <div className="grid grid-cols-5 gap-2 pt-1">
        {estadisticas.lista.map((fam) => {
          const esLider = fam.nombre === estadisticas.dominante.nombre && fam.cantidad > 0;
          return (
            <div
              key={fam.id}
              className={`relative flex flex-col items-center justify-between p-2 rounded-2xl border text-center transition-all duration-300 ${
                esLider
                  ? "bg-gradient-to-b from-amber-400/25 to-yellow-500/15 border-amber-400 shadow-md scale-105 ring-2 ring-amber-400/30"
                  : "bg-white/90 dark:bg-neutral-800/80 border-neutral-200/90 dark:border-neutral-700/80 hover:border-amber-300"
              }`}
            >
              {esLider && (
                <div className="absolute -top-2 px-1.5 py-0.2 rounded-full bg-amber-500 text-neutral-950 text-[8px] font-black uppercase tracking-wider shadow-sm">
                  Top
                </div>
              )}

              {/* Insignia con el emoji estilizado y efecto de profundidad */}
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xl shadow-sm ${
                  esLider
                    ? "bg-gradient-to-tr from-amber-500 to-yellow-300 shadow-amber-500/40 text-neutral-950"
                    : "bg-neutral-100 dark:bg-neutral-700/60 shadow-inner"
                }`}
              >
                <span className="filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] transform transition-transform hover:scale-125">
                  {fam.emoji}
                </span>
              </div>

              <span className="text-[10px] font-extrabold text-neutral-800 dark:text-neutral-100 truncate w-full mt-1.5 tracking-tight">
                {fam.id}
              </span>

              <div
                className={`mt-1 px-1.5 py-0.5 rounded-lg w-full text-[10px] font-black ${
                  esLider
                    ? "bg-amber-500 text-neutral-950 shadow-sm"
                    : "bg-neutral-100 dark:bg-neutral-700/50 text-neutral-600 dark:text-neutral-300"
                }`}
              >
                {fam.cantidad}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
