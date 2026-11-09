import React, { useState, useMemo } from 'react';
import type { Product, OrderItem, PaymentMethod } from '../../types/database';
import { productsService } from '../../services/productsService';
import { cashRegisterService } from '../../services/cashRegisterService';
import { ordersService } from '../../services/ordersService';
import { formatUSD, formatARS } from '../../lib/formatters';
import { downloadReceiptPDF } from '../../lib/pdfGenerator';
import { AppleButton } from '../ui/AppleButton';
import {
  Search,
  Plus,
  Minus,
  CheckCircle,
  FileDown,
  Split,
} from 'lucide-react';

interface AdminPOSProps {
  products: Product[];
  exchangeRate: number;
  onRefreshData: () => void;
}

export const AdminPOS: React.FC<AdminPOSProps> = ({ products, exchangeRate, onRefreshData }) => {
  const [posCart, setPosCart] = useState<OrderItem[]>([]);
  const [customerName, setCustomerName] = useState('Cliente Mostrador');
  const [customerPhone, setCustomerPhone] = useState('+54 9 11 Local');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'todos' | 'nuevo' | 'usado' | 'accesorio'>('todos');

  // Mixed / Combined Payments State
  const [payments, setPayments] = useState<{
    efectivo_usd: number;
    efectivo_ars: number;
    transferencia: number;
    debito: number;
    credito: number;
  }>({
    efectivo_usd: 0,
    efectivo_ars: 0,
    transferencia: 0,
    debito: 0,
    credito: 0,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [lastOrderCompleted, setLastOrderCompleted] = useState<any | null>(null);

  // Filter available products (only active with stock > 0)
  const availableProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = categoryFilter === 'todos' || p.category === categoryFilter;
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.colors?.some((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
      return p.is_active && p.stock > 0 && matchCat && matchSearch;
    });
  }, [products, categoryFilter, searchQuery]);

  // Cart Calculations
  const totalUSD = posCart.reduce((sum, it) => sum + it.subtotal_usd, 0);
  const totalARS = totalUSD * exchangeRate;

  // Payments total calculation in USD equivalent
  const totalPaidInUSD = useMemo(() => {
    const fromUSD = payments.efectivo_usd;
    const fromARS = (payments.efectivo_ars + payments.transferencia + payments.debito + payments.credito) / exchangeRate;
    return fromUSD + fromARS;
  }, [payments, exchangeRate]);

  const remainingUSD = Math.max(0, totalUSD - totalPaidInUSD);
  const changeUSD = Math.max(0, totalPaidInUSD - totalUSD);
  const isFullyPaid = totalUSD > 0 && totalPaidInUSD >= totalUSD - 0.01;

  // Add product to POS ticket
  const handleAddToPOS = (p: Product) => {
    setPosCart((prev) => {
      const existing = prev.findIndex((it) => it.product_id === p.id);
      if (existing > -1) {
        const updated = [...prev];
        const item = updated[existing];
        const nextQty = item.quantity + 1;
        updated[existing] = {
          ...item,
          quantity: nextQty,
          subtotal_usd: item.unit_price_usd * nextQty,
        };
        return updated;
      }

      const newItem: OrderItem = {
        product_id: p.id,
        name: p.name,
        category: p.category,
        quantity: 1,
        unit_price_usd: p.price_usd,
        subtotal_usd: p.price_usd,
        selected_color: p.colors?.[0]?.name || null,
        selected_storage: p.storage_options?.[0]?.capacity || null,
        image_url: p.image_url,
      };
      return [...prev, newItem];
    });
  };

  const handleUpdateQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      setPosCart((prev) => prev.filter((_, i) => i !== index));
      return;
    }
    setPosCart((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        quantity: newQty,
        subtotal_usd: updated[index].unit_price_usd * newQty,
      };
      return updated;
    });
  };

  const handleSetQuickPayment = (method: keyof typeof payments) => {
    // Rellena el total restante en el método elegido
    if (method === 'efectivo_usd') {
      setPayments({
        efectivo_usd: totalUSD,
        efectivo_ars: 0,
        transferencia: 0,
        debito: 0,
        credito: 0,
      });
    } else {
      setPayments({
        efectivo_usd: 0,
        efectivo_ars: method === 'efectivo_ars' ? totalARS : 0,
        transferencia: method === 'transferencia' ? totalARS : 0,
        debito: method === 'debito' ? totalARS : 0,
        credito: method === 'credito' ? totalARS : 0,
      });
    }
  };

  const handleConfirmSale = async () => {
    if (posCart.length === 0) {
      alert('Agrega al menos un producto a la venta.');
      return;
    }

    if (!isFullyPaid) {
      alert(`Falta abonar ${formatUSD(remainingUSD)} para cubrir el total de la venta.`);
      return;
    }

    try {
      setIsProcessing(true);

      // Determinar método de pago para el resumen
      const activeMethods = Object.entries(payments).filter(([_, val]) => val > 0);
      const isMixed = activeMethods.length > 1;
      const primaryPaymentMethod = isMixed ? 'pago_mixto' : activeMethods[0]?.[0] || 'efectivo_ars';

      // 1. Crear Orden en Supabase como Aprobada / Cobrada
      const newOrder = await ordersService.createOrder({
        customer_name: customerName.trim() || 'Cliente Mostrador',
        customer_phone: customerPhone.trim() || '+54 9 11 Local',
        delivery_type: 'retiro',
        delivery_address: 'Mostrador Sucursal Central',
        payment_method: primaryPaymentMethod,
        items: posCart,
        total_usd: totalUSD,
        total_ars: totalARS,
        exchange_rate_used: exchangeRate,
        status: 'aprobado_cobrado',
        notes: `Venta Mostrador POS${isMixed ? ' (Pago Combinado)' : ''}`,
      });

      // 2. Descontar stock de cada producto
      for (const item of posCart) {
        if (item.product_id) {
          await productsService.discountStock(item.product_id, item.quantity);
        }
      }

      // 3. Registrar movimientos de caja individuales por cada medio de pago utilizado
      for (const [method, amount] of Object.entries(payments)) {
        if (amount > 0) {
          const isUSD = method === 'efectivo_usd';
          await cashRegisterService.addMovement({
            type: 'ingreso',
            category: 'venta_mostrador',
            description: `Venta POS #${newOrder.id.slice(0, 8).toUpperCase()} - ${customerName}`,
            amount_usd: isUSD ? amount : Math.round((amount / exchangeRate) * 100) / 100,
            amount_ars: isUSD ? Math.round(amount * exchangeRate) : amount,
            payment_method: method as PaymentMethod,
            order_id: newOrder.id,
          });
        }
      }

      // 4. Descargar PDF automáticamente
      downloadReceiptPDF(newOrder);

      // 5. Guardar estado de éxito y reiniciar
      setLastOrderCompleted(newOrder);
      setPosCart([]);
      setPayments({
        efectivo_usd: 0,
        efectivo_ars: 0,
        transferencia: 0,
        debito: 0,
        credito: 0,
      });
      onRefreshData();
    } catch (err) {
      console.error('Error al concretar venta en POS:', err);
      alert('Ocurrió un error al procesar la venta en caja.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Left Column: Product Selector (7 cols) */}
      <div className="lg:col-span-7 space-y-4">
        
        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-apple-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar producto para venta rápida..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2.5 rounded-full bg-white border border-apple-border/70 focus:outline-none focus:border-apple-blue"
            />
          </div>

          <div className="flex items-center space-x-1 bg-white p-1 rounded-full border border-apple-border/50 shrink-0">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'nuevo', label: 'Nuevos' },
              { id: 'usado', label: 'Usados' },
              { id: 'accesorio', label: 'Accesorios' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id as any)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  categoryFilter === cat.id
                    ? 'bg-apple-text text-white'
                    : 'text-apple-secondary hover:text-apple-text'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Products Quick Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pr-1">
          {availableProducts.length === 0 ? (
            <div className="col-span-full py-16 text-center text-xs text-apple-secondary bg-white rounded-apple border border-apple-border/40">
              No hay productos con stock disponible que coincidan con la búsqueda.
            </div>
          ) : (
            availableProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => handleAddToPOS(p)}
                className="bg-white rounded-2xl border border-apple-border/60 p-3 hover:border-apple-blue hover:shadow-apple-sm transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.98]"
              >
                <div>
                  <div className="aspect-square w-full rounded-xl bg-apple-bg/50 p-2 flex items-center justify-center mb-2">
                    <img
                      src={
                        p.image_url ||
                        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=200&q=80'
                      }
                      alt={p.name}
                      className="max-h-full max-w-full object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h4 className="text-xs font-semibold text-apple-text truncate" title={p.name}>
                    {p.name}
                  </h4>
                  <span className="text-[10px] text-apple-secondary block">
                    Stock: <strong className="text-apple-text">{p.stock}</strong> u.
                  </span>
                </div>

                <div className="mt-2 pt-2 border-t border-apple-border/30 flex items-center justify-between">
                  <span className="text-xs font-bold text-apple-text">{formatUSD(p.price_usd)}</span>
                  <span className="w-5 h-5 rounded-full bg-apple-blue/10 text-apple-blue flex items-center justify-center group-hover:bg-apple-blue group-hover:text-white transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Right Column: Ticket Mostrador & Pagos Mixtos (5 cols) */}
      <div className="lg:col-span-5 bg-white rounded-apple-lg border border-apple-border/60 p-5 shadow-apple-card flex flex-col justify-between space-y-5">
        
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-apple-border/40 pb-3">
            <h3 className="font-bold text-apple-text text-sm flex items-center gap-1.5">
              <span>Ticket de Venta Mostrador</span>
              <span className="text-[11px] font-normal text-apple-secondary">({posCart.length} items)</span>
            </h3>
            {posCart.length > 0 && (
              <button
                type="button"
                onClick={() => setPosCart([])}
                className="text-xs text-apple-red hover:underline"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Customer Fast Info */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-[11px] font-medium text-apple-secondary mb-0.5">Cliente</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-apple-border bg-apple-bg/50"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-apple-secondary mb-0.5">WhatsApp / DNI</label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-apple-border bg-apple-bg/50"
              />
            </div>
          </div>

          {/* Ticket Items List */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {posCart.length === 0 ? (
              <div className="py-8 text-center text-xs text-apple-secondary bg-apple-bg/40 rounded-xl border border-dashed border-apple-border">
                Haz clic en los productos para agregarlos al ticket.
              </div>
            ) : (
              posCart.map((it, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-apple-bg/50 border border-apple-border/40 text-xs"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="font-semibold text-apple-text block truncate">{it.name}</span>
                    <span className="text-[10px] text-apple-secondary">
                      {formatUSD(it.unit_price_usd)} c/u
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(idx, it.quantity - 1)}
                      className="w-5 h-5 rounded-md bg-white border border-apple-border flex items-center justify-center text-apple-secondary hover:text-apple-text"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-bold min-w-[14px] text-center">{it.quantity}</span>
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(idx, it.quantity + 1)}
                      className="w-5 h-5 rounded-md bg-white border border-apple-border flex items-center justify-center text-apple-secondary hover:text-apple-text"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <span className="font-bold text-apple-text pl-2">
                      {formatUSD(it.subtotal_usd)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Totals Header */}
          <div className="p-3.5 rounded-2xl bg-[#FBFBFD] border border-apple-border/60 space-y-1">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-apple-secondary">Total a Cobrar:</span>
              <div className="text-right">
                <span className="text-xl font-extrabold text-apple-text">{formatUSD(totalUSD)}</span>
                <span className="text-xs text-apple-secondary block font-medium">{formatARS(totalARS)}</span>
              </div>
            </div>
          </div>

          {/* Mixed Payment Section */}
          <div className="space-y-3 pt-2 border-t border-apple-border/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-apple-text flex items-center gap-1.5">
                <Split className="w-3.5 h-3.5 text-apple-blue" />
                <span>Cobro Combinado / Mixto</span>
              </span>
              <span className="text-[11px] text-apple-secondary">
                1 USD = {formatARS(exchangeRate)}
              </span>
            </div>

            {/* Quick Fill Buttons */}
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => handleSetQuickPayment('efectivo_usd')}
                className="text-[10px] px-2 py-0.5 rounded-full bg-apple-bg hover:bg-apple-border/50 text-apple-text font-medium border border-apple-border/60"
              >
                100% Efectivo USD
              </button>
              <button
                type="button"
                onClick={() => handleSetQuickPayment('efectivo_ars')}
                className="text-[10px] px-2 py-0.5 rounded-full bg-apple-bg hover:bg-apple-border/50 text-apple-text font-medium border border-apple-border/60"
              >
                100% Efectivo ARS
              </button>
              <button
                type="button"
                onClick={() => handleSetQuickPayment('transferencia')}
                className="text-[10px] px-2 py-0.5 rounded-full bg-apple-bg hover:bg-apple-border/50 text-apple-text font-medium border border-apple-border/60"
              >
                100% Transf.
              </button>
            </div>

            {/* Payment Fields Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[10px] font-medium text-apple-secondary mb-0.5">
                  💵 Efectivo USD
                </label>
                <input
                  type="number"
                  min={0}
                  step="any"
                  placeholder="0.00"
                  value={payments.efectivo_usd || ''}
                  onChange={(e) =>
                    setPayments((prev) => ({ ...prev, efectivo_usd: Number(e.target.value) || 0 }))
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-apple-border text-xs font-semibold focus:border-apple-blue"
                />
              </div>

              <div>
                <label className="block text-[10px] font-medium text-apple-secondary mb-0.5">
                  💵 Efectivo ARS
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={payments.efectivo_ars || ''}
                  onChange={(e) =>
                    setPayments((prev) => ({ ...prev, efectivo_ars: Number(e.target.value) || 0 }))
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-apple-border text-xs font-semibold focus:border-apple-blue"
                />
              </div>

              <div>
                <label className="block text-[10px] font-medium text-apple-secondary mb-0.5">
                  🏦 Transferencia ARS
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={payments.transferencia || ''}
                  onChange={(e) =>
                    setPayments((prev) => ({ ...prev, transferencia: Number(e.target.value) || 0 }))
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-apple-border text-xs font-semibold focus:border-apple-blue"
                />
              </div>

              <div>
                <label className="block text-[10px] font-medium text-apple-secondary mb-0.5">
                  💳 Débito / Crédito ARS
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={payments.debito || ''}
                  onChange={(e) =>
                    setPayments((prev) => ({ ...prev, debito: Number(e.target.value) || 0 }))
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-apple-border text-xs font-semibold focus:border-apple-blue"
                />
              </div>
            </div>

            {/* Live Payment Status Indicator */}
            <div
              className={`p-2.5 rounded-xl border text-xs flex items-center justify-between font-semibold ${
                isFullyPaid
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              <span>
                {isFullyPaid
                  ? 'Total Cubierto Correctamente'
                  : `Resta cubrir: ${formatUSD(remainingUSD)}`}
              </span>
              <span>
                {isFullyPaid && changeUSD > 0
                  ? `Vuelto: ${formatUSD(changeUSD)}`
                  : `Pagado: ${formatUSD(totalPaidInUSD)}`}
              </span>
            </div>
          </div>

        </div>

        {/* Action Button */}
        <div>
          <AppleButton
            onClick={handleConfirmSale}
            disabled={!isFullyPaid || posCart.length === 0 || isProcessing}
            size="lg"
            className="w-full flex items-center justify-center space-x-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4 text-white" />
            <span>
              {isProcessing
                ? 'Concretando Venta...'
                : `Confirmar Venta Mostrador (${formatUSD(totalUSD)})`}
            </span>
          </AppleButton>

          {lastOrderCompleted && (
            <div className="mt-2 text-center">
              <button
                type="button"
                onClick={() => downloadReceiptPDF(lastOrderCompleted)}
                className="text-[11px] text-apple-blue hover:underline inline-flex items-center gap-1 font-medium"
              >
                <FileDown className="w-3 h-3" />
                <span>Re-descargar Ticket de la Última Venta (#{lastOrderCompleted.id.slice(0, 8)})</span>
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
