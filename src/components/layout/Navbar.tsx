import React, { useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  RefreshCw,
  LayoutDashboard,
  Sparkles,
  Smartphone,
  Headphones,
  CheckCircle2,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { formatARS } from '../../lib/formatters';

export type StoreTab = 'nuevos' | 'usados' | 'accesorios' | 'trade-in' | 'admin';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  activeCategory?: string;
  onSelectCategory?: (category: 'nuevo' | 'usado' | 'accesorio') => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  activeCategory,
  onSelectCategory,
  searchQuery = '',
  onSearchChange,
}) => {
  const { cart, setIsCartOpen, exchangeRate, isFetchingRate, fetchExchangeRate } = useAppStore();
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    // Initial fetch of live Dólar Blue from DolarAPI
    fetchExchangeRate();
  }, [fetchExchangeRate]);

  const handleTabClick = (category: 'nuevo' | 'usado' | 'accesorio') => {
    if (currentView !== 'store') {
      onNavigate('store');
    }
    if (onSelectCategory) {
      onSelectCategory(category);
    }
  };

  return (
    <>
      {/* Top Banner Cotización Oficial Dólar Blue */}
      <div className="bg-[#1D1D1F] text-white text-[12px] py-1.5 px-4 text-center font-normal tracking-tight flex items-center justify-between sm:justify-center gap-2 sm:gap-4">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-apple-secondary hidden sm:inline">Dólar Blue hoy:</span>
          <span className="font-semibold text-white">1 USD = {formatARS(exchangeRate)}</span>
          <button
            onClick={() => fetchExchangeRate()}
            disabled={isFetchingRate}
            className="text-apple-secondary hover:text-white transition-colors p-0.5 rounded"
            title="Actualizar cotización en tiempo real"
          >
            <RefreshCw className={`w-3 h-3 ${isFetchingRate ? 'animate-spin text-apple-blue' : ''}`} />
          </button>
        </div>

        <span className="hidden md:inline text-apple-secondary/60">|</span>

        <div className="hidden md:flex items-center space-x-1.5 text-apple-secondary text-[11px]">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Equipos con garantía oficial y entrega inmediata en el día</span>
        </div>
      </div>

      {/* Main Glass Navbar */}
      <header className="apple-glass sticky top-0 z-40 border-b border-apple-border/50 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo Brand: Manzana Azul Global */}
          <button
            onClick={() => {
              onNavigate('store');
              if (onSelectCategory) onSelectCategory('nuevo');
            }}
            className="flex items-center space-x-2.5 group text-left shrink-0"
            title="World Apple Inicio"
          >
            <div className="w-8 h-8 rounded-full bg-apple-blue/10 flex items-center justify-center group-hover:bg-apple-blue/20 transition-colors">
              <svg
                className="w-5 h-5 fill-current text-apple-blue transition-transform group-hover:scale-105"
                viewBox="0 0 170 170"
              >
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.7-11.64-13.99-6.42-9.98-11.27-20.91-14.56-32.8-3.29-11.89-4.94-23.36-4.94-34.42 0-14.53 3.69-26.69 11.07-36.48 7.38-9.79 16.71-14.77 27.99-14.94 4.88 0 10.11 1.25 15.7 3.75 5.58 2.5 9.38 3.84 11.39 4.02 1.43-.18 5.43-1.57 12.01-4.17 6.58-2.6 12.08-3.77 16.5-3.52 12.35.6 22.37 4.96 30.06 13.08-10.74 6.5-16.01 15.48-15.81 26.93.2 9.07 3.74 16.75 10.62 23.03 6.88 6.28 15.11 9.94 24.69 10.98-2.31 7.23-5.25 14.56-8.81 22.01zM119.22 33.15c0-6.72 2.37-13.1 7.11-19.14 4.74-6.04 10.74-10.37 18-13.01-.52 2.22-.84 4.08-.96 5.58-.37 4.75-1.74 9.47-4.11 14.16-2.37 4.69-5.59 8.78-9.66 12.27-3.9 3.34-8.08 5.61-12.54 6.81-.37-2.22-.55-4.44-.55-6.67z"/>
              </svg>
            </div>
            <div>
              <span className="font-semibold text-base sm:text-lg tracking-tight text-apple-text block leading-none">
                World Apple
              </span>
              <span className="text-[10px] text-apple-secondary font-normal tracking-wide block">
                Store & Showroom
              </span>
            </div>
          </button>

          {/* Navigation Tabs (iPhones Nuevos, iPhones Usados, Accesorios, Plan Canje) */}
          <nav className="hidden lg:flex items-center space-x-1 text-xs font-medium tracking-tight">
            <button
              onClick={() => handleTabClick('nuevo')}
              className={`px-3.5 py-1.5 rounded-full transition-all flex items-center space-x-1.5 ${
                currentView === 'store' && activeCategory === 'nuevo'
                  ? 'bg-apple-text text-white shadow-sm font-semibold'
                  : 'text-apple-secondary hover:text-apple-text hover:bg-black/5'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>iPhones Nuevos</span>
            </button>

            <button
              onClick={() => handleTabClick('usado')}
              className={`px-3.5 py-1.5 rounded-full transition-all flex items-center space-x-1.5 ${
                currentView === 'store' && activeCategory === 'usado'
                  ? 'bg-apple-text text-white shadow-sm font-semibold'
                  : 'text-apple-secondary hover:text-apple-text hover:bg-black/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>iPhones Usados</span>
            </button>

            <button
              onClick={() => handleTabClick('accesorio')}
              className={`px-3.5 py-1.5 rounded-full transition-all flex items-center space-x-1.5 ${
                currentView === 'store' && activeCategory === 'accesorio'
                  ? 'bg-apple-text text-white shadow-sm font-semibold'
                  : 'text-apple-secondary hover:text-apple-text hover:bg-black/5'
              }`}
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>Accesorios</span>
            </button>

            <button
              onClick={() => onNavigate('trade-in')}
              className={`px-3.5 py-1.5 rounded-full transition-all flex items-center space-x-1.5 ${
                currentView === 'trade-in'
                  ? 'bg-apple-blue text-white shadow-sm font-semibold'
                  : 'text-apple-secondary hover:text-apple-text hover:bg-black/5'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Plan Canje</span>
            </button>
          </nav>

          {/* Integrated Apple Search Input */}
          <div className="flex-1 max-w-xs relative hidden sm:block">
            <Search className="w-4 h-4 text-apple-secondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar iPhone, capacidad, modelo..."
              value={searchQuery}
              onChange={(e) => {
                if (currentView !== 'store') onNavigate('store');
                if (onSearchChange) onSearchChange(e.target.value);
              }}
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-full bg-apple-bg/80 border border-apple-border/70 focus:outline-none focus:border-apple-blue focus:bg-white focus:ring-1 focus:ring-apple-blue transition-all"
            />
          </div>

          {/* Right Actions: Admin Link & Cart */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            <button
              onClick={() => onNavigate('admin')}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all flex items-center space-x-1.5 ${
                currentView === 'admin'
                  ? 'bg-apple-text text-white border-apple-text shadow-sm'
                  : 'text-apple-secondary border-apple-border/60 hover:text-apple-text hover:bg-black/5'
              }`}
              title="Panel Administrativo & POS"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin POS</span>
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-apple-text hover:text-apple-blue transition-colors rounded-full hover:bg-black/5"
              aria-label="Abrir bolsa de compras"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
              {cartItemCount > 0 && (
                <span className="absolute top-1 right-0 bg-apple-blue text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-in fade-in zoom-in duration-200">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>

        </div>

        {/* Mobile Secondary Navigation Bar */}
        <div className="lg:hidden border-t border-apple-border/40 px-4 py-2 flex items-center justify-between gap-1 overflow-x-auto scrollbar-none bg-white/70">
          <button
            onClick={() => handleTabClick('nuevo')}
            className={`text-xs px-3 py-1 rounded-full whitespace-nowrap transition-all ${
              currentView === 'store' && activeCategory === 'nuevo'
                ? 'bg-apple-text text-white font-medium'
                : 'text-apple-secondary'
            }`}
          >
            Nuevos
          </button>
          <button
            onClick={() => handleTabClick('usado')}
            className={`text-xs px-3 py-1 rounded-full whitespace-nowrap transition-all ${
              currentView === 'store' && activeCategory === 'usado'
                ? 'bg-apple-text text-white font-medium'
                : 'text-apple-secondary'
            }`}
          >
            Usados
          </button>
          <button
            onClick={() => handleTabClick('accesorio')}
            className={`text-xs px-3 py-1 rounded-full whitespace-nowrap transition-all ${
              currentView === 'store' && activeCategory === 'accesorio'
                ? 'bg-apple-text text-white font-medium'
                : 'text-apple-secondary'
            }`}
          >
            Accesorios
          </button>
          <button
            onClick={() => onNavigate('trade-in')}
            className={`text-xs px-3 py-1 rounded-full whitespace-nowrap transition-all ${
              currentView === 'trade-in'
                ? 'bg-apple-blue text-white font-medium'
                : 'text-apple-blue font-medium'
            }`}
          >
            Plan Canje
          </button>
          <button
            onClick={() => onNavigate('admin')}
            className={`text-xs px-3 py-1 rounded-full whitespace-nowrap transition-all ${
              currentView === 'admin'
                ? 'bg-apple-text text-white font-medium'
                : 'text-apple-secondary'
            }`}
          >
            Admin
          </button>
        </div>
      </header>
    </>
  );
};
