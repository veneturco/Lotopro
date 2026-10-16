import React, { useState, useEffect } from "react";
import { Download, X, Sparkles } from "lucide-react";

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Si ya está ejecutándose como PWA instalada, no mostrar banner
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) return;

    // Detectar iOS Safari (no soporta beforeinstallprompt nativo)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    if (isIosDevice) {
      setIsIOS(true);
      const dismissed = localStorage.getItem('lotopro_pwa_ios_dismissed');
      if (!dismissed) {
        setVisible(true);
      }
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      alert("Para instalar en iPhone/iPad:\n1. Toca el botón 'Compartir' (cuadrado con flecha hacia arriba) en Safari.\n2. Selecciona 'Agregar a la pantalla de inicio'.");
      return;
    }

    if (!deferredPrompt) {
      alert("Para instalar en Chrome / Edge: Haz clic en el icono de instalación en la barra de direcciones arriba (junto a la estrella de favoritos).");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleClose = () => {
    if (isIOS) {
      localStorage.setItem('lotopro_pwa_ios_dismissed', 'true');
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-3 left-3 right-3 z-50 max-w-md mx-auto animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-900 text-white shadow-2xl border border-amber-400/40 backdrop-blur-xl">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-neutral-950">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Instalar LotoPro</h4>
            <p className="text-[10px] text-neutral-400">Acceso instantáneo sin navegador</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleInstall}
            className="flex items-center space-x-1 py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs shadow-md transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Instalar</span>
          </button>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
