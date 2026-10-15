import React, { useState } from "react";
import { X, Calculator, DollarSign, TrendingUp, Sparkles } from "lucide-react";

export default function BetCalculatorModal({ isOpen, onClose, pronosticos = [] }) {
  const [montoTotal, setMontoTotal] = useState(3);
  const [multiplicador, setMultiplicador] = useState(30); // 30:1 estándar

  if (!isOpen) return null;

  const montoPorAnimal = montoTotal / 3;
  const gananciaBruta = montoPorAnimal * multiplicador;
  const gananciaNeta = gananciaBruta - montoTotal;
  const retornoPorcentual = Math.round((gananciaNeta / montoTotal) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
      <div className="w-full max-w-md bg-white rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Cabecera */}
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-amber-50">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-neutral-900 text-base">
                Simulador de Ganancias (30:1)
              </h3>
              <p className="text-[11px] text-neutral-600 font-medium">
                Calcula tu retorno apostando al Top 3 recomendado
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

        {/* Contenido */}
        <div className="p-4 space-y-4 bg-neutral-50">
          {/* Selector de Monto */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-700 block">
              Monto Total a Repartir entre los 3 Animales:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[3, 6, 15, 30].map((val) => (
                <button
                  key={val}
                  onClick={() => setMontoTotal(val)}
                  className={`py-2 px-3 rounded-xl font-black text-xs transition-all ${
                    montoTotal === val
                      ? "bg-amber-500 text-white shadow-md shadow-amber-500/30 scale-102"
                      : "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100"
                  }`}
                >
                  ${val}
                </button>
              ))}
            </div>
            <div className="relative mt-2">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-neutral-500">$</span>
              <input
                type="number"
                min="1"
                value={montoTotal}
                onChange={(e) => setMontoTotal(Math.max(1, Number(e.target.value)))}
                className="w-full pl-7 pr-3 py-2 text-xs font-bold rounded-xl bg-white border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-neutral-800"
                placeholder="Otro monto personalizado..."
              />
            </div>
            <span className="text-[11px] text-neutral-500 block pt-0.5">
              Equivale a <strong>${montoPorAnimal.toFixed(2)}</strong> por cada animal del Top 3.
            </span>
          </div>

          {/* Tarjeta de Retorno Potencial */}
          <div className="rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-800 p-4 text-white shadow-lg space-y-3 border border-amber-400/30">
            <div className="flex items-center justify-between text-xs text-amber-400 font-bold uppercase tracking-wider">
              <span>Si acierta cualquiera de los 3</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300">
                Cuota {multiplicador}:1
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-[10px] text-neutral-400 font-semibold block uppercase">
                  Cobro Bruto Estimado
                </span>
                <span className="text-3xl font-black text-emerald-400">
                  ${gananciaBruta.toFixed(2)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-neutral-400 font-semibold block uppercase">
                  Ganancia Neta
                </span>
                <span className="text-xl font-black text-amber-300">
                  +${gananciaNeta.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-700/80 flex items-center justify-between text-xs font-semibold text-neutral-300">
              <span>Retorno sobre inversión (ROI):</span>
              <span className="text-emerald-400 font-bold">+{retornoPorcentual}%</span>
            </div>
          </div>
        </div>

        {/* Pie */}
        <div className="p-3 bg-white border-t border-neutral-100 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-neutral-900 text-white font-bold text-xs hover:bg-neutral-800 transition-colors"
          >
            Entendido, volver al pronóstico
          </button>
        </div>
      </div>
    </div>
  );
}
