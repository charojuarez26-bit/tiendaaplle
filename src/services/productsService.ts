import { useAppStore } from '../store/useAppStore';
import type { Product, ProductCategory } from '../types/database';

export const sortNewProducts = (products: Product[]): Product[] => {
  return [...products].sort((a, b) => {
    const genRegex = /iPhone\s*(\d+)/i;
    const aMatch = a.name.match(genRegex);
    const bMatch = b.name.match(genRegex);

    const aGen = aMatch ? parseInt(aMatch[1], 10) : 0;
    const bGen = bMatch ? parseInt(bMatch[1], 10) : 0;

    if (bGen !== aGen) {
      return bGen - aGen;
    }

    const aIsProMax = /pro\s*max/i.test(a.name);
    const bIsProMax = /pro\s*max/i.test(b.name);
    if (aIsProMax && !bIsProMax) return -1;
    if (!aIsProMax && bIsProMax) return 1;

    const aIsPro = /pro/i.test(a.name);
    const bIsPro = /pro/i.test(b.name);
    if (aIsPro && !bIsPro) return -1;
    if (!aIsPro && bIsPro) return 1;

    return b.price_usd - a.price_usd;
  });
};

export const productsService = {
  async getActiveProducts(category?: ProductCategory): Promise<Product[]> {
    const products = useAppStore.getState().products;
    const filtered = category
      ? products.filter((p) => p.category === category && p.is_active)
      : products.filter((p) => p.is_active);

    if (category === 'nuevo') {
      return sortNewProducts(filtered);
    }
    return filtered;
  },

  async getAllProducts(): Promise<Product[]> {
    return useAppStore.getState().products;
  },

  async getAccessories(): Promise<Product[]> {
    return this.getActiveProducts('accesorio');
  },

  async getProductById(id: string): Promise<Product | null> {
    const products = useAppStore.getState().products;
    return products.find((p) => p.id === id) || null;
  },

  async createProduct(
    product: Omit<Product, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Product | null> {
    return useAppStore.getState().addProduct(product);
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    useAppStore.getState().updateProduct(id, updates);
    return this.getProductById(id);
  },

  async deleteProduct(id: string): Promise<boolean> {
    useAppStore.getState().deleteProduct(id);
    return true;
  },

  async discountStock(id: string, quantityToDeduct: number = 1): Promise<Product | null> {
    useAppStore.getState().discountStock(id, quantityToDeduct);
    return this.getProductById(id);
  },
};
