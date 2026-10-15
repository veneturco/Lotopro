/**
 * ============================================================================
 *  speech.js · Narrador de Resultados por Voz (Web Speech API)
 * ============================================================================
 */

export function narrarResultado(animalObj, hora = "", onEnd) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    console.warn("Web Speech API no está soportada en este navegador.");
    return false;
  }

  try {
    window.speechSynthesis.cancel(); // Detener cualquier locución previa

    const numero = animalObj?.numero ?? "";
    const animal = animalObj?.animal ?? "";
    const color = animalObj?.color ? `, color ${animalObj.color}` : "";
    const textoHora = hora ? ` de las ${hora}` : "";

    const mensaje = `¡Atención! Sorteo oficial${textoHora}. Ganador el número ${numero}, ${animal}${color}.`;

    const utterance = new SpeechSynthesisUtterance(mensaje);
    utterance.lang = "es-VE"; // Español venezolano / latino
    utterance.rate = 0.95; // Velocidad ligeramente pausada para claridad
    utterance.pitch = 1.05;

    // Intentar buscar una voz en español
    const voces = window.speechSynthesis.getVoices();
    const vozEspanol = voces.find(
      (v) => v.lang.startsWith("es") || v.lang.includes("es-")
    );
    if (vozEspanol) {
      utterance.voice = vozEspanol;
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.warn("Error al emitir voz:", err);
    if (onEnd) onEnd();
    return false;
  }
}
