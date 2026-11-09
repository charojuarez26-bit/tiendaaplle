import React from 'react';
import { useAppStore } from '../store/useAppStore';
import type { OrderItem, Product } from '../types/database';

interface CartContextType {
  cart: OrderItem[];
  addToCart: (
    product: Product,
    selectedColor?: string,
    selectedStorage?: string,
    priceAdjustment?: number
  ) => void;
  updateQuantity: (index: number, newQty: number) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  totalUSD: number;
  totalARS: number;
  exchangeRate: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Pass-through wrapper maintaining backwards compatibility
  return <>{children}</>;
};

export const useCart = (): CartContextType => {
  const store = useAppStore();
  const totals = store.getCartTotals();

  return {
    cart: store.cart,
    addToCart: (product, selectedColor, selectedStorage, priceAdjustment) =>
      store.addToCart(product, selectedColor, selectedStorage, priceAdjustment),
    updateQuantity: (index, newQty) => store.updateCartQty(index, newQty),
    removeFromCart: (index) => store.removeFromCart(index),
    clearCart: () => store.clearCart(),
    totalUSD: totals.totalUSD,
    totalARS: totals.totalARS,
    exchangeRate: store.exchangeRate,
    isCartOpen: store.isCartOpen,
    setIsCartOpen: (open) => store.setIsCartOpen(open),
  };
};
