import { useAppStore } from '../store/useAppStore';
import type { Order, OrderStatus, PaymentMethod } from '../types/database';

export const ordersService = {
  async getAllOrders(): Promise<Order[]> {
    return useAppStore.getState().orders;
  },

  async createOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order> {
    return useAppStore.getState().createOrder(order);
  },

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    paymentMethod?: string
  ): Promise<Order | null> {
    const store = useAppStore.getState();
    if (status === 'aprobado_cobrado') {
      store.approveOrder(orderId, paymentMethod as PaymentMethod);
    } else if (status === 'cancelado') {
      store.cancelOrder(orderId);
    }

    const updated = useAppStore.getState().orders.find((o) => o.id === orderId);
    return updated || null;
  },

  async getOrderById(orderId: string): Promise<Order | null> {
    const order = useAppStore.getState().orders.find((o) => o.id === orderId);
    return order || null;
  },
};
