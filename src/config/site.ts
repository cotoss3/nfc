/**
 * Configuración pública centralizada (Config)
 * Centraliza las variables de configuración del cliente de forma segura y tipada.
 */
export const Config = {
  siteUrl: 'https://startap.com.pa',
  brand: {
    name: 'starTAP Panamá',
    supportEmail: 'info@startap.com.pa',
    ordersEmail: 'pedidos@send.startap.com.pa',
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xnepnlaoiflngtikozqd.supabase.co',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  pixels: {
    facebook: process.env.NEXT_PUBLIC_FB_PIXEL_ID || '1591597945771251',
    tiktok: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || 'DAKQIS3C77U8PGIBH830',
  },
};
