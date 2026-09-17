import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://startap.com.pa/app' },
};

export default function FuncionesRedirect() {
  redirect('/app');
}

