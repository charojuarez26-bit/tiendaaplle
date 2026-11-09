// ==============================================================================
// WORLD APPLE - TYPES & DATABASE INTERFACES (SUPABASE COMPLIANT)
// ==============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ProductCategory = 'nuevo' | 'usado' | 'accesorio';
export type DeliveryType = 'retiro' | 'envio';
export type OrderStatus = 'pendiente' | 'aprobado_cobrado' | 'cancelado';
export type MovementType = 'ingreso' | 'egreso';
export type PaymentMethod =
  | 'efectivo_ars'
  | 'efectivo_usd'
  | 'transferencia'
  | 'debito'
  | 'credito';
export type TradeInStatus = 'pendiente_revision' | 'cotizado' | 'rechazado';

export interface ColorOption {
  name: string;
  hex: string;
}

export interface StorageOption {
  capacity: string;
  price_adjustment: number;
}

export interface OrderItem {
  product_id: string;
  name: string;
  category: ProductCategory;
  quantity: number;
  unit_price_usd: number;
  subtotal_usd: number;
  selected_color?: string | null;
  selected_storage?: string | null;
  image_url?: string | null;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price_usd: number;
  stock: number;
  battery_health?: number | null;
  aesthetic_condition?: string | null;
  colors: ColorOption[];
  storage_options: StorageOption[];
  image_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExchangeRate {
  id: string;
  currency: string;
  rate: number;
  updated_at: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  delivery_type: DeliveryType;
  delivery_address?: string | null;
  payment_method?: string | null;
  items: OrderItem[];
  total_usd: number;
  total_ars: number;
  exchange_rate_used: number;
  status: OrderStatus;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CashRegisterMovement {
  id: string;
  type: MovementType;
  category: string;
  description: string;
  amount_ars: number;
  amount_usd: number;
  payment_method: PaymentMethod;
  order_id?: string | null;
  created_at: string;
}

export interface TradeIn {
  id: string;
  customer_name: string;
  customer_phone: string;
  device_model: string;
  battery_health?: number | null;
  condition: string;
  has_box: boolean;
  photos: string[];
  status: TradeInStatus;
  offered_value_usd?: number | null;
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
}

// Complete Database definition for Supabase client
export interface Database {
  public: {
    Tables: {
      products: {
        Row: Product;
        Insert: {
          id?: string;
          name: string;
          category: ProductCategory;
          price_usd: number;
          stock?: number;
          battery_health?: number | null;
          aesthetic_condition?: string | null;
          colors?: any;
          storage_options?: any;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: ProductCategory;
          price_usd?: number;
          stock?: number;
          battery_health?: number | null;
          aesthetic_condition?: string | null;
          colors?: any;
          storage_options?: any;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      exchange_rates: {
        Row: ExchangeRate;
        Insert: {
          id?: string;
          currency?: string;
          rate: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          currency?: string;
          rate?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: Order;
        Insert: {
          id?: string;
          customer_name: string;
          customer_phone: string;
          delivery_type: DeliveryType;
          delivery_address?: string | null;
          payment_method?: string | null;
          items?: any;
          total_usd: number;
          total_ars: number;
          exchange_rate_used: number;
          status?: OrderStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_name?: string;
          customer_phone?: string;
          delivery_type?: DeliveryType;
          delivery_address?: string | null;
          payment_method?: string | null;
          items?: any;
          total_usd?: number;
          total_ars?: number;
          exchange_rate_used?: number;
          status?: OrderStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      cash_register_movements: {
        Row: CashRegisterMovement;
        Insert: {
          id?: string;
          type: MovementType;
          category: string;
          description: string;
          amount_ars?: number;
          amount_usd?: number;
          payment_method: PaymentMethod;
          order_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          type?: MovementType;
          category?: string;
          description?: string;
          amount_ars?: number;
          amount_usd?: number;
          payment_method?: PaymentMethod;
          order_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      trade_ins: {
        Row: TradeIn;
        Insert: {
          id?: string;
          customer_name: string;
          customer_phone: string;
          device_model: string;
          battery_health?: number | null;
          condition: string;
          has_box?: boolean;
          photos?: any;
          status?: TradeInStatus;
          offered_value_usd?: number | null;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_name?: string;
          customer_phone?: string;
          device_model?: string;
          battery_health?: number | null;
          condition?: string;
          has_box?: boolean;
          photos?: any;
          status?: TradeInStatus;
          offered_value_usd?: number | null;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
