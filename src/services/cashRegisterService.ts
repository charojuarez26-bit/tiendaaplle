import { useAppStore } from '../store/useAppStore';
import type { CashRegisterMovement, PaymentMethod } from '../types/database';

export interface PaymentMethodSummary {
  ingresos_ars: number;
  egresos_ars: number;
  saldo_ars: number;
  ingresos_usd: number;
  egresos_usd: number;
  saldo_usd: number;
  count: number;
}

export interface CashRegisterBreakdown {
  methods: Record<PaymentMethod, PaymentMethodSummary>;
  total_ars: number;
  total_usd: number;
  total_ingresos_ars: number;
  total_egresos_ars: number;
  total_ingresos_usd: number;
  total_egresos_usd: number;
}

export const cashRegisterService = {
  async getMovements(): Promise<CashRegisterMovement[]> {
    return useAppStore.getState().cashMovements;
  },

  async addMovement(
    movement: Omit<CashRegisterMovement, 'id' | 'created_at'>
  ): Promise<CashRegisterMovement> {
    return useAppStore.getState().addCashMovement(movement);
  },

  async getBalances(): Promise<{ total_ars: number; total_usd: number }> {
    const breakdown = useAppStore.getState().getCashBreakdown();
    return {
      total_ars: breakdown.total_ars,
      total_usd: breakdown.total_usd,
    };
  },

  async getBreakdown(): Promise<CashRegisterBreakdown> {
    return useAppStore.getState().getCashBreakdown();
  },
};
