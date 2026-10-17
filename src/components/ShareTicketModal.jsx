import React, { useState, useRef } from "react";
import { X, Share2, Copy, Check, MessageCircle, Ticket, Download, Image as ImageIcon } from "lucide-react";
import AnimalAvatar from "./AnimalAvatar";

export default function ShareTicketModal({
  isOpen,
  onClose,
  pronosticos = [],
  estrategiaNombre = "Equilibrado",
  semaforoEntropia = { nivel: "VERDE", label: "Patrón Claro" }
}) {
  const [copiado, setCopiado] = useState(false);
  const [generandoImagen, setGenerandoImagen] = useState(false);
  const canvasRef = useRef(null);

  if (!isOpen || pronosticos.length === 0) return null;

  const fechaHoy = new Date().toLocaleDateString("es-VE", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric"
  });

  const textoCompartir = `🎰 *LotoPro · Pronóstico Táctico VIP*\n📅 ${fechaHoy}\n🧠 *Estrategia:* ${estrategiaNombre}\n📊 *Volatilidad:* ${semaforoEntropia.label}\n\n*Top 3 Táctico para la próxima jugada:*\n${pronosticos
    .map(
      (p) =>
        `${p.rolTactico === "FIJO" ? "🎯" : p.rolTactico === "DEFENSA" ? "🛡️" : "💣"} *[${p.rolTactico}] N° ${p.numero} - ${p.animal}* ${p.emoji}\n   └ Score: ${p.score}% · ${p.motivo} (Banca: ${p.sugerenciaBancaPct || 33}%)`
    )
    .join("\n\n")}\n\n👉 *Consulta en vivo:* https://lotoproactivo.vercel.app`;

  const handleCopiar = () => {
    navigator.clipboard.writeText(textoCompartir);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(textoCompartir)}`;
    window.open(url, "_blank");
  };

  // Generador de Imagen Vertical estética (1080x1920) con HTML5 Canvas Nativo
  const handleDescargarImagen = () => {
    setGenerandoImagen(true);
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");

    // Fondo degradado Dark VIP Obsidian & Gold
    const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920);
    bgGrad.addColorStop(0, "#0a0a0a");
    bgGrad.addColorStop(0.5, "#141414");
    bgGrad.addColorStop(1, "#050505");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1920);

    // Borde de Oro fino
    ctx.strokeStyle = "#eab308";
    ctx.lineWidth = 14;
    ctx.strokeRect(30, 30, 1020, 1860);

    // Cabecera
    ctx.fillStyle = "#eab308";
    ctx.font = "bold 52px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🎰 LOTOPRO VIP", 540, 150);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 38px system-ui, -apple-system, sans-serif";
    ctx.fillText("PRONÓSTICO ESTOCÁSTICO OFICIAL", 540, 220);

    ctx.fillStyle = "#a3a3a3";
    ctx.font = "32px system-ui, -apple-system, sans-serif";
    ctx.fillText(`${fechaHoy.toUpperCase()} · ESTRATEGIA: ${estrategiaNombre.toUpperCase()}`, 540, 280);

    // Píldora de Volatilidad
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.roundRect(240, 320, 600, 70, 35);
    ctx.fill();
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 28px system-ui, -apple-system, sans-serif";
    ctx.fillText(`📊 VOLATILIDAD: ${semaforoEntropia.label.toUpperCase()}`, 540, 365);

    // Tarjetas del Top 3
    const startY = 460;
    const cardHeight = 360;
    const spacing = 45;

    pronosticos.forEach((p, idx) => {
      const y = startY + idx * (cardHeight + spacing);

      // Fondo tarjeta
      const cardGrad = ctx.createLinearGradient(100, y, 980, y + cardHeight);
      cardGrad.addColorStop(0, "#1c1917");
      cardGrad.addColorStop(1, "#171717");
      ctx.fillStyle = cardGrad;
      ctx.beginPath();
      ctx.roundRect(100, y, 880, cardHeight, 36);
      ctx.fill();

      // Borde según rol
      const roleColors = {
        FIJO: "#eab308",
        DEFENSA: "#38bdf8",
        BATACAZO: "#f43f5e"
      };
      ctx.strokeStyle = roleColors[p.rolTactico] || "#eab308";
      ctx.lineWidth = 5;
      ctx.stroke();

      // Badge de Rol
      ctx.fillStyle = roleColors[p.rolTactico] || "#eab308";
      ctx.beginPath();
      ctx.roundRect(140, y + 35, 260, 55, 20);
      ctx.fill();

      ctx.fillStyle = "#000000";
      ctx.font = "900 28px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${p.rolTactico}`, 270, y + 73);

      // Animal y Número
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 68px system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`${p.emoji || "🎯"} ${p.animal}`, 140, y + 175);

      ctx.fillStyle = "#eab308";
      ctx.font = "900 68px system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`N° ${p.numero}`, 930, y + 175);

      // Motivo y Explicabilidad
      ctx.fillStyle = "#d4d4d4";
      ctx.font = "32px system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`💡 ${p.motivo}`, 140, y + 245);

      // Score y Banca
      ctx.fillStyle = "#a3a3a3";
      ctx.font = "28px system-ui, sans-serif";
      ctx.fillText(`Score: ${p.score}% · Color ${p.color}`, 140, y + 305);

      ctx.fillStyle = "#10b981";
      ctx.font = "bold 32px system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`Banca Sugerida: ${p.sugerenciaBancaPct || 33}%`, 930, y + 305);
    });

    // Footer Sello de Garantía
    ctx.fillStyle = "#737373";
    ctx.font = "26px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Algoritmo Estocástico LotoPro v2.0 · Banca 30:1", 540, 1780);
    ctx.fillText("https://lotoproactivo.vercel.app", 540, 1830);

    // Si el dispositivo móvil soporta compartir archivos directamente (Web Share API Nivel 2)
    canvas.toBlob(async (blob) => {
      if (!blob) {
        setGenerandoImagen(false);
        return;
      }
      const archivoImagen = new File([blob], `LotoPro_${p.numero || "Top3"}.png`, { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [archivoImagen] })) {
        try {
          await navigator.share({
            files: [archivoImagen],
            title: "🎰 LotoPro · Pronóstico Táctico VIP",
            text: textoCompartir
          });
          setGenerandoImagen(false);
          return;
        } catch (err) {
          // Si el usuario canceló el share nativo, proseguimos con descarga
        }
      }

      // Descarga directa tradicional si no está en móvil o no soporta Web Share
      const link = document.createElement("a");
      link.download = `LotoPro_Pronostico_${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      setGenerandoImagen(false);
    }, "image/png");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 border border-white/20 dark:border-neutral-800">
        
        {/* Cabecera */}
        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-neutral-900 dark:to-neutral-850">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/30">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-neutral-900 dark:text-white text-base">
                Ticket Táctico VIP
              </h3>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-medium">
                Listo para enviar a la agencia, WhatsApp o Estado
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

        {/* Vista previa del Ticket */}
        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/80 border border-dashed border-amber-300 dark:border-neutral-700 font-mono text-xs space-y-2 text-neutral-800 dark:text-neutral-200">
            <div className="text-center pb-2 border-b border-neutral-200 dark:border-neutral-700">
              <span className="font-black text-sm tracking-wider">🎰 LOTOPRO VIP TICKET</span>
              <p className="text-[10px] text-neutral-500">{fechaHoy}</p>
              <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                Estrategia: {estrategiaNombre}
              </p>
            </div>

            {pronosticos.map((p) => (
              <div key={p.numero} className="flex items-center justify-between py-1 border-b border-neutral-200/50 dark:border-neutral-700/50">
                <div>
                  <span className="font-bold text-[10px] px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 mr-1.5">
                    {p.rolTactico}
                  </span>
                  <span className="font-black">N° {p.numero} - {p.animal}</span>
                  <div className="text-[9px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                    💡 {p.motivo}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-amber-600 dark:text-amber-400">{p.score}%</span>
                  <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">
                    {p.sugerenciaBancaPct || 33}% banca
                  </div>
                </div>
              </div>
            ))}

            <div className="text-center pt-1 text-[9.5px] text-neutral-500">
              Regla 30:1 · Cobertura optimizada de banca
            </div>
          </div>
        </div>

        {/* Botones de Compartir */}
        <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleWhatsApp}
              className="w-full py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-600/30 transition-all active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleDescargarImagen}
              disabled={generandoImagen}
              className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-neutral-950 font-black text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-amber-500/30 transition-all active:scale-95"
            >
              <ImageIcon className="w-4 h-4" />
              <span>{generandoImagen ? "Generando..." : "Imagen HD"}</span>
            </button>
          </div>

          <button
            onClick={handleCopiar}
            className="w-full py-2 px-3 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all active:scale-95"
          >
            {copiado ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copiado ? "¡Copiado al portapapeles!" : "Copiar Texto"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
