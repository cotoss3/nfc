import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CardsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto text-center space-y-4 mt-20">
      <h1 className="text-2xl font-bold text-slate-900">Módulo de cards</h1>
      <p className="text-slate-500">Este módulo está siendo migrado a su URL independiente.</p>
      <div className="pt-4">
        <Link href="/master-control" className="inline-flex items-center gap-2 text-amber-600 font-bold hover:underline">
          <ArrowLeft className="w-4 h-4" /> Volver al Dashboard
        </Link>
      </div>
    </div>
  );
}