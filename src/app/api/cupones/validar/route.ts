import { NextRequest, NextResponse } from 'next/server';
import { revisarCupon } from '@/lib/cupones';

/**
 * Valida un cupón contra la MISMA fuente que usa el cobro.
 *
 * Es publico a proposito: el checkout lo consulta antes de mostrar el
 * descuento, para que el cliente no vea en pantalla una rebaja que despues
 * el servidor va a rechazar.
 */

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code') || '';

  try {
    const resultado = await revisarCupon(code);
    return NextResponse.json(resultado);
  } catch (e: any) {
    console.error('[CUPONES_VALIDAR] Error validando el cupón', e);
    return NextResponse.json(
      { valido: false, error: 'No pudimos validar el cupón ahora mismo. Inténtalo de nuevo.' },
      { status: 500 }
    );
  }
}
