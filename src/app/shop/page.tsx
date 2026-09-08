import type { Metadata } from 'next';
import ShopClient from './ShopClient';

export const metadata: Metadata = {
  title: 'Tienda: Dispositivos NFC para Reseñas',
  description:
    'Stands, tarjetas y placas NFC para multiplicar las reseñas de Google de tu negocio. Precios en dólares, pago con Yappy o tarjeta, envíos a todo Panamá.',
  alternates: { canonical: '/shop' },
};

export default function Page() {
  return <ShopClient />;
}
