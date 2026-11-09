import React, { useState, useEffect } from 'react';
import type { Product } from '../../types/database';
import { useCart } from '../../context/CartContext';
import { AppleButton } from '../ui/AppleButton';
import { Badge } from '../ui/Badge';
import { formatUSD, formatARS } from '../../lib/formatters';
import { useAppStore } from '../../store/useAppStore';
import {
  X,
  BatteryCharging,
  Sparkles,
  ShieldCheck,
  Check,
  Plus,
  Truck,
  Box,
  Share2,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
}) => {
  const { addToCart, exchangeRate } = useCart();
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedStorageIndex, setSelectedStorageIndex] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  const allProducts = useAppStore((state) => state.products);
  const accessories = allProducts
    .filter((p) => p.category === 'accesorio' && p.is_active)
    .slice(0, 3);
  const [addedAccessories, setAddedAccessories] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (product) {
      setSelectedColorIndex(0);
      setSelectedStorageIndex(0);
      setIsAdded(false);
    }
  }, [product]);

  if (!product) return null;

  const isSoldOut = product.stock <= 0;
  const isIPhone = product.category === 'nuevo' || product.category === 'usado';
  const selectedColor = product.colors?.[selectedColorIndex]?.name;
  const currentStorage = product.storage_options?.[selectedStorageIndex];
  const storageAdjustment = currentStorage?.price_adjustment || 0;
  
  const finalPriceUSD = product.price_usd + storageAdjustment;
  const finalPriceARS = finalPriceUSD * exchangeRate;

  const handleAddToCart = () => {
    if (isSoldOut) return;

    addToCart(
      product,
      selectedColor,
      currentStorage?.capacity,
      storageAdjustment
    );
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleAddCrossSell = (acc: Product) => {
    addToCart(acc, acc.colors?.[0]?.name, undefined, 0);
    setAddedAccessories((prev) => ({ ...prev, [acc.id]: true }));
    setTimeout(() => {
      setAddedAccessories((prev) => ({ ...prev, [acc.id]: false }));
    }, 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `World Apple - ${product.name}`,
        text: `Mira este ${product.name} en World Apple`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div className="min-h-full flex items-end sm:items-center justify-center p-0 sm:p-6">
        <div className="relative bg-white rounded-t-3xl sm:rounded-apple-lg border border-apple-border/60 max-w-4xl w-full overflow-hidden shadow-apple-modal z-10 animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
          
          {/* Close button */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center space-x-2">
            <button
              onClick={handleShare}
              className="w-9 h-9 rounded-full bg-apple-bg/80 hover:bg-apple-bg text-apple-secondary hover:text-apple-text flex items-center justify-center transition-colors"
              title="Compartir"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-apple-bg/80 hover:bg-apple-bg text-apple-secondary hover:text-apple-text flex items-center justify-center transition-colors"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 max-h-[90vh] overflow-y-auto">
            
            {/* Left Column: Product Showcase */}
            <div className="md:col-span-5 bg-[#FBFBFD] p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-apple-border/40">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge variant={product.category === 'nuevo' ? 'blue' : product.category === 'usado' ? 'orange' : 'gray'}>
                    {product.category === 'nuevo' ? 'Nuevo Sellado' : product.category === 'usado' ? 'Usado Certificado' : 'Accesorio Oficial'}
                  </Badge>

                  {isSoldOut ? (
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                      Agotado
                    </span>
                  ) : (
                    <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Disponible
                    </span>
                  )}
                </div>

                <div className="aspect-square w-full rounded-2xl flex items-center justify-center p-6 bg-white border border-apple-border/30 shadow-apple-sm">
                  <img
                    src={product.image_url || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80'}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain drop-shadow-lg transition-transform hover:scale-105 duration-300"
                  />
                </div>
              </div>

              {/* Guarantees Box */}
              <div className="mt-6 pt-6 border-t border-apple-border/40 space-y-2 text-xs text-apple-secondary">
                <div className="flex items-center space-x-2 text-apple-text">
                  <ShieldCheck className="w-4 h-4 text-apple-blue shrink-0" />
                  <span>
                    {product.category === 'nuevo'
                      ? 'Garantía oficial Apple de 1 año'
                      : 'Garantía escrita de 6 meses World Apple'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-apple-secondary shrink-0" />
                  <span>Envío asegurado a todo el país o retiro inmediato</span>
                </div>
              </div>
            </div>

            {/* Right Column: Customization, Pricing & Cross-sell */}
            <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              
              <div className="space-y-6">
                {/* Header Info */}
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-apple-text mb-1">
                    {product.name}
                  </h2>

                  {/* Used specifications */}
                  {product.category === 'usado' && (
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {product.battery_health && (
                        <div className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-200">
                          <BatteryCharging className="w-4 h-4 text-emerald-600" />
                          <span>{product.battery_health}% Batería Original</span>
                        </div>
                      )}
                      {product.aesthetic_condition && (
                        <div className="flex items-center space-x-1.5 bg-apple-bg text-apple-text px-3 py-1 rounded-full text-xs font-medium border border-apple-border/60">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>{product.aesthetic_condition}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {product.category === 'nuevo' && product.aesthetic_condition && (
                    <p className="text-xs text-apple-secondary mt-1 flex items-center gap-1.5">
                      <Box className="w-3.5 h-3.5 text-apple-blue" />
                      <span>{product.aesthetic_condition}</span>
                    </p>
                  )}
                </div>

                {/* Color Selector */}
                {product.colors && product.colors.length > 0 && (
                  <div>
                    <label className="block text-xs uppercase font-semibold text-apple-secondary tracking-wider mb-2">
                      Color: <strong className="text-apple-text font-normal">{selectedColor}</strong>
                    </label>
                    <div className="flex items-center space-x-2.5">
                      {product.colors.map((color, idx) => (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => setSelectedColorIndex(idx)}
                          className={`w-7 h-7 rounded-full border transition-all ${
                            selectedColorIndex === idx
                              ? 'ring-2 ring-apple-blue ring-offset-2 scale-110'
                              : 'hover:scale-105 border-black/10'
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Storage Selector (Capacidades) */}
                {product.storage_options && product.storage_options.length > 0 && (
                  <div>
                    <label className="block text-xs uppercase font-semibold text-apple-secondary tracking-wider mb-2">
                      Capacidad de almacenamiento
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {product.storage_options.map((opt, idx) => {
                        const isSelected = selectedStorageIndex === idx;
                        return (
                          <button
                            key={opt.capacity}
                            type="button"
                            onClick={() => setSelectedStorageIndex(idx)}
                            className={`p-3 rounded-xl border text-center transition-all ${
                              isSelected
                                ? 'border-apple-blue bg-apple-blue/5 text-apple-text ring-1 ring-apple-blue font-semibold'
                                : 'border-apple-border/70 hover:border-apple-text/40 bg-white text-apple-text'
                            }`}
                          >
                            <span className="block text-sm font-semibold">{opt.capacity}</span>
                            <span className="block text-[11px] text-apple-secondary mt-0.5">
                              {opt.price_adjustment === 0
                                ? 'Incluido'
                                : `+$${opt.price_adjustment} USD`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Dynamic Price Calculation */}
                <div className="p-4 rounded-2xl bg-apple-bg/70 border border-apple-border/50">
                  <span className="text-xs text-apple-secondary block mb-1">Precio total configurado</span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-extrabold text-apple-text tracking-tight">
                      {formatUSD(finalPriceUSD)}
                    </span>
                    <span className="text-sm font-medium text-apple-secondary">USD</span>
                  </div>
                  <div className="text-sm text-apple-secondary mt-1">
                    Equivalente aproximado:{' '}
                    <strong className="text-apple-text font-semibold">{formatARS(finalPriceARS)}</strong>{' '}
                    <span className="text-xs text-apple-tertiary">(Tasa: 1 USD = {formatARS(exchangeRate)})</span>
                  </div>
                </div>

                {/* Cross-selling (Venta Cruzada) Section */}
                {isIPhone && accessories.length > 0 && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs uppercase font-semibold text-apple-secondary tracking-wider">
                        Complementos recomendados para tu iPhone
                      </span>
                      <span className="text-[11px] text-apple-blue font-medium">Venta Oficial</span>
                    </div>

                    <div className="space-y-2.5">
                      {accessories.map((acc) => {
                        const accAdded = addedAccessories[acc.id];
                        return (
                          <div
                            key={acc.id}
                            className="flex items-center justify-between p-2.5 rounded-xl border border-apple-border/50 bg-white hover:border-apple-border transition-colors"
                          >
                            <div className="flex items-center space-x-3 min-w-0">
                              <img
                                src={acc.image_url || 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=100&q=80'}
                                alt={acc.name}
                                className="w-10 h-10 object-contain rounded-lg bg-apple-bg p-1 shrink-0"
                              />
                              <div className="min-w-0">
                                <h4 className="text-xs font-semibold text-apple-text truncate max-w-[200px] sm:max-w-xs">
                                  {acc.name}
                                </h4>
                                <div className="text-[11px] text-apple-secondary">
                                  {formatUSD(acc.price_usd)} • {formatARS(acc.price_usd * exchangeRate)}
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleAddCrossSell(acc)}
                              className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-all flex items-center space-x-1 ${
                                accAdded
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                  : 'bg-apple-bg hover:bg-[#E8E8ED] text-apple-blue border-apple-border/60 font-medium'
                              }`}
                            >
                              {accAdded ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>¡Agregado!</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Agregar</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>

              {/* Main CTA */}
              <div className="sticky bottom-0 bg-white/95 backdrop-blur-md pt-3 pb-safe sm:pb-4 border-t border-apple-border/40 z-20 mt-4 -mx-6 sm:mx-0 px-6 sm:px-0">
                <AppleButton
                  onClick={handleAddToCart}
                  disabled={isSoldOut}
                  variant={isAdded ? 'secondary' : 'primary'}
                  size="lg"
                  className="w-full flex items-center justify-center space-x-2 py-3.5 sm:py-4 active:scale-95"
                >
                  {isSoldOut ? (
                    <span>Producto Agotado</span>
                  ) : isAdded ? (
                    <>
                      <Check className="w-5 h-5 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">¡Agregado a la Bolsa!</span>
                    </>
                  ) : (
                    <span>Agregar a la Bolsa • {formatUSD(finalPriceUSD)}</span>
                  )}
                </AppleButton>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
