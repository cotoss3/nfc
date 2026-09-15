import { NextResponse } from 'next/server';
import { getCatalogoConPrecios } from '@/lib/precios';

export const dynamic = 'force-dynamic';

/**
 * Catalogo con los precios vigentes. La tienda lee de aqui para mostrar
 * exactamente lo mismo que se va a cobrar.
 */
export async function GET() {
  try {
    const productos = await getCatalogoConPrecios();
    return NextResponse.json(
      { success: true, productos },
      { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' } }
    );
  } catch (error: any) {
    console.error('[CATALOGO_ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'No pudimos cargar el catálogo.' },
      { status: 500 }
    );
  }
}
