import React, { useState } from "react";
import { Clock, ShieldCheck, Volume2 } from "lucide-react";
import AnimalAvatar from "./AnimalAvatar";
import { resolverAnimal } from "../constants/catalogo";
import { narrarResultado } from "../utils/speech";

export default function HeroCard({ resultado }) {
  const [narrando, setNarrando] = useState(false);

  if (!resultado) return null;

  const animal = resolverAnimal(resultado);
  const hora = resultado.time_s || "Reciente";

  const colorBadgeStyles = {
    rojo: "bg-rose-600 text-white shadow-rose-600/50 border-rose-400",
    negro: "bg-neutral-800 text-white shadow-neutral-900/60 border-neutral-600",
    azul: "bg-sky-600 text-white shadow-sky-600/50 border-sky-400"
  };

  const badgeClass = colorBadgeStyles[animal?.color] || "bg-amber-600 text-white border-amber-400";

  const handleEscuchar = () => {
    setNarrando(true);
    narrarResultado(animal, hora, () => setNarrando(false));
  };

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-5 text-white shadow-2xl border border-amber-400/30">
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -left-12 -bottom-12 w-40 h-40 bg-yellow-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10 flex items-center justify-between pb-3 border-b border-neutral-800/80">
        <div className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>Último Sorteo Oficial</span>
        </div>

        <div className="flex items-center space-x-1.5">
          {/* Botón de Narración por Voz */}
          <button
            onClick={handleEscuchar}
            className={`p-1.5 rounded-full border text-xs flex items-center space-x-1 transition-all ${
              narrando
                ? "bg-amber-500 text-neutral-950 border-amber-400 animate-pulse"
                : "bg-neutral-800 text-neutral-300 hover:text-white border-neutral-700"
            }`}
            title="Escuchar locución del sorteo"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold pr-1">Voz</span>
          </button>

          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-neutral-800/90 text-neutral-300 text-xs font-medium border border-neutral-700">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{hora}</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 pt-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <AnimalAvatar animal={animal} size="lg" className="border-2 border-white/20" />

          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">
              Ganador
            </span>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white drop-shadow-sm">
              {animal?.animal || resultado?.name_animal || "Sorteo"}
            </h2>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs capitalize px-2 py-0.5 rounded-md bg-neutral-800/80 text-neutral-300 border border-neutral-700">
                Color {animal?.color || "N/A"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl shadow-xl border-2 transition-transform hover:scale-105 ${badgeClass}`}
          >
            {animal?.numero ?? "--"}
          </div>
          <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold mt-1">
            Número
          </span>
        </div>
      </div>
    </section>
  );
}
