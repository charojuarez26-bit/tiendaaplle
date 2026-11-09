import React, { useState } from 'react';
import {
  X,
  Trash2,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  Truck,
  Store,
  Plus,
  Minus,
  MessageCircle,
  FileDown,
  CreditCard,
  Banknote,
  ArrowLeft,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatUSD, formatARS } from '../../lib/formatters';
import { AppleButton } from '../ui/AppleButton';
import { ordersService } from '../../services/ordersService';
import { getWhatsAppOrderUrl } from '../../lib/whatsapp';
import { downloadReceiptPDF } from '../../lib/pdfGenerator';
import type { DeliveryType, Order } from '../../types/database';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalUSD,
    totalARS,
    exchangeRate,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  // Drawer steps: 'cart' | 'checkout' | 'success'
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');

  // Checkout form fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('retiro');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string>('transferencia');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (!isCartOpen) return null;

  const handleProceedToCheckout = () => {
    if (cart.length === 0) return;
    setStep('checkout');
  };

  const handleBackToCart = () => {
    setStep('cart');
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Por favor ingresa tu nombre y teléfono de contacto.');
      return;
    }

    if (deliveryType === 'envio' && !deliveryAddress.trim()) {
      alert('Por favor ingresa la dirección de entrega.');
      return;
    }

    try {
      setIsSubmitting(true);

      const orderPayload = {
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        delivery_type: deliveryType,
        delivery_address: deliveryType === 'envio' ? deliveryAddress.trim() : null,
        payment_method: paymentMethod,
        items: cart,
        total_usd: totalUSD,
        total_ars: totalARS,
        exchange_rate_used: exchangeRate,
        status: 'pendiente' as const,
        notes: notes.trim() || null,
      };

      const newOrder = await ordersService.createOrder(orderPayload);
      setCompletedOrder(newOrder);
      setStep('success');
      clearCart();

      // Derivación automática a WhatsApp
      const waUrl = getWhatsAppOrderUrl(newOrder);
      const win = window.open(waUrl, '_blank');
      if (!win) {
        // En caso de que el navegador bloquee el popup automático, el usuario tendrá el botón grande disponible
        console.log('Popup bloqueado, el usuario puede hacer clic en el botón de WhatsApp.');
      }
    } catch (error) {
      console.error('Error al registrar el pedido:', error);
      alert('Hubo un inconveniente al procesar el pedido. Por favor intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsCartOpen(false);
    // Reset solo si ya completó el pedido
    if (step === 'success') {
      setStep('cart');
      setCompletedOrder(null);
    }
  };

  const totalItemUnits = cart.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-apple-border/50 flex items-center justify-between bg-white/90 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center space-x-2">
              {step === 'checkout' && (
                <button
                  type="button"
                  onClick={handleBackToCart}
                  className="mr-1 p-1 rounded-full text-apple-secondary hover:text-apple-text hover:bg-apple-bg transition-colors"
                  title="Volver al carrito"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <ShoppingBag className="w-5 h-5 text-apple-text" />
              <h2 className="text-base sm:text-lg font-bold text-apple-text tracking-tight">
                {step === 'cart' && `Bolsa de Compras (${totalItemUnits})`}
                {step === 'checkout' && 'Datos de Entrega y Pago'}
                {step === 'success' && '¡Pedido Recibido!'}
              </h2>
            </div>

            <button
              onClick={handleClose}
              className="text-apple-secondary hover:text-apple-text transition-colors p-1.5 rounded-full hover:bg-apple-bg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Body */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
            
            {/* STEP 1: CART REVIEW */}
            {step === 'cart' && (
              <>
                {cart.length === 0 ? (
                  <div className="text-center py-24 space-y-3">
                    <div className="w-16 h-16 bg-apple-bg rounded-full flex items-center justify-center mx-auto text-apple-border">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <p className="text-base font-semibold text-apple-text">Tu bolsa está vacía</p>
                    <p className="text-xs text-apple-secondary max-w-xs mx-auto">
                      Explora nuestros iPhones nuevos, usados certificados y accesorios originales para comenzar.
                    </p>
                    <div className="pt-4">
                      <AppleButton onClick={handleClose} size="sm">
                        Explorar catálogo
                      </AppleButton>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-apple-secondary">
                      <span className="uppercase font-semibold tracking-wider">Productos</span>
                      <button
                        onClick={clearCart}
                        className="text-apple-red hover:underline flex items-center space-x-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Vaciar bolsa</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {cart.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center space-x-3.5 p-3.5 rounded-2xl border border-apple-border/50 bg-[#FBFBFD] hover:border-apple-border transition-colors"
                        >
                          <img
                            src={
                              item.image_url ||
                              'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=200&q=80'
                            }
                            alt={item.name}
                            className="w-16 h-16 object-contain rounded-xl bg-white p-1.5 border border-apple-border/40 shrink-0"
                          />

                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs sm:text-sm font-semibold text-apple-text truncate">
                              {item.name}
                            </h4>
                            
                            <div className="text-[11px] text-apple-secondary mt-0.5 space-x-2">
                              {item.selected_storage && (
                                <span className="font-medium text-apple-tertiary">
                                  {item.selected_storage}
                                </span>
                              )}
                              {item.selected_color && <span>• {item.selected_color}</span>}
                            </div>

                            <div className="text-xs font-bold text-apple-text mt-1.5">
                              {formatUSD(item.unit_price_usd)}
                            </div>
                          </div>

                          {/* Quantity Controls & Remove */}
                          <div className="flex flex-col items-end space-y-2 shrink-0">
                            <div className="flex items-center space-x-1.5 bg-white border border-apple-border/60 rounded-full px-1.5 py-0.5 shadow-2xs">
                              <button
                                type="button"
                                onClick={() => updateQuantity(idx, item.quantity - 1)}
                                className="w-5 h-5 flex items-center justify-center text-apple-secondary hover:text-apple-text rounded-full hover:bg-apple-bg"
                                title="Disminuir"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-semibold px-1 min-w-[16px] text-center text-apple-text">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(idx, item.quantity + 1)}
                                className="w-5 h-5 flex items-center justify-center text-apple-secondary hover:text-apple-text rounded-full hover:bg-apple-bg"
                                title="Aumentar"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeFromCart(idx)}
                              className="text-apple-secondary hover:text-apple-red transition-colors p-1"
                              title="Eliminar producto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* STEP 2: CHECKOUT FORM */}
            {step === 'checkout' && (
              <form id="checkout-drawer-form" onSubmit={handleSubmitOrder} className="space-y-5">
                
                {/* Contact Data */}
                <div className="space-y-3">
                  <span className="text-xs uppercase font-bold text-apple-secondary tracking-wider block">
                    1. Datos de Contacto
                  </span>

                  <div>
                    <label className="block text-xs font-medium text-apple-text mb-1">
                      Nombre y Apellido *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Lucas Fernández"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-apple-border focus:outline-none focus:border-apple-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-apple-text mb-1">
                      Teléfono / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ej. +54 9 11 4455-6677"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-apple-border focus:outline-none focus:border-apple-blue"
                    />
                  </div>
                </div>

                {/* Delivery Option */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs uppercase font-bold text-apple-secondary tracking-wider block">
                    2. Modalidad de Entrega
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryType('retiro')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                        deliveryType === 'retiro'
                          ? 'border-apple-blue bg-apple-blue/5 text-apple-blue ring-1 ring-apple-blue font-semibold'
                          : 'border-apple-border/70 text-apple-text bg-white hover:border-apple-text/40'
                      }`}
                    >
                      <Store className="w-5 h-5 mb-1" />
                      <span className="text-xs font-semibold">Retiro en Local</span>
                      <span className="text-[10px] text-apple-secondary">Gratis • Inmediato</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryType('envio')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                        deliveryType === 'envio'
                          ? 'border-apple-blue bg-apple-blue/5 text-apple-blue ring-1 ring-apple-blue font-semibold'
                          : 'border-apple-border/70 text-apple-text bg-white hover:border-apple-text/40'
                      }`}
                    >
                      <Truck className="w-5 h-5 mb-1" />
                      <span className="text-xs font-semibold">Envío a Domicilio</span>
                      <span className="text-[10px] text-apple-secondary">Asegurado 24/48 hs</span>
                    </button>
                  </div>

                  {deliveryType === 'envio' && (
                    <div className="animate-in fade-in duration-200">
                      <label className="block text-xs font-medium text-apple-text mb-1">
                        Dirección completa de entrega *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Calle, altura, piso/depto, barrio, ciudad"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-apple-border focus:outline-none focus:border-apple-blue"
                      />
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs uppercase font-bold text-apple-secondary tracking-wider block">
                    3. Medio de Pago Preferido
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'transferencia', label: 'Transferencia Bancaria', icon: Banknote },
                      { id: 'efectivo_usd', label: 'Efectivo USD (Dólares)', icon: Banknote },
                      { id: 'efectivo_ars', label: 'Efectivo ARS (Pesos)', icon: Banknote },
                      { id: 'credito', label: 'Tarjeta de Crédito / Débito', icon: CreditCard },
                    ].map((pm) => {
                      const Icon = pm.icon;
                      return (
                        <button
                          key={pm.id}
                          type="button"
                          onClick={() => setPaymentMethod(pm.id)}
                          className={`flex items-center space-x-2 p-2.5 rounded-xl border text-left transition-all ${
                            paymentMethod === pm.id
                              ? 'border-apple-blue bg-apple-blue/5 text-apple-blue ring-1 ring-apple-blue font-semibold'
                              : 'border-apple-border/70 text-apple-text bg-white hover:border-apple-text/40'
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="text-xs">{pm.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Notes */}
                <div className="pt-2">
                  <label className="block text-xs font-medium text-apple-text mb-1">
                    Notas o aclaraciones (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Horarios preferidos de contacto o instrucciones..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-apple-border focus:outline-none focus:border-apple-blue resize-none"
                  />
                </div>

              </form>
            )}

            {/* STEP 3: SUCCESS & WHATSAPP DERIVATION & PDF */}
            {step === 'success' && completedOrder && (
              <div className="text-center py-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-apple-text">¡Pedido Registrado con Éxito!</h3>
                  <p className="text-xs text-apple-secondary">
                    Guardado en nuestro sistema con estado{' '}
                    <span className="font-semibold text-amber-600">Pendiente de Confirmación</span>.
                  </p>
                  <div className="inline-block mt-2 font-mono text-xs font-bold bg-apple-bg px-3 py-1 rounded-full border border-apple-border/60">
                    Orden #{completedOrder.id.slice(0, 8).toUpperCase()}
                  </div>
                </div>

                {/* WhatsApp Action Box */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-left space-y-3">
                  <div className="flex items-center space-x-2 text-emerald-800">
                    <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Derivación Automática a WhatsApp
                    </span>
                  </div>
                  <p className="text-xs text-emerald-950">
                    Para confirmar el stock y coordinar el pago, abrí WhatsApp con el mensaje estructurado ya preparado para nuestro asesor de ventas:
                  </p>
                  <a
                    href={getWhatsAppOrderUrl(completedOrder)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center space-x-2 w-full py-3 rounded-full bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-bold shadow-sm transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Abrir Chat de WhatsApp Oficial</span>
                  </a>
                </div>

                {/* Download PDF Ticket Button */}
                <div className="p-4 rounded-2xl bg-apple-bg/70 border border-apple-border/50 text-left space-y-3">
                  <div className="flex items-center space-x-2 text-apple-text">
                    <FileDown className="w-5 h-5 text-apple-blue shrink-0" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Comprobante de Compra Oficial
                    </span>
                  </div>
                  <p className="text-xs text-apple-secondary">
                    Descargá tu ticket en PDF con el detalle de items, totales en USD y ARS, fecha y políticas de garantía:
                  </p>
                  <AppleButton
                    type="button"
                    onClick={() => downloadReceiptPDF(completedOrder)}
                    variant="secondary"
                    className="w-full flex items-center justify-center space-x-2 text-xs py-2.5"
                  >
                    <FileDown className="w-4 h-4 text-apple-blue" />
                    <span>Descargar Ticket en PDF</span>
                  </AppleButton>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="text-xs text-apple-secondary hover:text-apple-text transition-colors"
                  >
                    Cerrar y seguir navegando
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Drawer Footer (Sticky Totals & Action) */}
          {cart.length > 0 && step !== 'success' && (
            <div className="p-5 sm:p-6 border-t border-apple-border/50 bg-[#FBFBFD] space-y-4">
              
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs text-apple-secondary">
                  <span>Subtotal en Dólares (USD):</span>
                  <span className="font-bold text-apple-text text-sm">{formatUSD(totalUSD)}</span>
                </div>

                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-sm font-semibold text-apple-text">Total en Pesos (ARS):</span>
                  <div className="text-right">
                    <span className="text-xl sm:text-2xl font-black text-apple-text tracking-tight">
                      {formatARS(totalARS)}
                    </span>
                    <span className="block text-[10px] text-apple-secondary">
                      Tasa oficial: 1 USD = {formatARS(exchangeRate)}
                    </span>
                  </div>
                </div>
              </div>

              {step === 'cart' && (
                <AppleButton
                  onClick={handleProceedToCheckout}
                  size="lg"
                  className="w-full flex items-center justify-center space-x-2 py-3.5"
                >
                  <span>Continuar al Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </AppleButton>
              )}

              {step === 'checkout' && (
                <AppleButton
                  type="submit"
                  form="checkout-drawer-form"
                  disabled={isSubmitting}
                  size="lg"
                  className="w-full flex items-center justify-center space-x-2 py-3.5 bg-emerald-600 hover:bg-emerald-700"
                >
                  <MessageCircle className="w-4 h-4 text-white" />
                  <span>
                    {isSubmitting ? 'Registrando Pedido...' : 'Confirmar y Enviar por WhatsApp'}
                  </span>
                </AppleButton>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
