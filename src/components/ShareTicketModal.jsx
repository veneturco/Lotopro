import React, { useState } from "react";
import { X, Share2, Copy, Check, MessageCircle, Ticket } from "lucide-react";
import AnimalAvatar from "./AnimalAvatar";

export default function ShareTicketModal({ isOpen, onClose, pronosticos = [], estrategiaNombre = "Equilibrado" }) {
  const [copiado, setCopiado] = useState(false);

  if (!isOpen || pronosticos.length === 0) return null;

  const fechaHoy = new Date().toLocaleDateString("es-VE", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric"
  });

  const textoCompartir = `🎰 *LotoPro · Pronóstico Inteligente*\n📅 ${fechaHoy}\n🧠 *Estrategia:* ${estrategiaNombre}\n\n*Top 3 para el próximo sorteo:*\n${pronosticos
    .map(
      (p, i) =>
        `${i + 1}️⃣ *N° ${p.numero} - ${p.animal}* ${p.emoji} (${p.score}% calor · ${p.etiqueta})`
    )
    .join("\n")}\n\n👉 *Consulta en vivo:* https://lotoproactivo.vercel.app`;

  const handleCopiar = () => {
    navigator.clipboard.writeText(textoCompartir);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(textoCompartir)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
      <div className="w-full max-w-md bg-white rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Cabecera */}
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-yellow-50">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/30">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-neutral-900 text-base">
                Ticket Inteligente de Jugada
              </h3>
              <p className="text-[11px] text-neutral-600 font-medium">
                Listo para enviar a la agencia o compartir en WhatsApp
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

        {/* Tarjeta de Ticket Visual (Estilo recibo premium) */}
        <div className="p-4 bg-neutral-50">
          <div className="rounded-2xl bg-white border-2 border-dashed border-amber-300 p-4 shadow-sm space-y-3">
            <div className="text-center pb-2 border-b border-neutral-100">
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-600">
                LotoPro AI · Boleto Sugerido
              </span>
              <h4 className="text-sm font-black text-neutral-900 capitalize">
                {fechaHoy}
              </h4>
              <span className="text-[10px] text-neutral-500 font-semibold">
                Modo: {estrategiaNombre}
              </span>
            </div>

            {/* Fila de los 3 animales */}
            <div className="grid grid-cols-3 gap-2 py-1">
              {pronosticos.map((p, idx) => (
                <div
                  key={p.numero}
                  className="flex flex-col items-center justify-center p-2 rounded-xl bg-amber-50/60 border border-amber-200/60 text-center"
                >
                  <span className="text-[10px] font-black text-amber-700">
                    #{idx + 1}
                  </span>
                  <AnimalAvatar animal={p} size="sm" className="my-1" />
                  <span className="text-xs font-black text-neutral-900 truncate w-full">
                    {p.animal}
                  </span>
                  <span className="text-[11px] font-black px-1.5 py-0.2 rounded bg-neutral-900 text-white mt-1">
                    N° {p.numero}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-neutral-100 text-center">
              <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold">
                Cálculo Estocástico Oficial
              </span>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="p-4 bg-white border-t border-neutral-100 space-y-2">
          <button
            onClick={handleWhatsApp}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all active:scale-98"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Compartir en WhatsApp</span>
          </button>

          <button
            onClick={handleCopiar}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs transition-all active:scale-98 border border-neutral-200"
          >
            {copiado ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">¡Texto Copiado al Portapapeles!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-neutral-600" />
                <span>Copiar Texto Formateado</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
