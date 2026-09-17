import type { Metadata } from 'next';

const BASE_URL = 'https://startap.com.pa';

export const metadata: Metadata = {
  title: 'Tu Carrito · starTAP Panamá',
  description: 'Revisa los productos NFC que seleccionaste y finaliza tu pedido con envío a todo Panamá.',
  alternates: { canonical: `${BASE_URL}/cart` },
  robots: { index: false, follow: false },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
