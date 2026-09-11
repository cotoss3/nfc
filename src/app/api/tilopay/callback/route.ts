import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return handleCallback(req);
}

export async function POST(req: NextRequest) {
  return handleCallback(req);
}

async function handleCallback(req: NextRequest) {
  const host = req.headers.get('host') || 'startap.com.pa';
  const protocol = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;

  const searchParams = req.nextUrl.searchParams;
  let code: string | null = searchParams.get('code');
  let order: string | null = searchParams.get('order') || searchParams.get('orderNumber');
  let reason: string | null = searchParams.get('reason') || searchParams.get('message') || '';

  // If POST request, params might be in formdata / json body
  if (req.method === 'POST') {
    try {
      const contentType = req.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const body = await req.json();
        code = code || (body.code ? String(body.code) : null) || (body.response ? String(body.response) : null);
        order = order || (body.order ? String(body.order) : null) || (body.orderNumber ? String(body.orderNumber) : null);
        reason = reason || (body.reason ? String(body.reason) : null) || (body.message ? String(body.message) : null);
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        const formData = await req.formData();
        code = code || (formData.get('code') as string);
        order = order || (formData.get('order') as string) || (formData.get('orderNumber') as string);
        reason = reason || (formData.get('reason') as string) || (formData.get('message') as string);
      }
    } catch (e) {
      console.warn('[TILOPAY_CALLBACK_BODY_PARSE_WARN]', e);
    }
  }

  const isSuccess = code === '1' || code === '100';

  if (isSuccess) {
    const successUrl = new URL('/checkout', baseUrl);
    successUrl.searchParams.set('status', 'success');
    if (order) successUrl.searchParams.set('order', order);
    return NextResponse.redirect(successUrl.toString(), 303);
  } else {
    const failUrl = new URL('/checkout', baseUrl);
    failUrl.searchParams.set('status', 'failed');
    if (reason) failUrl.searchParams.set('reason', reason);
    if (order) failUrl.searchParams.set('order', order);
    return NextResponse.redirect(failUrl.toString(), 303);
  }
}
