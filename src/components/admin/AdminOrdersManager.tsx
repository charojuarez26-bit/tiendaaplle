import React, { useState } from 'react';
import type { Order } from '../../types/database';
import { ordersService } from '../../services/ordersService';
import { productsService } from '../../services/productsService';
import { cashRegisterService } from '../../services/cashRegisterService';
import { formatUSD, formatARS, formatDate } from '../../lib/formatters';
import { downloadReceiptPDF } from '../../lib/pdfGenerator';
import { Badge } from '../ui/Badge';
import {
  FileDown,
  CheckCircle,
  XCircle,
  Truck,
  Store,
  MessageCircle,
} from 'lucide-react';
import { getWhatsAppOrderUrl } from '../../lib/whatsapp';

interface AdminOrdersManagerProps {
  orders: Order[];
  onRefresh: () => void;
}

export const AdminOrdersManager: React.FC<AdminOrdersManagerProps> = ({ orders, onRefresh }) => {
  const [filter, setFilter] = useState<'todas' | 'pendiente' | 'aprobado_cobrado' | 'cancelado'>('todas');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const filteredOrders = orders.filter((o) => {
    if (filter === 'todas') return true;
    return o.status === filter;
  });

  const handleApproveOrder = async (order: Order) => {
    if (
      !confirm(
        `¿Confirmar cobro y aprobación de la Orden #${order.id.slice(0, 8)} de ${order.customer_name}?\n\n• Descontará el stock de cada producto.\n• Registrará el ingreso en el Libro de Caja.\n• Generará el ticket oficial en PDF.`
      )
    ) {
      return;
    }

    try {
      setProcessingId(order.id);

      // 1. Descontar stock automáticamente de cada producto
      for (const item of order.items) {
        if (item.product_id) {
          await productsService.discountStock(item.product_id, item.quantity);
        }
      }

      // 2. Registrar ingreso en caja
      await cashRegisterService.addMovement({
        type: 'ingreso',
        category: 'venta_web',
        description: `Cobro Orden Web #${order.id.slice(0, 8).toUpperCase()} - ${order.customer_name}`,
        amount_ars: order.total_ars,
        amount_usd: order.total_usd,
        payment_method: (order.payment_method as any) || 'transferencia',
        order_id: order.id,
      });

      // 3. Actualizar estado de orden
      const updated = await ordersService.updateOrderStatus(order.id, 'aprobado_cobrado');

      // 4. Descargar PDF automáticamente
      if (updated) {
        downloadReceiptPDF(updated);
      }

      onRefresh();
    } catch (err) {
      console.error('Error al aprobar orden:', err);
      alert('Hubo un error al procesar la orden.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (confirm('¿Seguro que deseas cancelar este pedido?')) {
      await ordersService.updateOrderStatus(orderId, 'cancelado');
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-1.5 overflow-x-auto bg-white p-1 rounded-full border border-apple-border/50 shadow-2xs">
          {[
            { id: 'todas', label: `Todas (${orders.length})` },
            {
              id: 'pendiente',
              label: `Pendientes (${orders.filter((o) => o.status === 'pendiente').length})`,
              badge: 'orange',
            },
            {
              id: 'aprobado_cobrado',
              label: `Aprobadas / Cobradas (${orders.filter((o) => o.status === 'aprobado_cobrado').length})`,
              badge: 'green',
            },
            {
              id: 'cancelado',
              label: `Canceladas (${orders.filter((o) => o.status === 'cancelado').length})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                filter === tab.id
                  ? 'bg-apple-text text-white shadow-xs'
                  : 'text-apple-secondary hover:text-apple-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-apple-secondary">
          Mostrando <strong className="text-apple-text">{filteredOrders.length}</strong> órdenes
        </div>
      </div>

      {/* Mobile Card List (block md:hidden) */}
      <div className="md:hidden space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-apple-border/50 p-8 text-center text-xs text-apple-secondary">
            No se encontraron órdenes con este filtro.
          </div>
        ) : (
          filteredOrders.map((ord) => {
            const isProcessing = processingId === ord.id;
            return (
              <div
                key={ord.id}
                className="bg-white rounded-2xl border border-apple-border/60 p-4 shadow-sm space-y-3"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-apple-border/30">
                  <div>
                    <span className="font-mono font-bold text-apple-text text-sm">
                      #{ord.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span className="text-[10px] text-apple-secondary block">
                      {formatDate(ord.created_at)}
                    </span>
                  </div>
                  <Badge
                    variant={
                      ord.status === 'aprobado_cobrado'
                        ? 'green'
                        : ord.status === 'pendiente'
                        ? 'orange'
                        : 'red'
                    }
                  >
                    {ord.status === 'aprobado_cobrado'
                      ? 'Aprobado'
                      : ord.status === 'pendiente'
                      ? 'Pendiente'
                      : 'Cancelado'}
                  </Badge>
                </div>

                {/* Customer */}
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-apple-text block">{ord.customer_name}</span>
                    <span className="text-[11px] text-apple-secondary">{ord.customer_phone}</span>
                  </div>
                  <a
                    href={getWhatsAppOrderUrl(ord)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center space-x-1 text-xs font-medium"
                    title="Chatear en WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-[11px]">Chat</span>
                  </a>
                </div>

                {/* Delivery */}
                <div className="text-[11px] text-apple-secondary flex items-center space-x-1.5">
                  {ord.delivery_type === 'envio' ? (
                    <Truck className="w-3.5 h-3.5 text-apple-blue shrink-0" />
                  ) : (
                    <Store className="w-3.5 h-3.5 text-apple-secondary shrink-0" />
                  )}
                  <span className="capitalize font-medium text-apple-text">{ord.delivery_type}</span>
                  {ord.delivery_address && <span className="truncate">• {ord.delivery_address}</span>}
                </div>

                {/* Items */}
                <div className="bg-apple-bg/50 rounded-xl p-2.5 space-y-1 text-xs">
                  {ord.items?.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-[11px]">
                      <span className="truncate pr-2">
                        <strong className="text-apple-text">{it.quantity}x</strong> {it.name}
                        {(it.selected_storage || it.selected_color) && (
                          <span className="text-apple-secondary"> ({it.selected_storage})</span>
                        )}
                      </span>
                      <span className="font-semibold text-apple-text shrink-0">{formatUSD(it.subtotal_usd)}</span>
                    </div>
                  ))}
                  <div className="pt-1.5 border-t border-apple-border/30 flex justify-between font-bold text-xs">
                    <span>Total:</span>
                    <span className="text-apple-blue">{formatUSD(ord.total_usd)} • {formatARS(ord.total_ars)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  {ord.status === 'pendiente' && (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleApproveOrder(ord)}
                      className="flex-1 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center space-x-1 active:scale-95 transition-all shadow-xs"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{isProcessing ? 'Procesando...' : 'Aprobar y Cobrar'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => downloadReceiptPDF(ord)}
                    className="py-2 px-3 rounded-full bg-apple-bg hover:bg-[#E8E8ED] text-apple-text text-xs font-medium border border-apple-border/60 flex items-center space-x-1"
                    title="Descargar Comprobante PDF"
                  >
                    <FileDown className="w-3.5 h-3.5 text-apple-blue" />
                    <span>PDF</span>
                  </button>

                  {ord.status === 'pendiente' && (
                    <button
                      type="button"
                      onClick={() => handleCancelOrder(ord.id)}
                      className="p-2 rounded-full text-rose-600 hover:bg-rose-50 border border-rose-200"
                      title="Cancelar orden"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Orders Table */}
      <div className="hidden md:block bg-white rounded-apple border border-apple-border/50 overflow-hidden shadow-apple-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FBFBFD] border-b border-apple-border/40 text-apple-secondary uppercase tracking-wider">
              <tr>
                <th className="p-3.5 font-medium">Orden & Fecha</th>
                <th className="p-3.5 font-medium">Cliente & WhatsApp</th>
                <th className="p-3.5 font-medium">Entrega & Pago</th>
                <th className="p-3.5 font-medium">Productos</th>
                <th className="p-3.5 font-medium">Totales</th>
                <th className="p-3.5 font-medium">Estado</th>
                <th className="p-3.5 font-medium text-right">Acciones de Cobro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-apple-border/30">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-apple-secondary">
                    No se encontraron órdenes con este filtro.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const isProcessing = processingId === ord.id;
                  return (
                    <tr key={ord.id} className="hover:bg-apple-bg/40">
                      
                      {/* ID and Date */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="font-mono font-bold text-apple-text block">
                          #{ord.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className="text-[11px] text-apple-secondary block mt-0.5">
                          {formatDate(ord.created_at)}
                        </span>
                      </td>

                      {/* Customer Info */}
                      <td className="p-3.5">
                        <div className="font-semibold text-apple-text">{ord.customer_name}</div>
                        <div className="text-[11px] text-apple-secondary flex items-center space-x-1 mt-0.5">
                          <span>{ord.customer_phone}</span>
                          <a
                            href={getWhatsAppOrderUrl(ord)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-700"
                            title="Abrir chat en WhatsApp"
                          >
                            <MessageCircle className="w-3 h-3" />
                          </a>
                        </div>
                      </td>

                      {/* Delivery & Payment */}
                      <td className="p-3.5">
                        <div className="flex items-center space-x-1.5 font-medium text-apple-text capitalize">
                          {ord.delivery_type === 'envio' ? (
                            <Truck className="w-3.5 h-3.5 text-apple-blue" />
                          ) : (
                            <Store className="w-3.5 h-3.5 text-apple-secondary" />
                          )}
                          <span>{ord.delivery_type}</span>
                        </div>
                        {ord.delivery_address && (
                          <div className="text-[11px] text-apple-secondary max-w-[180px] truncate" title={ord.delivery_address}>
                            {ord.delivery_address}
                          </div>
                        )}
                        <div className="text-[10px] text-apple-tertiary uppercase mt-1">
                          Pago: {ord.payment_method?.replace('_', ' ') || 'A convenir'}
                        </div>
                      </td>

                      {/* Items */}
                      <td className="p-3.5">
                        <div className="space-y-1">
                          {ord.items?.map((it, idx) => (
                            <div key={idx} className="text-apple-text text-[11px]">
                              <span className="font-semibold">{it.quantity}x</span> {it.name}
                              {(it.selected_storage || it.selected_color) && (
                                <span className="text-apple-secondary ml-1">
                                  ({it.selected_storage} {it.selected_color})
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Totals */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-bold text-apple-text text-sm">{formatUSD(ord.total_usd)}</div>
                        <div className="text-[11px] text-apple-secondary font-medium">{formatARS(ord.total_ars)}</div>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <Badge
                          variant={
                            ord.status === 'aprobado_cobrado'
                              ? 'green'
                              : ord.status === 'pendiente'
                              ? 'orange'
                              : 'red'
                          }
                        >
                          {ord.status === 'aprobado_cobrado'
                            ? 'Aprobado / Cobrado'
                            : ord.status === 'pendiente'
                            ? 'Pendiente'
                            : 'Cancelado'}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          {ord.status === 'pendiente' && (
                            <>
                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() => handleApproveOrder(ord)}
                                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-full shadow-2xs transition-all flex items-center space-x-1"
                                title="Aprobar pedido, descontar stock, asentar en caja y descargar ticket PDF"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>{isProcessing ? 'Procesando...' : 'Aprobar / Cobrado'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleCancelOrder(ord.id)}
                                className="text-xs text-rose-600 hover:bg-rose-50 p-1.5 rounded-full border border-rose-200 transition-colors"
                                title="Cancelar orden"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          {/* PDF Receipt Button */}
                          <button
                            type="button"
                            onClick={() => downloadReceiptPDF(ord)}
                            className="text-xs bg-apple-bg hover:bg-[#E8E8ED] text-apple-text px-2.5 py-1.5 rounded-full border border-apple-border/60 flex items-center space-x-1 font-medium"
                            title="Descargar Comprobante Oficial en PDF"
                          >
                            <FileDown className="w-3.5 h-3.5 text-apple-blue" />
                            <span>PDF</span>
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
