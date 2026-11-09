import type { Order } from '../types/database';
import { formatUSD, formatARS } from './formatters';

const DEFAULT_STORE_PHONE = '5491155667788'; // Número de la tienda World Apple

export const generateWhatsAppOrderMessage = (order: Order): string => {
  const shortId = order.id.slice(0, 8).toUpperCase();
  const deliveryText =
    order.delivery_type === 'envio'
      ? `Envío a domicilio (${order.delivery_address || 'A convenir'})`
      : 'Retiro en Sucursal Central';

  const paymentText = order.payment_method
    ? order.payment_method.replace('_', ' ').toUpperCase()
    : 'A convenir';

  const itemsList = order.items
    .map((item) => {
      const variants = [item.selected_storage, item.selected_color].filter(Boolean).join(' • ');
      const variantInfo = variants ? ` (${variants})` : '';
      return `• *${item.quantity}x* ${item.name}${variantInfo} - ${formatUSD(item.subtotal_usd)}`;
    })
    .join('\n');

  const notesText = order.notes ? `\n📝 *Notas del cliente:* ${order.notes}` : '';

  return (
    `🍏 *¡NUEVO PEDIDO EN WORLD APPLE!*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🧾 *Orden:* #${shortId}\n` +
    `👤 *Cliente:* ${order.customer_name}\n` +
    `📱 *WhatsApp:* ${order.customer_phone}\n` +
    `📍 *Modalidad:* ${deliveryText}\n` +
    `💳 *Medio de Pago:* ${paymentText}\n\n` +
    `📦 *DETALLE DE LA COMPRA:*\n` +
    `${itemsList}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `💵 *Total Dólares:* ${formatUSD(order.total_usd)} USD\n` +
    `📈 *Tasa aplicada:* 1 USD = ${formatARS(order.exchange_rate_used)}\n` +
    `💰 *TOTAL EN PESOS:* ${formatARS(order.total_ars)}\n` +
    `━━━━━━━━━━━━━━━━━━━━${notesText}\n\n` +
    `_Hola World Apple, acabo de registrar este pedido desde la web. ¿Me confirman disponibilidad y los datos de pago para coordinar?_`
  );
};

export const getWhatsAppOrderUrl = (order: Order, phone: string = DEFAULT_STORE_PHONE): string => {
  const message = generateWhatsAppOrderMessage(order);
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};
