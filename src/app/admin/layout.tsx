import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'starTAP Admin - Panamá Master',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'none',
      'max-snippet': -1,
    },
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-root min-h-screen bg-slate-50">
      {children}
    </div>
  );
}
