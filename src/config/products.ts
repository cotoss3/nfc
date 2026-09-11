export interface ProductConfig {
  id: string; // SKU principal
  aliases?: string[]; // SKUs legacy para compatibilidad
  name: string;
  category: string;
  categoryLabel: string;
  material: string;
  price: number; // Precio entero en USD
  priceFormatted: string;
  badge: string;
  description: string;
  useCase: string;
  image: string;
  images: string[];
  isPack?: boolean;
  savingsText?: string;
  shippingNote?: string;
  spec?: string;
  type: string;
}

export const PRODUCTS: ProductConfig[] = [
  {
    id: 'tarjeta-nfc-bolsillo',
    aliases: ['tarjeta-nfc', 'placa-google'],
    name: 'Tarjeta NFC de Bolsillo',
    category: 'cards',
    categoryLabel: 'TARJETA DE BOLSILLO',
    material: 'PVC CONTACTLESS 0.76MM | NFC + QR',
    price: 20,
    priceFormatted: '$20.00',
    badge: 'PVC Contactless 0.76mm',
    description: 'Tarjeta de PVC tamaño tarjeta de crédito. Llévala en tu billetera o portacredencial para solicitar valoraciones en entregas, visitas técnicas o eventos.',
    useCase: 'Meseros, técnicos en ruta, repartidores y eventos.',
    image: '/products/tarjeta-nfc/tarjeta-nfc-bolsillo-resenas-google-panama.webp',
    images: [
      '/products/tarjeta-nfc/tarjeta-nfc-bolsillo-resenas-google-panama.webp',
      '/products/tarjeta-nfc/tarjeta-nfc-contactless-google-maps-panama.webp',
      '/products/tarjeta-nfc/tarjeta-nfc-bolsillo-dimensiones-especificaciones.webp'
    ],
    spec: 'Impermeable HD + Impresión de Alta Durabilidad',
    type: 'google'
  },
  {
    id: 'placa-nfc-mostrador',
    aliases: ['placa-acrilica-nfc', 'NFC_10001'],
    name: 'Placa NFC para Reseñas de Google',
    category: 'plates',
    categoryLabel: 'PLACA DE MOSTRADOR Y PARED',
    material: 'ACRÍLICO PREMIUM 3MM | NFC + QR',
    price: 30,
    priceFormatted: '$30.00',
    badge: 'Acrílico Premium 3mm',
    description: 'Acrílico pulido de 3mm con adhesivo 3M listo para instalar en tu caja de cobro o pared de atención. Captura reseñas antes de que el cliente abandone tu local.',
    useCase: 'Caja de cobro, recepción y mostradores de atención.',
    image: '/products/NFC_10001/NFC_10001_Placa.webp',
    images: [
      '/products/NFC_10001/NFC_10001_Placa.webp',
      '/products/NFC_10001/NFC_10001_Placa.png'
    ],
    spec: 'Adhesivo 3M Industrial + Chip NTAG Integrado',
    type: 'google'
  },
  {
    id: 'stand-nfc-mesa',
    aliases: ['stand-nfc', 'NFC10002'],
    name: 'Stand NFC para Reseñas de Google',
    category: 'stands',
    categoryLabel: 'STAND DE MESA Y RECEPCIÓN',
    material: 'PVC TÉCNICO AUTOPORTANTE | NFC + QR',
    price: 35,
    priceFormatted: '$35.00',
    badge: 'PVC Técnico Autoportante',
    description: 'Estructura rígida autoportante con ángulo de lectura optimizado para mesas y escritorios. Permite al cliente escanear o acercar el teléfono cómodamente.',
    useCase: 'Mesas de restaurantes, cafeterías, escritorios y clínicas.',
    image: '/products/NFC10002/NFC_10002_Stan.webp',
    images: [
      '/products/NFC10002/NFC_10002_Stan.webp',
      '/products/NFC10002/NFC_10002_Stan.png'
    ],
    spec: 'Ángulo Inclinado Ergonómico + Antena NFC Dual',
    type: 'google'
  },
  {
    id: 'pack-trio-comercial',
    aliases: ['pack-trio'],
    name: 'Pack Trío Comercial (1 Placa Mostrador + 2 Tarjetas de Bolsillo)',
    category: 'packs',
    categoryLabel: 'PAQUETE EMPRESARIAL',
    material: '1 PLACA ACRÍLICA 3MM + 2 TARJETAS PVC 0.76MM | NFC + QR',
    price: 50,
    priceFormatted: '$50.00',
    badge: 'Ahorro de $20.00 (28% OFF)',
    description: 'Equipa tu punto fijo de cobro y tu personal móvil. Incluye 1 Placa de Mostrador para recepción y 2 Tarjetas de Bolsillo para tu equipo de ventas o entregas.',
    useCase: 'Caja de cobro fija + personal móvil en campo.',
    image: '/products/NFC_10001/NFC_10001_Placa.webp',
    images: [
      '/products/NFC_10001/NFC_10001_Placa.webp',
      '/products/tarjeta-nfc/tarjeta-nfc-bolsillo-resenas-google-panama.webp'
    ],
    isPack: true,
    savingsText: 'Ahorro de $20.00 (28% OFF) vs compra individual',
    shippingNote: 'Envío gratis en Ciudad de Panamá',
    spec: 'Solución Completa de Captación Local',
    type: 'google'
  }
];

export function getProductById(id: string): ProductConfig | undefined {
  const normalizedId = id.trim().toLowerCase();
  return PRODUCTS.find(
    (p) => p.id === normalizedId || (p.aliases && p.aliases.includes(normalizedId))
  );
}

export function getMainHardwareProducts(): ProductConfig[] {
  return PRODUCTS.filter((p) => !p.isPack);
}

export function getSpecialPacks(): ProductConfig[] {
  return PRODUCTS.filter((p) => p.isPack);
}
