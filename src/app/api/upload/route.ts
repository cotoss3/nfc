import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Nunca un valor por defecto aqui: esta llave ignora las reglas de seguridad
// de Supabase y el repositorio es publico. Si falta, la ruta falla y punto.
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('[UPLOAD] Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.');
}

const supabase =
  supabaseUrl && serviceKey ? createClient(supabaseUrl, serviceKey) : null;

async function ensureBucketExists(bucketName: string) {
  if (!supabase) return;
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some(b => b.name === bucketName);

    if (!exists) {
      await supabase!.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
        fileSizeLimit: 10485760 // 10MB
      });
    }
  } catch (err) {
    console.error('Bucket creation/check warning:', err);
  }
}

export async function POST(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json(
      { error: 'Almacenamiento no configurado en el servidor.' },
      { status: 503 }
    );
  }
  try {
    const formData = await req.formData();
    const files = formData.getAll('file') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No se enviaron archivos' }, { status: 400 });
    }

    const bucketName = 'products';
    await ensureBucketExists(bucketName);

    const ALLOWED_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
    const ALLOWED_EXTS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif']);
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: `El archivo ${file.name} excede el tamaño máximo permitido de 5MB` }, { status: 400 });
      }

      const mime = (file.type || '').toLowerCase();
      const ext = (file.name.split('.').pop() || '').toLowerCase();

      if (!ALLOWED_MIMES.has(mime) || !ALLOWED_EXTS.has(ext)) {
        return NextResponse.json({ error: `Formato no permitido para ${file.name}. Solo se aceptan imágenes JPG, PNG, WEBP o GIF.` }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;

      const { data, error } = await supabase!.storage
        .from(bucketName)
        .upload(fileName, buffer, {
          contentType: mime,
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Error al subir imagen a Supabase Storage:', error.message);
        return NextResponse.json({ error: `Error subiendo ${file.name}: ${error.message}` }, { status: 500 });
      }

      const { data: urlData } = supabase!.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      if (urlData?.publicUrl) {
        uploadedUrls.push(urlData.publicUrl);
      }
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      url: uploadedUrls[0] || ''
    });

  } catch (err: any) {
    console.error('Error en POST /api/upload:', err);
    return NextResponse.json({ error: err.message || 'Error interno al procesar imagen' }, { status: 500 });
  }
}
