import { useAppStore } from '../store/useAppStore';
import type { ExchangeRate } from '../types/database';

export const exchangeRateService = {
  async getExchangeRate(): Promise<ExchangeRate> {
    const state = useAppStore.getState();
    return {
      id: 'rate-usd-ars-current',
      currency: 'USD_ARS',
      rate: state.exchangeRate,
      updated_at: state.rateLastUpdated || new Date().toISOString(),
    };
  },

  async updateExchangeRate(newRate: number): Promise<ExchangeRate> {
    const store = useAppStore.getState();
    store.setExchangeRate(newRate);
    return {
      id: 'rate-usd-ars-current',
      currency: 'USD_ARS',
      rate: newRate,
      updated_at: new Date().toISOString(),
    };
  },

  async syncLiveRate(): Promise<number> {
    return await useAppStore.getState().fetchExchangeRate();
  },
};
