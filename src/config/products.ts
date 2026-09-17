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
  sku?: string;
  mpn?: string;
  gtin13?: string;
  ratingValue?: string;
  reviewCount?: string;
}

export const PRODUCTS: ProductConfig[] = [
  {
    id: 'tarjeta-nfc-bolsillo',
    aliases: ['tarjeta-nfc', 'placa-google'],
    sku: 'STP-NFC-CARD-01',
    mpn: 'STP-CRD-01',
    gtin13: '0745301294801',
    ratingValue: '4.9',
    reviewCount: '128',
    name: 'Tarjeta NFC de Bolsillo',
    category: 'cards',
    categoryLabel: 'TARJETA DE BOLSILLO',
    material: 'PVC BLANCO MATE 0.76MM | NFC + QR',
    price: 20,
    priceFormatted: '$20.00',
    badge: 'PVC Blanco Mate 0.76mm',
    description: 'Tarjeta de PVC tamaño tarjeta de crédito en acabado blanco mate. Llévala en tu billetera o portacredencial para solicitar valoraciones en entregas, visitas técnicas o eventos.',
    useCase: 'Meseros, técnicos en ruta, repartidores y eventos.',
    image: '/products/tarjeta-nfc/tarjeta-nfc-bolsillo-resenas-google-panama.webp',
    images: [
      '/products/tarjeta-nfc/tarjeta-nfc-bolsillo-resenas-google-panama.webp',
      '/products/tarjeta-nfc/tarjeta-nfc-en-lanyard-empleado.webp',
      '/products/tarjeta-nfc/tarjeta-nfc-contactless-google-maps-panama.webp',
      '/products/tarjeta-nfc/tarjeta-nfc-bolsillo-dimensiones-especificaciones.webp'
    ],
    spec: 'Impermeable HD + Impresión de Alta Durabilidad',
    type: 'google'
  },
  {
    id: 'placa-nfc-mostrador',
    aliases: ['placa-acrilica-nfc', 'NFC_10001'],
    sku: 'STP-NFC-PLACA-01',
    mpn: 'STP-PLC-01',
    gtin13: '0745301294818',
    ratingValue: '5.0',
    reviewCount: '184',
    name: 'Placa NFC para Reseñas de Google',
    category: 'plates',
    categoryLabel: 'PLACA DE MOSTRADOR Y PARED',
    material: 'ACRÍLICO BLANCO 3MM | NFC + QR',
    price: 30,
    priceFormatted: '$30.00',
    badge: 'Acrílico Blanco 3mm',
    description: 'Acrílico blanco pulido de 3mm con adhesivo 3M listo para instalar en tu caja de cobro o pared de atención. Captura reseñas antes de que el cliente abandone tu local.',
    useCase: 'Caja de cobro, recepción y mostradores de atención.',
    image: '/products/NFC_10001/NFC_10001_Placa.webp',
    images: [
      '/products/NFC_10001/NFC_10001_Placa.webp',
      '/products/NFC_10001/placa-acrilica-resistente-agua-limpieza.webp'
    ],
    spec: 'Adhesivo 3M Industrial + Chip NTAG Integrado',
    type: 'google'
  },
  {
    id: 'stand-nfc-mesa',
    aliases: ['stand-nfc', 'NFC10002'],
    sku: 'STP-NFC-STAND-01',
    mpn: 'STP-STD-01',
    gtin13: '0745301294825',
    ratingValue: '4.9',
    reviewCount: '96',
    name: 'Stand NFC para Reseñas de Google',
    category: 'stands',
    categoryLabel: 'STAND DE MESA Y RECEPCIÓN',
    material: 'PVC BLANCO MATE AUTOPORTANTE | NFC + QR',
    price: 35,
    priceFormatted: '$35.00',
    badge: 'PVC Blanco Mate Autoportante',
    description: 'Estructura rígida autoportante con ángulo de lectura optimizado para mesas y escritorios. Permite al cliente escanear o acercar el teléfono cómodamente.',
    useCase: 'Mesas de restaurantes, cafeterías, escritorios y clínicas.',
    image: '/products/NFC10002/stand-nfc-resenas-google-startap-panama.webp',
    images: [
        '/products/NFC10002/stand-nfc-resenas-google-startap-panama.webp',
        '/products/NFC10002/stand-nfc-taller-mecanico-clientes-felices.webp',
        '/products/NFC10002/stand-nfc-aumento-confianza-seo-local.webp',
        '/products/NFC10002/stand-nfc-escaneo-restaurante-panama.webp',
        '/products/NFC10002/panel-administracion-startap-nfc.webp'
      ],
    spec: 'Ángulo Inclinado Ergonómico + Antena NFC Dual',
    type: 'google'
  },
  {
    id: 'pack-trio-comercial',
    aliases: ['pack-trio'],
    sku: 'STP-NFC-TRIO-01',
    mpn: 'STP-TRIO-01',
    gtin13: '0745301294832',
    ratingValue: '5.0',
    reviewCount: '210',
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
  return PRODUCTS.filter((p) => !p.isPack && p.category !== 'test' && p.type !== 'test');
}

export function getSpecialPacks(): ProductConfig[] {
  return PRODUCTS.filter((p) => p.isPack && p.category !== 'test' && p.type !== 'test');
}
