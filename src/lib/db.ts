import { createClient } from '@supabase/supabase-js';

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
  payment_method: 'tarjeta' | 'yappy';
  payment_status: 'pending' | 'completed';
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  total: number;
  items: OrderItem[];
  created_at: string;
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
  created_at: string;
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

// Productos semilla predeterminados
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'stand-nfc',
    name: 'Stand NFC para Reseñas de Google',
    description: 'Stand NFC optimizado para SEO local. Perfecto para capturar reseñas para restaurante y comercios. Mejora tu posicionamiento en Google Maps al instante y vende más en Panamá. Elegante, sin apps y listo para usar.',
    price: 35.00,
    image: '/products/NFC10002/NFC_10002_Stan.webp',
    images: [
      '/products/NFC10002/NFC_10002_Stan.webp',
      '/products/NFC10002/NFC_10002_Stan.png'
    ],
    material: 'PVC Técnico',
    category: 'accessories',
    type: 'google'
  },
  {
    id: 'tarjeta-nfc',
    name: 'Tarjeta NFC para Reseñas de Google',
    description: 'Tarjeta NFC portátil para disparar tu SEO local. Lleva tu captación de clientes a otro nivel: obtén reseñas para restaurante, clínica o tienda con un solo toque y vende más en Panamá rápidamente.',
    price: 20.00,
    image: 'https://tapreview.es/wp-content/uploads/2025/01/Tarjeta-NFC-TapReview.webp',
    images: [
      'https://tapreview.es/wp-content/uploads/2025/01/Tarjeta-NFC-TapReview.webp',
      'https://tapreview.es/wp-content/uploads/2025/01/Tarjeta-NFC-Resenas-Google-funcionando.webp'
    ],
    material: 'PVC Premium',
    category: 'cards',
    type: 'google'
  },
  {
    id: 'placa-acrilica-nfc',
    name: 'Placa NFC para Reseñas de Google',
    description: 'Placa NFC de instalación permanente. La herramienta definitiva de SEO local para conseguir reseñas para restaurante, recepción o local comercial. Domina las búsquedas orgánicas y vende más en Panamá.',
    price: 30.00,
    image: '/products/NFC_10001/NFC_10001_Placa.webp',
    images: [
      '/products/NFC_10001/NFC_10001_Placa.webp',
      '/products/NFC_10001/NFC_10001_Placa.png'
    ],
    material: 'PVC de alta densidad',
    category: 'plates',
    type: 'google'
  },
  {
    id: 'NFC_10001',
    name: 'Placa NFC Google Reviews Elite (Acrílico Blanco)',
    description: 'Aumenta tus reseñas de Google Maps de forma rápida y mejora tu SEO local en Panamá. Diseñada en elegante acrílico blanco pulido de 3mm, perfecta para capturar reseñas para restaurante o clínica. Pago único de por vida y vende más en Panamá sin mensualidades.',
    price: 34.99,
    image: '/products/NFC_10001/NFC_10001_Placa.webp',
    images: [
      '/products/NFC_10001/NFC_10001_Placa.webp',
      '/products/NFC_10001/NFC_10001_Placa.png'
    ],
    category: 'plates',
    type: 'google'
  },
  {
    id: 'placa-google',
    name: 'Tarjeta NFC Google Reviews (PVC)',
    description: 'Tarjeta inteligente de PVC premium para llevar tu estrategia de SEO local en el bolsillo. Consigue reseñas en Google Maps, recolecta reseñas para restaurante o atención a domicilio y vende más en Panamá con un solo toque.',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
    colors: ['Negro Mate', 'Blanco Mate'],
    material: 'PVC Premium 0.76mm (Grado Tarjeta de Crédito)',
    category: 'cards',
    type: 'google'
  },
  {
    id: 'placa-tripadvisor',
    name: 'Placa NFC TripAdvisor (Acrílico)',
    description: 'Ideal para hoteles, cafeterías y conseguir reseñas para restaurante turísticos. Impulsa tu reputación online, fortalece tu SEO local y vende más en Panamá logrando que los clientes te califiquen al instante.',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600',
    category: 'plates',
    type: 'tripadvisor'
  },
  {
    id: 'placa-instagram',
    name: 'Placa NFC Instagram Followers',
    description: 'Aumenta tus seguidores orgánicamente en tu tienda o restaurante. Apoya tu estrategia de SEO local en redes sociales y vende más en Panamá redirigiendo a tu perfil de Instagram con un solo toque.',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=600',
    category: 'plates',
    type: 'instagram'
  },
  {
    id: 'placa-airbnb',
    name: 'Placa NFC Airbnb Connect (Acrílico)',
    description: 'Placa premium para anfitriones. Permite a tus huéspedes conectarse al WiFi o dejar calificación 5 estrellas al instante. Mejora tu posicionamiento de SEO local en la plataforma de turismo y vende más en Panamá.',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600',
    colors: ['Negro Mate', 'Blanco Brillante', 'Dorado Espejo', 'Plata Cepillado'],
    material: 'Acrílico Premium 3mm',
    category: 'plates',
    type: 'airbnb'
  },
  {
    id: 'tarjeta-pvc',
    name: 'Tarjeta de Presentación NFC PVC',
    description: 'Tarjeta inteligente de PVC mate. Potencia tu networking y contribuye a tu SEO local al compartir todos tus datos comerciales al instante. Vende más en Panamá con una presentación inolvidable.',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
    category: 'cards',
    type: 'vcard'
  },
  {
    id: 'tarjeta-madera',
    name: 'Tarjeta de Presentación NFC Madera Ecológica',
    description: 'Tarjeta inteligente fabricada en madera natural. Una primera impresión premium que apoya tu SEO local. Cierra más tratos y vende más en Panamá proyectando una imagen ecológica.',
    price: 39.99,
    image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=600',
    category: 'cards',
    type: 'vcard'
  },
  {
    id: 'llavero-google',
    name: 'Llavero NFC Google Reviews',
    description: 'Llavero de resina ultra resistente. El accesorio ideal de SEO local para personal de entrega y captura de reseñas para restaurante a domicilio. Vende más en Panamá multiplicando tus reviews donde vayas.',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&q=80&w=600',
    category: 'accessories',
    type: 'google'
  }
];

// Inicializar cliente real de Supabase si existen variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isRealSupabaseConfigured = supabaseUrl !== '' && supabaseAnonKey !== '';

export const supabase = isRealSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const DEFAULT_SEED_CARDS: NfcCard[] = [
  {
    card_id: 'STT-1001',
    activation_code: 'STT-1001',
    owner_id: 'user-carlos',
    owner_name: 'Carlos Mendoza',
    owner_email: 'carlos.mendoza@gmail.com',
    label: 'Placa de Mostrador (STT-1001)',
    target_url: 'https://google.com',
    is_active: true,
    claimed: true,
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
    const hasNewProduct = storedProducts.some(p => p.id === 'NFC_10001');
    const isGooglePlacaPVC = storedProducts.some(p => p.id === 'placa-google' && p.name.includes('PVC'));
    const hasAirbnb = storedProducts.some(p => p.id === 'placa-airbnb');
    const isWebpImagesUpdated = storedProducts.some(p => (p.id === 'NFC_10001' || p.id === 'stand-nfc') && p.image.includes('/products/') && p.image.includes('.webp'));
    const hasStandNFC = storedProducts.some(p => p.id === 'stand-nfc');
    const hasTarjetaNFC = storedProducts.some(p => p.id === 'tarjeta-nfc');
    const hasPlacaNFC = storedProducts.some(p => p.id === 'placa-acrilica-nfc');
    const hasSEO = storedProducts.some(p => p.id === 'stand-nfc' && p.description.includes('SEO local'));
    const hasAllSEO = storedProducts.some(p => p.id === 'llavero-google' && p.description.includes('SEO local'));
    const hasCorrectPrices = storedProducts.some(p => p.id === 'stand-nfc' && p.price === 35.00);
    
    if (storedProducts.length === 0 || !hasNewProduct || !isGooglePlacaPVC || !hasAirbnb || !isWebpImagesUpdated || !hasStandNFC || !hasTarjetaNFC || !hasPlacaNFC || !hasSEO || !hasAllSEO || !hasCorrectPrices) {
      this.setStorageItem('nfc_products', INITIAL_PRODUCTS);
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
    return this.getStorageItem('nfc_products', INITIAL_PRODUCTS);
  }

  getProductById(id: string): Product | undefined {
    return this.getProducts().find(p => p.id === id);
  }

  updateProductPrice(id: string, newPrice: number): boolean {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index].price = newPrice;
      this.setStorageItem('nfc_products', products);
      if (supabase) {
        supabase.from('products').update({ price: newPrice }).eq('id', id).then();
      }
      return true;
    }
    return false;
  }

  updateFullProduct(id: string, updates: Partial<Product>): boolean {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = {
        ...products[index],
        ...updates
      };
      this.setStorageItem('nfc_products', products);
      if (supabase) {
        supabase.from('products').upsert(products[index]).then(({ error }) => {
          if (error) console.error('Error actualizando producto en Supabase:', error);
        });
      }
      return true;
    }
    return false;
  }

  createProduct(product: Product): boolean {
    const products = this.getProducts();
    const existingIndex = products.findIndex(p => p.id === product.id);
    if (existingIndex !== -1) {
      products[existingIndex] = product;
    } else {
      products.unshift(product);
    }
    this.setStorageItem('nfc_products', products);
    if (supabase) {
      supabase.from('products').upsert(product).then(({ error }) => {
        if (error) console.error('Error insertando producto en Supabase:', error);
      });
    }
    return true;
  }

  // Métodos de Pedidos
  getOrders(): Order[] {
    return this.getStorageItem('nfc_orders', []);
  }

  getOrderById(id: string): Order | undefined {
    return this.getOrders().find(o => o.id === id);
  }

  // Generador de Códigos Secuenciales para Etiquetas de Sticker STT-XXXX
  getNextStickerCode(): string {
    const cards = this.getCards();
    let maxNumber = 1000;

    cards.forEach(c => {
      const codeMatch = (c.activation_code || c.card_id).match(/STT-(\d+)/i);
      if (codeMatch && codeMatch[1]) {
        const num = parseInt(codeMatch[1], 10);
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      }
    });

    const nextNum = maxNumber + 1;
    return `STT-${nextNum}`;
  }

  createOrder(orderData: Omit<Order, 'id' | 'created_at'>): Order {
    const orders = this.getOrders();
    const newOrder: Order = {
      ...orderData,
      id: `PED-${Math.floor(1000 + Math.random() * 9000)}`,
      created_at: new Date().toISOString()
    };
    orders.unshift(newOrder);
    this.setStorageItem('nfc_orders', orders);

    // Crear tarjetas NFC asociadas a este pedido con etiquetas STT-XXXX
    const cards = this.getCards();
    const newCardsToSync: NfcCard[] = [];

    newOrder.items.forEach((item) => {
      for (let i = 0; i < item.quantity; i++) {
        const sttCode = this.getNextStickerCode();
        const cardObj: NfcCard = {
          card_id: sttCode,
          activation_code: sttCode,
          owner_id: 'user-session',
          owner_name: newOrder.customer_name,
          owner_email: newOrder.customer_email.trim().toLowerCase(),
          label: `${item.product_name} (${sttCode})`,
          target_url: item.initial_redirect_url || 'https://search.google.com/local/writereview?placeid=...',
          is_active: true,
          claimed: true,
          type: item.product_id.includes('google') ? 'google' : item.product_id.includes('tripadvisor') ? 'tripadvisor' : item.product_id.includes('instagram') ? 'instagram' : 'vcard',
          created_at: new Date().toISOString()
        };
        cards.push(cardObj);
        newCardsToSync.push(cardObj);
      }
    });
    this.setStorageItem('nfc_cards', cards);

    // Sincronización Real-Time con Supabase
    if (supabase) {
      if (newCardsToSync.length > 0) {
        supabase.from('nfc_cards').upsert(newCardsToSync).then(({ error }) => {
          if (error) console.error('Error sincronizando tarjetas de orden en Supabase:', error);
        });
      }
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

  // Métodos de Tarjetas NFC
  getCards(): NfcCard[] {
    return this.getStorageItem('nfc_cards', DEFAULT_SEED_CARDS);
  }

  async getCardsAsync(): Promise<NfcCard[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('nfc_cards').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          this.setStorageItem('nfc_cards', data);
          return data;
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
      c.owner_email.trim().toLowerCase() === cleanEmail || 
      c.owner_id === emailOrId
    );
  }

  async getCardsByOwnerAsync(emailOrId: string): Promise<NfcCard[]> {
    const cleanEmail = emailOrId.trim().toLowerCase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('nfc_cards')
          .select('*')
          .or(`owner_email.ilike.${cleanEmail},owner_id.eq.${emailOrId}`);
        if (!error && data && data.length > 0) {
          const currentCards = this.getCards();
          data.forEach(remoteCard => {
            const idx = currentCards.findIndex(c => c.card_id === remoteCard.card_id);
            if (idx !== -1) {
              currentCards[idx] = remoteCard;
            } else {
              currentCards.unshift(remoteCard);
            }
          });
          this.setStorageItem('nfc_cards', currentCards);
          return data;
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

    // Pattern STT-X -> STT-100X (ej. STT-1 -> STT-1001)
    const sttMatch = clean.match(/^stt-(\d+)$/i);
    if (sttMatch) {
      const num = parseInt(sttMatch[1], 10);
      if (num < 1000) {
        const fullCode = `stt-${1000 + num}`;
        const found = cards.find(c => 
          c.card_id.toLowerCase() === fullCode || 
          (c.activation_code && c.activation_code.toLowerCase() === fullCode)
        );
        if (found) return found.card_id;
      }
    }

    // Number only "1" -> "STT-1001"
    const numOnly = parseInt(clean, 10);
    if (!isNaN(numOnly)) {
      const targetCode = numOnly < 1000 ? `stt-${1000 + numOnly}` : `stt-${numOnly}`;
      const found = cards.find(c => 
        c.card_id.toLowerCase() === targetCode || 
        (c.activation_code && c.activation_code.toLowerCase() === targetCode)
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
    const isAdmin = cleanEmail === 'admin@startap.com.pa' || cleanEmail.includes('admin');
    
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

  claimCard(codeOrCardId: string, ownerEmail: string, ownerName: string = ''): { success: boolean; message: string; card?: NfcCard } {
    const cards = this.getCards();
    const resolvedId = this.resolveCardId(codeOrCardId, cards);
    const cleanEmail = ownerEmail.trim().toLowerCase();
    
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
        claimed: true
      };
      this.setStorageItem('nfc_cards', cards);

      if (supabase) {
        supabase.from('nfc_cards').update({
          owner_email: cleanEmail,
          owner_name: ownerName || cleanEmail.split('@')[0],
          claimed: true
        }).eq('card_id', card.card_id).then();
      }

      return { success: true, message: '¡Dispositivo TAP vinculado exitosamente a tu negocio!', card: cards[cardIndex] };
    }

    const rawCode = codeOrCardId.trim().toUpperCase();
    const newCard: NfcCard = {
      card_id: rawCode.startsWith('STT-') || rawCode.startsWith('TAP-') ? rawCode : `STT-${rawCode}`,
      activation_code: rawCode,
      owner_id: 'user-' + Date.now(),
      owner_name: ownerName || cleanEmail.split('@')[0],
      owner_email: cleanEmail,
      label: `Dispositivo TAP (${rawCode})`,
      target_url: 'https://google.com',
      is_active: false, // REQUIERE HABILITACIÓN DE ADMIN
      claimed: true,
      type: 'google',
      created_at: new Date().toISOString()
    };

    cards.unshift(newCard);
    this.setStorageItem('nfc_cards', cards);

    if (supabase) {
      supabase.from('nfc_cards').upsert(newCard).then();
    }

    return { success: true, message: '¡Dispositivo vinculado a tu negocio! (Pendiente de activación por Administrador)', card: newCard };
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
    this.setStorageItem('nfc_scans', scans);

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
