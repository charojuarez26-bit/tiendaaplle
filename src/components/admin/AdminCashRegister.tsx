import React, { useState } from 'react';
import type { PaymentMethod } from '../../types/database';
import { useAppStore } from '../../store/useAppStore';
import { formatUSD, formatARS, formatDate } from '../../lib/formatters';
import { downloadCashClosePDF } from '../../lib/pdfCashClose';
import { AppleButton } from '../ui/AppleButton';
import {
  ArrowDownLeft,
  ArrowUpRight,
  FileDown,
  TrendingDown,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  X,
} from 'lucide-react';

interface AdminCashRegisterProps {
  onRefreshData?: () => void;
}

export const AdminCashRegister: React.FC<AdminCashRegisterProps> = ({ onRefreshData }) => {
  const { cashMovements, addCashMovement, getCashBreakdown } = useAppStore();
  const breakdown = getCashBreakdown();

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showArqueoModal, setShowArqueoModal] = useState(false);

  // Expense form states
  const [expCategory, setExpCategory] = useState('gasto_proveedor');
  const [expDescription, setExpDescription] = useState('');
  const [expAmountArs, setExpAmountArs] = useState<number | ''>('');
  const [expAmountUsd, setExpAmountUsd] = useState<number | ''>('');
  const [expPaymentMethod, setExpPaymentMethod] = useState<PaymentMethod>('efectivo_ars');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Arqueo declaration states
  const [declaredUSD, setDeclaredUSD] = useState<number | ''>('');
  const [declaredARS, setDeclaredARS] = useState<number | ''>('');
  const [arqueoNotes, setArqueoNotes] = useState('');

  const expectedUSD = breakdown.methods.efectivo_usd.saldo_usd;
  const expectedARS = breakdown.methods.efectivo_ars.saldo_ars;

  const currentDeclaredUSD = declaredUSD === '' ? expectedUSD : Number(declaredUSD);
  const currentDeclaredARS = declaredARS === '' ? expectedARS : Number(declaredARS);

  const diffUSD = currentDeclaredUSD - expectedUSD;
  const diffARS = currentDeclaredARS - expectedARS;

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expDescription.trim()) return;

    try {
      setIsSubmitting(true);
      addCashMovement({
        type: 'egreso',
        category: expCategory,
        description: expDescription.trim(),
        amount_ars: Number(expAmountArs || 0),
        amount_usd: Number(expAmountUsd || 0),
        payment_method: expPaymentMethod,
      });

      setShowExpenseModal(false);
      setExpDescription('');
      setExpAmountArs('');
      setExpAmountUsd('');
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error(err);
      alert('Error al registrar egreso.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmArqueoAndDownload = () => {
    downloadCashClosePDF(breakdown, {
      declaredUSD: currentDeclaredUSD,
      declaredARS: currentDeclaredARS,
      notes: arqueoNotes.trim() || undefined,
    });
    setShowArqueoModal(false);
  };

  const methodLabels: Record<PaymentMethod, string> = {
    efectivo_ars: 'Efectivo en Pesos (ARS)',
    efectivo_usd: 'Efectivo en Dólares (USD)',
    transferencia: 'Transferencias Bancarias',
    debito: 'Tarjetas de Débito',
    credito: 'Tarjetas de Crédito',
  };

  return (
    <div className="space-y-6">
      
      {/* Top Actions & Daily Balance Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-apple-text">Control y Arqueo de Caja Diaria</h3>
          <p className="text-xs text-apple-secondary">
            Discriminación de movimientos en vivo por los 5 métodos de cobro oficiales
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <AppleButton
            type="button"
            variant="secondary"
            onClick={() => setShowExpenseModal(true)}
            size="sm"
            className="space-x-1.5 text-apple-red border-rose-200 hover:bg-rose-50"
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Registrar Gasto / Egreso</span>
          </AppleButton>

          <AppleButton
            type="button"
            onClick={() => {
              setDeclaredUSD(expectedUSD);
              setDeclaredARS(expectedARS);
              setShowArqueoModal(true);
            }}
            size="sm"
            className="space-x-1.5 bg-apple-text hover:bg-black text-white"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Arqueo y Cierre Diario (PDF)</span>
          </AppleButton>
        </div>
      </div>

      {/* 5 Payment Methods Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {(Object.keys(breakdown.methods) as PaymentMethod[]).map((methodKey) => {
          const data = breakdown.methods[methodKey];
          const isUSD = methodKey === 'efectivo_usd';
          return (
            <div
              key={methodKey}
              className="bg-white rounded-apple border border-apple-border/50 p-4 shadow-apple-sm flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] uppercase font-bold text-apple-secondary tracking-wider block truncate">
                  {methodLabels[methodKey]}
                </span>
                <div className="text-lg font-black text-apple-text mt-1">
                  {isUSD ? formatUSD(data.saldo_usd) : formatARS(data.saldo_ars)}
                </div>
                <span className="text-[10px] text-apple-tertiary">
                  {data.count} operaciones registradas
                </span>
              </div>

              <div className="mt-3 pt-2 border-t border-apple-border/30 text-[10px] space-y-0.5">
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Ingresos (+):</span>
                  <span>{isUSD ? formatUSD(data.ingresos_usd) : formatARS(data.ingresos_ars)}</span>
                </div>
                <div className="flex justify-between text-rose-600 font-medium">
                  <span>Egresos (-):</span>
                  <span>{isUSD ? formatUSD(data.egresos_usd) : formatARS(data.egresos_ars)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-apple border border-apple-border/50 overflow-hidden shadow-apple-sm">
        <div className="p-4 border-b border-apple-border/40 flex items-center justify-between">
          <h4 className="font-semibold text-apple-text text-xs uppercase tracking-wider">
            Movimientos Detallados del Libro de Caja
          </h4>
          <span className="text-xs text-apple-secondary font-medium">
            Total {cashMovements.length} asientos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FBFBFD] border-b border-apple-border/40 text-apple-secondary uppercase tracking-wider">
              <tr>
                <th className="p-3 font-medium">Fecha y Hora</th>
                <th className="p-3 font-medium">Tipo</th>
                <th className="p-3 font-medium">Categoría</th>
                <th className="p-3 font-medium">Descripción</th>
                <th className="p-3 font-medium">Medio de Pago</th>
                <th className="p-3 font-medium">Monto ARS</th>
                <th className="p-3 font-medium">Monto USD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-apple-border/30">
              {cashMovements.map((m) => (
                <tr key={m.id} className="hover:bg-apple-bg/40">
                  <td className="p-3 text-apple-secondary whitespace-nowrap">{formatDate(m.created_at)}</td>
                  
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center space-x-1 font-bold ${
                        m.type === 'ingreso' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {m.type === 'ingreso' ? (
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      )}
                      <span className="capitalize">{m.type}</span>
                    </span>
                  </td>

                  <td className="p-3 uppercase text-[10px] font-semibold text-apple-tertiary">
                    {m.category.replace('_', ' ')}
                  </td>

                  <td className="p-3 text-apple-text font-medium">{m.description}</td>

                  <td className="p-3 capitalize text-apple-secondary">
                    {m.payment_method?.replace('_', ' ') || 'Efectivo'}
                  </td>

                  <td className="p-3 font-semibold text-apple-text whitespace-nowrap">
                    {formatARS(m.amount_ars)}
                  </td>

                  <td className="p-3 font-bold text-apple-text whitespace-nowrap">
                    {formatUSD(m.amount_usd)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: REGISTRAR GASTO / EGRESO */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-apple-lg border border-apple-border max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-apple-border/40">
              <div className="flex items-center space-x-2 text-rose-600">
                <TrendingDown className="w-5 h-5" />
                <h3 className="text-base font-bold text-apple-text">Registrar Egreso / Gasto Diario</h3>
              </div>
              <button
                onClick={() => setShowExpenseModal(false)}
                className="text-apple-secondary hover:text-apple-text"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-apple-text mb-1">Categoría del Gasto</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-apple-border focus:border-apple-blue bg-white"
                >
                  <option value="gasto_proveedor">Pago a Proveedor de Mercadería</option>
                  <option value="flete_envio">Flete / Courier / Importación</option>
                  <option value="alquiler_servicios">Alquiler / Servicios de Local</option>
                  <option value="retiro_ganancia">Retiro de Ganancias / Utilidades</option>
                  <option value="viaticos_comida">Viáticos / Gastos Menores</option>
                  <option value="otros_egresos">Otros Egresos</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-apple-text mb-1">Descripción del Egreso *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Pago encomienda de fundas MagSafe"
                  value={expDescription}
                  onChange={(e) => setExpDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-apple-border focus:border-apple-blue"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-apple-text mb-1">Monto en Pesos (ARS)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={expAmountArs}
                    onChange={(e) => setExpAmountArs(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 rounded-xl border border-apple-border focus:border-apple-blue font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-medium text-apple-text mb-1">Monto en Dólares (USD)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0.00"
                    value={expAmountUsd}
                    onChange={(e) => setExpAmountUsd(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 rounded-xl border border-apple-border focus:border-apple-blue font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-apple-text mb-1">Medio de Pago Utilizado</label>
                <select
                  value={expPaymentMethod}
                  onChange={(e) => setExpPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 rounded-xl border border-apple-border focus:border-apple-blue bg-white"
                >
                  <option value="efectivo_ars">Efectivo ARS (Caja física)</option>
                  <option value="efectivo_usd">Efectivo USD (Caja física)</option>
                  <option value="transferencia">Transferencia Bancaria</option>
                  <option value="debito">Tarjeta de Débito</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-apple-border/40">
                <AppleButton type="button" variant="secondary" onClick={() => setShowExpenseModal(false)}>
                  Cancelar
                </AppleButton>
                <AppleButton type="submit" disabled={isSubmitting} variant="danger">
                  {isSubmitting ? 'Registrando...' : 'Registrar Egreso'}
                </AppleButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ARQUEO DE CAJA DIARIO (SISTEMA VS. CONTADO REAL) */}
      {showArqueoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-apple-lg border border-apple-border max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-apple-border/40">
              <div className="flex items-center space-x-2 text-apple-text">
                <Calculator className="w-5 h-5 text-apple-blue" />
                <h3 className="text-base font-bold">Arqueo y Cierre Diario de Caja</h3>
              </div>
              <button
                onClick={() => setShowArqueoModal(false)}
                className="text-apple-secondary hover:text-apple-text"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-apple-secondary">
              Ingresa el dinero físico real recontado en el cajón de mostrador para cotejar contra el saldo teórico del sistema.
            </p>

            {/* Comparativa Efectivo USD */}
            <div className="bg-apple-bg rounded-2xl p-4 border border-apple-border/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-apple-text">Efectivo en Dólares (USD)</span>
                <span className="text-xs text-apple-secondary font-medium">
                  Esperado: <strong className="text-apple-text">{formatUSD(expectedUSD)}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-[11px] text-apple-secondary mb-1">Monto Real Contado:</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={declaredUSD}
                    onChange={(e) => setDeclaredUSD(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-apple-border bg-white text-xs font-bold text-apple-text focus:outline-none focus:border-apple-blue"
                  />
                </div>

                <div className="pt-4">
                  {diffUSD === 0 ? (
                    <span className="inline-flex items-center space-x-1 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Cuadrado ($0)</span>
                    </span>
                  ) : diffUSD > 0 ? (
                    <span className="inline-flex items-center space-x-1 text-xs text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Sobrante: +{formatUSD(diffUSD)}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 text-xs text-rose-600 font-semibold bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Faltante: {formatUSD(diffUSD)}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Comparativa Efectivo ARS */}
            <div className="bg-apple-bg rounded-2xl p-4 border border-apple-border/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-apple-text">Efectivo en Pesos (ARS)</span>
                <span className="text-xs text-apple-secondary font-medium">
                  Esperado: <strong className="text-apple-text">{formatARS(expectedARS)}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-[11px] text-apple-secondary mb-1">Monto Real Contado:</label>
                  <input
                    type="number"
                    step="100"
                    min="0"
                    value={declaredARS}
                    onChange={(e) => setDeclaredARS(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-apple-border bg-white text-xs font-bold text-apple-text focus:outline-none focus:border-apple-blue"
                  />
                </div>

                <div className="pt-4">
                  {diffARS === 0 ? (
                    <span className="inline-flex items-center space-x-1 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Cuadrado ($0)</span>
                    </span>
                  ) : diffARS > 0 ? (
                    <span className="inline-flex items-center space-x-1 text-xs text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Sobrante: +{formatARS(diffARS)}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 text-xs text-rose-600 font-semibold bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Faltante: {formatARS(diffARS)}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-xs font-medium text-apple-text mb-1">Observaciones de Auditoría (Opcional):</label>
              <textarea
                rows={2}
                placeholder="Ej. Cierre de turno verificado por el encargado del showroom."
                value={arqueoNotes}
                onChange={(e) => setArqueoNotes(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-apple-border focus:border-apple-blue focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-apple-border/40">
              <AppleButton type="button" variant="secondary" onClick={() => setShowArqueoModal(false)}>
                Cancelar
              </AppleButton>
              <AppleButton
                type="button"
                onClick={handleConfirmArqueoAndDownload}
                className="space-x-1.5 bg-apple-blue text-white hover:bg-apple-blue-hover"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Confirmar y Descargar Reporte PDF</span>
              </AppleButton>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
