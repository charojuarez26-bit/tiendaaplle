import React from 'react';
import {
  Smartphone,
  Sparkles,
  Headphones,
  RefreshCw,
  ShoppingBag,
  LayoutDashboard,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { ProductCategory } from '../../types/database';

interface MobileTabBarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  activeCategory?: ProductCategory;
  onSelectCategory?: (category: ProductCategory) => void;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  currentView,
  onNavigate,
  activeCategory = 'nuevo',
  onSelectCategory,
}) => {
  const { cart, setIsCartOpen } = useAppStore();
  const cartItemCount = cart.reduce((acc, it) => acc + it.quantity, 0);

  const handleTab = (cat: ProductCategory) => {
    if (currentView !== 'store') {
      onNavigate('store');
    }
    if (onSelectCategory) {
      onSelectCategory(cat);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTradeIn = () => {
    onNavigate('trade-in');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdmin = () => {
    onNavigate('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav
      aria-label="Navegación Móvil"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-apple-border/50 lg:hidden pb-safe transition-all shadow-[0_-4px_20px_rgba(0,0,0,0.04)]"
    >
      <div className="grid grid-cols-6 h-14 items-center px-1 text-center select-none">
        
        {/* iPhones Nuevos */}
        <button
          type="button"
          onClick={() => handleTab('nuevo')}
          className={`flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
            currentView === 'store' && activeCategory === 'nuevo'
              ? 'text-apple-blue font-semibold'
              : 'text-apple-secondary hover:text-apple-text'
          }`}
        >
          <Smartphone className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] mt-0.5 tracking-tight">Nuevos</span>
        </button>

        {/* iPhones Usados */}
        <button
          type="button"
          onClick={() => handleTab('usado')}
          className={`flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
            currentView === 'store' && activeCategory === 'usado'
              ? 'text-apple-blue font-semibold'
              : 'text-apple-secondary hover:text-apple-text'
          }`}
        >
          <Sparkles className="w-5 h-5 stroke-[1.8] text-amber-500" />
          <span className="text-[10px] mt-0.5 tracking-tight">Usados</span>
        </button>

        {/* Accesorios */}
        <button
          type="button"
          onClick={() => handleTab('accesorio')}
          className={`flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
            currentView === 'store' && activeCategory === 'accesorio'
              ? 'text-apple-blue font-semibold'
              : 'text-apple-secondary hover:text-apple-text'
          }`}
        >
          <Headphones className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] mt-0.5 tracking-tight">Accesorios</span>
        </button>

        {/* Plan Canje */}
        <button
          type="button"
          onClick={handleTradeIn}
          className={`flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
            currentView === 'trade-in'
              ? 'text-apple-blue font-semibold'
              : 'text-apple-secondary hover:text-apple-text'
          }`}
        >
          <RefreshCw className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] mt-0.5 tracking-tight">Canje</span>
        </button>

        {/* Bolsa / Carrito */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center justify-center py-1 text-apple-secondary hover:text-apple-blue transition-all active:scale-95"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-apple-blue text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {cartItemCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Bolsa</span>
        </button>

        {/* Admin POS */}
        <button
          type="button"
          onClick={handleAdmin}
          className={`flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
            currentView === 'admin'
              ? 'text-apple-blue font-semibold'
              : 'text-apple-secondary hover:text-apple-text'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] mt-0.5 tracking-tight">Admin</span>
        </button>

      </div>
    </nav>
  );
};
