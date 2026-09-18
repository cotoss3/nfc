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
  location: string;
  country: string;
  country_code: string;
  province: string;
  district: string;
  page_start_time: string;
  first_seen: string;
  last_seen: string;
  ip?: string;
}

// In-memory active session cache in Node.js global object
const globalRef = global as unknown as { 
  __activeSessions?: Map<string, ActiveSessionData>;
  __ipCache?: Map<string, { country: string; country_code: string; province: string; district: string; fullLocation: string }>;
  __totalVisitsToday?: { date: string; sessions: Set<string> };
};

if (!globalRef.__activeSessions) {
  globalRef.__activeSessions = new Map<string, ActiveSessionData>();
}
if (!globalRef.__ipCache) {
  globalRef.__ipCache = new Map<string, { country: string; country_code: string; province: string; district: string; fullLocation: string }>();
}
if (!globalRef.__totalVisitsToday) {
  globalRef.__totalVisitsToday = { date: new Date().toISOString().split('T')[0], sessions: new Set<string>() };
}

const activeSessions = globalRef.__activeSessions;
const ipCache = globalRef.__ipCache;

function recordVisit(sessionId?: string): number {
  const todayStr = new Date().toISOString().split('T')[0];
  if (!globalRef.__totalVisitsToday || globalRef.__totalVisitsToday.date !== todayStr) {
    globalRef.__totalVisitsToday = { date: todayStr, sessions: new Set<string>() };
  }
  if (sessionId) {
    globalRef.__totalVisitsToday.sessions.add(sessionId);
  }
  return Math.max(globalRef.__totalVisitsToday.sessions.size, activeSessions.size);
}

const CLEANUP_INTERVAL_MS = 180000; // 3 minutes timeout

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

  return valid.sort((a, b) => new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime());
}

async function resolveLocation(ip: string, userProvince?: string, userDistrict?: string): Promise<{ country: string; country_code: string; province: string; district: string; fullLocation: string }> {
  if (userProvince && userDistrict) {
    return {
      country: 'Panamá',
      country_code: 'PA',
      province: userProvince,
      district: userDistrict,
      fullLocation: `PA Panamá - ${userProvince} (${userDistrict})`,
    };
  }

  if (ipCache.has(ip)) {
    return ipCache.get(ip)!;
  }

  // Fallback default if local or lookup fails
  let resolved = {
    country: 'Panamá',
    country_code: 'PA',
    province: 'Panamá',
    district: 'Bella Vista',
    fullLocation: 'PA Panamá - Panamá (Bella Vista)',
  };

  if (ip && ip !== '127.0.0.1' && ip !== '::1' && !ip.startsWith('192.168.') && !ip.startsWith('10.')) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1000);
      const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success') {
          const country = data.country || 'Panamá';
          const countryCode = data.countryCode || 'PA';
          const prov = data.regionName || 'Panamá';
          const dist = data.city || 'Bella Vista';
          resolved = {
            country,
            country_code: countryCode,
            province: prov,
            district: dist,
            fullLocation: `${countryCode} ${country} - ${prov} (${dist})`,
          };
        }
      }
    } catch (e) {
      // Ignore API lookup errors
    }
  }

  ipCache.set(ip, resolved);
  return resolved;
}

export async function GET() {
  const sessions = getCleanActiveSessions();
  const totalVisitsToday = recordVisit();
  return NextResponse.json({
    success: true,
    active_count: sessions.length,
    total_visits_today: totalVisitsToday,
    sessions,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      session_id, 
      current_page, 
      referrer, 
      device, 
      has_cart, 
      cart_count, 
      cart_total, 
      cart_summary,
      page_start_time,
      user_province,
      user_district
    } = body;

    if (!session_id) {
      return NextResponse.json({ success: false, error: 'session_id is required' }, { status: 400 });
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || '127.0.0.1';
    const locInfo = await resolveLocation(ip, user_province, user_district);

    const nowIso = new Date().toISOString();
    const existing = activeSessions.get(session_id);

    const updatedSession: ActiveSessionData = {
      session_id,
      current_page: current_page || '/',
      referrer: referrer || 'Enlace Directo / Navegador',
      device: device || 'Escritorio',
      has_cart: Boolean(has_cart),
      cart_count: Number(cart_count) || 0,
      cart_total: Number(cart_total) || 0,
      cart_summary: cart_summary || 'Carrito vacío',
      country: locInfo.country,
      country_code: locInfo.country_code,
      province: locInfo.province,
      district: locInfo.district,
      location: locInfo.fullLocation,
      page_start_time: page_start_time || existing?.page_start_time || nowIso,
      first_seen: existing ? existing.first_seen : nowIso,
      last_seen: nowIso,
      ip,
    };

    activeSessions.set(session_id, updatedSession);

    const sessions = getCleanActiveSessions();
    const totalVisitsToday = recordVisit(session_id);

    return NextResponse.json({
      success: true,
      active_count: sessions.length,
      total_visits_today: totalVisitsToday,
      session: updatedSession,
      sessions,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
