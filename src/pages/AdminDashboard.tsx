import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { formatUSD, formatARS, formatDate } from '../lib/formatters';
import { AppleButton } from '../components/ui/AppleButton';
import { Badge } from '../components/ui/Badge';
import { AdminLogin } from '../components/admin/AdminLogin';
import { AdminInventory } from '../components/admin/AdminInventory';
import { AdminOrdersManager } from '../components/admin/AdminOrdersManager';
import { AdminPOS } from '../components/admin/AdminPOS';
import { AdminCashRegister } from '../components/admin/AdminCashRegister';
import {
  DollarSign,
  Package,
  ShoppingBag,
  RefreshCw,
  Wallet,
  Sliders,
  LogOut,
  Store,
  ArrowRight,
  RotateCcw,
  Store as StoreIcon,
} from 'lucide-react';

interface AdminDashboardProps {
  onBackToStore?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToStore }) => {
  const {
    isAdminAuthenticated,
    loginAdmin,
    logoutAdmin,
    products,
    orders,
    tradeIns,
    updateTradeIn,
    exchangeRate,
    setExchangeRate,
    getCashBreakdown,
    resetToDefaultData,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'resumen' | 'pos' | 'productos' | 'pedidos' | 'caja' | 'canjes'>('resumen');
  const [newRateInput, setNewRateInput] = useState<string>(String(exchangeRate));
  const [rateUpdatedSuccess, setRateUpdatedSuccess] = useState(false);

  const breakdown = getCashBreakdown();

  const handleUpdateRate = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newRateInput);
    if (!isNaN(val) && val > 0) {
      setExchangeRate(val);
      setRateUpdatedSuccess(true);
      setTimeout(() => setRateUpdatedSuccess(false), 2000);
    }
  };

  const handleUpdateTradeStatus = (
    tradeId: string,
    status: 'cotizado' | 'rechazado',
    offeredVal?: number
  ) => {
    updateTradeIn(tradeId, status, offeredVal ?? null);
  };

  const handleResetDemoData = () => {
    if (
      window.confirm(
        '¿Restablecer datos de fábrica / Demo?\n\nEsto reestablecerá el inventario completo, pedidos de prueba, movimientos de caja y solicitudes de Plan Canje a sus valores iniciales.'
      )
    ) {
      resetToDefaultData();
      setNewRateInput('1350');
      alert('¡Datos restablecidos a los valores predeterminados de fábrica!');
    }
  };

  // If not logged in with '2020', show the Apple Passcode Login screen
  if (!isAdminAuthenticated) {
    return (
      <AdminLogin
        onSuccess={() => loginAdmin('2020')}
        onCancel={() => onBackToStore && onBackToStore()}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-apple-border/50">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-bold text-apple-blue tracking-wider">
              World Apple Backoffice
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
              ● Sesión Protegida (PIN 2020)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-apple-text tracking-tight mt-0.5">
            Panel de Administración & POS
          </h1>
        </div>

        {/* Live Cotización, Reset & Logout */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Back to Store */}
          {onBackToStore && (
            <button
              type="button"
              onClick={onBackToStore}
              className="text-xs flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-apple-bg hover:bg-apple-border/50 text-apple-text font-medium border border-apple-border transition-colors"
              title="Volver a la tienda pública"
            >
              <StoreIcon className="w-3.5 h-3.5" />
              <span>Ver Tienda</span>
            </button>
          )}

          {/* Rate Setter */}
          <form
            onSubmit={handleUpdateRate}
            className="flex items-center space-x-1.5 bg-white p-1 rounded-2xl border border-apple-border/60 shadow-sm"
          >
            <div className="flex items-center space-x-1 px-1.5 text-xs text-apple-secondary">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Dólar:</span>
            </div>
            <input
              type="number"
              step="1"
              value={newRateInput}
              onChange={(e) => setNewRateInput(e.target.value)}
              className="w-16 sm:w-20 text-xs font-bold px-1.5 py-1 bg-apple-bg rounded-lg border border-apple-border text-apple-text text-center focus:outline-none focus:border-apple-blue"
            />
            <AppleButton type="submit" size="sm" variant={rateUpdatedSuccess ? 'secondary' : 'primary'}>
              {rateUpdatedSuccess ? '¡Listo!' : 'Fijar'}
            </AppleButton>
          </form>

          {/* Reset Demo Data Button */}
          <button
            type="button"
            onClick={handleResetDemoData}
            className="text-xs flex items-center space-x-1 px-2.5 py-1.5 rounded-full text-apple-secondary hover:text-amber-800 hover:bg-amber-50 border border-apple-border/60 transition-colors"
            title="Restablecer datos iniciales de fábrica para pruebas"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>

          {/* Logout */}
          <button
            type="button"
            onClick={logoutAdmin}
            className="p-2 rounded-xl text-apple-secondary hover:text-apple-red hover:bg-rose-50 border border-apple-border/60 transition-colors"
            title="Cerrar Sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto py-2 border-b border-apple-border/30 scrollbar-none">
        {[
          { id: 'resumen', label: 'Resumen', icon: Sliders },
          { id: 'pos', label: 'POS Mostrador', icon: Store, highlight: true },
          { id: 'productos', label: `Inventario (${products.length})`, icon: Package },
          {
            id: 'pedidos',
            label: `Órdenes Web (${orders.filter((o) => o.status === 'pendiente').length} pend.)`,
            icon: ShoppingBag,
          },
          { id: 'caja', label: 'Caja y Arqueo', icon: Wallet },
          { id: 'canjes', label: `Plan Canje (${tradeIns.length})`, icon: RefreshCw },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-apple-text text-white shadow-xs'
                  : tab.highlight
                  ? 'bg-apple-blue/10 text-apple-blue hover:bg-apple-blue/20'
                  : 'bg-white text-apple-secondary hover:text-apple-text border border-apple-border/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: RESUMEN GENERAL */}
      {activeTab === 'resumen' && (
        <div className="space-y-8 pt-2">
          {/* Top Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-apple border border-apple-border/50 p-5 shadow-apple-sm">
              <span className="text-xs font-semibold text-apple-secondary uppercase tracking-wider">
                Total en Caja (ARS)
              </span>
              <div className="text-2xl font-black text-apple-text mt-2">{formatARS(breakdown.total_ars)}</div>
              <span className="text-[11px] text-emerald-600 font-medium">Balance activo en pesos</span>
            </div>

            <div className="bg-white rounded-apple border border-apple-border/50 p-5 shadow-apple-sm">
              <span className="text-xs font-semibold text-apple-secondary uppercase tracking-wider">
                Total en Caja (USD)
              </span>
              <div className="text-2xl font-black text-apple-text mt-2">{formatUSD(breakdown.total_usd)}</div>
              <span className="text-[11px] text-emerald-600 font-medium">Dólares físicos en tesorería</span>
            </div>

            <div className="bg-white rounded-apple border border-apple-border/50 p-5 shadow-apple-sm">
              <span className="text-xs font-semibold text-apple-secondary uppercase tracking-wider">
                Órdenes Web Pendientes
              </span>
              <div className="text-2xl font-black text-amber-600 mt-2">
                {orders.filter((o) => o.status === 'pendiente').length}
              </div>
              <span className="text-[11px] text-amber-700 font-medium">Esperando aprobación y cobro</span>
            </div>

            <div className="bg-white rounded-apple border border-apple-border/50 p-5 shadow-apple-sm">
              <span className="text-xs font-semibold text-apple-secondary uppercase tracking-wider">
                Solicitudes de Canje
              </span>
              <div className="text-2xl font-black text-apple-blue mt-2">
                {tradeIns.filter((t) => t.status === 'pendiente_revision').length}
              </div>
              <span className="text-[11px] text-apple-blue font-medium">Aguardando cotización de tasador</span>
            </div>
          </div>

          {/* Quick Access POS Hero Card */}
          <div className="bg-gradient-to-r from-apple-text to-[#2c2c2e] text-white rounded-apple-lg p-6 sm:p-8 shadow-apple-card flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-emerald-400">
                <Store className="w-3.5 h-3.5" />
                <span>Punto de Venta para Atención al Público</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Ventas Rápidas en Mostrador con Pagos Mixtos</h2>
              <p className="text-xs text-white/70 max-w-xl">
                Cobra compras presenciales distribuyendo pagos combinados entre efectivo en dólares, pesos, transferencias o tarjetas, descontando stock automáticamente.
              </p>
            </div>

            <AppleButton
              type="button"
              onClick={() => setActiveTab('pos')}
              size="lg"
              className="bg-apple-blue text-white hover:bg-apple-blue/90 shrink-0 space-x-2"
            >
              <span>Abrir POS Mostrador</span>
              <ArrowRight className="w-4 h-4" />
            </AppleButton>
          </div>

          {/* Breakdown Preview */}
          <div className="bg-white rounded-apple border border-apple-border/50 p-6 shadow-apple-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-apple-text text-sm">Resumen por Vía de Pago</h3>
              <button onClick={() => setActiveTab('caja')} className="text-xs text-apple-blue hover:underline">
                Ver detalle de caja →
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-apple-bg/50 border border-apple-border/40">
                <span className="text-[10px] text-apple-secondary font-bold block">EFECTIVO ARS</span>
                <span className="font-bold text-apple-text text-sm mt-0.5 block">
                  {formatARS(breakdown.methods.efectivo_ars.saldo_ars)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-apple-bg/50 border border-apple-border/40">
                <span className="text-[10px] text-apple-secondary font-bold block">EFECTIVO USD</span>
                <span className="font-bold text-apple-text text-sm mt-0.5 block">
                  {formatUSD(breakdown.methods.efectivo_usd.saldo_usd)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-apple-bg/50 border border-apple-border/40">
                <span className="text-[10px] text-apple-secondary font-bold block">TRANSFERENCIA</span>
                <span className="font-bold text-apple-text text-sm mt-0.5 block">
                  {formatARS(breakdown.methods.transferencia.saldo_ars)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-apple-bg/50 border border-apple-border/40">
                <span className="text-[10px] text-apple-secondary font-bold block">DÉBITO</span>
                <span className="font-bold text-apple-text text-sm mt-0.5 block">
                  {formatARS(breakdown.methods.debito.saldo_ars)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-apple-bg/50 border border-apple-border/40">
                <span className="text-[10px] text-apple-secondary font-bold block">CRÉDITO</span>
                <span className="font-bold text-apple-text text-sm mt-0.5 block">
                  {formatARS(breakdown.methods.credito.saldo_ars)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PUNTO DE VENTA (POS MOSTRADOR) */}
      {activeTab === 'pos' && (
        <AdminPOS products={products} exchangeRate={exchangeRate} onRefreshData={() => {}} />
      )}

      {/* TAB 3: INVENTARIO (CRUD) */}
      {activeTab === 'productos' && (
        <AdminInventory products={products} onRefresh={() => {}} />
      )}

      {/* TAB 4: GESTIÓN DE ÓRDENES WEB */}
      {activeTab === 'pedidos' && (
        <AdminOrdersManager orders={orders} onRefresh={() => {}} />
      )}

      {/* TAB 5: CONTROL DE CAJA Y ARQUEO */}
      {activeTab === 'caja' && (
        <AdminCashRegister onRefreshData={() => {}} />
      )}

      {/* TAB 6: PLAN CANJE */}
      {activeTab === 'canjes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-apple-text text-base">Solicitudes Recibidas de Plan Canje</h3>
            <span className="text-xs text-apple-secondary">{tradeIns.length} registradas</span>
          </div>

          <div className="bg-white rounded-apple border border-apple-border/50 overflow-hidden shadow-apple-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FBFBFD] border-b border-apple-border/40 text-apple-secondary uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5 font-medium">Fecha</th>
                    <th className="p-3.5 font-medium">Cliente & Contacto</th>
                    <th className="p-3.5 font-medium">Dispositivo</th>
                    <th className="p-3.5 font-medium">Batería & Caja</th>
                    <th className="p-3.5 font-medium">Estado Físico Reportado</th>
                    <th className="p-3.5 font-medium">Cotización USD</th>
                    <th className="p-3.5 font-medium">Estado</th>
                    <th className="p-3.5 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-apple-border/30">
                  {tradeIns.map((t) => (
                    <tr key={t.id} className="hover:bg-apple-bg/40">
                      <td className="p-3.5 text-apple-secondary whitespace-nowrap">{formatDate(t.created_at)}</td>
                      <td className="p-3.5">
                        <div className="font-semibold text-apple-text">{t.customer_name}</div>
                        <div className="text-[11px] text-apple-secondary">{t.customer_phone}</div>
                      </td>
                      <td className="p-3.5 font-semibold text-apple-text">{t.device_model}</td>
                      <td className="p-3.5 text-apple-tertiary">
                        <div>{t.battery_health ? `${t.battery_health}% batería` : 'Sin dato'}</div>
                        <div className="text-[11px]">{t.has_box ? 'Con caja original' : 'Sin caja'}</div>
                      </td>
                      <td className="p-3.5 text-apple-secondary max-w-xs">{t.condition}</td>
                      <td className="p-3.5 font-bold text-apple-text">
                        {t.offered_value_usd ? formatUSD(t.offered_value_usd) : '—'}
                      </td>
                      <td className="p-3.5">
                        <Badge
                          variant={
                            t.status === 'cotizado'
                              ? 'green'
                              : t.status === 'pendiente_revision'
                              ? 'orange'
                              : 'red'
                          }
                        >
                          {t.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        {t.status === 'pendiente_revision' && (
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                const val = prompt('Ingresa el monto formal cotizado en USD para el cliente:');
                                if (val) handleUpdateTradeStatus(t.id, 'cotizado', parseFloat(val));
                              }}
                              className="text-xs bg-apple-blue/10 hover:bg-apple-blue/20 text-apple-blue px-2.5 py-1 rounded-full border border-apple-blue/30 font-medium"
                            >
                              Cotizar USD
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateTradeStatus(t.id, 'rechazado')}
                              className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full border border-rose-200"
                            >
                              Rechazar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
