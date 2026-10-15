/**
 * ============================================================================
 *  schedule.js · Horarios Oficiales y Cronómetro de Loto Activo
 * ============================================================================
 *  Horarios oficiales de lunes a domingo:
 *  09:00 AM, 10:00 AM, 11:00 AM, 12:00 PM, 01:00 PM, 04:00 PM, 05:00 PM, 06:00 PM, 07:00 PM
 */

export const HORARIOS_OFICIALES = [
  { hora: 9, minuto: 0, label: "09:00 AM", valor24: "09:00" },
  { hora: 10, minuto: 0, label: "10:00 AM", valor24: "10:00" },
  { hora: 11, minuto: 0, label: "11:00 AM", valor24: "11:00" },
  { hora: 12, minuto: 0, label: "12:00 PM", valor24: "12:00" },
  { hora: 13, minuto: 0, label: "01:00 PM", valor24: "13:00" },
  { hora: 16, minuto: 0, label: "04:00 PM", valor24: "16:00" },
  { hora: 17, minuto: 0, label: "05:00 PM", valor24: "17:00" },
  { hora: 18, minuto: 0, label: "06:00 PM", valor24: "18:00" },
  { hora: 19, minuto: 0, label: "07:00 PM", valor24: "19:00" },
];

/**
 * Calcula el próximo sorteo en base a la hora actual.
 */
export function calcularTiempoProximoSorteo(fechaReferencia = new Date()) {
  const ahora = fechaReferencia;
  const horasActuales = ahora.getHours();
  const minutosActuales = ahora.getMinutes();
  const segundosActuales = ahora.getSeconds();
  const segundosDesdeMedianoche =
    horasActuales * 3600 + minutosActuales * 60 + segundosActuales;

  // Buscar el próximo horario del día
  for (const item of HORARIOS_OFICIALES) {
    const segundosSorteo = item.hora * 3600 + item.minuto * 60;
    if (segundosSorteo > segundosDesdeMedianoche) {
      const diffSegundos = segundosSorteo - segundosDesdeMedianoche;
      const minutos = Math.floor(diffSegundos / 60);
      const segundos = diffSegundos % 60;

      return {
        proximoSorteo: item.label,
        minutos,
        segundos,
        totalSegundos: diffSegundos,
        esCierreInminente: diffSegundos <= 300, // Menos de 5 minutos
        esManana: false
      };
    }
  }

  // Si ya pasaron las 7:00 PM, el próximo es mañana a las 9:00 AM
  const segundosSorteoManana = 9 * 3600;
  const segundosHastaMedianoche = 86400 - segundosDesdeMedianoche;
  const diffSegundos = segundosHastaMedianoche + segundosSorteoManana;
  const minutos = Math.floor(diffSegundos / 60);
  const segundos = diffSegundos % 60;

  return {
    proximoSorteo: "09:00 AM (Mañana)",
    minutos,
    segundos,
    totalSegundos: diffSegundos,
    esCierreInminente: false,
    esManana: true
  };
}
