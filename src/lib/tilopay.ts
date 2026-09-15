export interface TilopayPaymentRequest {
  orderNumber: string;
  amount: number;
  currency?: string; // Default USD
  billToFirstName: string;
  billToLastName: string;
  billToEmail: string;
  billToTelephone: string;
  billToAddress: string;
  billToAddress2?: string;
  billToCity?: string;
  billToState?: string;
  billToCountry?: string;
  redirectUrl: string;
}

export interface TilopayPaymentResponse {
  type: string;
  url?: string;
  message?: string;
  code?: string | number;
}

const TILOPAY_BASE_URL = 'https://app.tilopay.com/api/v1';

/**
 * Retrieves access token from Tilopay API
 */
export async function getTilopayToken(): Promise<string> {
  const apiuser = process.env.TILOPAY_API_USER;
  const password = process.env.TILOPAY_API_PASSWORD;

  if (!apiuser || !password) {
    throw new Error('Faltan las credenciales de Tilopay en las variables de entorno (TILOPAY_API_USER, TILOPAY_API_PASSWORD).');
  }

  const res = await fetch(`${TILOPAY_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ apiuser, password }),
    cache: 'no-store',
  });

  const data = await res.json();

  if (!res.ok || !data.access_token) {
    throw new Error(data.message || data.error || 'Error al autenticar con Tilopay.');
  }

  return data.access_token;
}

/**
 * Token del SDK (navegador). Es distinto del token del API:
 * dura 1 hora en vez de 24 y es el unico que baja al cliente.
 * apiuser y password nunca salen del servidor.
 */
export async function getTilopaySdkToken(): Promise<{ token: string; key: string; expiresIn: number }> {
  const apiuser = process.env.TILOPAY_API_USER;
  const password = process.env.TILOPAY_API_PASSWORD;
  const key = process.env.TILOPAY_API_KEY;

  // loginSdk pide TRES credenciales, no dos como /login. Si falta la key
  // Tilopay responde "Request not valid, missing username, password or key".
  if (!apiuser || !password || !key) {
    const faltan = [
      !apiuser && 'TILOPAY_API_USER',
      !password && 'TILOPAY_API_PASSWORD',
      !key && 'TILOPAY_API_KEY',
    ].filter(Boolean).join(', ');
    throw new Error(`Faltan credenciales de Tilopay en las variables de entorno: ${faltan}.`);
  }

  const res = await fetch(`${TILOPAY_BASE_URL}/loginSdk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiuser, password, key }),
    cache: 'no-store',
  });

  const data = await res.json();

  // Tilopay no garantiza 4xx en los errores: hay que mirar el cuerpo siempre.
  if (!res.ok || !data.access_token) {
    const detalle =
      data.message || data.description || data.error || JSON.stringify(data).slice(0, 200);
    console.error('[TILOPAY_LOGIN_SDK_ERROR]', res.status, detalle);
    throw new Error(`Tilopay rechazó el inicio de sesión del SDK: ${detalle}`);
  }

  // expires_in llega como fecha ("2026-09-15 13:32:06"), no como segundos.
  const vence = Date.parse(String(data.expires_in).replace(' ', 'T'));
  const expiresIn = Number.isFinite(vence)
    ? Math.max(60, Math.floor((vence - Date.now()) / 1000))
    : 3600;

  return { token: data.access_token, key, expiresIn };
}

/**
 * Creates a payment transaction in Tilopay and returns the secure checkout URL
 */
export async function createTilopayPayment(
  params: TilopayPaymentRequest
): Promise<TilopayPaymentResponse> {
  const apiKey = process.env.TILOPAY_API_KEY;

  if (!apiKey) {
    throw new Error('Falta TILOPAY_API_KEY en las variables de entorno.');
  }

  const token = await getTilopayToken();

  const payload = {
    redirect: params.redirectUrl,
    key: apiKey,
    amount: params.amount.toFixed(2),
    currency: params.currency || 'USD',
    orderNumber: params.orderNumber,
    capture: '1',
    billToFirstName: params.billToFirstName || 'Cliente',
    billToLastName: params.billToLastName || 'StarTAP',
    billToAddress: params.billToAddress || 'Panamá',
    billToAddress2: params.billToAddress2 || '',
    billToCity: params.billToCity || 'Panamá',
    billToState: params.billToState || 'PA-8',
    billToZipPostCode: '00000',
    billToCountry: params.billToCountry || 'PA',
    billToTelephone: params.billToTelephone || '67134341',
    billToEmail: params.billToEmail,
    subscription: '0',
    platform: 'api',
    token_version: 'v2',
  };

  const res = await fetch(`${TILOPAY_BASE_URL}/processPayment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `bearer ${token}`,
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const data = await res.json();

  if (!res.ok || (data.type !== '100' && !data.url)) {
    throw new Error(data.message || data.description || 'Error al procesar la solicitud de pago con Tilopay.');
  }

  return data;
}

/**
 * Consults transaction status by order number
 */
export async function consultTilopayPayment(orderNumber: string): Promise<any> {
  const apiKey = process.env.TILOPAY_API_KEY;
  if (!apiKey) {
    throw new Error('Falta TILOPAY_API_KEY en las variables de entorno.');
  }

  const token = await getTilopayToken();

  const res = await fetch(`${TILOPAY_BASE_URL}/consult`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `bearer ${token}`,
    },
    body: JSON.stringify({
      key: apiKey,
      orderNumber,
    }),
    cache: 'no-store',
  });

  return await res.json();
}
