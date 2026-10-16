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
      className={`relative flex items-center justify-center select-none ${currentSize} ${className}`}
    >
      {/* Sombra de suelo realista para el personaje 3D */}
      <div className="absolute -bottom-1 w-3/4 h-2.5 bg-black/25 rounded-full blur-sm"></div>

      {/* Imagen 3D Pixar Real con Fallback al Emoji Volumétrico */}
      {imageSrc && !imgError ? (
        <img
          src={imageSrc}
          alt={animal?.animal || "Animal 3D"}
          onError={() => setImgError(true)}
          className="relative z-10 w-full h-full object-contain filter drop-shadow-[0_6px_12px_rgba(0,0,0,0.35)] transform transition-transform duration-300 hover:scale-110"
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
