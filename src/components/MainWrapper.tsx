'use client';

import { usePathname } from 'next/navigation';

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMasterControl = pathname?.startsWith('/master-control');

  return (
    <main className={`flex-grow ${isMasterControl ? 'pt-0' : 'pt-20'}`}>
      {children}
    </main>
  );
}
