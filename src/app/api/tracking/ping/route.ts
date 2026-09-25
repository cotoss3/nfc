import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

export interface VisitorStats {
  today: number;
  yesterday: number;
  week: number;
  month: number;
  all: number;
  pageviews_today: number;
  pageviews_yesterday: number;
  pageviews_week: number;
  pageviews_month: number;
  all_pageviews: number;
}

// In-memory active session cache in Node.js global object
const globalRef = global as unknown as { 
  __activeSessions?: Map<string, ActiveSessionData>;
  __ipCache?: Map<string, { country: string; country_code: string; province: string; district: string; fullLocation: string }>;
  __sessionLastPage?: Map<string, { page: string; time: number }>;
  __cachedVisitorStats?: { timestamp: number; stats: VisitorStats };
};

if (!globalRef.__activeSessions) {
  globalRef.__activeSessions = new Map<string, ActiveSessionData>();
}
if (!globalRef.__ipCache) {
  globalRef.__ipCache = new Map<string, { country: string; country_code: string; province: string; district: string; fullLocation: string }>();
}
if (!globalRef.__sessionLastPage) {
  globalRef.__sessionLastPage = new Map<string, { page: string; time: number }>();
}

const activeSessions = globalRef.__activeSessions;
const ipCache = globalRef.__ipCache;
const sessionLastPage = globalRef.__sessionLastPage;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

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

/**
 * Calcula los límites temporales exactos para Panamá (UTC-5 sin horario de verano)
 */
function getPanamaDateBoundaries() {
  const PANAMA_OFFSET_MS = -5 * 3600 * 1000;
  const nowUtc = Date.now();
  const panamaNow = new Date(nowUtc + PANAMA_OFFSET_MS);

  const y = panamaNow.getUTCFullYear();
  const m = panamaNow.getUTCMonth();
  const d = panamaNow.getUTCDate();

  // 00:00:00 en Panamá equivale a 05:00:00 UTC
  const todayStartUtcMs = Date.UTC(y, m, d, 5, 0, 0);
  const yesterdayStartUtcMs = todayStartUtcMs - 24 * 3600 * 1000;
  const weekStartUtcMs = todayStartUtcMs - 7 * 24 * 3600 * 1000;
  const monthStartUtcMs = todayStartUtcMs - 30 * 24 * 3600 * 1000;

  return {
    todayStart: new Date(todayStartUtcMs).toISOString(),
    yesterdayStart: new Date(yesterdayStartUtcMs).toISOString(),
    weekStart: new Date(weekStartUtcMs).toISOString(),
    monthStart: new Date(monthStartUtcMs).toISOString(),
  };
}

const STATS_CACHE_TTL_MS = 8000; // 8 segundos de caché para el polling rápido de master-control

async function getVisitorStats(): Promise<VisitorStats> {
  const now = Date.now();
  if (globalRef.__cachedVisitorStats && (now - globalRef.__cachedVisitorStats.timestamp < STATS_CACHE_TTL_MS)) {
    return globalRef.__cachedVisitorStats.stats;
  }

  const boundaries = getPanamaDateBoundaries();
  const activeNow = getCleanActiveSessions();

  if (!supabase) {
    const fallbackCount = activeNow.length;
    return {
      today: fallbackCount,
      yesterday: 0,
      week: fallbackCount,
      month: fallbackCount,
      all: fallbackCount,
      pageviews_today: fallbackCount,
      pageviews_yesterday: 0,
      pageviews_week: fallbackCount,
      pageviews_month: fallbackCount,
      all_pageviews: fallbackCount,
    };
  }

  try {
    const [recentVisitsRes, totalCountRes] = await Promise.all([
      supabase
        .from('site_visits')
        .select('session_id, created_at')
        .gte('created_at', boundaries.monthStart)
        .order('created_at', { ascending: false })
        .limit(30000),
      supabase
        .from('site_visits')
        .select('id', { count: 'exact', head: true })
    ]);

    const visits = recentVisitsRes.data || [];
    const totalCount = totalCountRes.count || visits.length;

    const todaySessions = new Set<string>();
    let todayPageviews = 0;
    const yesterdaySessions = new Set<string>();
    let yesterdayPageviews = 0;
    const weekSessions = new Set<string>();
    let weekPageviews = 0;
    const monthSessions = new Set<string>();
    let monthPageviews = 0;

    // Agregar sesiones actualmente activas en memoria a hoy
    for (const s of activeNow) {
      todaySessions.add(s.session_id);
    }

    const tStart = new Date(boundaries.todayStart).getTime();
    const yStart = new Date(boundaries.yesterdayStart).getTime();
    const wStart = new Date(boundaries.weekStart).getTime();
    const mStart = new Date(boundaries.monthStart).getTime();

    for (const v of visits) {
      if (String(v.session_id || '').startsWith('revt_')) continue;
      const cTime = new Date(v.created_at).getTime();
      if (cTime >= tStart) {
        todaySessions.add(v.session_id);
        todayPageviews++;
      } else if (cTime >= yStart && cTime < tStart) {
        yesterdaySessions.add(v.session_id);
        yesterdayPageviews++;
      }

      if (cTime >= wStart) {
        weekSessions.add(v.session_id);
        weekPageviews++;
      }

      if (cTime >= mStart) {
        monthSessions.add(v.session_id);
        monthPageviews++;
      }
    }

    const calculatedStats: VisitorStats = {
      today: todaySessions.size,
      yesterday: yesterdaySessions.size,
      week: weekSessions.size,
      month: monthSessions.size,
      all: Math.max(monthSessions.size, totalCount),
      pageviews_today: Math.max(todayPageviews, todaySessions.size),
      pageviews_yesterday: yesterdayPageviews,
      pageviews_week: weekPageviews,
      pageviews_month: monthPageviews,
      all_pageviews: totalCount,
    };

    globalRef.__cachedVisitorStats = {
      timestamp: now,
      stats: calculatedStats,
    };

    return calculatedStats;
  } catch (err) {
    console.error('Error calculando estadísticas de visitas en Supabase:', err);
    return globalRef.__cachedVisitorStats?.stats || {
      today: activeNow.length,
      yesterday: 0,
      week: activeNow.length,
      month: activeNow.length,
      all: activeNow.length,
      pageviews_today: activeNow.length,
      pageviews_yesterday: 0,
      pageviews_week: activeNow.length,
      pageviews_month: activeNow.length,
      all_pageviews: activeNow.length,
    };
  }
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

  // Fallback default si es local o falla el lookup
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
  const stats = await getVisitorStats();

  return NextResponse.json({
    success: true,
    active_count: sessions.length,
    total_visits_today: stats.today,
    stats,
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

    // Persistir visita en Supabase si es nueva página o si pasaron más de 30 minutos
    const lastRecorded = sessionLastPage.get(session_id);
    const isNewPage = !lastRecorded || lastRecorded.page !== (current_page || '/');
    const isStale = lastRecorded ? (Date.now() - lastRecorded.time > 30 * 60 * 1000) : false;

    if (isNewPage || isStale) {
      sessionLastPage.set(session_id, { page: current_page || '/', time: Date.now() });

      if (supabase) {
        const visitId = `vis_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        (async () => {
          try {
            const { error } = await supabase
              .from('site_visits')
              .insert({
                id: visitId,
                session_id,
                page: current_page || '/',
                referrer: referrer || 'Enlace Directo / Navegador',
                device: device || 'Escritorio',
                ip,
                country: locInfo.country,
                province: locInfo.province,
                district: locInfo.district,
                created_at: nowIso,
              });
            if (error) console.error('Error insertando visita en Supabase:', error.message);
          } catch (e) {
            console.error('Error en Supabase site_visits insert:', e);
          }
        })();
      }
    }

    const sessions = getCleanActiveSessions();
    const stats = await getVisitorStats();

    return NextResponse.json({
      success: true,
      active_count: sessions.length,
      total_visits_today: stats.today,
      stats,
      session: updatedSession,
      sessions,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
