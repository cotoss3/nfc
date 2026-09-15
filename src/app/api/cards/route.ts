import { NextRequest, NextResponse } from 'next/server';
import { dbLocal } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const STORE_FILE = path.join(process.cwd(), 'db_store.json');

// Rutas protegidas para sincronización de almacenamiento local
const ALLOWED_KEYS = new Set([
  'nfc_cards',
  'nfc_products',
  'nfc_deleted_product_ids',
  'nfc_scans',
  'nfc_users'
]);

export async function GET() {
  // Bloquear volcado no autenticado de la base de datos completa
  return NextResponse.json(
    { error: 'Acceso denegado. El almacén de datos no permite lecturas públicas completas.' },
    { status: 403 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const { key, value } = await request.json();
    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Parámetros key o value faltantes' }, { status: 400 });
    }

    if (typeof key !== 'string' || !ALLOWED_KEYS.has(key)) {
      return NextResponse.json({ error: 'Clave de almacenamiento no permitida' }, { status: 403 });
    }

    // Actualizar memoria e ingresar al archivo local mediante dbLocal
    dbLocal.setStorageItem(key, value);

    return NextResponse.json({ success: true, key }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
      }
    });
  } catch (error) {
    console.error('Error saving server db store:', error);
    return NextResponse.json({ error: 'Failed to update store' }, { status: 500 });
  }
}
