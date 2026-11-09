# World Apple 🍏 - Tienda de iPhones, Accesorios y Panel de Administración

Aplicación web integral para la venta de iPhones nuevos, usados certificados y accesorios oficiales, con cotización de divisa en tiempo real (USD a ARS), formulario de Plan Canje (Trade In), control de pedidos, libro de caja diaria y panel de administración completo.

---

## 🚀 Tecnologías Utilizadas

- **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend / Base de Datos:** Supabase (PostgreSQL, Row Level Security, Triggers).
- **Estilos:** Apple Design Language (SF Pro, paleta minimalista `#F5F5F7`, `#1D1D1F`, `#0071E3`, bordes sutiles `#D2D2D7`).

---

## 📂 Estructura Modular del Proyecto

```text
├── public/
│   └── apple-icon.svg
├── src/
│   ├── components/
│   │   ├── layout/         # Navbar con cotización en vivo, Footer Apple
│   │   ├── store/          # ProductCard, CartDrawer, etc.
│   │   └── ui/             # AppleButton, Badge, etc.
│   ├── context/
│   │   └── CartContext.tsx # Estado global de la bolsa de compras y conversión ARS/USD
│   ├── lib/
│   │   └── formatters.ts   # Formateo de moneda USD, ARS y fechas
│   ├── pages/
│   │   ├── StorePage.tsx       # Catálogo con filtros y búsqueda
│   │   ├── TradeInPage.tsx     # Solicitud de Plan Canje (Trade In)
│   │   └── AdminDashboard.tsx  # Panel Admin: Productos, Pedidos, Caja y Canjes
│   ├── services/
│   │   ├── supabase.ts             # Cliente y conexión inicial a Supabase
│   │   ├── productsService.ts      # CRUD de productos (nuevos, usados, accesorios)
│   │   ├── exchangeRateService.ts  # Consulta y actualización de cotización USD_ARS
│   │   ├── ordersService.ts        # Creación y gestión de pedidos
│   │   ├── cashRegisterService.ts  # Control de ingresos/egresos y saldos
│   │   └── tradeInService.ts       # Cotización y revisión de dispositivos usados
│   ├── types/
│   │   └── database.ts     # Tipado completo de la base de datos Supabase
│   ├── App.tsx             # Enrutador principal y vistas
│   ├── index.css           # Configuración base tipográfica y glassmorphism
│   └── main.tsx
├── supabase/
│   └── schema.sql          # Script SQL completo de creación de tablas, triggers, RLS y seed data
├── tailwind.config.js      # Paleta de colores Apple y fuentes del sistema
├── vite.config.ts
└── package.json
```

---

## 🗄️ Esquema de Base de Datos en Supabase

El archivo [schema.sql](file:///home/exe/Descargas/tienda%20aple/supabase/schema.sql) contiene la definición completa en PostgreSQL:

1. **`products`**:
   - `id`, `name`, `category` ('nuevo', 'usado', 'accesorio'), `price_usd`, `stock`, `battery_health`, `aesthetic_condition`, `colors` (jsonb), `storage_options` (jsonb con capacity y price_adjustment), `image_url`, `is_active`, `created_at`, `updated_at`.
2. **`exchange_rates`**:
   - `id`, `currency` ('USD_ARS'), `rate`, `updated_at`.
3. **`orders`**:
   - `id`, `customer_name`, `customer_phone`, `delivery_type` ('retiro', 'envio'), `delivery_address`, `items` (jsonb), `total_usd`, `total_ars`, `exchange_rate_used`, `status` ('pendiente', 'aprobado_cobrado', 'cancelado'), `notes`, `created_at`, `updated_at`.
4. **`cash_register_movements`**:
   - `id`, `type` ('ingreso', 'egreso'), `category` ('venta', 'gasto_proveedor', 'retiro', etc.), `description`, `amount_ars`, `amount_usd`, `payment_method` ('efectivo_ars', 'efectivo_usd', 'transferencia', 'debito', 'credito'), `order_id`, `created_at`.
5. **`trade_ins`**:
   - `id`, `customer_name`, `customer_phone`, `device_model`, `battery_health`, `condition`, `has_box`, `photos` (jsonb), `status` ('pendiente_revision', 'cotizado', 'rechazado'), `offered_value_usd`, `admin_notes`, `created_at`, `updated_at`.

### Triggers & RLS
- Disparador automático `update_updated_at_column()` en todas las tablas con fecha de modificación.
- Políticas de Row Level Security (RLS) habilitadas para proteger los datos en producción y permitir inserciones de pedidos/canjes por parte de los clientes.

---

## ⚙️ Configuración y Puesta en Marcha

### 1. Variables de Entorno
Copia el archivo `.env.example` a `.env` y completa con las credenciales de tu proyecto de Supabase:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-public-key
```
*(Nota: Si no se configuran, la aplicación incluye automáticamente un modo offline/fallback con datos demo precargados para visualización inmediata).*

### 2. Ejecutar la Base de Datos en Supabase
1. Ingresa a tu panel de Supabase.
2. Abre el **SQL Editor**.
3. Pega y ejecuta el contenido de `supabase/schema.sql`.

### 3. Iniciar el Servidor de Desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`.
