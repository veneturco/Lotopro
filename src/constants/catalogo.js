/**
 * Catálogo Canónico Oficial de Loto Activo (38 Elementos)
 * Colores reglamentarios:
 * - 0 y 00: Azul (Neutro / Especial)
 * - 1 al 10: Rojo
 * - 11 al 20: Negro
 * - 21 al 30: Rojo
 * - 31 al 36: Negro
 */

export const CATALOGO_ANIMALES = {
  "0": { numero: "0", animal: "Delfín", color: "azul", emoji: "🐬", familia: "Agua" },
  "00": { numero: "00", animal: "Ballena", color: "azul", emoji: "🐳", familia: "Agua" },
  "1": { numero: "1", animal: "Carnero", color: "rojo", emoji: "🐏", familia: "Campo" },
  "2": { numero: "2", animal: "Toro", color: "rojo", emoji: "🐂", familia: "Campo" },
  "3": { numero: "3", animal: "Ciempiés", color: "rojo", emoji: "🐛", familia: "Rastreros" },
  "4": { numero: "4", animal: "Alacrán", color: "rojo", emoji: "🦂", familia: "Rastreros" },
  "5": { numero: "5", animal: "León", color: "rojo", emoji: "🦁", familia: "Selva" },
  "6": { numero: "6", animal: "Rana", color: "rojo", emoji: "🐸", familia: "Agua" },
  "7": { numero: "7", animal: "Perico", color: "rojo", emoji: "🦜", familia: "Plumas" },
  "8": { numero: "8", animal: "Ratón", color: "rojo", emoji: "🐭", familia: "Campo" },
  "9": { numero: "9", animal: "Águila", color: "rojo", emoji: "🦅", familia: "Plumas" },
  "10": { numero: "10", animal: "Tigre", color: "rojo", emoji: "🐯", familia: "Selva" },
  "11": { numero: "11", animal: "Gato", color: "negro", emoji: "🐱", familia: "Campo" },
  "12": { numero: "12", animal: "Caballo", color: "negro", emoji: "🐴", familia: "Campo" },
  "13": { numero: "13", animal: "Mono", color: "negro", emoji: "🐒", familia: "Selva" },
  "14": { numero: "14", animal: "Paloma", color: "negro", emoji: "🕊️", familia: "Plumas" },
  "15": { numero: "15", animal: "Zorro", color: "negro", emoji: "🦊", familia: "Selva" },
  "16": { numero: "16", animal: "Oso", color: "negro", emoji: "🐻", familia: "Selva" },
  "17": { numero: "17", animal: "Pavo", color: "negro", emoji: "🦃", familia: "Plumas" },
  "18": { numero: "18", animal: "Burro", color: "negro", emoji: "🫏", familia: "Campo" },
  "19": { numero: "19", animal: "Chivo", color: "negro", emoji: "🐐", familia: "Campo" },
  "20": { numero: "20", animal: "Cochino", color: "negro", emoji: "🐷", familia: "Campo" },
  "21": { numero: "21", animal: "Gallo", color: "rojo", emoji: "🐓", familia: "Plumas" },
  "22": { numero: "22", animal: "Camello", color: "rojo", emoji: "🐫", familia: "Selva" },
  "23": { numero: "23", animal: "Cebra", color: "rojo", emoji: "🦓", familia: "Selva" },
  "24": { numero: "24", animal: "Iguana", color: "rojo", emoji: "🦎", familia: "Rastreros" },
  "25": { numero: "25", animal: "Gallina", color: "rojo", emoji: "🐔", familia: "Plumas" },
  "26": { numero: "26", animal: "Vaca", color: "rojo", emoji: "🐄", familia: "Campo" },
  "27": { numero: "27", animal: "Perro", color: "rojo", emoji: "🐶", familia: "Campo" },
  "28": { numero: "28", animal: "Zamuro", color: "rojo", emoji: "🦅", familia: "Plumas" },
  "29": { numero: "29", animal: "Elefante", color: "rojo", emoji: "🐘", familia: "Selva" },
  "30": { numero: "30", animal: "Caimán", color: "rojo", emoji: "🐊", familia: "Agua" },
  "31": { numero: "31", animal: "Lapa", color: "negro", emoji: "🦡", familia: "Selva" },
  "32": { numero: "32", animal: "Ardilla", color: "negro", emoji: "🐿️", familia: "Selva" },
  "33": { numero: "33", animal: "Pescado", color: "negro", emoji: "🐟", familia: "Agua" },
  "34": { numero: "34", animal: "Venado", color: "negro", emoji: "🦌", familia: "Selva" },
  "35": { numero: "35", animal: "Jirafa", color: "negro", emoji: "🦒", familia: "Selva" },
  "36": { numero: "36", animal: "Culebra", color: "negro", emoji: "🐍", familia: "Rastreros" }
};

export const FAMILIAS_TRADICIONALES = {
  Plumas: { nombre: "Plumas / Aves", emoji: "🪶", color: "text-amber-500", bg: "bg-amber-500/15" },
  Agua: { nombre: "Criaturas de Agua", emoji: "🌊", color: "text-sky-500", bg: "bg-sky-500/15" },
  Selva: { nombre: "Selva y Fieras", emoji: "🐾", color: "text-emerald-500", bg: "bg-emerald-500/15" },
  Campo: { nombre: "Campo y Granja", emoji: "🌾", color: "text-orange-500", bg: "bg-orange-500/15" },
  Rastreros: { nombre: "Bichos y Rastreros", emoji: "🦗", color: "text-rose-500", bg: "bg-rose-500/15" }
};

// Mapa invertido para búsqueda rápida por nombre (sin tildes)
const normalizarTexto = (str) =>
  (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export const MAPA_POR_NOMBRE = Object.values(CATALOGO_ANIMALES).reduce((acc, item) => {
  acc[normalizarTexto(item.animal)] = item;
  return acc;
}, {});

/**
 * Resuelve un animal desde cualquier representación:
 * número, nombre, objeto `{ name_animal }`, `{ animal }`, etc.
 */
export function resolverAnimal(dato) {
  if (!dato) return null;

  // Si ya es un objeto de catálogo
  if (typeof dato === "object") {
    if (dato.numero && CATALOGO_ANIMALES[String(dato.numero)]) {
      return CATALOGO_ANIMALES[String(dato.numero)];
    }
    const nombre = dato.name_animal || dato.animal || dato.nombre;
    if (nombre) {
      const match = MAPA_POR_NOMBRE[normalizarTexto(nombre)];
      if (match) return match;
    }
    if (dato.numero !== undefined) {
      const key = String(dato.numero);
      if (CATALOGO_ANIMALES[key]) return CATALOGO_ANIMALES[key];
    }
  }

  // Si es string o número
  const str = String(dato).trim();
  if (CATALOGO_ANIMALES[str]) {
    return CATALOGO_ANIMALES[str];
  }

  const matchNombre = MAPA_POR_NOMBRE[normalizarTexto(str)];
  if (matchNombre) return matchNombre;

  return null;
}
