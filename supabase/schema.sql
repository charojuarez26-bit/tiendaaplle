-- ==============================================================================
-- WORLD APPLE - DATABASE SCHEMA (SUPABASE / POSTGRESQL)
-- Tienda de iPhones, Accesorios y Panel de Administración
-- ==============================================================================

-- 1. Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Función utilitaria para actualizar automáticamente el campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 2. TABLA: products (Productos: iPhones nuevos, usados y accesorios)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('nuevo', 'usado', 'accesorio')),
    price_usd NUMERIC(10, 2) NOT NULL CHECK (price_usd >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0), -- relevante para nuevos y accesorios
    battery_health INTEGER CHECK (battery_health IS NULL OR (battery_health >= 50 AND battery_health <= 100)), -- relevante para usados (%)
    aesthetic_condition TEXT, -- condición estética para usados (ej. "Excelente 10/10", "Muy bueno 9/10")
    colors JSONB NOT NULL DEFAULT '[]'::jsonb, -- array de colores: [{"name": "Titanio Natural", "hex": "#9A958D"}]
    storage_options JSONB NOT NULL DEFAULT '[]'::jsonb, -- array de opciones: [{"capacity": "128GB", "price_adjustment": 0}, {"capacity": "256GB", "price_adjustment": 100}]
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger de updated_at para products
DROP TRIGGER IF EXISTS trigger_products_updated_at ON public.products;
CREATE TRIGGER trigger_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Índices de consulta frecuente
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_price_usd ON public.products(price_usd);


-- ==============================================================================
-- 3. TABLA: exchange_rates (Cotización diaria USD a ARS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.exchange_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    currency TEXT NOT NULL UNIQUE DEFAULT 'USD_ARS',
    rate NUMERIC(12, 2) NOT NULL CHECK (rate > 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger de updated_at para exchange_rates
DROP TRIGGER IF EXISTS trigger_exchange_rates_updated_at ON public.exchange_rates;
CREATE TRIGGER trigger_exchange_rates_updated_at
BEFORE UPDATE ON public.exchange_rates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- ==============================================================================
-- 4. TABLA: orders (Pedidos de clientes)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_type TEXT NOT NULL CHECK (delivery_type IN ('retiro', 'envio')),
    delivery_address TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb, -- detalle de items comprados, precios, variantes
    total_usd NUMERIC(10, 2) NOT NULL CHECK (total_usd >= 0),
    total_ars NUMERIC(14, 2) NOT NULL CHECK (total_ars >= 0),
    exchange_rate_used NUMERIC(12, 2) NOT NULL CHECK (exchange_rate_used > 0),
    status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'aprobado_cobrado', 'cancelado')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger de updated_at para orders
DROP TRIGGER IF EXISTS trigger_orders_updated_at ON public.orders;
CREATE TRIGGER trigger_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Índices para orders
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);


-- ==============================================================================
-- 5. TABLA: cash_register_movements (Movimientos de Caja: Ingresos / Egresos)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.cash_register_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('ingreso', 'egreso')),
    category TEXT NOT NULL, -- 'venta', 'gasto_proveedor', 'retiro', 'servicios', 'otros'
    description TEXT NOT NULL,
    amount_ars NUMERIC(14, 2) NOT NULL DEFAULT 0,
    amount_usd NUMERIC(10, 2) NOT NULL DEFAULT 0,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('efectivo_ars', 'efectivo_usd', 'transferencia', 'debito', 'credito')),
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para caja
CREATE INDEX IF NOT EXISTS idx_cash_movements_type ON public.cash_register_movements(type);
CREATE INDEX IF NOT EXISTS idx_cash_movements_category ON public.cash_register_movements(category);
CREATE INDEX IF NOT EXISTS idx_cash_movements_created_at ON public.cash_register_movements(created_at DESC);


-- ==============================================================================
-- 6. TABLA: trade_ins (Plan Canje / Toma de usados)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.trade_ins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    device_model TEXT NOT NULL,
    battery_health INTEGER CHECK (battery_health IS NULL OR (battery_health >= 50 AND battery_health <= 100)),
    condition TEXT NOT NULL, -- descripción del estado estético y funcional
    has_box BOOLEAN NOT NULL DEFAULT false,
    photos JSONB NOT NULL DEFAULT '[]'::jsonb, -- URLs de fotos adjuntadas por el cliente
    status TEXT NOT NULL DEFAULT 'pendiente_revision' CHECK (status IN ('pendiente_revision', 'cotizado', 'rechazado')),
    offered_value_usd NUMERIC(10, 2) DEFAULT NULL, -- Valor estimado o cotizado final
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger de updated_at para trade_ins
DROP TRIGGER IF EXISTS trigger_trade_ins_updated_at ON public.trade_ins;
CREATE TRIGGER trigger_trade_ins_updated_at
BEFORE UPDATE ON public.trade_ins
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Índices para trade_ins
CREATE INDEX IF NOT EXISTS idx_trade_ins_status ON public.trade_ins(status);
CREATE INDEX IF NOT EXISTS idx_trade_ins_created_at ON public.trade_ins(created_at DESC);


-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) & POLICIES
-- ==============================================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_register_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_ins ENABLE ROW LEVEL SECURITY;

-- Products
CREATE POLICY "Permitir lectura publica de productos activos"
    ON public.products FOR SELECT
    USING (is_active = true OR auth.role() = 'authenticated');

CREATE POLICY "Permitir gestion completa a administradores en productos"
    ON public.products FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Exchange Rates
CREATE POLICY "Permitir lectura publica de cotizacion"
    ON public.exchange_rates FOR SELECT
    USING (true);

CREATE POLICY "Permitir actualizacion de cotizacion a administradores"
    ON public.exchange_rates FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Orders
CREATE POLICY "Permitir a clientes crear pedidos"
    ON public.orders FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Permitir lectura de pedidos al admin"
    ON public.orders FOR SELECT
    USING (true);

CREATE POLICY "Permitir actualizacion de pedidos al admin"
    ON public.orders FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Cash Register
CREATE POLICY "Acceso a caja para administradores"
    ON public.cash_register_movements FOR ALL
    USING (true)
    WITH CHECK (true);

-- Trade-ins
CREATE POLICY "Permitir a clientes solicitar plan canje"
    ON public.trade_ins FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Permitir lectura y gestion de plan canje al admin"
    ON public.trade_ins FOR ALL
    USING (true)
    WITH CHECK (true);


-- ==============================================================================
-- 8. DATOS SEMILLA (SEED DATA)
-- ==============================================================================

-- Cotización inicial (USD a ARS)
INSERT INTO public.exchange_rates (currency, rate)
VALUES ('USD_ARS', 1250.00)
ON CONFLICT (currency) DO UPDATE SET rate = EXCLUDED.rate, updated_at = NOW();

-- Productos Nuevos, Usados y Accesorios
INSERT INTO public.products (name, category, price_usd, stock, battery_health, aesthetic_condition, colors, storage_options, image_url, is_active)
VALUES
-- NUEVOS
(
    'iPhone 16 Pro Max',
    'nuevo',
    1399.00,
    8,
    NULL,
    'Nuevo Sellado en Caja Oficial Apple - Garantía 1 Año',
    '[
        {"name": "Titanio Desierto", "hex": "#C5B5A5"},
        {"name": "Titanio Natural", "hex": "#9A958D"},
        {"name": "Titanio Blanco", "hex": "#E3E3DF"},
        {"name": "Titanio Negro", "hex": "#3B3A36"}
    ]'::jsonb,
    '[
        {"capacity": "256GB", "price_adjustment": 0},
        {"capacity": "512GB", "price_adjustment": 200},
        {"capacity": "1TB", "price_adjustment": 400}
    ]'::jsonb,
    'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=900&q=80',
    true
),
(
    'iPhone 16 Pro',
    'nuevo',
    1199.00,
    12,
    NULL,
    'Nuevo Sellado en Caja Oficial Apple - Chip A18 Pro',
    '[
        {"name": "Titanio Desierto", "hex": "#C5B5A5"},
        {"name": "Titanio Natural", "hex": "#9A958D"},
        {"name": "Titanio Blanco", "hex": "#E3E3DF"},
        {"name": "Titanio Negro", "hex": "#3B3A36"}
    ]'::jsonb,
    '[
        {"capacity": "128GB", "price_adjustment": 0},
        {"capacity": "256GB", "price_adjustment": 120},
        {"capacity": "512GB", "price_adjustment": 320}
    ]'::jsonb,
    'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=900&q=80',
    true
),
(
    'iPhone 16',
    'nuevo',
    949.00,
    15,
    NULL,
    'Nuevo Sellado en Caja Oficial Apple - Control de Cámara',
    '[
        {"name": "Ultramar", "hex": "#4863A0"},
        {"name": "Verde Azulado", "hex": "#9BB8AC"},
        {"name": "Rosa Pastel", "hex": "#E8B6BA"},
        {"name": "Blanco", "hex": "#F5F5F7"},
        {"name": "Negro", "hex": "#1D1D1F"}
    ]'::jsonb,
    '[
        {"capacity": "128GB", "price_adjustment": 0},
        {"capacity": "256GB", "price_adjustment": 100},
        {"capacity": "512GB", "price_adjustment": 280}
    ]'::jsonb,
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=900&q=80',
    true
),
(
    'iPhone 15 Pro Max',
    'nuevo',
    1099.00,
    6,
    NULL,
    'Nuevo Sellado en Caja Oficial Apple - Zoom Óptico 5x',
    '[
        {"name": "Titanio Natural", "hex": "#9A958D"},
        {"name": "Titanio Azul", "hex": "#2B343D"},
        {"name": "Titanio Negro", "hex": "#3C3B37"}
    ]'::jsonb,
    '[
        {"capacity": "256GB", "price_adjustment": 0},
        {"capacity": "512GB", "price_adjustment": 180}
    ]'::jsonb,
    'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=900&q=80',
    true
),
(
    'iPhone 15',
    'nuevo',
    849.00,
    14,
    NULL,
    'Nuevo Sellado en Caja Oficial Apple - Dynamic Island',
    '[
        {"name": "Negro", "hex": "#353839"},
        {"name": "Azul", "hex": "#D4E1E8"},
        {"name": "Verde", "hex": "#D5E0D5"},
        {"name": "Rosa", "hex": "#F7D8D8"}
    ]'::jsonb,
    '[
        {"capacity": "128GB", "price_adjustment": 0},
        {"capacity": "256GB", "price_adjustment": 90}
    ]'::jsonb,
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=900&q=80',
    true
),
(
    'iPhone 14',
    'nuevo',
    699.00,
    9,
    NULL,
    'Nuevo Sellado en Caja Oficial Apple - Pantalla Super Retina XDR',
    '[
        {"name": "Medianoche", "hex": "#1E232B"},
        {"name": "Blanco Estelar", "hex": "#F7F4EE"},
        {"name": "Azul", "hex": "#A3B9CE"}
    ]'::jsonb,
    '[
        {"capacity": "128GB", "price_adjustment": 0},
        {"capacity": "256GB", "price_adjustment": 80}
    ]'::jsonb,
    'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?auto=format&fit=crop&w=900&q=80',
    true
),

-- USADOS
(
    'iPhone 14 Pro Max 256GB',
    'usado',
    799.00,
    1,
    91,
    'Impecable (9.8/10) - Batería 91% Original, sin rayas ni marcas',
    '[{"name": "Morado Oscuro", "hex": "#4B3E52"}]'::jsonb,
    '[{"capacity": "256GB", "price_adjustment": 0}]'::jsonb,
    'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?auto=format&fit=crop&w=900&q=80',
    true
),
(
    'iPhone 13 Pro 128GB',
    'usado',
    649.00,
    1,
    88,
    'Excelente (9.5/10) - Batería y pantalla original con TrueTone',
    '[{"name": "Azul Sierra", "hex": "#9BB5CE"}, {"name": "Grafito", "hex": "#54524F"}]'::jsonb,
    '[{"capacity": "128GB", "price_adjustment": 0}]'::jsonb,
    'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=900&q=80',
    true
),
(
    'iPhone 13 128GB',
    'usado',
    520.00,
    0, -- Agotado para test de stock
    89,
    'Muy Bueno (9.0/10) - Pequeño micro-desgaste en borde inferior',
    '[{"name": "Azul", "hex": "#215E7C"}]'::jsonb,
    '[{"capacity": "128GB", "price_adjustment": 0}]'::jsonb,
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=900&q=80',
    true
),
(
    'iPhone 12 Pro 128GB',
    'usado',
    480.00,
    1,
    86,
    'Excelente (9.2/10) - Acero inoxidable brillante, Face ID perfecto',
    '[{"name": "Azul Pacífico", "hex": "#2D4B5A"}, {"name": "Plata", "hex": "#E3E4E5"}]'::jsonb,
    '[{"capacity": "128GB", "price_adjustment": 0}]'::jsonb,
    'https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&w=900&q=80',
    true
),
(
    'iPhone 12 64GB',
    'usado',
    399.00,
    1,
    85,
    'Muy Bueno (8.8/10) - Detalle mínimo cosmético en chasis',
    '[{"name": "Blanco", "hex": "#F4F5F7"}, {"name": "Negro", "hex": "#1F2020"}]'::jsonb,
    '[{"capacity": "64GB", "price_adjustment": 0}, {"capacity": "128GB", "price_adjustment": 40}]'::jsonb,
    'https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&w=900&q=80',
    true
),

-- ACCESORIOS
(
    'Adaptador de Corriente USB-C 20W Apple',
    'accesorio',
    29.00,
    45,
    NULL,
    'Nuevo Original en Caja Sellada - Carga Rápida',
    '[{"name": "Blanco", "hex": "#FFFFFF"}]'::jsonb,
    '[]'::jsonb,
    'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
    true
),
(
    'AirPods Pro (2.ª gen) con Estuche MagSafe (USB-C)',
    'accesorio',
    249.00,
    22,
    NULL,
    'Nuevo Sellado Oficial - Cancelación Activa de Ruido 2x',
    '[{"name": "Blanco", "hex": "#FFFFFF"}]'::jsonb,
    '[]'::jsonb,
    'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80',
    true
),
(
    'Cargador Inalámbrico MagSafe Oficial 15W',
    'accesorio',
    45.00,
    35,
    NULL,
    'Nuevo Sellado en Blister Original Apple',
    '[{"name": "Plata / Blanco", "hex": "#EAEAEA"}]'::jsonb,
    '[]'::jsonb,
    'https://images.unsplash.com/photo-1622445262464-84b1456045b6?auto=format&fit=crop&w=800&q=80',
    true
),
(
    'Funda de Silicona con MagSafe para iPhone',
    'accesorio',
    49.00,
    30,
    NULL,
    'Nuevo Original - Protección de policarbonato y microfibra',
    '[
        {"name": "Negro Medianoche", "hex": "#1D1D1F"},
        {"name": "Azul Tormenta", "hex": "#27384D"},
        {"name": "Arcilla", "hex": "#B7A99A"},
        {"name": "Rojo Product(RED)", "hex": "#D11A2A"}
    ]'::jsonb,
    '[]'::jsonb,
    'https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=800&q=80',
    true
),
(
    'Cable USB-C a USB-C Tejido 60W (1m)',
    'accesorio',
    25.00,
    50,
    NULL,
    'Nuevo Sellado en Caja Oficial Apple',
    '[{"name": "Blanco", "hex": "#FFFFFF"}]'::jsonb,
    '[]'::jsonb,
    'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
    true
);

-- Movimiento inicial de caja de muestra
INSERT INTO public.cash_register_movements (type, category, description, amount_ars, amount_usd, payment_method)
VALUES
('ingreso', 'apertura_caja', 'Fondo inicial de apertura de caja World Apple', 150000.00, 500.00, 'efectivo_usd');
