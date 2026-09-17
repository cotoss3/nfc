import type { Metadata } from 'next';

const BASE_URL = 'https://startap.com.pa';

export const metadata: Metadata = {
  title: 'Checkout Seguro · starTAP Panamá',
  description: 'Finaliza tu pedido de dispositivos NFC para reseñas de Google. Pago seguro con tarjeta o Yappy.',
  alternates: { canonical: `${BASE_URL}/checkout` },
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
