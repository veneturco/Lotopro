import React, { useState } from "react";
import { Sparkles, RefreshCw, Volume2, VolumeX, Moon, Sun } from "lucide-react";

export default function Header({
  isLive,
  isRefreshing,
  onRefresh,
  vozHabilitada,
  onToggleVoz,
  temaOscuro,
  onToggleTema
}) {
  const [mascotaOk, setMascotaOk] = useState(true);
  return (
    <header className="flex items-center justify-between pb-3 border-b border-white/30 dark:border-neutral-800">
      <div className="flex items-center space-x-2.5">
        <div
          onClick={() => {
            if ("speechSynthesis" in window) {
              window.speechSynthesis.cancel();
              const u = new SpeechSynthesisUtterance("¡Hola! Soy la mascota de LotoPro. ¡Mucho éxito en tu jugada de hoy!");
              u.lang = "es-VE";
              window.speechSynthesis.speak(u);
            }
          }}
          className="w-11 h-11 rounded-2xl overflow-hidden bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/30 border-2 border-white/80 cursor-pointer transition-transform hover:scale-110 active:scale-95 animate-pulse-slow"
          title="Tócame para saludarte"
        >
          {mascotaOk ? (
            <img
              src="/mascota.png"
              alt="Mascota LotoPro"
              className="w-full h-full object-cover select-none"
              onError={() => setMascotaOk(false)}
            />
          ) : (
            <Sparkles className="w-5 h-5 text-white" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-xl font-black tracking-tight text-neutral-900 dark:text-white">
              Loto<span className="text-amber-700 dark:text-amber-400">Pro</span>
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/30">
              PWA
            </span>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
            Loto Activo · Edición Pro
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-1.5">
        {/* Toggle de Voz Narradora */}
        <button
          onClick={onToggleVoz}
          className={`p-2 rounded-xl transition-all border shadow-xs ${
            vozHabilitada
              ? "bg-amber-500 text-white border-amber-600 shadow-amber-500/30"
              : "bg-white/60 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-white/70 dark:border-neutral-700"
          }`}
          title={vozHabilitada ? "Desactivar voz narradora" : "Activar voz narradora"}
        >
          {vozHabilitada ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Toggle de Modo Oscuro Casino VIP */}
        <button
          onClick={onToggleTema}
          className="p-2 rounded-xl bg-white/60 dark:bg-neutral-800 hover:bg-white text-neutral-700 dark:text-amber-300 transition-all border border-white/70 dark:border-neutral-700 shadow-xs"
          title={temaOscuro ? "Modo Día Dorado" : "Modo Casino VIP Oscuro"}
        >
          {temaOscuro ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Botón Refrescar */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-xl bg-white/60 dark:bg-neutral-800 hover:bg-white text-neutral-700 dark:text-neutral-300 transition-all border border-white/70 dark:border-neutral-700 shadow-xs active:scale-95 disabled:opacity-50"
          title="Actualizar resultados"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-amber-600" : ""}`} />
        </button>
      </div>
    </header>
  );
}
