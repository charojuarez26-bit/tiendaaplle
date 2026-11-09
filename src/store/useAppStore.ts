import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Product,
  OrderItem,
  Order,
  OrderStatus,
  CashRegisterMovement,
  TradeIn,
  TradeInStatus,
  PaymentMethod,
} from '../types/database';
import {
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_CASH_MOVEMENTS,
  INITIAL_TRADE_INS,
} from '../data/initialData';
import type { CashRegisterBreakdown, PaymentMethodSummary } from '../services/cashRegisterService';

export interface AppState {
  // --- EXCHANGE RATE ---
  exchangeRate: number;
  isFetchingRate: boolean;
  rateLastUpdated: string | null;
  fetchExchangeRate: () => Promise<number>;
  setExchangeRate: (rate: number) => void;

  // --- PRODUCTS / INVENTORY ---
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  discountStock: (productId: string, qty: number) => void;

  // --- CART ---
  cart: OrderItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (
    product: Product,
    selectedColor?: string | null,
    selectedStorage?: string | null,
    priceAdjustment?: number
  ) => void;
  updateCartQty: (index: number, newQty: number) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  getCartTotals: () => { totalUSD: number; totalARS: number };

  // --- ORDERS ---
  orders: Order[];
  createOrder: (
    orderData: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'status'>
  ) => Order;
  approveOrder: (orderId: string, paymentMethod?: PaymentMethod) => void;
  cancelOrder: (orderId: string) => void;

  // --- CASH REGISTER ---
  cashMovements: CashRegisterMovement[];
  addCashMovement: (
    movement: Omit<CashRegisterMovement, 'id' | 'created_at'>
  ) => CashRegisterMovement;
  getCashBreakdown: () => CashRegisterBreakdown;

  // --- TRADE IN (PLAN CANJE) ---
  tradeIns: TradeIn[];
  createTradeIn: (
    data: Omit<TradeIn, 'id' | 'created_at' | 'updated_at' | 'status'>
  ) => TradeIn;
  updateTradeIn: (
    id: string,
    status: TradeInStatus,
    offeredValueUsd?: number | null,
    adminNotes?: string | null
  ) => void;

  // --- ADMIN AUTH ---
  isAdminAuthenticated: boolean;
  loginAdmin: (pin: string) => boolean;
  logoutAdmin: () => void;

  // --- DEMO RESET ---
  resetToDefaultData: () => void;
}

const DEFAULT_EXCHANGE_RATE = 1350;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // --- EXCHANGE RATE ---
      exchangeRate: DEFAULT_EXCHANGE_RATE,
      isFetchingRate: false,
      rateLastUpdated: null,

      fetchExchangeRate: async () => {
        set({ isFetchingRate: true });
        try {
          // Fetch Dólar Blue from DolarAPI
          const res = await fetch('https://dolarapi.com/v1/dolares/blue', {
            headers: { Accept: 'application/json' },
          });

          if (!res.ok) throw new Error('Error al consultar DolarAPI');
          const data = await res.json();
          const rate = Number(data.venta);

          if (!isNaN(rate) && rate > 0) {
            set({
              exchangeRate: rate,
              rateLastUpdated: new Date().toISOString(),
              isFetchingRate: false,
            });
            return rate;
          }
          throw new Error('Cotización no válida');
        } catch (err) {
          console.warn('Usando cotización fallback ($1350):', err);
          const current = get().exchangeRate || DEFAULT_EXCHANGE_RATE;
          set({ isFetchingRate: false });
          return current;
        }
      },

      setExchangeRate: (rate: number) => {
        if (rate > 0) {
          set({
            exchangeRate: rate,
            rateLastUpdated: new Date().toISOString(),
          });
        }
      },

      // --- PRODUCTS ---
      products: INITIAL_PRODUCTS,

      addProduct: (productData) => {
        const now = new Date().toISOString();
        const newProduct: Product = {
          ...productData,
          id: `prod-${Date.now().toString(36)}`,
          created_at: now,
          updated_at: now,
        };
        set((state) => ({
          products: [newProduct, ...state.products],
        }));
        return newProduct;
      },

      updateProduct: (id, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...updates, updated_at: now } : p
          ),
        }));
      },

      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));
      },

      discountStock: (productId, qty) => {
        set((state) => ({
          products: state.products.map((p) => {
            if (p.id === productId) {
              const newStock = Math.max(0, p.stock - qty);
              return { ...p, stock: newStock, updated_at: new Date().toISOString() };
            }
            return p;
          }),
        }));
      },

      // --- CART ---
      cart: [],
      isCartOpen: false,
      setIsCartOpen: (open) => set({ isCartOpen: open }),

      addToCart: (product, selectedColor, selectedStorage, priceAdjustment = 0) => {
        const finalPrice = product.price_usd + priceAdjustment;
        const color = selectedColor || (product.colors?.[0]?.name ?? null);
        const storage = selectedStorage || (product.storage_options?.[0]?.capacity ?? null);

        set((state) => {
          const existingIndex = state.cart.findIndex(
            (item) =>
              item.product_id === product.id &&
              item.selected_color === color &&
              item.selected_storage === storage
          );

          if (existingIndex > -1) {
            const updated = [...state.cart];
            const item = updated[existingIndex];
            const nextQty = item.quantity + 1;
            updated[existingIndex] = {
              ...item,
              quantity: nextQty,
              subtotal_usd: item.unit_price_usd * nextQty,
            };
            return { cart: updated, isCartOpen: true };
          }

          const newItem: OrderItem = {
            product_id: product.id,
            name: product.name,
            category: product.category,
            quantity: 1,
            unit_price_usd: finalPrice,
            subtotal_usd: finalPrice,
            selected_color: color,
            selected_storage: storage,
            image_url: product.image_url,
          };
          return { cart: [...state.cart, newItem], isCartOpen: true };
        });
      },

      updateCartQty: (index, newQty) => {
        if (newQty <= 0) {
          get().removeFromCart(index);
          return;
        }
        set((state) => {
          const updated = [...state.cart];
          if (updated[index]) {
            updated[index] = {
              ...updated[index],
              quantity: newQty,
              subtotal_usd: updated[index].unit_price_usd * newQty,
            };
          }
          return { cart: updated };
        });
      },

      removeFromCart: (index) => {
        set((state) => ({
          cart: state.cart.filter((_, i) => i !== index),
        }));
      },

      clearCart: () => set({ cart: [] }),

      getCartTotals: () => {
        const { cart, exchangeRate } = get();
        const totalUSD = cart.reduce((sum, item) => sum + item.subtotal_usd, 0);
        const totalARS = totalUSD * exchangeRate;
        return { totalUSD, totalARS };
      },

      // --- ORDERS ---
      orders: INITIAL_ORDERS,

      createOrder: (orderData) => {
        const now = new Date().toISOString();
        const randNum = Math.floor(1000 + Math.random() * 9000);
        const newOrder: Order = {
          ...orderData,
          id: `WA-${randNum}`,
          status: 'pendiente',
          created_at: now,
          updated_at: now,
        };

        set((state) => ({
          orders: [newOrder, ...state.orders],
        }));

        return newOrder;
      },

      approveOrder: (orderId, paymentMethod = 'efectivo_usd') => {
        const state = get();
        const targetOrder = state.orders.find((o) => o.id === orderId);
        if (!targetOrder || targetOrder.status === 'aprobado_cobrado') return;

        const now = new Date().toISOString();

        // 1. Discount stock of items
        const updatedProducts = [...state.products];
        targetOrder.items.forEach((item) => {
          const prodIndex = updatedProducts.findIndex((p) => p.id === item.product_id);
          if (prodIndex > -1) {
            const currentStock = updatedProducts[prodIndex].stock;
            updatedProducts[prodIndex] = {
              ...updatedProducts[prodIndex],
              stock: Math.max(0, currentStock - item.quantity),
              updated_at: now,
            };
          }
        });

        // 2. Register cash movement
        const chosenMethod = paymentMethod || (targetOrder.payment_method as PaymentMethod) || 'efectivo_usd';
        const isArs = chosenMethod === 'efectivo_ars' || chosenMethod === 'transferencia' || chosenMethod === 'debito' || chosenMethod === 'credito';

        const newMovement: CashRegisterMovement = {
          id: `mov-${Date.now().toString(36)}`,
          type: 'ingreso',
          category: 'venta_web',
          description: `Cobro Pedido ${targetOrder.id} - ${targetOrder.customer_name}`,
          amount_ars: isArs ? targetOrder.total_ars : 0,
          amount_usd: isArs ? 0 : targetOrder.total_usd,
          payment_method: chosenMethod,
          order_id: targetOrder.id,
          created_at: now,
        };

        // 3. Update order status
        const updatedOrders = state.orders.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: 'aprobado_cobrado' as OrderStatus,
                payment_method: chosenMethod,
                updated_at: now,
              }
            : o
        );

        set({
          products: updatedProducts,
          orders: updatedOrders,
          cashMovements: [newMovement, ...state.cashMovements],
        });
      },

      cancelOrder: (orderId) => {
        const now = new Date().toISOString();
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status: 'cancelado' as OrderStatus, updated_at: now } : o
          ),
        }));
      },

      // --- CASH REGISTER ---
      cashMovements: INITIAL_CASH_MOVEMENTS,

      addCashMovement: (movementData) => {
        const now = new Date().toISOString();
        const newMov: CashRegisterMovement = {
          ...movementData,
          id: `mov-${Date.now().toString(36)}`,
          created_at: now,
        };
        set((state) => ({
          cashMovements: [newMov, ...state.cashMovements],
        }));
        return newMov;
      },

      getCashBreakdown: () => {
        const movements = get().cashMovements;
        const defaultMethodSummary = (): PaymentMethodSummary => ({
          ingresos_ars: 0,
          egresos_ars: 0,
          saldo_ars: 0,
          ingresos_usd: 0,
          egresos_usd: 0,
          saldo_usd: 0,
          count: 0,
        });

        const breakdown: CashRegisterBreakdown = {
          methods: {
            efectivo_ars: defaultMethodSummary(),
            efectivo_usd: defaultMethodSummary(),
            transferencia: defaultMethodSummary(),
            debito: defaultMethodSummary(),
            credito: defaultMethodSummary(),
          },
          total_ars: 0,
          total_usd: 0,
          total_ingresos_ars: 0,
          total_egresos_ars: 0,
          total_ingresos_usd: 0,
          total_egresos_usd: 0,
        };

        movements.forEach((m) => {
          const methodKey = m.payment_method;
          const methodSummary = breakdown.methods[methodKey];
          if (!methodSummary) return;

          methodSummary.count += 1;

          if (m.type === 'ingreso') {
            methodSummary.ingresos_ars += m.amount_ars;
            methodSummary.ingresos_usd += m.amount_usd;
            breakdown.total_ingresos_ars += m.amount_ars;
            breakdown.total_ingresos_usd += m.amount_usd;
          } else {
            methodSummary.egresos_ars += m.amount_ars;
            methodSummary.egresos_usd += m.amount_usd;
            breakdown.total_egresos_ars += m.amount_ars;
            breakdown.total_egresos_usd += m.amount_usd;
          }

          methodSummary.saldo_ars = methodSummary.ingresos_ars - methodSummary.egresos_ars;
          methodSummary.saldo_usd = methodSummary.ingresos_usd - methodSummary.egresos_usd;
        });

        breakdown.total_ars = breakdown.total_ingresos_ars - breakdown.total_egresos_ars;
        breakdown.total_usd = breakdown.total_ingresos_usd - breakdown.total_egresos_usd;

        return breakdown;
      },

      // --- TRADE IN ---
      tradeIns: INITIAL_TRADE_INS,

      createTradeIn: (data) => {
        const now = new Date().toISOString();
        const randId = `ti-${Math.floor(100 + Math.random() * 900)}`;
        const newTrade: TradeIn = {
          ...data,
          id: randId,
          status: 'pendiente_revision',
          offered_value_usd: null,
          admin_notes: null,
          created_at: now,
          updated_at: now,
        };
        set((state) => ({
          tradeIns: [newTrade, ...state.tradeIns],
        }));
        return newTrade;
      },

      updateTradeIn: (id, status, offeredValueUsd = null, adminNotes = null) => {
        const now = new Date().toISOString();
        set((state) => ({
          tradeIns: state.tradeIns.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status,
                  offered_value_usd: offeredValueUsd !== undefined ? offeredValueUsd : t.offered_value_usd,
                  admin_notes: adminNotes !== undefined ? adminNotes : t.admin_notes,
                  updated_at: now,
                }
              : t
          ),
        }));
      },

      // --- ADMIN AUTH ---
      isAdminAuthenticated: false,

      loginAdmin: (pin: string) => {
        if (pin === '2020') {
          set({ isAdminAuthenticated: true });
          return true;
        }
        return false;
      },

      logoutAdmin: () => {
        set({ isAdminAuthenticated: false });
      },

      // --- DEMO RESET ---
      resetToDefaultData: () => {
        set({
          products: INITIAL_PRODUCTS,
          orders: INITIAL_ORDERS,
          cashMovements: INITIAL_CASH_MOVEMENTS,
          tradeIns: INITIAL_TRADE_INS,
          cart: [],
          exchangeRate: DEFAULT_EXCHANGE_RATE,
        });
      },
    }),
    {
      name: 'world-apple-store-v1',
      partialize: (state) => ({
        products: state.products,
        orders: state.orders,
        cashMovements: state.cashMovements,
        tradeIns: state.tradeIns,
        cart: state.cart,
        exchangeRate: state.exchangeRate,
        rateLastUpdated: state.rateLastUpdated,
        isAdminAuthenticated: state.isAdminAuthenticated,
      }),
    }
  )
);
