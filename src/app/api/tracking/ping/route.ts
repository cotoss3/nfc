import { NextResponse } from 'next/server';

export interface ActiveSessionData {
  session_id: string;
  current_page: string;
  referrer: string;
  device: string;
  has_cart: boolean;
  cart_count: number;
  cart_total: number;
  cart_summary: string;
  location?: string;
  first_seen: string;
  last_seen: string;
  ip?: string;
}

// In-memory active session cache in Node.js global object
const globalRef = global as unknown as { __activeSessions?: Map<string, ActiveSessionData> };
if (!globalRef.__activeSessions) {
  globalRef.__activeSessions = new Map<string, ActiveSessionData>();
}
const activeSessions = globalRef.__activeSessions;

const CLEANUP_INTERVAL_MS = 180000; // 3 minutes timeout for inactive sessions

function getCleanActiveSessions(): ActiveSessionData[] {
  const now = Date.now();
  const valid: ActiveSessionData[] = [];

  activeSessions.forEach((session, id) => {
    const lastSeenMs = new Date(session.last_seen).getTime();
    if (now - lastSeenMs <= CLEANUP_INTERVAL_MS) {
      valid.push(session);
    } else {
      activeSessions.delete(id);
    }
  });

  // Sort by most recently active
  return valid.sort((a, b) => new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime());
}

export async function GET() {
  const sessions = getCleanActiveSessions();
  return NextResponse.json({
    success: true,
    active_count: sessions.length,
    sessions,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { session_id, current_page, referrer, device, has_cart, cart_count, cart_total, cart_summary } = body;

    if (!session_id) {
      return NextResponse.json({ success: false, error: 'session_id is required' }, { status: 400 });
    }

    const nowIso = new Date().toISOString();
    const existing = activeSessions.get(session_id);

    const updatedSession: ActiveSessionData = {
      session_id,
      current_page: current_page || '/',
      referrer: referrer || 'Directo / Navegador',
      device: device || 'Escritorio',
      has_cart: Boolean(has_cart),
      cart_count: Number(cart_count) || 0,
      cart_total: Number(cart_total) || 0,
      cart_summary: cart_summary || 'Carrito vacío',
      first_seen: existing ? existing.first_seen : nowIso,
      last_seen: nowIso,
      location: '🇵🇦 Panamá',
    };

    activeSessions.set(session_id, updatedSession);

    const sessions = getCleanActiveSessions();

    return NextResponse.json({
      success: true,
      active_count: sessions.length,
      session: updatedSession,
      sessions,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
