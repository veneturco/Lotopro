# 🎰 LotoPro · Monitoreo en Tiempo Real y Pronóstico Inteligente (v1.3.0)

**LotoPro** es una Progressive Web App (PWA) de alto rendimiento diseñada con estética **Glassmorphism Premium** y **Modo Casino VIP Oscuro** para el seguimiento en vivo y análisis estocástico predictivo de **Loto Activo** (38 figuras oficiales: 0, 00 y 1 al 36).

---

## 🚀 Inicio Rápido

Para iniciar el servidor de desarrollo local:

```bash
# Desde PowerShell o CMD en la carpeta del proyecto:
node ./node_modules/vite/bin/vite.js
```

La aplicación estará disponible inmediatamente en `http://localhost:3000`.

---

## 🌟 Funcionalidades Avanzadas Integradas

1. **⏱️ Reloj de Cuenta Regresiva al Próximo Sorteo Oficial:**
   - Detecta automáticamente el horario oficial más cercano (09:00 AM, 10:00 AM, 11:00 AM, 12:00 PM, 01:00 PM, 04:00 PM, 05:00 PM, 06:00 PM, 07:00 PM).
   - Cronómetro digital en tiempo real con alerta visual cuando faltan menos de 5 minutos (*"¡Cierre de jugadas inminente!"*).

2. **🎙️ Narrador de Resultados por Voz (Web Speech API):**
   - Locución nativa en español de los sorteos ganadores (*"¡Atención! Sorteo oficial de las 4:00 PM: Ganador el número 27, Perro, color Rojo"*).
   - Botón directo en la Hero Card y conmutador general de voz en la barra superior.

3. **🌙 Modo Casino VIP / Midnight Gold (Tema Oscuro):**
   - Conmutador Sol/Luna (☀️ / 🌙) en la cabecera.
   - Transición fluida a cristal ahumado y fondo negro obsidiana con detalles dorados, persistido en `localStorage`.

4. **🎛️ Selector de Estrategia Predictiva Multi-Modo:**
   - **Equilibrado:** Modelo estocástico estándar (40% racha, 40% atraso, 20% color).
   - **Más Salidores:** Ley del Tercio e inercia reciente (65% racha activa).
   - **Cazador de Fríos:** Reversión a la media y números con atraso crítico (65% atraso).

5. **🎯 Tasa de Efectividad en Vivo (Backtesting):**
   - Badge dinámico `🎯 68.4% Acierto` calculado sobre la serie histórica registrada.

6. **🌡️ Termómetro Completo de los 38 Animales (Heatmap):**
   - Buscador por nombre y número con filtros: `Todos (38)`, `🔥 Calientes`, `⏳ Fríos`, `🔴 Rojos`, `⚫ Negros`.

7. **🕒 Análisis de Tendencia por Franja Horaria:**
   - Permite filtrar el histórico por hora específica oficial (ej. 12:00 PM, 04:00 PM) para descubrir patrones horarios.

8. **📲 Ticket Inteligente de Jugada:**
   - Formateo de recibo sugerido con botón **1-tap a WhatsApp** y copia al portapapeles.

9. **💰 Simulador de Ganancias & ROI (Banca 30:1):**
   - Calcula cobro bruto y retorno de inversión (+900%) al repartir jugadas en el Top 3.

10. **📱 Instalación PWA Nativa (1-Tap):**
    - Banner interactivo flotante para instalar LotoPro en la pantalla de inicio del smartphone sin necesidad de tiendas de aplicaciones.

---

## 🏛️ Arquitectura del Proyecto

```
Lotopro/
├── index.html                 # Shell HTML con tipografía y viewport móvil PWA
├── package.json               # Configuración de dependencias y scripts
├── vite.config.js             # Vite con Tailwind v4 y Code-Splitting manual
├── src/
│   ├── main.jsx               # Punto de entrada
│   ├── App.jsx                # Orquestador con estado reactivo, temas y modales
│   ├── index.css              # Directivas Tailwind y utilidades Glassmorphism
│   ├── constants/
│   │   └── catalogo.js        # Catálogo oficial de 38 animales y colores canónicos
│   ├── services/
│   │   └── firebase.js        # Firestore v10 con persistencia Offline-First
│   ├── utils/
│   │   ├── predictiveEngine.js # Motor estocástico, estrategias y backtesting
│   │   ├── schedule.js        # Horarios oficiales y lógica de cuenta regresiva
│   │   └── speech.js          # Síntesis de voz natural en español
│   └── components/
│       ├── Header.jsx         # Cabecera con selector de tema, voz y estado en vivo
│       ├── HeroCard.jsx       # Último ganador con locutor de voz y avatar 3D
│       ├── CountdownTimer.jsx # Reloj regresivo al próximo sorteo oficial
│       ├── PredictionCard.jsx # Pronóstico del Sistema con selector y 4 herramientas
│       ├── ResultsGrid.jsx    # Cuadrícula amarilla de sorteos del día
│       ├── AnimalAvatar.jsx   # Avatar volumétrico 3D estilo Pixar
│       ├── HeatmapModal.jsx   # Modal termómetro de los 38 animales
│       ├── TimeFilterModal.jsx# Modal de análisis de tendencia por horario
│       ├── ShareTicketModal.jsx# Modal para compartir en WhatsApp
│       ├── BetCalculatorModal.jsx # Simulador de ganancias y ROI
│       ├── PWAInstallBanner.jsx # Banner de instalación PWA en el teléfono
│       └── SkeletonLoader.jsx # Efecto shimmer de carga
```
