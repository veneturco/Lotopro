import React, { useState, useMemo } from "react";
import { X, Search, Flame, Hourglass, Thermometer, Filter } from "lucide-react";
import AnimalAvatar from "./AnimalAvatar";

export default function HeatmapModal({ isOpen, onClose, heatmapData = [] }) {
  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  const itemsFiltrados = useMemo(() => {
    return heatmapData.filter((item) => {
      // Filtro de búsqueda textual
      const coincideBusqueda =
        item.animal.toLowerCase().includes(busqueda.toLowerCase()) ||
        String(item.numero).includes(busqueda);

      if (!coincideBusqueda) return false;

      // Filtro por categoría
      if (filtro === "calientes") return item.temperatura === "fuego" || item.temperatura === "caliente";
      if (filtro === "frios") return item.temperatura === "hielo";
      if (filtro === "rojos") return item.color === "rojo";
      if (filtro === "negros") return item.color === "negro";
      return true;
    });
  }, [heatmapData, filtro, busqueda]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
      <div className="w-full max-w-md max-h-[90vh] bg-white rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Cabecera del Modal */}
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-yellow-50">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/30">
              <Thermometer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-neutral-900 text-base">
                Termómetro de los 38 Animales
              </h3>
              <p className="text-[11px] text-neutral-600 font-medium">
                Atrasos, rachas y temperaturas en tiempo real
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-200/60 text-neutral-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Búsqueda y Filtros */}
        <div className="p-3.5 space-y-2.5 bg-neutral-50 border-b border-neutral-100">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar por animal o número (ej. Tigre, 10)..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-neutral-800 placeholder-neutral-400 font-medium shadow-sm"
            />
          </div>

          {/* Chips de filtro */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {[
              { id: "todos", label: "Todos (38)" },
              { id: "calientes", label: "🔥 Calientes" },
              { id: "frios", label: "⏳ Fríos / Dormidos" },
              { id: "rojos", label: "🔴 Rojos" },
              { id: "negros", label: "⚫ Negros" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFiltro(tab.id)}
                className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
                  filtro === tab.id
                    ? "bg-amber-500 text-white shadow-sm"
                    : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista Scrollable de Animales */}
        <div className="p-3.5 overflow-y-auto space-y-2 flex-1 max-h-[55vh]">
          {itemsFiltrados.length === 0 ? (
            <div className="text-center py-8 text-neutral-400 text-xs font-semibold">
              No se encontraron animales con ese criterio.
            </div>
          ) : (
            itemsFiltrados.map((item) => {
              const esFuego = item.temperatura === "fuego" || item.temperatura === "caliente";
              const esHielo = item.temperatura === "hielo";

              const tempBadge = esFuego
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : esHielo
                ? "bg-sky-50 text-sky-700 border-sky-200"
                : "bg-neutral-100 text-neutral-700 border-neutral-200";

              return (
                <div
                  key={item.numero}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-neutral-100 shadow-sm hover:border-amber-200 transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs text-white bg-neutral-900 shadow-sm">
                      {item.numero}
                    </div>

                    <AnimalAvatar animal={item} size="sm" />

                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-neutral-900 text-xs">
                          {item.animal}
                        </span>
                        <span className="text-[10px] capitalize text-neutral-500">
                          ({item.color})
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-500 block">
                        Atraso: <strong className="text-neutral-800">{item.atraso}</strong> sorteos
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tempBadge}`}>
                      {esFuego ? "🔥 " : esHielo ? "❄️ " : "⚖️ "}
                      {item.tempLabel}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pie del modal */}
        <div className="p-3 bg-neutral-50 border-t border-neutral-100 text-center">
          <p className="text-[10px] text-neutral-500">
            Los atrasos se calculan de forma acumulativa sobre los sorteos recientes registrados.
          </p>
        </div>
      </div>
    </div>
  );
}
