import { createClient } from '@supabase/supabase-js';
import { PRODUCTS, getProductById as getCentralProductById } from '@/config/products';
import { Coupon, DEFAULT_COUPONS_LIST } from '@/config/shipping';


// Tipos del sistema
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  images?: string[];
  colors?: string[];
  material?: string;
  in_stock?: boolean;
  category: 'plates' | 'cards' | 'accessories' | 'stands' | 'packs' | string;
  type: 'google' | 'tripadvisor' | 'instagram' | 'vcard' | 'airbnb' | 'custom' | string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  unit_price_base?: number;
  has_custom_logo?: boolean;
  has_qr_code?: boolean;
  logo_url?: string;
  logo_price?: number;
  qr_price?: number;
  selected_color?: string;
  business_name?: string;
  initial_redirect_url?: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_province: string;
  shipping_district: string;
  shipping_address: string;
  payment_method: 'tarjeta' | 'yappy' | 'transfer' | 'presencial' | 'efectivo';
  payment_status: 'pending' | 'completed';
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: OrderItem[];
  canal?: 'web' | 'visita' | 'b2b';
  created_at: string;
  tracking_number?: string;
  tracking_courier?: string;
  admin_notes?: string;
  // Cuantos tags no se pudieron asignar por falta de stock fisico.
  tags_pendientes?: number;
}

export interface NfcCard {
  card_id: string;
  owner_id: string;
  owner_name: string;
  owner_email: string;
  label: string;
  target_url: string;
  nfc_target_url?: string;
  qr_target_url?: string;
  group_name?: string;
  is_active: boolean;
  channels?: 'both' | 'nfc' | 'qr';
  type: string;
  claimed?: boolean;
  activation_code?: string;
  // Estado del ciclo de vida del tag fisico:
  //  en_stock    -> grabado, en la caja, sin vender      (claimed:false, is_active:false)
  //  asignado    -> vendido, con dueno, sin configurar   (claimed:true,  is_active:false)
  //  configurado -> el cliente puso su enlace real        (claimed:true,  is_active:true)
  estado?: 'en_stock' | 'asignado' | 'configurado';
  // Tipo de activación comercial: 'venta' (con costo comercial), 'prueba' (demo $0) o 'regalia' (combo/paquete $0)
  tipo_activacion?: 'venta' | 'prueba' | 'regalia';
  precio_venta?: number;
  // Numero de pedido (orders.id) que se llevo este tag
  order_id?: string;
  created_at: string;
}

/**
 * Deriva el estado de un tag. Los 70 tags antiguos no tienen el campo `estado`,
 * asi que se deduce de los dos booleanos que ya existian.
 */
export function derivarEstado(card: Pick<NfcCard, 'estado' | 'claimed' | 'is_active'>): 'en_stock' | 'asignado' | 'configurado' {
  if (card.estado) return card.estado;
  if (!card.claimed) return 'en_stock';
  return card.is_active ? 'configurado' : 'asignado';
}

export interface ScanRecord {
  id: string;
  card_id: string;
  device: string;
  referrer: string;
  scan_type?: 'nfc' | 'qr';
  group_name?: string;
  created_at: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface InventoryBatch {
  id: string; // e.g. LOTE-2026-09A
  product_id: string;
  product_name: string;
  quantity_initial: number;
  quantity_remaining: number;
  unit_cost: number;
  supplier: string;
  received_at: string;
  notes?: string;
  status: 'active' | 'depleted' | 'in_transit';
}

export interface StockMovement {
  id: string;
  created_at: string;
  type: 'entrada_lote' | 'salida_venta' | 'salida_visita' | 'ajuste_manual' | 'merma' | 'devolucion_cancelacion';
  product_name: string;
  quantity_change: number;
  resulting_stock: number;
  reference: string;
}

export interface ProductStockInfo {
  product_id: string;
  sku: string;
  name: string;
  category: string;
  current_stock: number;
  min_alert_stock: number;
  unit_cost: number;
  selling_price: number;
  is_bundle?: boolean;
}

export interface StockAuditItem {
  productId: string;
  productName: string;
  hardwareType: 'stand' | 'plate' | 'card' | 'bundle';
  unclaimedTagsCount: number;
  recordedStock: number;
  difference: number;
  isBalanced: boolean;
}

export interface AbandonedCheckout {
  id: string;
  customer_email: string;
  customer_name?: string;
  customer_phone?: string;
  shipping_province?: string;
  shipping_district?: string;
  items: OrderItem[];
  total: number;
  status: 'abandoned' | 'recovered' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface CustomerSummary {
  email: string;
  name: string;
  phone: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderDate: string;
  province?: string;
  district?: string;
  cardCount: number;
}

export interface B2bQuote {
  id: string;
  name: string;
  email: string;
  phone: string;
  business_name: string;
  quantity: number | string;
  notes?: string;
  status: 'pending' | 'contacted' | 'won' | 'lost';
  created_at: string;
}

// Productos semilla predeterminados desde la constante central de productos
const INITIAL_PRODUCTS: Product[] = PRODUCTS.map((p) => ({
  id: p.id,
  name: p.name,
  description: p.description,
  price: p.price,
  image: p.image,
  images: p.images,
  material: p.material,
  category: (p.category === 'cards' ? 'cards' : p.category === 'plates' ? 'plates' : 'accessories') as any,
  type: 'google'
}));


// Inicializar cliente real de Supabase si existen variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isRealSupabaseConfigured = supabaseUrl !== '' && supabaseKey !== '';

export const supabase = isRealSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export const DEFAULT_SEED_CARDS: NfcCard[] = [
  {
    card_id: 'STT-1001',
    activation_code: 'STT-1001',
    owner_id: 'unassigned',
    owner_name: 'Sin Asignar (Stock)',
    owner_email: 'admin@startap.com.pa',
    label: 'Placa de Mostrador (STT-1001)',
    target_url: 'https://google.com',
    is_active: false,
    claimed: false,
    type: 'google',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString()
  },
  {
    card_id: 'STTT-1001',
    activation_code: 'STTT-1001',
    owner_id: 'unassigned',
    owner_name: 'Sin Asignar (Stock)',
    owner_email: 'admin@startap.com.pa',
    label: 'Tarjeta NFC de Bolsillo (STTT-1001)',
    target_url: 'https://google.com',
    is_active: false,
    claimed: false,
    type: 'google',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString()
  }
];

// MOTOR DE BASE DE DATOS LOCAL (Fallback & Sync)
class LocalDbService {
  public getStorageItem<T>(key: string, defaultValue: T): T {
    if (typeof window !== 'undefined') {
      try {
        const data = localStorage.getItem(key);
        if (data) return JSON.parse(data);
      } catch {
        return defaultValue;
      }
    } else {
      // Leer SIEMPRE la versión más fresca desde el archivo de disco db_store.json en cada petición
      try {
        const fsModule = eval("require('fs')");
        const pathModule = eval("require('path')");
        const storeFile = pathModule.join(process.cwd(), 'db_store.json');

        if (fsModule.existsSync(storeFile)) {
          const fileContent = fsModule.readFileSync(storeFile, 'utf-8');
          const store = JSON.parse(fileContent);
          if (store[key] !== undefined) {
            return store[key];
          }
        }
      } catch (e) {
        console.error('Error leyendo db_store.json:', e);
      }
    }
    return defaultValue;
  }

  public setStorageItem<T>(key: string, value: T): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // Ignorar errores de cuota o modo privado/crawler restringido
      }
      // Notificar al servidor Next.js para sincronizar el archivo de almacenamiento
      fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      }).catch(() => {});
      return;
    }

    // Persistir DIRECTAMENTE en el archivo de disco db_store.json
    try {
      const fsModule = eval("require('fs')");
      const pathModule = eval("require('path')");
      const storeFile = pathModule.join(process.cwd(), 'db_store.json');

      let store: Record<string, any> = {};
      if (fsModule.existsSync(storeFile)) {
        try {
          store = JSON.parse(fsModule.readFileSync(storeFile, 'utf-8'));
        } catch {
          store = {};
        }
      }
      store[key] = value;
      fsModule.writeFileSync(storeFile, JSON.stringify(store, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error escribiendo db_store.json en servidor:', e);
    }
  }

  // Inicializar catálogo local en navegador sin disparar peticiones POST /api/cards ni sembrar datos ficticios
  init() {
    if (typeof window === 'undefined') return;

    try {
      const storedProducts = this.getStorageItem<Product[]>('nfc_products', []);
      const deletedIds = this.getStorageItem<string[]>('nfc_deleted_product_ids', []);

      const currentIds = storedProducts.map(p => p.id.trim().toLowerCase());
      const expectedSeedIds = INITIAL_PRODUCTS
        .map(p => p.id.trim().toLowerCase())
        .filter(id => !deletedIds.includes(id));

      const missingAny = expectedSeedIds.some(id => !currentIds.includes(id));

      if (storedProducts.length === 0 || missingAny) {
        if (storedProducts.length === 0 && deletedIds.length === 0) {
          localStorage.setItem('nfc_products', JSON.stringify(INITIAL_PRODUCTS));
        } else {
          const merged = storedProducts.filter(p => !deletedIds.includes(p.id.trim().toLowerCase()));
          for (const seed of INITIAL_PRODUCTS) {
            const seedIdNorm = seed.id.trim().toLowerCase();
            if (!currentIds.includes(seedIdNorm) && !deletedIds.includes(seedIdNorm)) {
              merged.push(seed);
            }
          }
          localStorage.setItem('nfc_products', JSON.stringify(merged));
        }
      }
    } catch {
      // Ignorar si localStorage está restringido (ej. crawlers o modo incógnito estricto)
    }
  }

  // Métodos de Productos
  getProducts(): Product[] {
    const stored = this.getStorageItem<Product[]>('nfc_products', []);
    const deletedIds = this.getStorageItem<string[]>('nfc_deleted_product_ids', []).map(id => id.trim().toLowerCase());

    const productMap = new Map<string, Product>();

    // 1. Cargar semillas iniciales de config/products.ts como base
    for (const seed of INITIAL_PRODUCTS) {
      const seedIdNorm = seed.id.trim().toLowerCase();
      if (!deletedIds.includes(seedIdNorm)) {
        productMap.set(seedIdNorm, { ...seed });
      }
    }

    // 2. Aplicar sobre-escrituras y/o productos nuevos guardados en nfc_products
    if (Array.isArray(stored)) {
      for (const p of stored) {
        if (!p || !p.id) continue;
        const normId = p.id.trim().toLowerCase();
        if (deletedIds.includes(normId)) continue;

        const existing = productMap.get(normId);
        if (existing) {
          productMap.set(normId, {
            ...existing,
            ...p,
            name: p.name || existing.name,
            description: p.description !== undefined ? p.description : existing.description,
            price: p.price ?? existing.price,
            image: p.image || existing.image,
            images: p.images && p.images.length > 0 ? p.images : existing.images,
            material: p.material !== undefined ? p.material : existing.material,
            category: p.category || existing.category,
            type: p.type || existing.type,
            in_stock: p.in_stock !== undefined ? p.in_stock : existing.in_stock
          });
        } else {
          productMap.set(normId, {
            ...p,
            category: p.category || 'plates',
            type: p.type || 'google'
          });
        }
      }
    }

    return Array.from(productMap.values());
  }

  getProductById(id: string): Product | undefined {
    const normalizedId = id.trim().toLowerCase();
    const deletedIds = this.getStorageItem<string[]>('nfc_deleted_product_ids', []).map(d => d.trim().toLowerCase());
    if (deletedIds.includes(normalizedId)) return undefined;

    return this.getProducts().find(p => p.id.trim().toLowerCase() === normalizedId);
  }

  // Consultar stock físico disponible por ID de producto o alias
  getProductStock(productId: string): number {
    const normId = (productId || '').trim().toLowerCase();
    const productStocks = this.getStorageItem<Record<string, any>>('inventory_product_stocks', {});

    // 1. Coincidencia directa por ID exacto de producto (ej. placa-google, tarjeta-nfc)
    if (productStocks[normId] && typeof productStocks[normId].current_stock === 'number') {
      return Math.max(0, productStocks[normId].current_stock);
    }

    // 2. Normalizar ID a llaves canónicas
    let stockKey = normId;
    if (normId.includes('placa') || normId === 'nfc_10001' || normId === 'placa-google') {
      stockKey = 'placa-nfc-mostrador';
    } else if (normId.includes('tarjeta') || normId === 'tarjeta-nfc') {
      stockKey = 'tarjeta-nfc-bolsillo';
    } else if (normId.includes('stand') || normId === 'nfc10002') {
      stockKey = 'stand-nfc-mesa';
    } else if (normId.includes('pack')) {
      stockKey = 'pack-trio-comercial';
    }

    if (stockKey === 'pack-trio-comercial') {
      const placaStock = this.getProductStock('placa-nfc-mostrador');
      const tarjetaStock = this.getProductStock('tarjeta-nfc-bolsillo');
      return Math.min(placaStock, Math.floor(tarjetaStock / 2));
    }

    if (productStocks[stockKey] && typeof productStocks[stockKey].current_stock === 'number') {
      return Math.max(0, productStocks[stockKey].current_stock);
    }

    // 3. Búsqueda por subcadena en las llaves del inventario
    for (const [key, item] of Object.entries(productStocks)) {
      if (!item || typeof item.current_stock !== 'number') continue;
      const keyNorm = key.trim().toLowerCase();
      if (keyNorm.includes(normId) || normId.includes(keyNorm)) {
        return Math.max(0, item.current_stock);
      }
    }

    // Default fallbacks para productos no inicializados
    if (stockKey === 'placa-nfc-mostrador') return 50;
    if (stockKey === 'tarjeta-nfc-bolsillo') return 20;
    if (stockKey === 'stand-nfc-mesa') return 0;
    return 10;
  }

  isProductInStock(productId: string, quantityRequested: number = 1): boolean {
    return this.getProductStock(productId) >= quantityRequested;
  }

  validateOrderItemsStock(items: Array<{ product_id: string; product_name?: string; quantity: number }>): { valid: boolean; outOfStockItem?: string; message?: string } {
    for (const item of items) {
      const reqQty = item.quantity || 1;
      const stock = this.getProductStock(item.product_id);
      if (stock < reqQty) {
        const name = item.product_name || item.product_id;
        if (stock === 0) {
          return {
            valid: false,
            outOfStockItem: name,
            message: `El producto "${name}" se encuentra AGOTADO (stock 0) y no se puede vender.`
          };
        } else {
          return {
            valid: false,
            outOfStockItem: name,
            message: `Solo quedan ${stock} unidades disponibles del producto "${name}". No es posible comprar ${reqQty}.`
          };
        }
      }
    }
    return { valid: true };
  }

  updateProductPrice(id: string, newPrice: number): boolean {
    return this.updateFullProduct(id, { price: newPrice });
  }

  updateFullProduct(id: string, updates: Partial<Product>): boolean {
    const normId = id.trim().toLowerCase();
    const products = this.getProducts();
    const index = products.findIndex(p => p.id.trim().toLowerCase() === normId);

    let updatedProduct: Product;
    if (index !== -1) {
      updatedProduct = {
        ...products[index],
        ...updates
      };
      products[index] = updatedProduct;
    } else {
      updatedProduct = {
        id,
        name: updates.name || id,
        description: updates.description || '',
        price: updates.price || 0,
        image: updates.image || '',
        images: updates.images || (updates.image ? [updates.image] : []),
        material: updates.material || '',
        category: updates.category || 'plates',
        type: updates.type || 'google',
        ...updates
      };
      products.push(updatedProduct);
    }

    this.setStorageItem('nfc_products', products);

    if (supabase) {
      supabase.from('products').upsert(updatedProduct).then(({ error }) => {
        if (error) console.error('Error actualizando producto en Supabase:', error);
      });
    }

    return true;
  }

  toggleProductStock(id: string, in_stock: boolean): boolean {
    return this.updateFullProduct(id, { in_stock });
  }

  createProduct(product: Product): boolean {
    const normalizedId = product.id.trim().toLowerCase();

    // Si el producto fue eliminado previamente, reactivarlo removiéndolo de la lista de eliminados
    const deletedIds = this.getStorageItem<string[]>('nfc_deleted_product_ids', []);
    if (deletedIds.map(d => d.trim().toLowerCase()).includes(normalizedId)) {
      const updatedDeleted = deletedIds.filter(d => d.trim().toLowerCase() !== normalizedId);
      this.setStorageItem('nfc_deleted_product_ids', updatedDeleted);
    }

    return this.updateFullProduct(product.id, product);
  }

  deleteProduct(id: string): boolean {
    const normalizedId = id.trim().toLowerCase();

    // 1. Guardar el id en la lista persistente de productos eliminados para evitar resembrado
    const deletedIds = this.getStorageItem<string[]>('nfc_deleted_product_ids', []);
    if (!deletedIds.map(d => d.trim().toLowerCase()).includes(normalizedId)) {
      deletedIds.push(normalizedId);
      this.setStorageItem('nfc_deleted_product_ids', deletedIds);
    }

    // 2. Filtrar de la lista de productos
    const products = this.getProducts().filter(p => p.id.trim().toLowerCase() !== normalizedId);
    this.setStorageItem('nfc_products', products);

    // 3. Eliminar de Supabase si está configurado
    if (supabase) {
      supabase.from('products').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Error eliminando producto en Supabase:', error);
      });
    }
    return true;
  }

  // Métodos de Cupones de Descuento
  getCoupons(): Coupon[] {
    const coupons = this.getStorageItem<Coupon[]>('nfc_coupons', DEFAULT_COUPONS_LIST);
    if (!coupons || coupons.length === 0) {
      return DEFAULT_COUPONS_LIST;
    }
    return coupons;
  }

  saveCoupon(coupon: Coupon): Coupon[] {
    const coupons = this.getCoupons();
    const codeNorm = (coupon.code || '').trim().toUpperCase();
    const existingIdx = coupons.findIndex(c => (c.code || '').trim().toUpperCase() === codeNorm);

    const updatedCoupon: Coupon = {
      ...coupon,
      code: codeNorm,
      is_active: coupon.is_active ?? true,
      created_at: coupon.created_at || new Date().toISOString()
    };

    if (existingIdx !== -1) {
      coupons[existingIdx] = updatedCoupon;
    } else {
      coupons.unshift(updatedCoupon);
    }

    this.setStorageItem('nfc_coupons', coupons);
    return coupons;
  }

  toggleCouponActive(code: string, is_active: boolean): Coupon[] {
    const coupons = this.getCoupons();
    const codeNorm = (code || '').trim().toUpperCase();
    const idx = coupons.findIndex(c => (c.code || '').trim().toUpperCase() === codeNorm);
    if (idx !== -1) {
      coupons[idx].is_active = is_active;
      this.setStorageItem('nfc_coupons', coupons);
    }
    return coupons;
  }

  deleteCoupon(code: string): Coupon[] {
    const coupons = this.getCoupons();
    const codeNorm = (code || '').trim().toUpperCase();
    const filtered = coupons.filter(c => (c.code || '').trim().toUpperCase() !== codeNorm);
    this.setStorageItem('nfc_coupons', filtered);
    return filtered;
  }

  // Métodos de Pedidos
  getOrders(): Order[] {
    return this.getStorageItem('nfc_orders', []);
  }

  async getOrdersAsync(): Promise<Order[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          this.setStorageItem('nfc_orders', data);
          return data;
        }
      } catch (err) {
        console.error('Error cargando órdenes desde Supabase:', err);
      }
    }
    return this.getOrders();
  }

  getOrderById(id: string): Order | undefined {
    return this.getOrders().find(o => o.id === id);
  }

  // Generador de Códigos Secuenciales (STT-XXXX para Placas / STTS-XXXX para Stands / STTT-XXXX para Tarjetas)
  getNextStickerCode(deviceType: string = 'plate'): string {
    const cards = this.getCards();
    const typeStr = (deviceType || '').toLowerCase();
    const isStand = typeStr.includes('stand') || typeStr.includes('stts') || typeStr.includes('mesa');
    const isCard = !isStand && (typeStr.includes('card') || typeStr.includes('tarjeta') || typeStr.includes('sttt') || typeStr.includes('bolsillo'));
    const prefix = isStand ? 'STTS' : isCard ? 'STTT' : 'STT';
    let maxNumber = 1000;

    cards.forEach(c => {
      const codeId = (c.activation_code || c.card_id || '').toUpperCase();
      if (isStand) {
        const match = codeId.match(/^STTS-(\d+)/i);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxNumber) maxNumber = num;
        }
      } else if (isCard) {
        const match = codeId.match(/^STTT-(\d+)/i);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxNumber) maxNumber = num;
        }
      } else {
        const match = codeId.match(/^STT-(\d+)/i);
        if (match && match[1] && !codeId.startsWith('STTT-') && !codeId.startsWith('STTS-')) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxNumber) maxNumber = num;
        }
      }
    });

    const nextNum = maxNumber + 1;
    return `${prefix}-${nextNum}`;
  }

  createOrder(orderData: Omit<Order, 'id' | 'created_at'> & { id?: string }): Order {
    const orders = this.getOrders();
    const newOrder: Order = {
      ...orderData,
      id: orderData.id || `PED-${Math.floor(1000 + Math.random() * 9000)}`,
      created_at: new Date().toISOString()
    };
    const existingIdx = orders.findIndex(o => o.id === newOrder.id);
    if (existingIdx !== -1) {
      orders[existingIdx] = { ...orders[existingIdx], ...newOrder };
    } else {
      orders.unshift(newOrder);
    }
    this.setStorageItem('nfc_orders', orders);

    // Los tags YA NO se crean al vender: existen fisicamente antes del pedido.
    // La asignacion de tags en stock la hace el servidor en /api/pedidos.

    // Descontar inventario físico en inventory_product_stocks
    const productStocks = this.getStorageItem<Record<string, any>>('inventory_product_stocks', {});
    let stocksUpdated = false;

    newOrder.items.forEach((item) => {
      const pId = (item.product_id || '').toLowerCase();
      const pName = (item.product_name || '').toLowerCase();
      const isPack = pId.includes('pack-trio') || pId.includes('pack') || pName.includes('pack');
      const qty = item.quantity || 1;

      if (isPack) {
        // Descontar 1 Placa y 2 Tarjetas por cada pack
        const placaKey = Object.keys(productStocks).find(k => k.includes('placa')) || 'placa-nfc-mostrador';
        const tarjetaKey = Object.keys(productStocks).find(k => k.includes('tarjeta')) || 'tarjeta-nfc-bolsillo';

        if (productStocks[placaKey]) {
          productStocks[placaKey].current_stock = Math.max(0, productStocks[placaKey].current_stock - (1 * qty));
          stocksUpdated = true;
        }
        if (productStocks[tarjetaKey]) {
          productStocks[tarjetaKey].current_stock = Math.max(0, productStocks[tarjetaKey].current_stock - (2 * qty));
          stocksUpdated = true;
        }
      } else if (productStocks[item.product_id]) {
        productStocks[item.product_id].current_stock = Math.max(0, productStocks[item.product_id].current_stock - qty);
        stocksUpdated = true;
      }
    });

    if (stocksUpdated) {
      // Recalcular stock combo autocalculado del Pack Trío
      const placaKey = Object.keys(productStocks).find(k => k.includes('placa')) || 'placa-nfc-mostrador';
      const tarjetaKey = Object.keys(productStocks).find(k => k.includes('tarjeta')) || 'tarjeta-nfc-bolsillo';
      const packKey = Object.keys(productStocks).find(k => k.includes('pack')) || 'pack-trio-comercial';

      if (productStocks[packKey] && productStocks[placaKey] && productStocks[tarjetaKey]) {
        const pStock = productStocks[placaKey].current_stock;
        const tStock = productStocks[tarjetaKey].current_stock;
        productStocks[packKey].current_stock = Math.min(pStock, Math.floor(tStock / 2));
      }

      this.setStorageItem('inventory_product_stocks', productStocks);
    }

    // Sincronización Real-Time con Supabase
    if (supabase) {
      supabase.from('orders').upsert([{
        id: newOrder.id,
        customer_name: newOrder.customer_name,
        customer_email: newOrder.customer_email,
        customer_phone: newOrder.customer_phone,
        shipping_province: newOrder.shipping_province,
        shipping_district: newOrder.shipping_district,
        shipping_address: newOrder.shipping_address,
        payment_method: newOrder.payment_method,
        payment_status: newOrder.payment_status,
        status: newOrder.status,
        total: newOrder.total,
        items: newOrder.items,
        created_at: newOrder.created_at
      }]).then(({ error }) => {
        if (error) console.error('Error sincronizando orden en Supabase:', error);
      });
    }

    return newOrder;
  }

  updateOrderStatus(orderId: string, status: Order['status']): void {
    const orders = this.getOrders();
    const updated = orders.map(o => o.id === orderId ? { ...o, status } : o);
    this.setStorageItem('nfc_orders', updated);
  }

  updateOrderPaymentStatus(orderId: string, payment_status: Order['payment_status']): void {
    const orders = this.getOrders();
    const updated = orders.map(o => o.id === orderId ? { ...o, payment_status } : o);
    this.setStorageItem('nfc_orders', updated);
    if (supabase) {
      supabase.from('orders').update({ payment_status }).eq('id', orderId).then(({ error }) => {
        if (error) console.error('Error actualizando estado de pago en Supabase:', error);
      });
    }
  }

  updateOrderDetails(orderId: string, updates: Partial<Order>): void {
    const orders = this.getOrders();
    const updated = orders.map(o => o.id === orderId ? { ...o, ...updates } : o);
    this.setStorageItem('nfc_orders', updated);
    if (supabase) {
      supabase.from('orders').update(updates).eq('id', orderId).then();
    }
  }

  deleteOrder(orderId: string): boolean {
    const orders = this.getOrders();
    const filtered = orders.filter(o => o.id !== orderId);
    this.setStorageItem('nfc_orders', filtered);
    if (supabase) {
      supabase.from('orders').delete().eq('id', orderId).then();
    }
    return true;
  }

  clearAllOrders(): boolean {
    this.setStorageItem('nfc_orders', []);
    if (supabase) {
      supabase.from('orders').delete().neq('id', '0').then(({ error }) => {
        if (error) console.error('Error eliminando todas las órdenes en Supabase:', error);
      });
    }
    return true;
  }

  // Métodos CRM de Clientes
  getCustomersSummary(): CustomerSummary[] {
    const orders = this.getOrders();
    const cards = this.getCards();
    const users = this.getUsers();

    const map: { [email: string]: CustomerSummary } = {};

    orders.forEach((o) => {
      const email = (o.customer_email || '').trim().toLowerCase();
      if (!email || email === 'admin@startap.com.pa' || email === 'info@startap.com.pa') return;

      if (!map[email]) {
        map[email] = {
          email,
          name: o.customer_name || email.split('@')[0],
          phone: o.customer_phone || '',
          ordersCount: 0,
          totalSpent: 0,
          lastOrderDate: o.created_at,
          province: o.shipping_province,
          district: o.shipping_district,
          cardCount: 0,
        };
      }

      map[email].ordersCount += 1;
      map[email].totalSpent += o.total || 0;
      if (new Date(o.created_at) > new Date(map[email].lastOrderDate)) {
        map[email].lastOrderDate = o.created_at;
      }
      if (o.customer_phone && !map[email].phone) {
        map[email].phone = o.customer_phone;
      }
      if (o.customer_name && map[email].name === email.split('@')[0]) {
        map[email].name = o.customer_name;
      }
      if (o.shipping_province) {
        map[email].province = o.shipping_province;
        map[email].district = o.shipping_district;
      }
    });

    cards.forEach((c) => {
      const email = (c.owner_email || '').trim().toLowerCase();
      if (!email || email === 'admin@startap.com.pa' || email === 'info@startap.com.pa' || email === 'unassigned') return;

      if (!map[email]) {
        map[email] = {
          email,
          name: c.owner_name || email.split('@')[0],
          phone: '',
          ordersCount: 0,
          totalSpent: 0,
          lastOrderDate: c.created_at || new Date().toISOString(),
          cardCount: 0,
        };
      }

      map[email].cardCount += 1;
      if (c.owner_name && map[email].name === email.split('@')[0]) {
        map[email].name = c.owner_name;
      }
    });

    users.forEach((u) => {
      const email = (u.email || '').trim().toLowerCase();
      if (!email || email === 'admin@startap.com.pa' || email === 'info@startap.com.pa') return;

      if (!map[email]) {
        map[email] = {
          email,
          name: u.name || email.split('@')[0],
          phone: '',
          ordersCount: 0,
          totalSpent: 0,
          lastOrderDate: u.created_at,
          cardCount: 0,
        };
      }
    });

    return Object.values(map).sort((a, b) => b.totalSpent - a.totalSpent);
  }

  // Métodos de Cotizaciones Corporativas B2B
  getB2bQuotes(): B2bQuote[] {
    return this.getStorageItem<B2bQuote[]>('nfc_b2b_quotes', []);
  }

  async getB2bQuotesAsync(): Promise<B2bQuote[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('b2b_quotes')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          this.setStorageItem('nfc_b2b_quotes', data);
          return data;
        }
      } catch (err) {
        console.error('Error cargando cotizaciones B2B desde Supabase:', err);
      }
    }
    return this.getB2bQuotes();
  }

  saveB2bQuote(data: Omit<B2bQuote, 'id' | 'created_at'> & { id?: string }): B2bQuote {
    const list = this.getB2bQuotes();
    const newQuote: B2bQuote = {
      ...data,
      id: data.id || `B2B-${Math.floor(1000 + Math.random() * 9000)}`,
      status: data.status || 'pending',
      created_at: new Date().toISOString(),
    };
    list.unshift(newQuote);
    this.setStorageItem('nfc_b2b_quotes', list);
    if (supabase) {
      supabase.from('b2b_quotes').upsert([newQuote]).then();
    }
    return newQuote;
  }

  updateB2bQuoteStatus(id: string, status: B2bQuote['status']): void {
    const list = this.getB2bQuotes();
    const updated = list.map((q) => (q.id === id ? { ...q, status } : q));
    this.setStorageItem('nfc_b2b_quotes', updated);
    if (supabase) {
      supabase.from('b2b_quotes').update({ status }).eq('id', id).then();
    }
  }

  deleteB2bQuote(id: string): void {
    const list = this.getB2bQuotes();
    this.setStorageItem('nfc_b2b_quotes', list.filter((q) => q.id !== id));
    if (supabase) {
      supabase.from('b2b_quotes').delete().eq('id', id).then();
    }
  }

  // Métodos de Carritos / Pedidos Abandonados (Shopify Style)
  getAbandonedCheckouts(): AbandonedCheckout[] {
    return this.getStorageItem<AbandonedCheckout[]>('nfc_abandoned_checkouts', []);
  }

  async getAbandonedCheckoutsAsync(): Promise<AbandonedCheckout[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('abandoned_checkouts')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          this.setStorageItem('nfc_abandoned_checkouts', data);
          return data;
        }
      } catch (err) {
        console.error('Error cargando carritos abandonados desde Supabase:', err);
      }
    }
    return this.getAbandonedCheckouts();
  }

  saveAbandonedCheckout(data: Omit<AbandonedCheckout, 'created_at' | 'updated_at'>): AbandonedCheckout {
    if (typeof window === 'undefined') return data as AbandonedCheckout;
    const list = this.getAbandonedCheckouts();
    const cleanEmail = (data.customer_email || '').trim().toLowerCase();
    const existingIndex = list.findIndex(
      (c) => c.id === data.id || (cleanEmail && c.customer_email.trim().toLowerCase() === cleanEmail && c.status === 'abandoned')
    );

    const now = new Date().toISOString();
    let record: AbandonedCheckout;

    if (existingIndex > -1) {
      record = {
        ...list[existingIndex],
        ...data,
        updated_at: now,
      };
      list[existingIndex] = record;
    } else {
      record = {
        ...data,
        created_at: now,
        updated_at: now,
      };
      list.unshift(record);
    }

    this.setStorageItem('nfc_abandoned_checkouts', list);

    if (supabase) {
      supabase.from('abandoned_checkouts').upsert([record]).then();
    }

    return record;
  }

  markAbandonedCheckoutCompleted(emailOrPhone: string): void {
    if (typeof window === 'undefined') return;
    const list = this.getAbandonedCheckouts();
    const clean = (emailOrPhone || '').trim().toLowerCase();
    const updated = list.map((c) => {
      if (
        c.customer_email.trim().toLowerCase() === clean ||
        (c.customer_phone && c.customer_phone.includes(clean))
      ) {
        return { ...c, status: 'completed' as const, updated_at: new Date().toISOString() };
      }
      return c;
    });
    this.setStorageItem('nfc_abandoned_checkouts', updated);
    if (supabase) {
      supabase.from('abandoned_checkouts')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .or(`customer_email.ilike.%${clean}%,customer_phone.ilike.%${clean}%`).then();
    }
  }

  deleteAbandonedCheckout(id: string): void {
    if (typeof window === 'undefined') return;
    const list = this.getAbandonedCheckouts();
    this.setStorageItem('nfc_abandoned_checkouts', list.filter((c) => c.id !== id));
    if (supabase) {
      supabase.from('abandoned_checkouts').delete().eq('id', id).then();
    }
  }

  // Métodos de Tarjetas NFC
  getCards(): NfcCard[] {
    // Sin techos de numeracion: los lotes nuevos (STT-1051 en adelante) tambien valen.
    return this.getStorageItem('nfc_cards', DEFAULT_SEED_CARDS);
  }

  async getCardsAsync(): Promise<NfcCard[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('nfc_cards').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          // Se guarda la lista COMPLETA: antes se recortaba por un techo de
          // numeracion y eso borraba del storage los tags de lotes nuevos.
          const todas = data as NfcCard[];
          this.setStorageItem('nfc_cards', todas);
          return todas;
        }
      } catch (err) {
        console.error('Error cargando tarjetas desde Supabase:', err);
      }
    }
    return this.getCards();
  }

  getCardsByOwner(emailOrId: string): NfcCard[] {
    const cleanEmail = emailOrId.trim().toLowerCase();
    const isAdminAccount = cleanEmail === 'admin@startap.com.pa' || cleanEmail === 'info@startap.com.pa';
    return this.getCards().filter(c => {
      const cardEmail = (c.owner_email || '').trim().toLowerCase();
      if (!cardEmail) return false;
      if (cardEmail === cleanEmail) {
        return isAdminAccount ? true : (cardEmail !== 'admin@startap.com.pa' && cardEmail !== 'info@startap.com.pa');
      }
      return Boolean(c.claimed) && c.owner_id && c.owner_id === emailOrId && c.owner_id !== 'admin' && c.owner_id !== 'unassigned';
    });
  }

  async getCardsByOwnerAsync(emailOrId: string): Promise<NfcCard[]> {
    const cleanEmail = emailOrId.trim().toLowerCase();
    const isAdminAccount = cleanEmail === 'admin@startap.com.pa' || cleanEmail === 'info@startap.com.pa';

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('nfc_cards')
          .select('*')
          .or(`owner_email.ilike.${cleanEmail},owner_id.eq.${emailOrId}`);

        if (!error && data) {
          const userCards = (data as NfcCard[]).filter(c => {
            const cardEmail = (c.owner_email || '').trim().toLowerCase();
            if (cardEmail === cleanEmail) {
              return isAdminAccount ? true : (cardEmail !== 'admin@startap.com.pa' && cardEmail !== 'info@startap.com.pa');
            }
            return Boolean(c.claimed) && c.owner_id === emailOrId && c.owner_id !== 'admin' && c.owner_id !== 'unassigned';
          });

          // Auto-vinculación: Si el cliente inicia sesión y tiene tarjetas pre-asignadas a su correo
          // que aún no estaban marcadas como claimed o con su owner_id, vincularlas de inmediato
          if (!isAdminAccount && userCards.length > 0) {
            const toUpdate = userCards.filter(c => !c.claimed || c.owner_id !== emailOrId);
            if (toUpdate.length > 0) {
              const idsToUpdate = toUpdate.map(c => c.card_id);
              supabase
                .from('nfc_cards')
                .update({ claimed: true, owner_id: emailOrId })
                .in('card_id', idsToUpdate)
                .then(({ error: errUpd }) => {
                  if (errUpd) console.error('Error auto-vinculando tarjetas a usuario:', errUpd);
                });
              toUpdate.forEach(c => {
                c.claimed = true;
                c.owner_id = emailOrId;
              });
            }
          }

          const currentCards = this.getCards();
          userCards.forEach(remoteCard => {
            const idx = currentCards.findIndex(c => c.card_id === remoteCard.card_id);
            if (idx !== -1) {
              currentCards[idx] = remoteCard;
            } else {
              currentCards.unshift(remoteCard);
            }
          });
          this.setStorageItem('nfc_cards', currentCards);
          return userCards;
        }
      } catch (err) {
        console.error('Error cargando tarjetas por usuario desde Supabase:', err);
      }
    }
    return this.getCardsByOwner(emailOrId);
  }

  private resolveCardId(cardId: string, cards: NfcCard[]): string {
    let clean = cardId.trim().toLowerCase();
    
    // Direct match check
    const direct = cards.find(c => 
      c.card_id.toLowerCase() === clean || 
      (c.activation_code && c.activation_code.toLowerCase() === clean)
    );
    if (direct) return direct.card_id;

    // Pattern STTT-X or STT-X -> STTT-100X (ej. STTT-1 -> STTT-1001)
    const sttMatch = clean.match(/^(?:sttt|stt)-(\d+)$/i);
    if (sttMatch && sttMatch[1]) {
      // Sin techo de numeracion: cualquier lote se puede resolver.
      const num = parseInt(sttMatch[1], 10);
      const fullCode = num < 1000 ? `sttt-${1000 + num}` : `sttt-${num}`;
      const altCode = num < 1000 ? `stt-${1000 + num}` : `stt-${num}`;
      const found = cards.find(c => 
        c.card_id.toLowerCase() === fullCode || 
        c.card_id.toLowerCase() === altCode ||
        (c.activation_code && (c.activation_code.toLowerCase() === fullCode || c.activation_code.toLowerCase() === altCode))
      );
      if (found) return found.card_id;
    }

    // Number only "1" -> "STTT-1001"
    const numOnly = parseInt(clean, 10);
    if (!isNaN(numOnly)) {
      const targetCode = numOnly < 1000 ? `sttt-${1000 + numOnly}` : `sttt-${numOnly}`;
      const altTarget = numOnly < 1000 ? `stt-${1000 + numOnly}` : `stt-${numOnly}`;
      const found = cards.find(c => 
        c.card_id.toLowerCase() === targetCode || 
        c.card_id.toLowerCase() === altTarget ||
        (c.activation_code && (c.activation_code.toLowerCase() === targetCode || c.activation_code.toLowerCase() === altTarget))
      );
      if (found) return found.card_id;
    }

    return clean;
  }

  findCardById(cardId: string): NfcCard | null {
    const cards = this.getCards();
    const resolvedId = this.resolveCardId(cardId, cards);
    
    let found = cards.find(c => 
      c.card_id.toLowerCase() === resolvedId.toLowerCase() || 
      (c.activation_code && c.activation_code.toLowerCase() === resolvedId.toLowerCase())
    );

    return found || null;
  }

  getCardById(cardId: string): NfcCard {
    const found = this.findCardById(cardId);
    if (found) return found;

    const cards = this.getCards();
    const resolvedId = this.resolveCardId(cardId, cards);
    const cleanCode = resolvedId.toUpperCase();
    const autoCard: NfcCard = {
      card_id: cleanCode,
      activation_code: cleanCode,
      owner_id: 'unassigned',
      owner_name: 'Pendiente de Habilitación',
      owner_email: 'admin@startap.com.pa',
      label: `Dispositivo TAP (${cleanCode})`,
      target_url: 'https://google.com',
      is_active: false, // INACTIVO HASTA QUE EL ADMIN LO HABILITE
      channels: 'both',
      claimed: false,
      type: 'google',
      created_at: new Date().toISOString()
    };

    cards.push(autoCard);
    this.setStorageItem('nfc_cards', cards);
    return autoCard;
  }

  toggleCardActive(cardId: string, isActive: boolean): boolean {
    const cards = this.getCards();
    const resolvedId = this.resolveCardId(cardId, cards);
    const index = cards.findIndex(c => c.card_id.toLowerCase() === resolvedId.toLowerCase());

    if (index !== -1) {
      cards[index].is_active = isActive;
      this.setStorageItem('nfc_cards', cards);
      if (supabase) {
        supabase.from('nfc_cards').update({ is_active: isActive }).eq('card_id', cards[index].card_id).then();
      }
      return true;
    }
    return false;
  }

  updateCardChannels(cardId: string, channels: 'both' | 'nfc' | 'qr'): boolean {
    const cards = this.getCards();
    const resolvedId = this.resolveCardId(cardId, cards);
    const index = cards.findIndex(c => c.card_id.toLowerCase() === resolvedId.toLowerCase());

    if (index !== -1) {
      cards[index].channels = channels;
      this.setStorageItem('nfc_cards', cards);
      if (supabase) {
        supabase.from('nfc_cards').update({ channels }).eq('card_id', cards[index].card_id).then();
      }
      return true;
    }
    return false;
  }

  createAdminCard(cardId: string, channels: 'both' | 'nfc' | 'qr' = 'both', isActive: boolean = true, label: string = ''): NfcCard {
    const cards = this.getCards();
    const cleanCode = cardId.trim().toUpperCase();
    
    const existingIndex = cards.findIndex(c => c.card_id.toLowerCase() === cleanCode.toLowerCase());
    if (existingIndex !== -1) {
      cards[existingIndex].is_active = isActive;
      cards[existingIndex].channels = channels;
      if (label) cards[existingIndex].label = label;
      this.setStorageItem('nfc_cards', cards);
      return cards[existingIndex];
    }

    const newCard: NfcCard = {
      card_id: cleanCode,
      activation_code: cleanCode,
      owner_id: 'admin',
      owner_name: 'Administrador starTAP',
      owner_email: 'admin@startap.com.pa',
      label: label || `Placa TAP (${cleanCode})`,
      target_url: 'https://google.com',
      is_active: isActive,
      channels: channels,
      claimed: false,
      type: 'google',
      created_at: new Date().toISOString()
    };

    cards.push(newCard);
    this.setStorageItem('nfc_cards', cards);

    if (supabase) {
      supabase.from('nfc_cards').upsert(newCard).then();
    }

    return newCard;
  }

  /** Un enlace se considera real si no esta vacio ni es el generico de Google. */
  private esUrlReal(url: string): boolean {
    const u = (url || '').trim().toLowerCase();
    if (!u) return false;
    if (u === 'https://google.com' || u === 'http://google.com' || u === 'https://google.com/' || u === 'https://www.google.com') return false;
    if (u.includes('placeid=...')) return false;
    return u.startsWith('http://') || u.startsWith('https://');
  }

  /**
   * Marca un tag como 'configurado' (se enciende y empieza a redirigir) cuando el
   * cliente guarda su enlace real por primera vez sobre un tag en estado 'asignado'.
   */
  marcarTagConfigurado(cardId: string, targetUrl: string): { success: boolean; message: string } {
    const cards = this.getCards();
    const resolvedId = this.resolveCardId(cardId, cards);
    const index = cards.findIndex(c =>
      c.card_id.toLowerCase() === resolvedId.toLowerCase() ||
      (c.activation_code && c.activation_code.toLowerCase() === resolvedId.toLowerCase())
    );
    if (index === -1) return { success: false, message: 'No encontramos ese tag.' };
    if (!this.esUrlReal(targetUrl)) return { success: false, message: 'El enlace no es valido todavia.' };
    if (derivarEstado(cards[index]) === 'en_stock') return { success: false, message: 'Ese tag aun no se ha vendido.' };

    cards[index].estado = 'configurado';
    cards[index].claimed = true;
    cards[index].is_active = true;
    cards[index].target_url = targetUrl.trim();
    this.setStorageItem('nfc_cards', cards);

    if (supabase) {
      supabase.from('nfc_cards')
        .update({ estado: 'configurado', claimed: true, is_active: true, target_url: targetUrl.trim() })
        .eq('card_id', cards[index].card_id)
        .then(({ error }) => {
          if (error) console.error('Error marcando tag como configurado en Supabase:', error);
        });
    }
    return { success: true, message: 'Tag configurado y activo.' };
  }

  updateCardRedirect(cardId: string, nfcUrl: string, qrUrl: string, label: string, groupName: string = 'General', requestingEmail?: string): { success: boolean; message: string } {
    const cards = this.getCards();
    const resolvedId = this.resolveCardId(cardId, cards);
    const cleanNfcUrl = nfcUrl.trim();
    const cleanQrUrl = qrUrl.trim();
    const primaryUrl = cleanNfcUrl || cleanQrUrl || 'https://google.com';

    const index = cards.findIndex(c => 
      c.card_id.toLowerCase() === resolvedId.toLowerCase() || 
      (c.activation_code && c.activation_code.toLowerCase() === resolvedId.toLowerCase())
    );

    if (index !== -1) {
      const card = cards[index];
      // Verificación de Seguridad Multi-Tenant
      if (requestingEmail && card.claimed && card.owner_email && card.owner_email.trim().toLowerCase() !== requestingEmail.trim().toLowerCase()) {
        return { success: false, message: 'Acceso Denegado: Este dispositivo está asignado a otra cuenta comercial.' };
      }

      cards[index].target_url = primaryUrl;
      cards[index].nfc_target_url = cleanNfcUrl;
      cards[index].qr_target_url = cleanQrUrl;
      cards[index].group_name = groupName || 'General';
      if (label) cards[index].label = label;
      if (requestingEmail) cards[index].owner_email = requestingEmail.trim().toLowerCase();

      // Activacion al configurar: si el tag estaba 'asignado' (vendido pero apagado)
      // y el cliente acaba de poner un enlace real, pasa a 'configurado' y empieza
      // a redirigir. Un enlace vacio o el generico google.com no cuenta como real.
      if (derivarEstado(cards[index]) === 'asignado' && this.esUrlReal(primaryUrl)) {
        cards[index].estado = 'configurado';
        cards[index].claimed = true;
        cards[index].is_active = true;
      }
    } else {
      const cleanCode = resolvedId.toUpperCase();
      cards.push({
        card_id: cleanCode,
        activation_code: cleanCode,
        owner_id: 'user-auto',
        owner_name: requestingEmail ? requestingEmail.split('@')[0] : 'Cliente TapStar',
        owner_email: requestingEmail ? requestingEmail.trim().toLowerCase() : 'cliente@tapstar.es',
        label: label || `Dispositivo TAP (${cleanCode})`,
        target_url: primaryUrl,
        nfc_target_url: cleanNfcUrl,
        qr_target_url: cleanQrUrl,
        group_name: groupName || 'General',
        is_active: false, // REQUIERE HABILITACIÓN DE ADMIN
        claimed: true,
        type: 'google',
        created_at: new Date().toISOString()
      });
    }

    this.setStorageItem('nfc_cards', cards);

    if (supabase) {
      const cleanCode = resolvedId.toUpperCase();
      const cardObj = cards.find(c => c.card_id === cleanCode || c.card_id === resolvedId);
      if (cardObj) {
        supabase.from('nfc_cards').upsert({
          card_id: cardObj.card_id,
          activation_code: cardObj.activation_code,
          owner_id: cardObj.owner_id,
          owner_name: cardObj.owner_name,
          owner_email: cardObj.owner_email,
          label: cardObj.label,
          target_url: primaryUrl,
          nfc_target_url: cleanNfcUrl,
          qr_target_url: cleanQrUrl,
          group_name: groupName || 'General',
          is_active: cardObj.is_active,
          claimed: cardObj.claimed,
          estado: derivarEstado(cardObj),
          type: cardObj.type || 'google'
        }).then(({ error }) => {
          if (error) console.error('Error guardando tarjeta en Supabase:', error);
        });
      }
    }

    return { success: true, message: '¡Configuración guardada exitosamente!' };
  }

  deleteCard(cardId: string, requestingEmail: string): { success: boolean; message: string } {
    const cards = this.getCards();
    const resolvedId = this.resolveCardId(cardId, cards);
    const cleanEmail = requestingEmail.trim().toLowerCase();
    
    const cardIndex = cards.findIndex(c => 
      c.card_id.toLowerCase() === resolvedId.toLowerCase() || 
      (c.activation_code && c.activation_code.toLowerCase() === resolvedId.toLowerCase())
    );

    if (cardIndex === -1) {
      return { success: false, message: 'El dispositivo no fue encontrado.' };
    }

    const card = cards[cardIndex];
    // Solo comparacion exacta: con includes('admin') cualquier correo que
    // contuviera esa subcadena (ej. admincito@gmail.com) obtenia permisos.
    const isAdmin = cleanEmail === 'admin@startap.com.pa';
    
    if (!isAdmin && card.owner_email && card.owner_email.trim().toLowerCase() !== cleanEmail) {
      return { success: false, message: 'Acceso Denegado: No tienes permisos para desvincular un dispositivo de otro comercio.' };
    }

    cards.splice(cardIndex, 1);
    this.setStorageItem('nfc_cards', cards);

    if (supabase) {
      supabase.from('nfc_cards').delete().eq('card_id', card.card_id).then(({ error }) => {
        if (error) console.error('Error eliminando tarjeta en Supabase:', error);
      });
    }

    return { success: true, message: 'Dispositivo desvinculado exitosamente de tu cuenta.' };
  }

  claimCard(codeOrCardId: string, ownerEmail: string, ownerName: string = '', groupName: string = 'General'): { success: boolean; message: string; card?: NfcCard } {
    const cards = this.getCards();
    const resolvedId = this.resolveCardId(codeOrCardId, cards);
    const cleanEmail = ownerEmail.trim().toLowerCase();
    const cleanGroup = groupName.trim() || 'General';

    let cardIndex = cards.findIndex(c => 
      c.card_id.toLowerCase() === resolvedId.toLowerCase() || 
      (c.activation_code && c.activation_code.toLowerCase() === resolvedId.toLowerCase())
    );

    if (cardIndex !== -1) {
      const card = cards[cardIndex];
      if (card.claimed && card.owner_email && card.owner_email.trim().toLowerCase() !== cleanEmail) {
        return { success: false, message: '⚠️ Este dispositivo ya está registrado y pertenece a otra cuenta de comercio.' };
      }

      cards[cardIndex] = {
        ...card,
        owner_email: cleanEmail,
        owner_name: ownerName || cleanEmail.split('@')[0],
        group_name: cleanGroup,
        claimed: true
      };
      this.setStorageItem('nfc_cards', cards);

      if (supabase) {
        supabase.from('nfc_cards').update({
          owner_email: cleanEmail,
          owner_name: ownerName || cleanEmail.split('@')[0],
          group_name: cleanGroup,
          claimed: true
        }).eq('card_id', card.card_id).then();
      }

      return { success: true, message: '¡Dispositivo TAP vinculado exitosamente a tu negocio!', card: cards[cardIndex] };
    }

    const rawCode = codeOrCardId.trim().toUpperCase();
    const formattedCardId = rawCode.startsWith('STTT-') || rawCode.startsWith('STT-') || rawCode.startsWith('TAP-')
      ? rawCode
      : `STTT-${rawCode}`;
    const newCard: NfcCard = {
      card_id: formattedCardId,
      activation_code: rawCode,
      owner_id: 'user-' + Date.now(),
      owner_name: ownerName || cleanEmail.split('@')[0],
      owner_email: cleanEmail,
      group_name: cleanGroup,
      label: `Dispositivo TAP (${rawCode})`,
      target_url: 'https://google.com',
      is_active: false,
      claimed: true,
      type: 'google',
      created_at: new Date().toISOString()
    };

    cards.unshift(newCard);
    this.setStorageItem('nfc_cards', cards);

    if (supabase) {
      supabase.from('nfc_cards').upsert(newCard).then();
    }

    return { success: true, message: '¡Dispositivo vinculado a tu negocio!', card: newCard };
  }

  bulkUpdateCardsGroup(cardIds: string[], groupName: string, requestingEmail: string): { success: boolean; updatedCount: number } {
    const cards = this.getCards();
    const cleanEmail = requestingEmail.trim().toLowerCase();
    const cleanGroup = groupName.trim() || 'General';
    let count = 0;

    const updated = cards.map(c => {
      const isOwner = c.owner_email && c.owner_email.trim().toLowerCase() === cleanEmail;
      if (cardIds.includes(c.card_id) && (isOwner || !c.claimed)) {
        count++;
        return {
          ...c,
          group_name: cleanGroup,
          owner_email: cleanEmail,
          claimed: true
        };
      }
      return c;
    });

    this.setStorageItem('nfc_cards', updated);
    if (supabase && count > 0) {
      supabase.from('nfc_cards').update({ group_name: cleanGroup }).in('card_id', cardIds).then();
    }

    return { success: true, updatedCount: count };
  }

  bulkUpdateCardsActiveStatus(cardIds: string[], isActive: boolean, requestingEmail: string): { success: boolean; updatedCount: number } {
    const cards = this.getCards();
    const cleanEmail = requestingEmail.trim().toLowerCase();
    let count = 0;

    const updated = cards.map(c => {
      const isOwner = c.owner_email && c.owner_email.trim().toLowerCase() === cleanEmail;
      if (cardIds.includes(c.card_id) && (isOwner || !c.claimed)) {
        count++;
        return {
          ...c,
          is_active: isActive
        };
      }
      return c;
    });

    this.setStorageItem('nfc_cards', updated);
    if (supabase && count > 0) {
      supabase.from('nfc_cards').update({ is_active: isActive }).in('card_id', cardIds).then();
    }

    return { success: true, updatedCount: count };
  }

  // Métodos de Usuarios
  getUsers(): UserAccount[] {
    return this.getStorageItem<UserAccount[]>('nfc_users', []);
  }

  registerUser(name: string, email: string): { success: boolean; message: string; user?: UserAccount } {
    const cleanEmail = email.trim().toLowerCase();
    const users = this.getUsers();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Ingresa un correo electrónico válido.' };
    }

    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: true, message: 'Sesión iniciada con tu cuenta existente.', user: existing };
    }

    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name: name.trim() || cleanEmail.split('@')[0],
      email: cleanEmail,
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    this.setStorageItem('nfc_users', users);

    return { success: true, message: '¡Cuenta creada exitosamente!', user: newUser };
  }

  // Analíticas de Escaneo y Comportamiento en Página Puente
  registerScan(
    cardId: string,
    device: string,
    referrer: string,
    scanType: 'nfc' | 'qr' = 'nfc',
    groupName: string = 'General',
    options?: { id?: string; skipSupabase?: boolean }
  ): string {
    const scans = this.getStorageItem<ScanRecord[]>('nfc_scans', []);
    const scanId = options?.id || `scan-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newScan: ScanRecord = {
      id: scanId,
      card_id: cardId,
      device,
      referrer,
      scan_type: scanType,
      group_name: groupName,
      created_at: new Date().toISOString()
    };
    scans.push(newScan);
    // Limitar historial local a los últimos 500 registros para prevenir degradación de I/O y memoria
    const cappedScans = scans.length > 500 ? scans.slice(-500) : scans;
    this.setStorageItem('nfc_scans', cappedScans);

    if (supabase && !options?.skipSupabase) {
      supabase.from('scans').insert({
        id: newScan.id,
        card_id: cardId,
        device,
        referrer,
        scan_type: scanType,
        group_name: groupName
      }).then(({ error }) => {
        if (error) console.error('Error insertando escaneo en Supabase:', error);
      });
    }

    return scanId;
  }

  registerTapBehaviorEvent(
    cardId: string,
    scanId: string,
    action: 'auto_time' | 'cta_click' | 'ad_click' | 'ad_close'
  ): void {
    const cleanCardId = String(cardId || '').trim().toUpperCase();
    if (!cleanCardId) return;

    // 1. Actualizar el referrer del escaneo local si existe
    const scans = this.getStorageItem<ScanRecord[]>('nfc_scans', []);
    const tagMarker = `[${action}]`;
    let updatedScan = false;
    for (let i = scans.length - 1; i >= 0; i--) {
      if (scans[i].id === scanId || (!scanId && scans[i].card_id.toUpperCase() === cleanCardId)) {
        const currentRef = scans[i].referrer || '';
        if (!currentRef.includes(tagMarker)) {
          scans[i].referrer = `${currentRef} ${tagMarker}`.trim();
          updatedScan = true;
        }
        break;
      }
    }
    if (updatedScan) {
      this.setStorageItem('nfc_scans', scans);
    }

    // 2. Mantener mapa acumulado por código de TAP en nfc_tap_behavior
    const behaviorMap = this.getStorageItem<Record<string, {
      auto_time: number;
      cta_click: number;
      ad_click: number;
      ad_close: number;
      processed_events?: string[];
      updated_at: string;
    }>>('nfc_tap_behavior', {});

    const current = behaviorMap[cleanCardId] || {
      auto_time: 0,
      cta_click: 0,
      ad_click: 0,
      ad_close: 0,
      processed_events: [],
      updated_at: new Date().toISOString()
    };

    const dedupeKey = scanId ? `${scanId}:${action}` : `${Date.now()}:${action}`;
    const processed = Array.isArray(current.processed_events) ? current.processed_events : [];
    if (!processed.includes(dedupeKey)) {
      current[action] = (current[action] || 0) + 1;
      processed.push(dedupeKey);
      current.processed_events = processed.slice(-300);
      current.updated_at = new Date().toISOString();
      behaviorMap[cleanCardId] = current;
      this.setStorageItem('nfc_tap_behavior', behaviorMap);
    }
  }

  getTapBehaviorMap(): Record<string, {
    auto_time: number;
    cta_click: number;
    ad_click: number;
    ad_close: number;
    processed_events?: string[];
    updated_at: string;
  }> {
    return this.getStorageItem('nfc_tap_behavior', {});
  }

  getScansForCard(cardId: string): ScanRecord[] {
    const scans = this.getStorageItem<ScanRecord[]>('nfc_scans', []);
    return scans.filter(s => s.card_id === cardId);
  }

  getScansForOwner(emailOrId: string): ScanRecord[] {
    const ownerCards = this.getCardsByOwner(emailOrId);
    const cardIds = new Set(ownerCards.map(c => c.card_id));
    const scans = this.getStorageItem<ScanRecord[]>('nfc_scans', []);
    return scans.filter(s => cardIds.has(s.card_id));
  }

  getGroupsForOwner(emailOrId: string): string[] {
    const ownerCards = this.getCardsByOwner(emailOrId);
    const groups = new Set<string>();
    groups.add('General');

    if (typeof window !== 'undefined') {
      const cleanEmail = emailOrId.toLowerCase().trim();
      const savedCustom = this.getStorageItem<string[]>(`nfc_groups_${cleanEmail}`, []);
      savedCustom.forEach(g => {
        if (g && g.trim()) groups.add(g.trim());
      });
    }

    ownerCards.forEach(c => {
      if (c.group_name && c.group_name.trim()) groups.add(c.group_name.trim());
    });
    return Array.from(groups);
  }

  addGroupForOwner(emailOrId: string, groupName: string): boolean {
    const cleanEmail = emailOrId.toLowerCase().trim();
    const cleanGroup = groupName.trim();
    if (!cleanGroup) return false;

    const existing = this.getStorageItem<string[]>(`nfc_groups_${cleanEmail}`, []);
    if (!existing.includes(cleanGroup)) {
      existing.push(cleanGroup);
      this.setStorageItem(`nfc_groups_${cleanEmail}`, existing);
    }
    return true;
  }

  // ==========================================
  // MÓDULO DE AGREGAR EN LOTE & CUADRE DE STOCK
  // ==========================================

  getNextSequentialRange(
    deviceType: 'stand' | 'plate' | 'card' | string = 'plate',
    quantity: number = 1,
    customStart?: string
  ): {
    prefix: string;
    startNum: number;
    endNum: number;
    startCode: string;
    endCode: string;
    codes: string[];
  } {
    const typeStr = (deviceType || '').toLowerCase();
    const isStand = typeStr.includes('stand') || typeStr.includes('stts') || typeStr.includes('mesa');
    const isCard = !isStand && (typeStr.includes('card') || typeStr.includes('tarjeta') || typeStr.includes('sttt') || typeStr.includes('bolsillo'));
    const prefix = isStand ? 'STTS' : isCard ? 'STTT' : 'STT';

    let startNum = 1001;
    if (customStart && customStart.trim()) {
      const match = customStart.trim().match(/\d+/);
      if (match && match[0]) {
        startNum = parseInt(match[0], 10);
      }
    } else {
      const nextSingle = this.getNextStickerCode(deviceType);
      const match = nextSingle.match(/\d+/);
      if (match && match[0]) {
        startNum = parseInt(match[0], 10);
      }
    }

    const qty = Math.max(1, quantity);
    const endNum = startNum + qty - 1;
    const codes: string[] = [];
    for (let i = startNum; i <= endNum; i++) {
      codes.push(`${prefix}-${i}`);
    }

    return {
      prefix,
      startNum,
      endNum,
      startCode: `${prefix}-${startNum}`,
      endCode: `${prefix}-${endNum}`,
      codes
    };
  }

  createBatchTagIngestion(params: {
    hardwareType: 'stand' | 'plate' | 'card';
    quantity: number;
    customStartCode?: string;
    batchId?: string;
    supplier?: string;
    unitCost?: number;
    notes?: string;
    defaultTargetUrl?: string;
  }): {
    success: boolean;
    message: string;
    createdCards: NfcCard[];
    startCode: string;
    endCode: string;
    newStock: number;
    batch: InventoryBatch;
  } {
    const { hardwareType, quantity, customStartCode, batchId, supplier, unitCost, notes, defaultTargetUrl } = params;

    if (quantity <= 0) {
      throw new Error('La cantidad del lote debe ser mayor a 0');
    }

    const range = this.getNextSequentialRange(hardwareType, quantity, customStartCode);
    const { prefix, startNum, endNum, startCode, endCode, codes } = range;

    // Configuración por tipo de hardware
    const productId =
      hardwareType === 'stand' ? 'stand-nfc-mesa' :
      hardwareType === 'card' ? 'tarjeta-nfc-bolsillo' :
      'placa-nfc-mostrador';

    const productName =
      hardwareType === 'stand' ? 'Stand NFC para Reseñas de Google' :
      hardwareType === 'card' ? 'Tarjeta NFC de Bolsillo' :
      'Placa NFC para Reseñas de Google';

    const defaultUnitCost =
      hardwareType === 'stand' ? 2.00 :
      hardwareType === 'card' ? 1.50 :
      2.25;

    const cost = typeof unitCost === 'number' && unitCost > 0 ? unitCost : defaultUnitCost;

    const labelBase =
      hardwareType === 'stand' ? 'Stand NFC de Mesa' :
      hardwareType === 'card' ? 'Tarjeta NFC de Bolsillo' :
      'Placa NFC de Mostrador';

    // 1. Generar los Tags físicos correlativos
    const createdCards: NfcCard[] = [];
    for (let i = startNum; i <= endNum; i++) {
      const code = `${prefix}-${i}`;
      const cardObj: NfcCard = {
        card_id: code,
        activation_code: code,
        owner_id: 'unassigned',
        owner_name: 'Sin Asignar (Stock)',
        owner_email: 'admin@startap.com.pa',
        label: `${labelBase} (${code})`,
        target_url: defaultTargetUrl || 'https://google.com',
        nfc_target_url: defaultTargetUrl || 'https://google.com',
        is_active: false,
        claimed: false,
        estado: 'en_stock',
        type: 'google',
        channels: 'both',
        created_at: new Date().toISOString()
      };
      createdCards.push(cardObj);
    }

    // 2. Guardar Tags en almacenamiento local y Supabase
    const allCards = this.getCards();
    const updatedCards = [...allCards];
    createdCards.forEach(nc => {
      const idx = updatedCards.findIndex(c => c.card_id.toUpperCase() === nc.card_id.toUpperCase());
      if (idx !== -1) {
        updatedCards[idx] = nc;
      } else {
        updatedCards.push(nc);
      }
    });

    this.setStorageItem('nfc_cards', updatedCards);

    if (supabase) {
      supabase.from('nfc_cards').upsert(createdCards).then(({ error }) => {
        if (error) console.error('Error sincronizando lote de tags en Supabase:', error);
      });
    }

    // 3. Cuadrar / Sumar existencias en inventory_product_stocks
    const productStocks = this.getStorageItem<{ [id: string]: ProductStockInfo }>('inventory_product_stocks', {});
    if (!productStocks[productId]) {
      productStocks[productId] = {
        product_id: productId,
        sku: `STP-${hardwareType === 'stand' ? '0103' : hardwareType === 'card' ? '0102' : '0101'}`,
        name: productName,
        category: hardwareType === 'card' ? 'cards' : 'plates',
        current_stock: 0,
        min_alert_stock: 10,
        unit_cost: cost,
        selling_price: hardwareType === 'stand' ? 35 : hardwareType === 'card' ? 25 : 29
      };
    }

    productStocks[productId].current_stock = (productStocks[productId].current_stock || 0) + quantity;
    productStocks[productId].unit_cost = cost;

    // Recalcular stock de Pack Trío si aplica
    if (productStocks['pack-trio-comercial']) {
      const pStock = productStocks['placa-nfc-mostrador']?.current_stock || 0;
      const tStock = productStocks['tarjeta-nfc-bolsillo']?.current_stock || 0;
      productStocks['pack-trio-comercial'].current_stock = Math.min(pStock, Math.floor(tStock / 2));
    }

    this.setStorageItem('inventory_product_stocks', productStocks);

    // 4. Registrar en Lotes de Inventario (inventory_batches)
    const batches = this.getStorageItem<InventoryBatch[]>('inventory_batches', []);
    const cleanBatchId = (batchId && batchId.trim())
      ? batchId.trim().toUpperCase()
      : `LOTE-${new Date().getFullYear()}-${prefix}-${(batches.length + 10).toString()}`;

    const newBatch: InventoryBatch = {
      id: cleanBatchId,
      product_id: productId,
      product_name: productName,
      quantity_initial: quantity,
      quantity_remaining: quantity,
      unit_cost: cost,
      supplier: (supplier || 'Shenzhen Micro-NFC Tech').trim(),
      received_at: new Date().toISOString(),
      status: 'active',
      notes: notes || `Recepción de lote físico correlativo (${startCode} a ${endCode})`
    };

    batches.unshift(newBatch);
    this.setStorageItem('inventory_batches', batches);

    // 5. Asentar Movimiento en Kardex (inventory_kardex)
    const movements = this.getStorageItem<StockMovement[]>('inventory_kardex', []);
    const newMovement: StockMovement = {
      id: `MOV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      created_at: new Date().toISOString(),
      type: 'entrada_lote',
      product_name: productName,
      quantity_change: quantity,
      resulting_stock: productStocks[productId].current_stock,
      reference: `${cleanBatchId} (${startCode} a ${endCode})`
    };

    movements.unshift(newMovement);
    this.setStorageItem('inventory_kardex', movements);

    if (supabase) {
      (async () => {
        try {
          await supabase.from('inventory_stocks').upsert({
            product_id: productId,
            sku: productStocks[productId].sku,
            name: productStocks[productId].name,
            category: productStocks[productId].category,
            current_stock: productStocks[productId].current_stock,
            min_alert_stock: productStocks[productId].min_alert_stock || 10,
            unit_cost: cost,
            selling_price: productStocks[productId].selling_price,
            is_bundle: false,
            updated_at: new Date().toISOString()
          });

          if (productStocks['pack-trio-comercial']) {
            await supabase.from('inventory_stocks').update({
              current_stock: productStocks['pack-trio-comercial'].current_stock,
              updated_at: new Date().toISOString()
            }).eq('product_id', 'pack-trio-comercial');
          }

          await supabase.from('inventory_batches').insert({
            id: newBatch.id,
            product_id: newBatch.product_id,
            product_name: newBatch.product_name,
            quantity_initial: newBatch.quantity_initial,
            quantity_remaining: newBatch.quantity_remaining,
            unit_cost: newBatch.unit_cost,
            supplier: newBatch.supplier,
            received_at: newBatch.received_at,
            status: newBatch.status,
            notes: newBatch.notes
          });

          await supabase.from('inventory_kardex').insert({
            id: newMovement.id,
            type: newMovement.type,
            product_id: productId,
            product_name: productName,
            quantity_change: quantity,
            resulting_stock: productStocks[productId].current_stock,
            reference: newMovement.reference,
            channel: 'proveedor_lote'
          });
        } catch (e) {
          console.error('Error sincronizando lote de inventario en Supabase:', e);
        }
      })();
    }

    return {
      success: true,
      message: `¡Lote ${cleanBatchId} de ${quantity} unidades (${startCode} a ${endCode}) registrado y cuadrado con inventario!`,
      createdCards,
      startCode,
      endCode,
      newStock: productStocks[productId].current_stock,
      batch: newBatch
    };
  }

  getStockAudit(cardsParam?: NfcCard[], stocksParam?: Record<string, ProductStockInfo>): StockAuditItem[] {
    const cards = cardsParam || this.getCards();
    const productStocks = stocksParam || this.getStorageItem<{ [id: string]: ProductStockInfo }>('inventory_product_stocks', {});

    // Contar tags físicos en stock (claimed: false) por prefijo
    let unclaimedStands = 0;
    let unclaimedPlates = 0;
    let unclaimedCards = 0;

    cards.forEach(c => {
      if (!c.claimed) {
        const id = (c.activation_code || c.card_id || '').toUpperCase();
        if (id.startsWith('STTS-')) unclaimedStands++;
        else if (id.startsWith('STTT-')) unclaimedCards++;
        else if (id.startsWith('STT-')) unclaimedPlates++;
      }
    });

    const standStock = productStocks['stand-nfc-mesa']?.current_stock ?? 0;
    const plateStock = productStocks['placa-nfc-mostrador']?.current_stock ?? 0;
    const cardStock = productStocks['tarjeta-nfc-bolsillo']?.current_stock ?? 0;
    const trioStock = productStocks['pack-trio-comercial']?.current_stock ?? Math.min(plateStock, Math.floor(cardStock / 2));

    return [
      {
        productId: 'stand-nfc-mesa',
        productName: 'Stand NFC de Mesa (STTS-)',
        hardwareType: 'stand',
        unclaimedTagsCount: unclaimedStands,
        recordedStock: standStock,
        difference: unclaimedStands - standStock,
        isBalanced: unclaimedStands === standStock
      },
      {
        productId: 'placa-nfc-mostrador',
        productName: 'Placa NFC de Mostrador (STT-)',
        hardwareType: 'plate',
        unclaimedTagsCount: unclaimedPlates,
        recordedStock: plateStock,
        difference: unclaimedPlates - plateStock,
        isBalanced: unclaimedPlates === plateStock
      },
      {
        productId: 'tarjeta-nfc-bolsillo',
        productName: 'Tarjeta NFC de Bolsillo (STTT-)',
        hardwareType: 'card',
        unclaimedTagsCount: unclaimedCards,
        recordedStock: cardStock,
        difference: unclaimedCards - cardStock,
        isBalanced: unclaimedCards === cardStock
      },
      {
        productId: 'pack-trio-comercial',
        productName: 'Pack Trío Comercial (1 Placa + 2 Tarjetas)',
        hardwareType: 'bundle',
        unclaimedTagsCount: Math.min(unclaimedPlates, Math.floor(unclaimedCards / 2)),
        recordedStock: trioStock,
        difference: Math.min(unclaimedPlates, Math.floor(unclaimedCards / 2)) - trioStock,
        isBalanced: Math.min(unclaimedPlates, Math.floor(unclaimedCards / 2)) === trioStock
      }
    ];
  }

  reconcileStockWithUnclaimedTags(): {
    success: boolean;
    message: string;
    adjustments: { productId: string; previousStock: number; newStock: number }[];
  } {
    const audit = this.getStockAudit();
    const productStocks = this.getStorageItem<{ [id: string]: ProductStockInfo }>('inventory_product_stocks', {});
    const movements = this.getStorageItem<StockMovement[]>('inventory_kardex', []);
    const adjustments: { productId: string; previousStock: number; newStock: number }[] = [];

    audit.forEach(item => {
      const prev = productStocks[item.productId]?.current_stock ?? 0;
      if (prev !== item.unclaimedTagsCount) {
        if (!productStocks[item.productId]) {
          productStocks[item.productId] = {
            product_id: item.productId,
            sku: `STP-${item.hardwareType === 'stand' ? '0103' : item.hardwareType === 'card' ? '0102' : '0101'}`,
            name: item.productName,
            category: item.hardwareType === 'card' ? 'cards' : 'plates',
            current_stock: item.unclaimedTagsCount,
            min_alert_stock: 10,
            unit_cost: item.hardwareType === 'stand' ? 2.0 : item.hardwareType === 'card' ? 1.5 : 2.25,
            selling_price: item.hardwareType === 'stand' ? 35 : item.hardwareType === 'card' ? 25 : 29
          };
        } else {
          productStocks[item.productId].current_stock = item.unclaimedTagsCount;
        }

        adjustments.push({
          productId: item.productId,
          previousStock: prev,
          newStock: item.unclaimedTagsCount
        });

        // Registrar movimiento de ajuste en Kardex
        const diff = item.unclaimedTagsCount - prev;
        movements.unshift({
          id: `MOV-AUDIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          created_at: new Date().toISOString(),
          type: 'ajuste_manual',
          product_name: item.productName,
          quantity_change: diff,
          resulting_stock: item.unclaimedTagsCount,
          reference: 'Auditoría: Cuadre con Tags Físicos en Stock'
        });
      }
    });

    // Guardar cambios localmente
    this.setStorageItem('inventory_product_stocks', productStocks);
    this.setStorageItem('inventory_kardex', movements);

    // Sincronizar cuadre con Supabase
    if (supabase) {
      (async () => {
        try {
          for (const item of audit) {
            await supabase
              .from('inventory_stocks')
              .upsert({
                product_id: item.productId,
                sku: `STP-${item.hardwareType === 'stand' ? '0103' : item.hardwareType === 'card' ? '0102' : '0101'}`,
                name: item.productName,
                category: item.hardwareType === 'card' ? 'cards' : 'plates',
                current_stock: item.unclaimedTagsCount,
                min_alert_stock: 10,
                unit_cost: item.hardwareType === 'stand' ? 2.0 : item.hardwareType === 'card' ? 1.5 : 2.25,
                selling_price: item.hardwareType === 'stand' ? 35 : item.hardwareType === 'card' ? 25 : 29,
                is_bundle: item.hardwareType === 'bundle',
                updated_at: new Date().toISOString()
              });
          }

          if (adjustments.length > 0) {
            await supabase.from('inventory_kardex').insert(
              adjustments.map(adj => ({
                id: `MOV-AUDIT-${Date.now()}-${adj.productId}`,
                created_at: new Date().toISOString(),
                type: 'ajuste_manual',
                product_id: adj.productId,
                product_name: adj.productId,
                quantity_change: adj.newStock - adj.previousStock,
                resulting_stock: adj.newStock,
                reference: 'Auditoría: Cuadre con Tags Físicos en Stock',
                channel: 'auditoria'
              }))
            );
          }
        } catch (e) {
          console.error('Error sincronizando cuadre de inventario en Supabase:', e);
        }
      })();
    }

    return {
      success: true,
      message: `Auditoría completada: Se cuadraron ${adjustments.length} productos con los tags disponibles en stock.`,
      adjustments
    };
  }

  registrarVentaVisita(params: {
    cardId: string;
    precioVenta: number;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    label?: string;
    targetUrl?: string;
    tipoActivacion?: 'venta' | 'prueba' | 'regalia';
  }): { success: boolean; order?: Order; message: string } {
    const cleanId = (params.cardId || '').trim().toUpperCase();
    const tipo = params.tipoActivacion || (params.precioVenta > 0 ? 'venta' : 'prueba');
    const precio = tipo === 'venta' ? Number(params.precioVenta || 0) : 0;

    let productId = 'placa-nfc-mostrador';
    let productName = 'Placa NFC para Reseñas de Google';
    if (cleanId.startsWith('STTS-')) {
      productId = 'stand-nfc-mesa';
      productName = 'Stand NFC de Mesa';
    } else if (cleanId.startsWith('STTT-')) {
      productId = 'tarjeta-nfc-bolsillo';
      productName = 'Tarjeta NFC de Bolsillo';
    }

    const orderId = `PED-VISITA-${cleanId.replace(/[^A-Za-z0-9]/g, '')}`;
    const orders = this.getOrders();
    const existingIdx = orders.findIndex(o => o.id === orderId);

    const orderObj: Order = {
      id: orderId,
      customer_name: params.customerName || params.label || (tipo === 'regalia' ? `Regalía / Combo (${cleanId})` : `Cliente Visita (${cleanId})`),
      customer_email: params.customerEmail || 'venta.visita@startap.com.pa',
      customer_phone: params.customerPhone || '6483-9004',
      shipping_province: 'Panamá',
      shipping_district: 'Venta Presencial',
      shipping_address: params.label || (tipo === 'regalia' ? 'Tarjeta entregada como regalía de paquete' : 'Venta presencial en visita comercial'),
      payment_method: 'presencial',
      payment_status: 'completed',
      status: 'delivered',
      canal: 'visita',
      total: precio,
      items: [
        {
          id: `item-${cleanId}`,
          product_id: productId,
          product_name: productName,
          quantity: 1,
          price: precio,
          initial_redirect_url: params.targetUrl || '',
          business_name: params.label || ''
        }
      ],
      admin_notes: tipo === 'venta' 
        ? `Venta comercial en visita presencial con TAG ${cleanId} por $${precio.toFixed(2)} USD`
        : tipo === 'regalia'
        ? `🎁 Tarjeta entregada como Regalía / Paquete de cortesía ($0.00 USD) - TAG ${cleanId}`
        : `Activación de Muestra/Prueba (Demo) con TAG ${cleanId} ($0.00 USD)`,
      created_at: existingIdx !== -1 ? orders[existingIdx].created_at : new Date().toISOString()
    };

    const movements = this.getStorageItem<StockMovement[]>('inventory_kardex', []);
    const alreadyDeducted = movements.some(m => 
      (m.id && m.id.includes(cleanId)) || 
      (m.reference && m.reference.includes(cleanId))
    );

    if (existingIdx !== -1) {
      orders[existingIdx] = { 
        ...orders[existingIdx], 
        ...orderObj,
        created_at: orders[existingIdx].created_at 
      };
    } else {
      orders.unshift(orderObj);
    }

    // Descontar inventario físico si aún no se había asentado la salida para este TAG
    if (!alreadyDeducted && (tipo === 'venta' || tipo === 'regalia')) {
      const productStocks = this.getStorageItem<Record<string, any>>('inventory_product_stocks', {});
      if (productStocks[productId] && typeof productStocks[productId].current_stock === 'number') {
        productStocks[productId].current_stock = Math.max(0, productStocks[productId].current_stock - 1);
        
        if (productStocks['pack-trio-comercial']) {
          const pStock = productStocks['placa-nfc-mostrador']?.current_stock || 0;
          const tStock = productStocks['tarjeta-nfc-bolsillo']?.current_stock || 0;
          productStocks['pack-trio-comercial'].current_stock = Math.min(pStock, Math.floor(tStock / 2));
        }
        this.setStorageItem('inventory_product_stocks', productStocks);
      }

      // Asentar en Kardex
      const movId = `MOV-VISITA-${Date.now()}-${cleanId}`;
      const movObj: StockMovement = {
        id: movId,
        created_at: new Date().toISOString(),
        type: tipo === 'regalia' ? 'salida_regalia' as any : 'salida_visita',
        product_name: productName,
        quantity_change: -1,
        resulting_stock: productStocks[productId]?.current_stock ?? 0,
        reference: `${tipo === 'regalia' ? 'Regalía' : 'Venta Presencial'} - ${cleanId} ($${precio.toFixed(2)})`
      };
      movements.unshift(movObj);
      this.setStorageItem('inventory_kardex', movements);

      // Sincronización en tiempo real con Supabase
      if (supabase) {
        (async () => {
          try {
            // 1. Descontar en inventory_stocks
            const { data: stockRow } = await supabase
              .from('inventory_stocks')
              .select('current_stock')
              .eq('product_id', productId)
              .maybeSingle();

            if (stockRow) {
              const updatedStock = Math.max(0, stockRow.current_stock - 1);
              await supabase
                .from('inventory_stocks')
                .update({ current_stock: updatedStock, updated_at: new Date().toISOString() })
                .eq('product_id', productId);

              // Recalcular combo pack trío en Supabase
              const { data: trioRows } = await supabase
                .from('inventory_stocks')
                .select('product_id, current_stock')
                .in('product_id', ['placa-nfc-mostrador', 'tarjeta-nfc-bolsillo']);

              if (trioRows && trioRows.length === 2) {
                const plStock = trioRows.find(r => r.product_id === 'placa-nfc-mostrador')?.current_stock || 0;
                const tjStock = trioRows.find(r => r.product_id === 'tarjeta-nfc-bolsillo')?.current_stock || 0;
                await supabase
                  .from('inventory_stocks')
                  .update({ current_stock: Math.min(plStock, Math.floor(tjStock / 2)), updated_at: new Date().toISOString() })
                  .eq('product_id', 'pack-trio-comercial');
              }
            }

            // 2. Descontar en lote activo de inventory_batches
            const { data: batchRows } = await supabase
              .from('inventory_batches')
              .select('id, quantity_remaining')
              .eq('product_id', productId)
              .gt('quantity_remaining', 0)
              .order('received_at', { ascending: true })
              .limit(1);

            if (batchRows && batchRows.length > 0) {
              await supabase
                .from('inventory_batches')
                .update({ quantity_remaining: Math.max(0, batchRows[0].quantity_remaining - 1) })
                .eq('id', batchRows[0].id);
            }

            // 3. Asentar en inventory_kardex
            await supabase.from('inventory_kardex').insert({
              id: movId,
              created_at: new Date().toISOString(),
              type: tipo === 'regalia' ? 'salida_regalia' : 'salida_visita',
              product_id: productId,
              product_name: productName,
              quantity_change: -1,
              resulting_stock: productStocks[productId]?.current_stock ?? 0,
              reference: `${tipo === 'regalia' ? 'Regalía' : 'Venta Presencial'} - ${cleanId} ($${precio.toFixed(2)})`,
              channel: 'visita'
            });
          } catch (syncErr) {
            console.error('Error sincronizando inventario en Supabase:', syncErr);
          }
        })();
      }
    }

    this.setStorageItem('nfc_orders', orders);

    // Sincronizar Orden en Supabase
    if (supabase) {
      supabase.from('orders').upsert([{
        id: orderObj.id,
        customer_name: orderObj.customer_name,
        customer_email: orderObj.customer_email,
        customer_phone: orderObj.customer_phone,
        shipping_province: orderObj.shipping_province,
        shipping_district: orderObj.shipping_district,
        shipping_address: orderObj.shipping_address,
        payment_method: orderObj.payment_method,
        payment_status: orderObj.payment_status,
        status: orderObj.status,
        total: orderObj.total,
        items: orderObj.items,
        created_at: orderObj.created_at
      }]).then(({ error }) => {
        if (error) console.error('Error sincronizando orden de visita en Supabase:', error);
      });
    }

    // Actualizar el Tag en nfc_cards: claimed=true, estado='configurado', order_id=orderId
    const cards = this.getCards();
    const cIdx = cards.findIndex(c => c.card_id.toUpperCase() === cleanId);
    if (cIdx !== -1) {
      cards[cIdx].claimed = true;
      cards[cIdx].estado = 'configurado';
      cards[cIdx].is_active = true;
      cards[cIdx].order_id = orderId;
      cards[cIdx].tipo_activacion = tipo;
      cards[cIdx].precio_venta = precio;
      if (params.label) cards[cIdx].label = params.label;
      if (params.targetUrl) {
        cards[cIdx].target_url = params.targetUrl;
        cards[cIdx].nfc_target_url = params.targetUrl;
        cards[cIdx].qr_target_url = params.targetUrl;
      }
      this.setStorageItem('nfc_cards', cards);

      if (supabase) {
        supabase.from('nfc_cards').update({
          claimed: true,
          estado: 'configurado',
          is_active: true,
          order_id: orderId,
          tipo_activacion: tipo,
          precio_venta: precio,
          label: params.label || cards[cIdx].label,
          target_url: params.targetUrl || cards[cIdx].target_url,
          nfc_target_url: params.targetUrl || cards[cIdx].nfc_target_url,
          qr_target_url: params.targetUrl || cards[cIdx].qr_target_url,
        }).eq('card_id', cleanId).then();
      }
    }

    return {
      success: true,
      order: orderObj,
      message: `Venta de visita registrada como pedido #${orderId} por $${precio.toFixed(2)} USD`
    };
  }

  liberarTagsYRevertirStock(orderId: string): { success: boolean; liberatedTags: string[] } {
    const cleanOrderId = (orderId || '').trim();
    if (!cleanOrderId) return { success: false, liberatedTags: [] };

    // 1. Revertir existencias de inventario
    const orders = this.getOrders();
    const order = orders.find(o => o.id === cleanOrderId || (o as any).yappy_order_id === cleanOrderId);
    const productStocks = this.getStorageItem<Record<string, any>>('inventory_product_stocks', {});
    let stocksUpdated = false;

    if (order && Array.isArray(order.items)) {
      order.items.forEach(item => {
        const pId = (item.product_id || '').toLowerCase();
        const isPack = pId.includes('pack');
        const qty = item.quantity || 1;

        if (isPack) {
          const placaKey = Object.keys(productStocks).find(k => k.includes('placa')) || 'placa-nfc-mostrador';
          const tarjetaKey = Object.keys(productStocks).find(k => k.includes('tarjeta')) || 'tarjeta-nfc-bolsillo';
          if (productStocks[placaKey]) {
            productStocks[placaKey].current_stock = (productStocks[placaKey].current_stock || 0) + (1 * qty);
            stocksUpdated = true;
          }
          if (productStocks[tarjetaKey]) {
            productStocks[tarjetaKey].current_stock = (productStocks[tarjetaKey].current_stock || 0) + (2 * qty);
            stocksUpdated = true;
          }
        } else if (productStocks[item.product_id]) {
          productStocks[item.product_id].current_stock = (productStocks[item.product_id].current_stock || 0) + qty;
          stocksUpdated = true;
        }
      });
    }

    if (stocksUpdated) {
      if (productStocks['pack-trio-comercial']) {
        const pStock = productStocks['placa-nfc-mostrador']?.current_stock || 0;
        const tStock = productStocks['tarjeta-nfc-bolsillo']?.current_stock || 0;
        productStocks['pack-trio-comercial'].current_stock = Math.min(pStock, Math.floor(tStock / 2));
      }
      this.setStorageItem('inventory_product_stocks', productStocks);

      // Asentar en Kardex
      const revMovId = `MOV-REV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const movements = this.getStorageItem<StockMovement[]>('inventory_kardex', []);
      movements.unshift({
        id: revMovId,
        created_at: new Date().toISOString(),
        type: 'devolucion_cancelacion',
        product_name: order?.items[0]?.product_name || 'Productos Orden Cancelada',
        quantity_change: 1,
        resulting_stock: 0,
        reference: `Reversión y Cancelación de Pedido ${cleanOrderId}`
      });
      this.setStorageItem('inventory_kardex', movements);

      // Sincronizar reversión con Supabase
      if (supabase && order && Array.isArray(order.items)) {
        (async () => {
          try {
            for (const itm of order.items) {
              const pId = (itm.product_id || '').toLowerCase();
              const qty = itm.quantity || 1;
              const isPack = pId.includes('pack');

              if (isPack) {
                // Revertir 1 placa y 2 tarjetas
                for (const [subId, subQty] of [['placa-nfc-mostrador', 1 * qty], ['tarjeta-nfc-bolsillo', 2 * qty]] as const) {
                  const { data: row } = await supabase.from('inventory_stocks').select('current_stock').eq('product_id', subId).maybeSingle();
                  if (row) {
                    await supabase.from('inventory_stocks').update({ current_stock: row.current_stock + subQty, updated_at: new Date().toISOString() }).eq('product_id', subId);
                  }
                }
              } else if (pId) {
                const { data: row } = await supabase.from('inventory_stocks').select('current_stock').eq('product_id', pId).maybeSingle();
                if (row) {
                  await supabase.from('inventory_stocks').update({ current_stock: row.current_stock + qty, updated_at: new Date().toISOString() }).eq('product_id', pId);
                }
              }
            }

            // Recalcular combo pack trío en Supabase
            const { data: trioRows } = await supabase
              .from('inventory_stocks')
              .select('product_id, current_stock')
              .in('product_id', ['placa-nfc-mostrador', 'tarjeta-nfc-bolsillo']);

            if (trioRows && trioRows.length === 2) {
              const plStock = trioRows.find(r => r.product_id === 'placa-nfc-mostrador')?.current_stock || 0;
              const tjStock = trioRows.find(r => r.product_id === 'tarjeta-nfc-bolsillo')?.current_stock || 0;
              await supabase
                .from('inventory_stocks')
                .update({ current_stock: Math.min(plStock, Math.floor(tjStock / 2)), updated_at: new Date().toISOString() })
                .eq('product_id', 'pack-trio-comercial');
            }

            // Asentar movimiento en inventory_kardex
            await supabase.from('inventory_kardex').insert({
              id: revMovId,
              created_at: new Date().toISOString(),
              type: 'devolucion_cancelacion',
              product_id: order.items[0]?.product_id || 'varios',
              product_name: order.items[0]?.product_name || 'Productos Orden Cancelada',
              quantity_change: 1,
              resulting_stock: 0,
              reference: `Reversión y Cancelación de Pedido ${cleanOrderId}`,
              channel: 'devolucion'
            });
          } catch (e) {
            console.error('Error sincronizando reversión de inventario en Supabase:', e);
          }
        })();
      }
    }

    // 2. Liberar tags físicos asignados
    const cards = this.getCards();
    const liberatedTags: string[] = [];

    cards.forEach((c, idx) => {
      if (c.order_id === cleanOrderId || (order && c.order_id === order.id)) {
        cards[idx].claimed = false;
        cards[idx].estado = 'en_stock';
        cards[idx].order_id = undefined;
        cards[idx].is_active = false;
        cards[idx].owner_id = 'unassigned';
        cards[idx].owner_name = 'Sin Asignar (Stock)';
        cards[idx].owner_email = 'admin@startap.com.pa';
        liberatedTags.push(cards[idx].card_id);
      }
    });

    if (liberatedTags.length > 0) {
      this.setStorageItem('nfc_cards', cards);
      if (supabase) {
        supabase.from('nfc_cards').update({
          claimed: false,
          estado: 'en_stock',
          order_id: null,
          is_active: false,
          owner_id: 'unassigned',
          owner_name: 'Sin Asignar (Stock)',
          owner_email: 'admin@startap.com.pa'
        }).in('card_id', liberatedTags).then(({ error }) => {
          if (error) console.error('Error liberando tags en Supabase:', error);
        });
      }
    }

    return { success: true, liberatedTags };
  }

  async sincronizarVentasRetroactivas(): Promise<{ sincronizadas: number }> {
    let count = 0;
    let cards = this.getCards();
    const existingOrderIds = new Set(this.getOrders().map(o => o.id));

    if (supabase) {
      try {
        const [resCards, resOrders] = await Promise.all([
          supabase.from('nfc_cards').select('*').or('tipo_activacion.eq.venta,tipo_activacion.eq.prueba,precio_venta.gt.0'),
          supabase.from('orders').select('id')
        ]);
        if (!resCards.error && resCards.data && resCards.data.length > 0) {
          cards = resCards.data as NfcCard[];
        }
        if (!resOrders.error && resOrders.data) {
          resOrders.data.forEach(o => existingOrderIds.add(o.id));
        }
      } catch (e) {
        console.error('Error cargando tarjetas para sincronización retroactiva:', e);
      }
    }

    for (const card of cards) {
      const isVenta = (card.tipo_activacion === 'venta' && typeof card.precio_venta === 'number' && card.precio_venta > 0) || (typeof card.precio_venta === 'number' && card.precio_venta > 0);
      const isRegalia = card.tipo_activacion === 'regalia';

      if (isVenta || isRegalia) {
        const orderId = `PED-VISITA-${card.card_id.replace(/[^A-Za-z0-9]/g, '')}`;
        if (!existingOrderIds.has(orderId)) {
          this.registrarVentaVisita({
            cardId: card.card_id,
            precioVenta: isVenta ? Number(card.precio_venta || 0) : 0,
            label: card.label,
            targetUrl: card.target_url,
            tipoActivacion: isVenta ? 'venta' : 'regalia'
          });
          existingOrderIds.add(orderId);
          count++;
        }
      }
    }

    return { sincronizadas: count };
  }
}

export const dbLocal = new LocalDbService();

// Inicializar la base simulada si estamos corriendo en navegador
if (typeof window !== 'undefined') {
  dbLocal.init();
}
