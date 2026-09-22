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
  category: 'plates' | 'cards' | 'accessories';
  type: 'google' | 'tripadvisor' | 'instagram' | 'vcard' | 'airbnb' | 'custom';
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
  payment_method: 'tarjeta' | 'yappy' | 'transfer';
  payment_status: 'pending' | 'completed';
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: OrderItem[];
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
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);
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
      localStorage.setItem(key, JSON.stringify(value));
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

  // Inicializar bases simuladas si no existen
  init() {
    if (typeof window === 'undefined') return;

    const storedProducts = this.getStorageItem<Product[]>('nfc_products', []);
    const deletedIds = this.getStorageItem<string[]>('nfc_deleted_product_ids', []);

    // Solo sembrar los productos iniciales si el storage está completamente vacío.
    // NO resembrar si el admin eliminó explícitamente un producto.
    const currentIds = storedProducts.map(p => p.id.trim().toLowerCase());
    const expectedSeedIds = INITIAL_PRODUCTS
      .map(p => p.id.trim().toLowerCase())
      .filter(id => !deletedIds.includes(id));

    const missingAny = expectedSeedIds.some(id => !currentIds.includes(id));

    if (storedProducts.length === 0 || missingAny) {
      if (storedProducts.length === 0 && deletedIds.length === 0) {
        this.setStorageItem('nfc_products', INITIAL_PRODUCTS);
      } else {
        const merged = storedProducts.filter(p => !deletedIds.includes(p.id.trim().toLowerCase()));
        for (const seed of INITIAL_PRODUCTS) {
          const seedIdNorm = seed.id.trim().toLowerCase();
          if (!currentIds.includes(seedIdNorm) && !deletedIds.includes(seedIdNorm)) {
            merged.push(seed);
          }
        }
        this.setStorageItem('nfc_products', merged);
      }
    }
    if (!localStorage.getItem('nfc_orders')) {
      this.setStorageItem('nfc_orders', [
        {
          id: 'PED-9821',
          customer_name: 'Carlos Mendoza',
          customer_email: 'carlos.mendoza@gmail.com',
          customer_phone: '6523-9821',
          shipping_province: 'Panamá',
          shipping_district: 'San Francisco',
          shipping_address: 'Calle 74, Edificio Sunset, Apto 5B',
          payment_method: 'yappy',
          payment_status: 'completed',
          status: 'processing',
          total: 69.98,
          items: [
            {
              id: 'item-1',
              product_id: 'placa-google',
              product_name: 'Placa NFC Google Reviews (Acrílico)',
              quantity: 2,
              price: 34.99,
              initial_redirect_url: 'https://g.page/r/CZZzX-test',
              selected_color: 'Negro Premium',
              business_name: 'Café & Pan Panamá'
            }
          ],
          created_at: new Date(Date.now() - 3600000 * 24).toISOString() // Ayer
        }
      ]);
    }
    if (!localStorage.getItem('nfc_cards')) {
      this.setStorageItem('nfc_cards', [
        {
          card_id: 'STT-1001',
          activation_code: 'STT-1001',
          owner_id: 'user-carlos',
          owner_name: 'Carlos Mendoza',
          owner_email: 'carlos.mendoza@gmail.com',
          label: 'Placa de Mostrador (STT-1001)',
          target_url: 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeoQI8Rk3_JiM7UtGU',
          is_active: true,
          claimed: true,
          type: 'google',
          created_at: new Date(Date.now() - 3600000 * 48).toISOString()
        }
      ]);
    }
    if (!localStorage.getItem('nfc_scans')) {
      const cardId = 'STT-1001';
      const mockScans: ScanRecord[] = [];
      // Generar escaneos en los últimos 7 días
      for (let i = 0; i < 45; i++) {
        const daysAgo = Math.floor(Math.random() * 7);
        const randomHour = Math.floor(Math.random() * 24);
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        date.setHours(randomHour);
        
        const devices = ['iPhone (Safari)', 'Android (Chrome)', 'Android (Firefox)', 'iPhone (Chrome)'];
        const referrers = ['NFC Scan', 'QR Code'];

        mockScans.push({
          id: `scan-${i}`,
          card_id: cardId,
          device: devices[Math.floor(Math.random() * devices.length)],
          referrer: referrers[Math.random() > 0.3 ? 0 : 1],
          created_at: date.toISOString()
        });
      }
      this.setStorageItem('nfc_scans', mockScans);
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

  // Generador de Códigos Secuenciales (STT-XXXX para Placas / STTT-XXXX para Tarjetas)
  getNextStickerCode(deviceType: string = 'plate'): string {
    const cards = this.getCards();
    const isCard = (deviceType || '').toLowerCase().includes('card') || (deviceType || '').toLowerCase().includes('tarjeta');
    const prefix = isCard ? 'STTT' : 'STT';
    let maxNumber = 1000;

    cards.forEach(c => {
      const codeId = c.activation_code || c.card_id || '';
      if (isCard) {
        const match = codeId.match(/^STTT-(\d+)/i);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxNumber) maxNumber = num;
        }
      } else {
        const match = codeId.match(/^STT-(\d+)/i);
        if (match && match[1] && !codeId.toUpperCase().startsWith('STTT-')) {
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
      if (!email) return;

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
      if (!email) return;

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
      if (!email) return;

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
    return this.getCards().filter(c => 
      Boolean(c.claimed) && (
        c.owner_email.trim().toLowerCase() === cleanEmail || 
        (c.owner_id && c.owner_id === emailOrId && c.owner_id !== 'admin' && c.owner_id !== 'unassigned')
      )
    );
  }

  async getCardsByOwnerAsync(emailOrId: string): Promise<NfcCard[]> {
    const cleanEmail = emailOrId.trim().toLowerCase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('nfc_cards')
          .select('*')
          .eq('claimed', true)
          .or(`owner_email.ilike.${cleanEmail},owner_id.eq.${emailOrId}`);
        if (!error && data) {
          const claimedOnly = (data as NfcCard[]).filter(c => Boolean(c.claimed) && c.owner_email?.trim().toLowerCase() === cleanEmail);
          const currentCards = this.getCards();
          claimedOnly.forEach(remoteCard => {
            const idx = currentCards.findIndex(c => c.card_id === remoteCard.card_id);
            if (idx !== -1) {
              currentCards[idx] = remoteCard;
            } else {
              currentCards.unshift(remoteCard);
            }
          });
          this.setStorageItem('nfc_cards', currentCards);
          return claimedOnly;
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

  // Analíticas de Escaneo
  registerScan(cardId: string, device: string, referrer: string, scanType: 'nfc' | 'qr' = 'nfc', groupName: string = 'General'): void {
    const scans = this.getStorageItem<ScanRecord[]>('nfc_scans', []);
    const newScan: ScanRecord = {
      id: `scan-${Date.now()}-${Math.random()}`,
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

    if (supabase) {
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
}

export const dbLocal = new LocalDbService();

// Inicializar la base simulada si estamos corriendo en navegador
if (typeof window !== 'undefined') {
  dbLocal.init();
}
