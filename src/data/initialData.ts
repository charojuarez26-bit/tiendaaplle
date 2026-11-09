import type { Product, Order, CashRegisterMovement, TradeIn } from '../types/database';

export interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
  productTag: string;
}

export interface ShowroomInfo {
  name: string;
  badge: string;
  address: string;
  intersection: string;
  city: string;
  hours: string;
  phone: string;
  phoneFormatted: string;
  whatsappUrl: string;
  googleMapsUrl: string;
  directionsUrl: string;
}

export const INITIAL_PRODUCTS: Product[] = [
  // --- IPHONES NUEVOS ---
  {
    id: 'prod-15pm',
    name: 'iPhone 15 Pro Max',
    category: 'nuevo',
    price_usd: 1190,
    stock: 10,
    battery_health: null,
    aesthetic_condition: 'Nuevo Sellado en Caja Oficial Apple - Titanio Aeroespacial',
    colors: [
      { name: 'Titanio Natural', hex: '#8A857D' },
      { name: 'Titanio Negro', hex: '#3B3B3D' },
      { name: 'Titanio Azul', hex: '#343E4B' },
    ],
    storage_options: [
      { capacity: '256GB', price_adjustment: 0 },
      { capacity: '512GB', price_adjustment: 200 },
    ],
    image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=900&q=80',
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'prod-15',
    name: 'iPhone 15',
    category: 'nuevo',
    price_usd: 820,
    stock: 12,
    battery_health: null,
    aesthetic_condition: 'Nuevo Sellado en Caja Oficial Apple - Dynamic Island',
    colors: [
      { name: 'Negro', hex: '#35393B' },
      { name: 'Azul', hex: '#D3DCDE' },
      { name: 'Rosa', hex: '#E8D2CF' },
    ],
    storage_options: [
      { capacity: '128GB', price_adjustment: 0 },
      { capacity: '256GB', price_adjustment: 120 },
    ],
    image_url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=900&q=80',
    is_active: true,
    created_at: '2024-01-14T10:00:00Z',
    updated_at: '2024-01-14T10:00:00Z',
  },
  {
    id: 'prod-14',
    name: 'iPhone 14',
    category: 'nuevo',
    price_usd: 690,
    stock: 8,
    battery_health: null,
    aesthetic_condition: 'Nuevo Sellado en Caja Oficial Apple - Chip A15 Bionic',
    colors: [
      { name: 'Medianoche', hex: '#222930' },
      { name: 'Blanco estelar', hex: '#F9F6EF' },
    ],
    storage_options: [
      { capacity: '128GB', price_adjustment: 0 },
    ],
    image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80',
    is_active: true,
    created_at: '2024-01-13T10:00:00Z',
    updated_at: '2024-01-13T10:00:00Z',
  },

  // --- IPHONES USADOS (Unidades Únicas) ---
  {
    id: 'prod-used-13p',
    name: 'iPhone 13 Pro 128GB Grafito',
    category: 'usado',
    price_usd: 580,
    stock: 1,
    battery_health: 88,
    aesthetic_condition: 'Grado A+ (Impecable)',
    colors: [
      { name: 'Grafito', hex: '#54524F' },
    ],
    storage_options: [
      { capacity: '128GB', price_adjustment: 0 },
    ],
    image_url: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=900&q=80',
    is_active: true,
    created_at: '2024-01-12T10:00:00Z',
    updated_at: '2024-01-12T10:00:00Z',
  },
  {
    id: 'prod-used-12',
    name: 'iPhone 12 128GB Azul',
    category: 'usado',
    price_usd: 390,
    stock: 1,
    battery_health: 83,
    aesthetic_condition: 'Grado A (Detalles leves)',
    colors: [
      { name: 'Azul', hex: '#275276' },
    ],
    storage_options: [
      { capacity: '128GB', price_adjustment: 0 },
    ],
    image_url: 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&w=900&q=80',
    is_active: true,
    created_at: '2024-01-11T10:00:00Z',
    updated_at: '2024-01-11T10:00:00Z',
  },
  {
    id: 'prod-used-11',
    name: 'iPhone 11 64GB Negro',
    category: 'usado',
    price_usd: 290,
    stock: 0, // Probador estado AGOTADO
    battery_health: 81,
    aesthetic_condition: 'Grado B (Uso moderado)',
    colors: [
      { name: 'Negro', hex: '#1F2020' },
    ],
    storage_options: [
      { capacity: '64GB', price_adjustment: 0 },
    ],
    image_url: 'https://images.unsplash.com/photo-1574755393849-623942496936?auto=format&fit=crop&w=900&q=80',
    is_active: true,
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z',
  },

  // --- ACCESORIOS ORIGINALES ---
  {
    id: 'prod-acc-20w',
    name: 'Adaptador de corriente USB-C de 20 W Apple',
    category: 'accesorio',
    price_usd: 25,
    stock: 35,
    battery_health: null,
    aesthetic_condition: 'Original Sellado en Caja Oficial',
    colors: [
      { name: 'Blanco', hex: '#FFFFFF' },
    ],
    storage_options: [],
    image_url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=900&q=80',
    is_active: true,
    created_at: '2024-01-09T10:00:00Z',
    updated_at: '2024-01-09T10:00:00Z',
  },
  {
    id: 'prod-acc-cable',
    name: 'Cable USB-C a Lightning 1m',
    category: 'accesorio',
    price_usd: 19,
    stock: 40,
    battery_health: null,
    aesthetic_condition: 'Original Apple con Refuerzo Tejido',
    colors: [
      { name: 'Blanco', hex: '#FFFFFF' },
    ],
    storage_options: [],
    image_url: 'https://images.unsplash.com/photo-1588515724527-074a7a56616c?auto=format&fit=crop&w=900&q=80',
    is_active: true,
    created_at: '2024-01-08T10:00:00Z',
    updated_at: '2024-01-08T10:00:00Z',
  },
  {
    id: 'prod-acc-case-15p',
    name: 'Funda transparente MagSafe para iPhone 15 Pro',
    category: 'accesorio',
    price_usd: 35,
    stock: 20,
    battery_health: null,
    aesthetic_condition: 'Policarbonato transparente anti-amarilleo',
    colors: [
      { name: 'Transparente', hex: '#ECEEF2' },
    ],
    storage_options: [],
    image_url: 'https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=900&q=80',
    is_active: true,
    created_at: '2024-01-07T10:00:00Z',
    updated_at: '2024-01-07T10:00:00Z',
  },
  {
    id: 'prod-acc-airpods',
    name: 'AirPods Pro (2.ª generación) USB-C',
    category: 'accesorio',
    price_usd: 249,
    stock: 12,
    battery_health: null,
    aesthetic_condition: 'Chip H2 - Cancelación Activa de Ruido 2x',
    colors: [
      { name: 'Blanco', hex: '#FFFFFF' },
    ],
    storage_options: [],
    image_url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=900&q=80',
    is_active: true,
    created_at: '2024-01-06T10:00:00Z',
    updated_at: '2024-01-06T10:00:00Z',
  },
];

export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Sofía Martínez',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    date: 'Hace 3 días',
    comment: 'Excelente atención, mi iPhone 15 Pro llegó impecable y súper rápido. La experiencia de compra fue increíble de principio a fin.',
    productTag: 'Compró: iPhone 15 Pro',
  },
  {
    id: 'test-2',
    name: 'Bautista Gómez',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    date: 'Hace 1 semana',
    comment: 'Compré un usado y la salud de la batería está al 91%, ¡como nuevo! Totalmente recomendable si buscás un equipo verificado y con garantía real.',
    productTag: 'Compró: iPhone 13 Usado',
  },
  {
    id: 'test-3',
    name: 'Camila Silva',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    date: 'Hace 2 semanas',
    comment: 'Muy buena experiencia comprando accesorios, originales y en caja. La velocidad de carga del adaptador de 20W es notable.',
    productTag: 'Compró: Cargador de 20W',
  },
  {
    id: 'test-4',
    name: 'Matías Rossi',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    date: 'Hace 3 semanas',
    comment: 'Hice el Plan Canje entregando mi iPhone 12. Me lo cotizaron en el acto, pagué la diferencia y me fui con el nuevo en mano.',
    productTag: 'Plan Canje: iPhone 15 Pro Max',
  },
];

export const SHOWROOM_INFO: ShowroomInfo = {
  name: 'World Apple Showroom Palermo',
  badge: 'Showroom en Palermo, CABA',
  address: 'Av. Santa Fe 2400',
  intersection: 'entre Pueyrredón y Larrea',
  city: 'Palermo, CABA, Argentina',
  hours: 'Lunes a Sábados de 10:00 a 20:00 hs',
  phone: '5491134567890',
  phoneFormatted: '+54 9 11 3456-7890',
  whatsappUrl: 'https://wa.me/5491134567890?text=Hola%20World%20Apple!%20Quisiera%20hacer%20una%20consulta.',
  googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Av. Santa Fe 2400, C1123 CABA, Argentina'),
  directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent('Av. Santa Fe 2400, C1123 CABA, Argentina'),
};

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'WA-9042',
    customer_name: 'Sofía Martínez',
    customer_phone: '+54 9 11 4567-8910',
    delivery_type: 'envio',
    delivery_address: 'Av. Libertador 4500, Belgrano, CABA',
    payment_method: 'transferencia',
    items: [
      {
        product_id: 'prod-15pm',
        name: 'iPhone 15 Pro Max',
        category: 'nuevo',
        quantity: 1,
        unit_price_usd: 1190,
        subtotal_usd: 1190,
        selected_color: 'Titanio Natural',
        selected_storage: '256GB',
        image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=900&q=80',
      },
    ],
    total_usd: 1190,
    total_ars: 1606500,
    exchange_rate_used: 1350,
    status: 'pendiente',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'WA-9041',
    customer_name: 'Bautista Gómez',
    customer_phone: '+54 9 11 2345-6789',
    delivery_type: 'retiro',
    delivery_address: 'Retiro en Showroom Palermo',
    payment_method: 'efectivo_usd',
    items: [
      {
        product_id: 'prod-used-13p',
        name: 'iPhone 13 Pro 128GB Grafito',
        category: 'usado',
        quantity: 1,
        unit_price_usd: 580,
        subtotal_usd: 580,
        selected_color: 'Grafito',
        selected_storage: '128GB',
        image_url: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=900&q=80',
      },
    ],
    total_usd: 580,
    total_ars: 783000,
    exchange_rate_used: 1350,
    status: 'aprobado_cobrado',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 7).toISOString(),
  },
];

export const INITIAL_CASH_MOVEMENTS: CashRegisterMovement[] = [
  {
    id: 'mov-init-1',
    type: 'ingreso',
    category: 'apertura_caja',
    description: 'Fondo de apertura de caja central World Apple',
    amount_ars: 250000,
    amount_usd: 800,
    payment_method: 'efectivo_usd',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'mov-init-2',
    type: 'ingreso',
    category: 'venta',
    description: 'Cobro de Pedido WA-9041 (iPhone 13 Pro)',
    amount_ars: 0,
    amount_usd: 580,
    payment_method: 'efectivo_usd',
    order_id: 'WA-9041',
    created_at: new Date(Date.now() - 3600000 * 7).toISOString(),
  },
  {
    id: 'mov-init-3',
    type: 'egreso',
    category: 'gasto_proveedor',
    description: 'Flete expreso importación accesorios y packaging Apple',
    amount_ars: 45000,
    amount_usd: 0,
    payment_method: 'efectivo_ars',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'mov-init-4',
    type: 'ingreso',
    category: 'venta_mostrador',
    description: 'Venta mostrador: Adaptador 20W + Funda MagSafe',
    amount_ars: 81000,
    amount_usd: 60,
    payment_method: 'debito',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

export const INITIAL_TRADE_INS: TradeIn[] = [
  {
    id: 'ti-101',
    customer_name: 'Martín Benítez',
    customer_phone: '+54 9 11 6543-2109',
    device_model: 'iPhone 12 128GB',
    battery_health: 82,
    condition: 'Bueno - Detalles leves en esquinas, pantalla impecable.',
    has_box: true,
    photos: [
      'https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&w=400&q=80',
    ],
    status: 'cotizado',
    offered_value_usd: 280,
    admin_notes: 'Equipo verificado. Pantalla original TrueTone activa.',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 10).toISOString(),
  },
  {
    id: 'ti-102',
    customer_name: 'Camila Silva',
    customer_phone: '+54 9 11 7890-1234',
    device_model: 'iPhone 11 64GB',
    battery_health: 79,
    condition: 'Regular - Batería para recambio, marco con detalles de uso.',
    has_box: false,
    photos: [],
    status: 'pendiente_revision',
    offered_value_usd: null,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];
