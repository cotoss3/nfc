import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://startap.com.pa/catalogo' },
};

export default function ShopPage() {
  redirect('/catalogo');
}

