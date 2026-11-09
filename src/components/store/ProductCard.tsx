import React, { useState } from 'react';
import type { Product } from '../../types/database';
import { useCart } from '../../context/CartContext';
import { AppleButton } from '../ui/AppleButton';
import { Badge } from '../ui/Badge';
import { formatUSD, formatARS } from '../../lib/formatters';
import { BatteryCharging, Sparkles, Check, ChevronRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onOpenDetail?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenDetail,
}) => {
  const { addToCart, exchangeRate } = useCart();
  const [addedQuick, setAddedQuick] = useState(false);

  const isSoldOut = product.stock <= 0;
  const isIPhone = product.category === 'nuevo' || product.category === 'usado';
  const finalPriceUSD = product.price_usd;
  const finalPriceARS = finalPriceUSD * exchangeRate;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSoldOut) return;

    // Si es un iPhone nuevo con múltiples capacidades, invitamos a configurarlo en el modal
    if (product.category === 'nuevo' && product.storage_options && product.storage_options.length > 1 && onOpenDetail) {
      onOpenDetail(product);
      return;
    }

    addToCart(
      product,
      product.colors?.[0]?.name,
      product.storage_options?.[0]?.capacity,
      0
    );
    setAddedQuick(true);
    setTimeout(() => setAddedQuick(false), 1500);
  };

  const getCategoryBadge = () => {
    switch (product.category) {
      case 'nuevo':
        return <Badge variant="blue">Nuevo Sellado</Badge>;
      case 'usado':
        return <Badge variant="orange">Usado Certificado</Badge>;
      case 'accesorio':
        return <Badge variant="gray">Accesorio Original</Badge>;
    }
  };

  return (
    <div
      onClick={() => onOpenDetail && onOpenDetail(product)}
      className="group bg-white rounded-2xl sm:rounded-apple border border-apple-border/50 p-4 sm:p-5 flex flex-col justify-between hover:shadow-apple-hover transition-all duration-300 hover:border-apple-border cursor-pointer relative active:scale-[0.99]"
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1.5">
            {getCategoryBadge()}
            {isSoldOut && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                Agotado
              </span>
            )}
          </div>

          {/* Used Unit Battery Info */}
          {product.category === 'usado' && product.battery_health && (
            <div className="flex items-center space-x-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
              <span>{product.battery_health}% bat.</span>
            </div>
          )}

          {product.category === 'nuevo' && (
            <span className="text-[11px] font-medium text-apple-secondary">Garantía Oficial</span>
          )}
        </div>

        {/* Product Image Frame */}
        <div className="relative aspect-square w-full rounded-apple-sm overflow-hidden bg-[#FBFBFD] flex items-center justify-center p-4 mb-4 group-hover:scale-[1.02] transition-transform duration-300 border border-apple-border/20">
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80'}
            alt={product.name}
            className={`object-contain max-h-full max-w-full drop-shadow-md transition-opacity duration-200 ${
              isSoldOut ? 'opacity-50 grayscale-[30%]' : ''
            }`}
            loading="lazy"
          />

          {isSoldOut && (
            <div className="absolute inset-0 bg-white/40 flex items-center justify-center">
              <span className="bg-[#1D1D1F] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                Sin Stock
              </span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-apple-text text-base sm:text-lg tracking-tight mb-1 group-hover:text-apple-blue transition-colors">
          {product.name}
        </h3>

        {/* Condition detail for used items */}
        {product.category === 'usado' && product.aesthetic_condition && (
          <p className="text-apple-secondary text-xs mb-3 line-clamp-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
            <span className="truncate">{product.aesthetic_condition}</span>
          </p>
        )}

        {/* Color preview dots */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center space-x-1.5 mb-3">
            {product.colors.slice(0, 5).map((color) => (
              <span
                key={color.name}
                className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs"
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
            {product.colors.length > 5 && (
              <span className="text-[10px] text-apple-secondary">+{product.colors.length - 5}</span>
            )}
          </div>
        )}

        {/* Storage capacities badge line */}
        {product.storage_options && product.storage_options.length > 0 && (
          <div className="text-[11px] text-apple-secondary mb-3 flex items-center gap-1">
            <span>Capacidades:</span>
            <span className="text-apple-text font-medium">
              {product.storage_options.map((s) => s.capacity).join(' / ')}
            </span>
          </div>
        )}
      </div>

      {/* Pricing and Action */}
      <div className="pt-3 border-t border-apple-border/40 mt-1">
        <div className="mb-3">
          <div className="flex items-baseline space-x-1.5">
            <span className="text-xs text-apple-secondary font-medium">Desde</span>
            <span className="text-2xl font-bold text-apple-text tracking-tight">
              {formatUSD(finalPriceUSD)}
            </span>
            <span className="text-xs text-apple-secondary font-medium">USD</span>
          </div>
          <div className="text-xs text-apple-secondary font-normal mt-0.5">
            o <strong className="text-apple-text font-semibold">{formatARS(finalPriceARS)}</strong> (ARS)
          </div>
        </div>

        {/* Button */}
        {isSoldOut ? (
          <button
            disabled
            className="w-full py-2.5 rounded-full bg-apple-bg text-apple-secondary text-xs font-medium cursor-not-allowed border border-apple-border/40"
          >
            Agotado
          </button>
        ) : isIPhone ? (
          <AppleButton
            type="button"
            variant="secondary"
            className="w-full flex items-center justify-center space-x-1.5 text-xs group-hover:bg-apple-blue group-hover:text-white transition-colors"
          >
            <span>Configurar y Comprar</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </AppleButton>
        ) : (
          <AppleButton
            type="button"
            onClick={handleQuickAdd}
            variant={addedQuick ? 'secondary' : 'primary'}
            className="w-full flex items-center justify-center space-x-1 text-xs"
          >
            {addedQuick ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">¡Agregado!</span>
              </>
            ) : (
              <span>Agregar a la Bolsa</span>
            )}
          </AppleButton>
        )}
      </div>
    </div>
  );
};
