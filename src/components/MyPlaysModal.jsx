import React, { useState, useEffect } from "react";
import { X, CheckCircle2, BookmarkPlus, Trash2, Trophy, Volume2 } from "lucide-react";
import AnimalAvatar from "./AnimalAvatar";
import { CATALOGO_ANIMALES, resolverAnimal } from "../constants/catalogo";

const STORAGE_KEY = "lotopro_jugadas_favoritas_v1";

export default function MyPlaysModal({ isOpen, onClose, resultados = [] }) {
  const [favoritos, setFavoritos] = useState(() => {
    try {
      const guardados = localStorage.getItem(STORAGE_KEY);
      return guardados ? JSON.parse(guardados) : ["0", "27", "21"]; // Por defecto: Delfín, Perro, Gallo
    } catch {
      return ["0", "27", "21"];
    }
  });

  const [seleccionando, setSeleccionando] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favoritos));
  }, [favoritos]);

  if (!isOpen) return null;

  // Analiza cuáles de mis favoritos ya salieron hoy
  const numerosSalidosHoy = new Map();
  resultados.forEach((res) => {
    const fig = resolverAnimal(res);
    if (fig && !numerosSalidosHoy.has(fig.numero)) {
      numerosSalidosHoy.set(fig.numero, res.time_s || "Hoy");
    }
  });

  const toggleFavorito = (num) => {
    if (favoritos.includes(num)) {
      setFavoritos(favoritos.filter((n) => n !== num));
    } else {
      if (favoritos.length >= 8) {
        alert("Puedes guardar hasta un máximo de 8 animales favoritos en tu cartón.");
        return;
      }
      setFavoritos([...favoritos, num]);
    }
  };

  const aciertosTotales = favoritos.filter((n) => numerosSalidosHoy.has(n)).length;

  const handleCantarVictoria = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(
        `¡Atención! En tu cartón personal tienes ${aciertosTotales} aciertos registrados el día de hoy. ¡Felicitaciones!`
      );
      u.lang = "es-VE";
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 max-h-[90vh]">
        
        {/* Cabecera */}
        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-white/20 text-white shadow-md">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base">
                Mi Cartón de Jugadas
              </h3>
              <p className="text-[11px] font-semibold text-emerald-100">
                Seguimiento automático de aciertos en vivo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumen de Aciertos */}
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <span className="text-xs font-black text-emerald-950 dark:text-emerald-200 block">
                {aciertosTotales} de {favoritos.length} animales acertados hoy
              </span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400">
                Se verifica automáticamente con cada sorteo oficial
              </span>
            </div>
          </div>
          {aciertosTotales > 0 && (
            <button
              onClick={handleCantarVictoria}
              className="p-2 rounded-xl bg-emerald-600 text-white shadow-sm hover:bg-emerald-500 transition-all flex items-center space-x-1 text-xs font-bold"
              title="Escuchar resumen de aciertos"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Voz</span>
            </button>
          )}
        </div>

        {/* Lista de Animales Guardados */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          {favoritos.length === 0 ? (
            <div className="text-center py-8 text-neutral-400 text-xs font-semibold">
              No tienes ningún animal guardado en tu cartón todavía.
            </div>
          ) : (
            favoritos.map((num) => {
              const fig = CATALOGO_ANIMALES[num];
              const acerto = numerosSalidosHoy.has(num);
              const horaAcierto = numerosSalidosHoy.get(num);

              return (
                <div
                  key={num}
                  className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                    acerto
                      ? "bg-emerald-50/80 dark:bg-emerald-900/30 border-emerald-400 shadow-sm"
                      : "bg-white dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                        acerto
                          ? "bg-emerald-600 text-white animate-bounce"
                          : "bg-neutral-900 text-white"
                      }`}
                    >
                      {num}
                    </div>
                    <AnimalAvatar animal={fig} size="sm" />
                    <div>
                      <span className="text-xs font-black text-neutral-900 dark:text-white block">
                        {fig?.animal}
                      </span>
                      <span className="text-[10px] text-neutral-500 capitalize">
                        Color {fig?.color} · {fig?.familia || "Loto"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {acerto ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black shadow-xs">
                        ✅ Salió a las {horaAcierto}
                      </span>
                    ) : (
                      <span className="text-[10px] text-neutral-400 font-semibold">
                        Pendiente
                      </span>
                    )}
                    <button
                      onClick={() => toggleFavorito(num)}
                      className="p-1.5 text-neutral-400 hover:text-rose-500 transition-colors"
                      title="Eliminar de mi cartón"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selector de Nuevo Animal (Desplegable) */}
        {seleccionando ? (
          <div className="p-3 bg-neutral-100 dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 max-h-48 overflow-y-auto">
            <span className="text-[10px] font-bold text-neutral-500 uppercase block mb-1.5 px-1">
              Toca para agregar a tu cartón:
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {Object.values(CATALOGO_ANIMALES).map((a) => {
                const yaEsta = favoritos.includes(a.numero);
                return (
                  <button
                    key={a.numero}
                    onClick={() => toggleFavorito(a.numero)}
                    className={`p-1.5 rounded-xl text-center text-xs font-bold transition-all ${
                      yaEsta
                        ? "bg-emerald-600 text-white"
                        : "bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    <span className="block font-black text-[11px]">{a.numero}</span>
                    <span className="text-[9px] truncate block">{a.animal}</span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setSeleccionando(false)}
              className="w-full mt-2 py-1.5 bg-neutral-900 text-white text-xs font-bold rounded-xl"
            >
              Listo, cerrar selección
            </button>
          </div>
        ) : (
          <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800">
            <button
              onClick={() => setSeleccionando(true)}
              className="w-full py-2.5 rounded-xl bg-neutral-900 dark:bg-neutral-800 text-white font-bold text-xs flex items-center justify-center space-x-1.5 hover:bg-neutral-800 transition-colors"
            >
              <BookmarkPlus className="w-4 h-4 text-emerald-400" />
              <span>Personalizar Animales de Mi Cartón</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
