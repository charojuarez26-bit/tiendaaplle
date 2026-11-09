import React from 'react';
import { ShieldCheck, Truck, CreditCard, RotateCcw } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-apple-border/50 mt-20 text-apple-secondary text-xs">
      {/* Guarantees Apple-style grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-apple-border/40 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start space-y-2">
            <Truck className="w-6 h-6 text-apple-text stroke-[1.5]" />
            <h4 className="font-semibold text-apple-text text-sm">Envíos a todo el país</h4>
            <p className="text-apple-secondary text-[13px]">
              Entregas aseguradas en 24/48hs o retiro en sucursal.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start space-y-2">
            <ShieldCheck className="w-6 h-6 text-apple-text stroke-[1.5]" />
            <h4 className="font-semibold text-apple-text text-sm">Garantía Escrita</h4>
            <p className="text-apple-secondary text-[13px]">
              1 año oficial en nuevos y 6 meses de garantía en usados seleccionados.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start space-y-2">
            <RotateCcw className="w-6 h-6 text-apple-text stroke-[1.5]" />
            <h4 className="font-semibold text-apple-text text-sm">Plan Canje Inmediato</h4>
            <p className="text-apple-secondary text-[13px]">
              Tomamos tu iPhone usado al mejor valor del mercado como parte de pago.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start space-y-2">
            <CreditCard className="w-6 h-6 text-apple-text stroke-[1.5]" />
            <h4 className="font-semibold text-apple-text text-sm">Múltiples Medios de Pago</h4>
            <p className="text-apple-secondary text-[13px]">
              Efectivo USD/ARS, transferencias y tarjetas en cuotas.
            </p>
          </div>
        </div>

        {/* Bottom copyright notice */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between text-[11px] text-apple-secondary space-y-2 md:space-y-0">
          <p>© {new Date().getFullYear()} World Apple Argentina. Todos los derechos reservados.</p>
          <div className="flex space-x-6">
            <span className="hover:underline cursor-pointer">Política de Privacidad</span>
            <span className="hover:underline cursor-pointer">Términos de Garantía</span>
            <span className="hover:underline cursor-pointer">Soporte y Contacto</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
