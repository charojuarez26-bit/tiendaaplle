import { useAppStore } from '../store/useAppStore';
import type { TradeIn, TradeInStatus } from '../types/database';

export const tradeInService = {
  async getTradeIns(): Promise<TradeIn[]> {
    return useAppStore.getState().tradeIns;
  },

  async createTradeIn(
    tradeIn: Omit<TradeIn, 'id' | 'created_at' | 'updated_at' | 'status' | 'offered_value_usd' | 'admin_notes'>
  ): Promise<TradeIn> {
    return useAppStore.getState().createTradeIn(tradeIn);
  },

  async updateTradeInStatus(
    id: string,
    status: TradeInStatus,
    offeredValueUsd?: number,
    adminNotes?: string
  ): Promise<TradeIn | null> {
    useAppStore.getState().updateTradeIn(id, status, offeredValueUsd, adminNotes);
    const updated = useAppStore.getState().tradeIns.find((t) => t.id === id);
    return updated || null;
  },
};
