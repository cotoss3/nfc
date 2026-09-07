import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xnepnlaoiflngtikozqd.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhuZXBubGFvaWZsbmd0aWtvenFkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODc4NDI4NiwiZXhwIjoyMTA0MzYwMjg2fQ.VedI_FsJMBU1X1HSeJQxd4hXoRYVRxyJ_OU1eXp_q_w';

const supabase = createClient(supabaseUrl, serviceKey);

async function ensureBucketExists(bucketName: string) {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some(b => b.name === bucketName);

    if (!exists) {
      await supabase.storage.createBucket(bucketName, {
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
  try {
    const formData = await req.formData();
    const files = formData.getAll('file') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No se enviaron archivos' }, { status: 400 });
    }

    const bucketName = 'products';
    await ensureBucketExists(bucketName);

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const ext = originalName.split('.').pop() || 'png';
      const fileName = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, buffer, {
          contentType: file.type || `image/${ext}`,
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Error al subir imagen a Supabase Storage:', error.message);
        return NextResponse.json({ error: `Error subiendo ${file.name}: ${error.message}` }, { status: 500 });
      }

      const { data: urlData } = supabase.storage
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
