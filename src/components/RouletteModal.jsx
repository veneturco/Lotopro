import React, { useState } from "react";
import { X, Dices, Sparkles, Share2, RotateCcw } from "lucide-react";
import AnimalAvatar from "./AnimalAvatar";
import { CATALOGO_ANIMALES } from "../constants/catalogo";

export default function RouletteModal({ isOpen, onClose, pronosticos = [] }) {
  const [girando, setGirando] = useState(false);
  const [seleccionados, setSeleccionados] = useState([]);
  const [modo, setModo] = useState("tripleta"); // 'fijo' (1) o 'tripleta' (3)

  if (!isOpen) return null;

  const handleGirar = () => {
    setGirando(true);
    setSeleccionados([]);

    // Lista de candidatos: combina el top pronosticado con el catálogo completo para variedad
    const candidatos = Object.values(CATALOGO_ANIMALES);

    let giros = 0;
    const maxGiros = 18;
    const interval = setInterval(() => {
      giros++;
      // Muestra selecciones aleatorias durante el giro
      const rand1 = candidatos[Math.floor(Math.random() * candidatos.length)];
      const rand2 = candidatos[Math.floor(Math.random() * candidatos.length)];
      const rand3 = candidatos[Math.floor(Math.random() * candidatos.length)];
      setSeleccionados(modo === "fijo" ? [rand1] : [rand1, rand2, rand3]);

      if (giros >= maxGiros) {
        clearInterval(interval);
        // Resultado final favoreciendo el pronóstico del día si está disponible
        const poolFinal = pronosticos.length >= 3 
          ? [...pronosticos, ...candidatos.slice(0, 10)]
          : candidatos;
        
        const final1 = poolFinal[Math.floor(Math.random() * poolFinal.length)];
        let final2 = poolFinal[Math.floor(Math.random() * poolFinal.length)];
        let final3 = poolFinal[Math.floor(Math.random() * poolFinal.length)];
        while (final2.numero === final1.numero) final2 = poolFinal[Math.floor(Math.random() * poolFinal.length)];
        while (final3.numero === final1.numero || final3.numero === final2.numero) final3 = poolFinal[Math.floor(Math.random() * poolFinal.length)];

        setSeleccionados(modo === "fijo" ? [final1] : [final1, final2, final3]);
        setGirando(false);

        // Sonido y felicitación por voz
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
          const nombres = modo === "fijo" 
            ? `${final1.animal} número ${final1.numero}`
            : `${final1.animal}, ${final2.animal} y ${final3.animal}`;
          const u = new SpeechSynthesisUtterance(`¡La Ruleta de la Mascota ha elegido: ${nombres}! ¡Buena suerte!`);
          u.lang = "es-VE";
          window.speechSynthesis.speak(u);
        }
      }
    }, 90);
  };

  const handleCompartirWhatsApp = () => {
    if (seleccionados.length === 0) return;
    const texto = `🎰 *LotoPro · Ruleta de la Suerte*\n🐶 *La Mascota eligió esta jugada para hoy:*\n\n${seleccionados
      .map((a, i) => `${i + 1}️⃣ *N° ${a.numero} - ${a.animal}* ${a.emoji || ""}`)
      .join("\n")}\n\n👉 *Juega en vivo:* https://lotoproactivo.vercel.app`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Cabecera */}
        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-gradient-to-r from-amber-500 to-yellow-400 text-neutral-950">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-neutral-950 text-amber-400 shadow-md">
              <Dices className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base">
                Ruleta de la Mascota
              </h3>
              <p className="text-[11px] font-semibold text-neutral-900/80">
                ¿Indeciso? Deja que la suerte inteligente elija por ti
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/10 text-neutral-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selector de Modo */}
        <div className="p-3 bg-neutral-50 dark:bg-neutral-950 flex justify-center space-x-2 border-b border-neutral-100 dark:border-neutral-800">
          <button
            onClick={() => setModo("tripleta")}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
              modo === "tripleta"
                ? "bg-amber-500 text-neutral-950 shadow-sm"
                : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700"
            }`}
          >
            Tripleta Mágica (3)
          </button>
          <button
            onClick={() => setModo("fijo")}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
              modo === "fijo"
                ? "bg-amber-500 text-neutral-950 shadow-sm"
                : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700"
            }`}
          >
            Fijo del Día (1)
          </button>
        </div>

        {/* Zona de Ruleta y Resultados */}
        <div className="p-6 flex flex-col items-center justify-center min-h-[220px] bg-gradient-to-b from-white to-amber-50/40 dark:from-neutral-900 dark:to-neutral-950">
          {seleccionados.length === 0 && !girando ? (
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center animate-bounce">
                <Dices className="w-8 h-8" />
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold max-w-[240px]">
                Pulsa el botón dorado para hacer girar la ruleta y obtener tu combinación bendecida por la mascota.
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3 w-full">
              {seleccionados.map((item, idx) => (
                <div
                  key={`${item.numero}-${idx}`}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-neutral-800 border-2 shadow-lg transition-transform ${
                    girando
                      ? "scale-95 blur-[0.5px] border-amber-300"
                      : "scale-105 border-amber-500 animate-in zoom-in-50 duration-200"
                  } ${modo === "fijo" ? "w-36 h-44" : "flex-1 h-36"}`}
                >
                  <AnimalAvatar animal={item} size={modo === "fijo" ? "lg" : "md"} />
                  <span className="text-xs font-black uppercase text-neutral-900 dark:text-white mt-2 truncate w-full text-center">
                    {item.animal}
                  </span>
                  <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-neutral-900 text-amber-400 mt-1">
                    N° {item.numero}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botones de Acción */}
        <div className="p-4 bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
          <button
            onClick={handleGirar}
            disabled={girando}
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-neutral-950 font-black text-sm shadow-lg shadow-amber-500/30 transition-all active:scale-95 disabled:opacity-50"
          >
            {girando ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Girando la Ruleta...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>¡Girar la Ruleta de la Mascota!</span>
              </>
            )}
          </button>

          {seleccionados.length > 0 && !girando && (
            <button
              onClick={handleCompartirWhatsApp}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span>Compartir esta jugada en WhatsApp</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
