import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/resend';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xnepnlaoiflngtikozqd.supabase.co';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const ADMINS_FROM_ENV = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map(c => c.trim().toLowerCase())
  .filter(Boolean);

const SUPER_ADMINS_DEFAULT = [
  'cotoss3@gmail.com',
  'fbcontrerras@gmail.com',
  'fcontreras@grupotova.com',
  'admin@startap.com.pa',
  'info@startap.com.pa'
];

const ALLOWED_ADMINS = Array.from(new Set([...SUPER_ADMINS_DEFAULT, ...ADMINS_FROM_ENV]));

function getAdminClient() {
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

async function verifyAdmin(request: NextRequest): Promise<{ authorized: boolean; email?: string; error?: string; status?: number }> {
  if (!serviceKey) {
    return { authorized: false, error: 'Configuración del servidor incompleta', status: 500 };
  }

  const token = request.headers.get('authorization')?.replace(/^bearer\s+/i, '');
  if (!token) {
    return { authorized: false, error: 'Token de autorización requerido', status: 401 };
  }

  if (!url || !anonKey) {
    return { authorized: false, error: 'Configuración de Supabase incompleta', status: 500 };
  }

  const publicClient = createClient(url, anonKey);
  const { data: userData, error: authError } = await publicClient.auth.getUser(token);
  const email = userData?.user?.email?.trim().toLowerCase();

  if (authError || !email) {
    return { authorized: false, error: 'Sesión inválida o expirada', status: 401 };
  }

  if (!ALLOWED_ADMINS.includes(email)) {
    return { authorized: false, error: 'Acceso no autorizado', status: 403 };
  }

  return { authorized: true, email };
}

/**
 * POST /api/distribuidores
 * Envío de postulación al programa de distribuidores B2B / mayoreo
 */
export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Error de configuración del servidor' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      empresa,
      ruc,
      contacto,
      whatsapp,
      correo,
      giro,
      clientes_aprox,
      unidades_mes,
      acepta_contacto,
      website // Honeypot field
    } = body;

    // 1. Detección de bots vía honeypot
    if (website && String(website).trim().length > 0) {
      // Simular éxito silencioso ante bots
      return NextResponse.json({
        success: true,
        message: 'Revisamos tu solicitud y te escribimos en 2 días hábiles.'
      });
    }

    // 2. Validación y saneamiento de campos obligatorios
    const cleanEmpresa = String(empresa || '').trim().slice(0, 150);
    const cleanContacto = String(contacto || '').trim().slice(0, 100);
    const cleanWhatsapp = String(whatsapp || '').trim().slice(0, 50);
    const cleanCorreo = String(correo || '').trim().toLowerCase().slice(0, 100);
    const cleanRuc = String(ruc || '').trim().slice(0, 50);
    const cleanGiro = String(giro || '').trim().slice(0, 150);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmpresa || !cleanContacto || !cleanWhatsapp || !cleanCorreo || !emailRegex.test(cleanCorreo)) {
      return NextResponse.json(
        { success: false, error: 'Por favor completa todos los campos requeridos con datos válidos.' },
        { status: 400 }
      );
    }

    if (!acepta_contacto) {
      return NextResponse.json(
        { success: false, error: 'Debes aceptar los términos de contacto (Ley 81 de Protección de Datos).' },
        { status: 400 }
      );
    }

    const numClientes = typeof clientes_aprox === 'number' ? clientes_aprox : parseInt(String(clientes_aprox || '0'), 10) || 0;
    const numUnidades = typeof unidades_mes === 'number' ? unidades_mes : parseInt(String(unidades_mes || '0'), 10) || 0;

    // 3. Guardar solicitud en Supabase con service role
    const { data, error } = await supabaseAdmin
      .from('distribuidores_solicitudes')
      .insert([
        {
          empresa: cleanEmpresa,
          ruc: cleanRuc || null,
          contacto: cleanContacto,
          whatsapp: cleanWhatsapp,
          correo: cleanCorreo,
          giro: cleanGiro || null,
          clientes_aprox: numClientes,
          unidades_mes: numUnidades,
          acepta_contacto: true,
          estado: 'nueva'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('[API_DISTRIBUIDORES_INSERT_ERROR]', error);
      return NextResponse.json(
        { success: false, error: 'No se pudo guardar la postulación. Intenta nuevamente.' },
        { status: 500 }
      );
    }

    // 4. Notificación por correo a Fernando / info@startap.com.pa (en segundo plano)
    sendEmail({
      to: 'info@startap.com.pa',
      subject: `Nueva postulación de distribuidor: ${cleanEmpresa}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
          <h2 style="color: #01A6D2; margin-top: 0;">Nueva Postulación de Distribuidor</h2>
          <p>Se ha recibido una nueva solicitud para el programa de distribuidores mayoristas de starTAP:</p>
          <ul style="line-height: 1.8; color: #1e293b;">
            <li><strong>Empresa:</strong> ${cleanEmpresa}</li>
            <li><strong>RUC / DV:</strong> ${cleanRuc || 'No especificado'}</li>
            <li><strong>Persona de Contacto:</strong> ${cleanContacto}</li>
            <li><strong>WhatsApp / Teléfono:</strong> ${cleanWhatsapp}</li>
            <li><strong>Correo Electrónico:</strong> ${cleanCorreo}</li>
            <li><strong>Giro / Actividad:</strong> ${cleanGiro || 'No especificado'}</li>
            <li><strong>Clientes activos aproximados:</strong> ${numClientes}</li>
            <li><strong>Volumen estimado mensual:</strong> ${numUnidades} unidades</li>
            <li><strong>Aceptó términos Ley 81:</strong> Sí</li>
          </ul>
          <p style="margin-top: 24px; font-size: 13px; color: #64748b;">
            Puedes revisar y gestionar esta postulación desde el panel Master Control de starTAP.
          </p>
        </div>
      `
    }).catch(err => console.error('[API_DISTRIBUIDORES_NOTIF_ERROR]', err));

    return NextResponse.json({
      success: true,
      message: 'Revisamos tu solicitud y te escribimos en 2 días hábiles.'
    });
  } catch (err: any) {
    console.error('[API_DISTRIBUIDORES_POST_UNCAUGHT]', err);
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}

/**
 * GET /api/distribuidores
 * Lista de solicitudes para el panel de administración
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status || 401 });
    }

    const supabaseAdmin = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: 'Error inicializando cliente admin' }, { status: 500 });
    }

    const { data, error } = await supabaseAdmin
      .from('distribuidores_solicitudes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, solicitudes: data || [] });
  } catch (err: any) {
    console.error('[API_DISTRIBUIDORES_GET_UNCAUGHT]', err);
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}

/**
 * PATCH /api/distribuidores
 * Actualización del estado de una solicitud ('nueva' | 'aprobada' | 'rechazada')
 */
export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status || 401 });
    }

    const supabaseAdmin = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: 'Error inicializando cliente admin' }, { status: 500 });
    }

    const body = await request.json();
    const { id, estado } = body;

    if (!id || !['nueva', 'aprobada', 'rechazada'].includes(estado)) {
      return NextResponse.json({ success: false, error: 'id y estado válido son requeridos' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('distribuidores_solicitudes')
      .update({ estado })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Estado actualizado a ${estado}` });
  } catch (err: any) {
    console.error('[API_DISTRIBUIDORES_PATCH_UNCAUGHT]', err);
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}
