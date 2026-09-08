import type { Metadata } from 'next';
import CorporativoClient from './CorporativoClient';

export const metadata: Metadata = {
  title: 'Planes Corporativos y Multi-Sucursal',
  description:
    'Gestiona las reseñas de Google de todas tus sucursales desde un solo panel. Dispositivos NFC personalizados y facturación empresarial en Panamá.',
  alternates: { canonical: '/corporativo' },
};

export default function Page() {
  return <CorporativoClient />;
}
