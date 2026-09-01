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
  logo_url?: string;
  initial_redirect_url?: string;
  selected_color?: string;
  business_name?: string;
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
  is_active: boolean;
  type: string;
  created_at: string;
}

export interface ScanRecord {
  id: string;
  card_id: string;
  device: string;
  referrer: string;
  created_at: string;
}

// Productos semilla predeterminados
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'stand-nfc',
    name: 'Stand NFC para Reseñas de Google',
    description: 'Stand NFC optimizado para SEO local. Perfecto para capturar reseñas para restaurante y comercios. Mejora tu posicionamiento en Google Maps al instante y vende más en Panamá. Elegante, sin apps y listo para usar.',
    price: 17.00,
    image: 'https://tapreview.es/wp-content/uploads/2025/01/stand-nfc-tapreview.webp',
    images: [
      'https://tapreview.es/wp-content/uploads/2025/01/stand-nfc-tapreview.webp',
      'https://tapreview.es/wp-content/uploads/2025/01/StandNFC-Google.webp'
    ],
    material: 'PVC Técnico',
    category: 'accessories',
    type: 'google'
  },
  {
    id: 'tarjeta-nfc',
    name: 'Tarjeta NFC para Reseñas de Google',
    description: 'Tarjeta NFC portátil para disparar tu SEO local. Lleva tu captación de clientes a otro nivel: obtén reseñas para restaurante, clínica o tienda con un solo toque y vende más en Panamá rápidamente.',
    price: 15.00,
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
    price: 15.00,
    image: 'https://tapreview.es/wp-content/uploads/2025/01/Placa-nfc-tapreview.webp',
    images: [
      'https://tapreview.es/wp-content/uploads/2025/01/Placa-nfc-tapreview.webp',
      'https://tapreview.es/wp-content/uploads/2025/01/Placa2-nfc-tapreview.webp'
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
    image: '/products/NFC_10001/NFC_10001_white_1.png',
    images: [
      '/products/NFC_10001/NFC_10001_white_1.png',
      '/products/NFC_10001/NFC_10001_white_0.png',
      '/products/NFC_10001/NFC_10001_white_2.png',
      '/products/NFC_10001/NFC_10001_white_3.png',
      '/products/NFC_10001/NFC_10001_white_4.png'
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

// MOTOR DE BASE DE DATOS LOCAL (Fallback)
class LocalDbService {
  private getStorageItem<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  }

  private setStorageItem<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  }

  // Inicializar bases simuladas si no existen
  init() {
    if (typeof window === 'undefined') return;
    
    const storedProducts = this.getStorageItem<Product[]>('nfc_products', []);
    const hasNewProduct = storedProducts.some(p => p.id === 'NFC_10001');
    const isGooglePlacaPVC = storedProducts.some(p => p.id === 'placa-google' && p.name.includes('PVC'));
    const hasAirbnb = storedProducts.some(p => p.id === 'placa-airbnb');
    const isNFC10001ImageUpdated = storedProducts.some(p => p.id === 'NFC_10001' && p.image.includes('white_1.png'));
    const hasStandNFC = storedProducts.some(p => p.id === 'stand-nfc');
    const hasTarjetaNFC = storedProducts.some(p => p.id === 'tarjeta-nfc');
    const hasPlacaNFC = storedProducts.some(p => p.id === 'placa-acrilica-nfc');
    const hasSEO = storedProducts.some(p => p.id === 'stand-nfc' && p.description.includes('SEO local'));
    const hasAllSEO = storedProducts.some(p => p.id === 'llavero-google' && p.description.includes('SEO local'));
    
    if (storedProducts.length === 0 || !hasNewProduct || !isGooglePlacaPVC || !hasAirbnb || !isNFC10001ImageUpdated || !hasStandNFC || !hasTarjetaNFC || !hasPlacaNFC || !hasSEO || !hasAllSEO) {
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
          card_id: 'cafe-panama-nfc',
          owner_id: 'user-carlos',
          owner_name: 'Carlos Mendoza',
          owner_email: 'carlos.mendoza@gmail.com',
          label: 'Placa de Mostrador Principal',
          target_url: 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeoQI8Rk3_JiM7UtGU',
          is_active: true,
          type: 'google',
          created_at: new Date(Date.now() - 3600000 * 48).toISOString()
        }
      ]);
    }
    if (!localStorage.getItem('nfc_scans')) {
      const cardId = 'cafe-panama-nfc';
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

  // Métodos de Pedidos
  getOrders(): Order[] {
    return this.getStorageItem('nfc_orders', []);
  }

  getOrderById(id: string): Order | undefined {
    return this.getOrders().find(o => o.id === id);
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

    // Crear tarjetas NFC asociadas a este pedido de forma automática para simular el fulfillment
    const cards = this.getCards();
    newOrder.items.forEach((item, index) => {
      for (let i = 0; i < item.quantity; i++) {
        const customId = `${item.product_id}-${Math.floor(100000 + Math.random() * 900000)}`;
        cards.push({
          card_id: customId,
          owner_id: 'user-session', // Asignar al usuario actual de prueba
          owner_name: newOrder.customer_name,
          owner_email: newOrder.customer_email,
          label: `${item.product_name} (${i + 1})`,
          target_url: item.initial_redirect_url || 'https://google.com',
          is_active: true,
          type: item.product_id.includes('google') ? 'google' : item.product_id.includes('tripadvisor') ? 'tripadvisor' : item.product_id.includes('instagram') ? 'instagram' : 'vcard',
          created_at: new Date().toISOString()
        });
      }
    });
    this.setStorageItem('nfc_cards', cards);

    return newOrder;
  }

  updateOrderStatus(orderId: string, status: Order['status']): void {
    const orders = this.getOrders();
    const updated = orders.map(o => o.id === orderId ? { ...o, status } : o);
    this.setStorageItem('nfc_orders', updated);
  }

  // Métodos de Tarjetas NFC
  getCards(): NfcCard[] {
    return this.getStorageItem('nfc_cards', []);
  }

  getCardsByOwner(emailOrId: string): NfcCard[] {
    return this.getCards().filter(c => c.owner_email === emailOrId || c.owner_id === emailOrId);
  }

  getCardById(cardId: string): NfcCard | undefined {
    return this.getCards().find(c => c.card_id === cardId);
  }

  updateCardRedirect(cardId: string, targetUrl: string, label: string): boolean {
    const cards = this.getCards();
    const index = cards.findIndex(c => c.card_id === cardId);
    if (index !== -1) {
      cards[index].target_url = targetUrl;
      cards[index].label = label;
      this.setStorageItem('nfc_cards', cards);
      return true;
    }
    return false;
  }

  // Analíticas de Escaneo
  registerScan(cardId: string, device: string, referrer: string): void {
    const scans = this.getStorageItem<ScanRecord[]>('nfc_scans', []);
    scans.push({
      id: `scan-${Date.now()}-${Math.random()}`,
      card_id: cardId,
      device,
      referrer,
      created_at: new Date().toISOString()
    });
    this.setStorageItem('nfc_scans', scans);
  }

  getScansForCard(cardId: string): ScanRecord[] {
    const scans = this.getStorageItem<ScanRecord[]>('nfc_scans', []);
    return scans.filter(s => s.card_id === cardId);
  }
}

export const dbLocal = new LocalDbService();

// Inicializar la base simulada si estamos corriendo en navegador
if (typeof window !== 'undefined') {
  dbLocal.init();
}
