import React, { useState } from "react";

/**
 * Componente de Avatar 3D Pixar de LotoPro
 * Busca primero la imagen renderizada 3D en /animals/{numero}.png
 * Si la imagen aún no existe o falla la carga, usa el render volumétrico con emoji como fallback.
 */
export default function AnimalAvatar({ animal, size = "md", className = "" }) {
  const [imgError, setImgError] = useState(false);

  const sizeMap = {
    sm: "w-10 h-10 text-xl",
    md: "w-20 h-20 text-4xl",
    lg: "w-28 h-28 text-6xl",
    xl: "w-36 h-36 text-7xl"
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const imageSrc =
    animal?.numero !== undefined && animal?.numero !== null
      ? `/animals/${animal.numero}.png`
      : null;

  return (
    <div
      className={`relative flex items-center justify-center rounded-2xl select-none ${currentSize} ${className}`}
    >
      {/* Fondo volumétrico con iluminación 3D y brillo de cristal */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/40 via-amber-200/30 to-amber-600/30 dark:from-white/10 dark:via-neutral-800/40 dark:to-neutral-900/40 backdrop-blur-md border border-white/60 dark:border-white/20 shadow-[inset_0_2px_8px_rgba(255,255,255,0.7),0_8px_20px_rgba(0,0,0,0.12)]"></div>

      {/* Sombra de suelo */}
      <div className="absolute -bottom-1 w-3/4 h-2 bg-black/20 rounded-full blur-sm"></div>

      {/* Imagen 3D Pixar Real con Fallback al Emoji Volumétrico */}
      {imageSrc && !imgError ? (
        <img
          src={imageSrc}
          alt={animal?.animal || "Animal 3D"}
          onError={() => setImgError(true)}
          className="relative z-10 w-full h-full object-contain p-1 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)] transform transition-transform duration-300 hover:scale-110"
          loading="lazy"
        />
      ) : (
        <span className="relative z-10 filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.25)] transform transition-transform duration-300 hover:scale-110">
          {animal?.emoji || "🐾"}
        </span>
      )}
    </div>
  );
}
