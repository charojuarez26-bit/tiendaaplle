import React, { useState, useMemo } from 'react';
import type { Product, ProductCategory } from '../types/database';
import { useAppStore } from '../store/useAppStore';
import { sortNewProducts } from '../services/productsService';
import { ProductCard } from '../components/store/ProductCard';
import { ProductDetailModal } from '../components/store/ProductDetailModal';
import { TestimonialsSection } from '../components/store/TestimonialsSection';
import { LocationSection } from '../components/store/LocationSection';
import { AppleButton } from '../components/ui/AppleButton';
import {
  Smartphone,
  Sparkles,
  RefreshCw,
  Search,
  Headphones,
  ShieldCheck,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface StorePageProps {
  onNavigateToTradeIn: () => void;
  activeCategory?: ProductCategory;
  onSelectCategory?: (category: ProductCategory) => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export const StorePage: React.FC<StorePageProps> = ({
  onNavigateToTradeIn,
  activeCategory = 'nuevo',
  onSelectCategory,
  searchQuery = '',
  onSearchChange,
}) => {
  const allProducts = useAppStore((state) => state.products);
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);

  // Filtrado por categoría activa y ordenamiento oficial
  const categoryProducts = useMemo(() => {
    const list = allProducts.filter((p) => p.is_active && p.category === activeCategory);
    if (activeCategory === 'nuevo') {
      return sortNewProducts(list);
    }
    return list;
  }, [allProducts, activeCategory]);

  // Filtrado reactivo en base al buscador
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return categoryProducts;
    const q = searchQuery.toLowerCase();
    return categoryProducts.filter((p) => {
      const matchName = p.name.toLowerCase().includes(q);
      const matchCondition = p.aesthetic_condition?.toLowerCase().includes(q);
      const matchColors = p.colors?.some((c) => c.name.toLowerCase().includes(q));
      const matchStorage = p.storage_options?.some((s) => s.capacity.toLowerCase().includes(q));
      return matchName || matchCondition || matchColors || matchStorage;
    });
  }, [categoryProducts, searchQuery]);

  return (
    <div className="min-h-screen pb-16">
      
      {/* Apple Hero Highlight Bar */}
      <section className="bg-white border-b border-apple-border/40 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 text-center transition-all">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 bg-apple-blue/10 text-apple-blue px-3.5 py-1 rounded-full text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Tienda Oficial World Apple</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-apple-text">
            {activeCategory === 'nuevo' && 'iPhones Nuevos. Sellados.'}
            {activeCategory === 'usado' && 'iPhones Usados Seleccionados.'}
            {activeCategory === 'accesorio' && 'Accesorios Oficiales Apple.'}
          </h1>

          <p className="text-apple-secondary text-sm sm:text-base max-w-2xl mx-auto font-normal">
            {activeCategory === 'nuevo' &&
              'Equipos directos de fábrica en caja sellada con 1 año de garantía oficial Apple internacional. Stock disponible para despacho o retiro inmediato.'}
            {activeCategory === 'usado' &&
              'Unidades únicas 100% funcionales con batería original certificada, pantalla True Tone y 6 meses de garantía escrita de nuestra tienda.'}
            {activeCategory === 'accesorio' &&
              'Cargadores rápidos originales 20W, cables tejidos, AirPods con cancelación activa y fundas de silicona con tecnología MagSafe.'}
          </p>

          {/* Quick Trade-In Banner Link */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <AppleButton
              onClick={onNavigateToTradeIn}
              variant="secondary"
              className="space-x-2 text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-apple-blue" />
              <span>¿Tenés un iPhone usado? Cotizá tu Plan Canje aquí</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </AppleButton>
          </div>
        </div>
      </section>

      {/* Main Catalog Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Navigation Tabs Bar Apple Style */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-apple-border/40">
          
          {/* Main 3 Requested Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
            <button
              onClick={() => onSelectCategory && onSelectCategory('nuevo')}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                activeCategory === 'nuevo'
                  ? 'bg-apple-text text-white shadow-sm ring-1 ring-black'
                  : 'bg-white text-apple-secondary hover:text-apple-text border border-apple-border/60 hover:bg-apple-bg'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>iPhones Nuevos</span>
            </button>

            <button
              onClick={() => onSelectCategory && onSelectCategory('usado')}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                activeCategory === 'usado'
                  ? 'bg-apple-text text-white shadow-sm ring-1 ring-black'
                  : 'bg-white text-apple-secondary hover:text-apple-text border border-apple-border/60 hover:bg-apple-bg'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>iPhones Usados</span>
            </button>

            <button
              onClick={() => onSelectCategory && onSelectCategory('accesorio')}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                activeCategory === 'accesorio'
                  ? 'bg-apple-text text-white shadow-sm ring-1 ring-black'
                  : 'bg-white text-apple-secondary hover:text-apple-text border border-apple-border/60 hover:bg-apple-bg'
              }`}
            >
              <Headphones className="w-4 h-4" />
              <span>Accesorios</span>
            </button>
          </div>

          {/* Quick Mobile Search & Count */}
          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-apple-secondary">
            <div className="sm:hidden relative flex-1">
              <Search className="w-3.5 h-3.5 text-apple-secondary absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-full bg-white border border-apple-border"
              />
            </div>
            <span className="font-medium whitespace-nowrap">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}
            </span>
          </div>

        </div>

        {/* Section Context Notice */}
        <div className="pt-4 pb-2">
          {activeCategory === 'nuevo' && (
            <p className="text-xs text-apple-tertiary">
              💡 Catálogo ordenado por generación (de más reciente a anterior) y de mayor a menor precio. Haz clic en cualquier modelo para seleccionar tu color y capacidad deseada.
            </p>
          )}
          {activeCategory === 'usado' && (
            <p className="text-xs text-apple-tertiary">
              🔍 Cada unidad usada es única y verificada. Revisa el estado estético y porcentaje de salud de batería de cada una.
            </p>
          )}
          {activeCategory === 'accesorio' && (
            <p className="text-xs text-apple-tertiary">
              ⚡ Accesorios 100% originales con garantía y empaque oficial Apple.
            </p>
          )}
        </div>

        {/* Products Grid */}
        <div className="pt-6">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-apple border border-apple-border/50 p-16 text-center space-y-3 max-w-lg mx-auto shadow-apple-sm">
              <div className="w-12 h-12 bg-apple-bg rounded-full flex items-center justify-center mx-auto text-apple-secondary">
                <Filter className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-apple-text">No encontramos productos</h3>
              <p className="text-xs text-apple-secondary">
                No hay coincidencias para &quot;{searchQuery}&quot; en esta sección.
              </p>
              {searchQuery && (
                <button
                  onClick={() => onSearchChange && onSearchChange('')}
                  className="text-xs text-apple-blue font-medium hover:underline pt-2 block mx-auto"
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenDetail={(prod) => setSelectedProductForModal(prod)}
                />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* 1. Sección "Nuestros Clientes" (Opiniones) */}
      <TestimonialsSection />

      {/* 2. Sección "Dónde Estamos Ubicados" (Nuestra Ubicación) */}
      <LocationSection />

      {/* Product Detail & Configuration Modal (with Cross-selling) */}
      <ProductDetailModal
        product={selectedProductForModal}
        onClose={() => setSelectedProductForModal(null)}
      />

    </div>
  );
};
