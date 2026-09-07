-- ESQUEMA DE BASE DE DATOS SUPABASE PARA PRUEBAS Y PRODUCCIÓN (starTAP Panamá)

-- 1. Tabla de Productos
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  image TEXT NOT NULL,
  images TEXT[],
  colors TEXT[],
  material TEXT,
  category TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla de Pedidos
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_province TEXT NOT NULL,
  shipping_district TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'completed',
  status TEXT NOT NULL DEFAULT 'processing',
  total NUMERIC(10,2) NOT NULL,
  items JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabla de Tarjetas / Placas NFC (Dispositivos TAP)
CREATE TABLE IF NOT EXISTS public.nfc_cards (
  card_id TEXT PRIMARY KEY,
  activation_code TEXT,
  owner_id TEXT,
  owner_name TEXT,
  owner_email TEXT NOT NULL,
  label TEXT NOT NULL,
  target_url TEXT NOT NULL,
  nfc_target_url TEXT,
  qr_target_url TEXT,
  group_name TEXT DEFAULT 'General',
  is_active BOOLEAN DEFAULT true,
  claimed BOOLEAN DEFAULT false,
  type TEXT NOT NULL DEFAULT 'google',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Migraciones seguras para agregar columnas si la tabla ya existía
ALTER TABLE public.nfc_cards ADD COLUMN IF NOT EXISTS nfc_target_url TEXT;
ALTER TABLE public.nfc_cards ADD COLUMN IF NOT EXISTS qr_target_url TEXT;
ALTER TABLE public.nfc_cards ADD COLUMN IF NOT EXISTS group_name TEXT DEFAULT 'General';

-- 4. Tabla de Escaneos y Analíticas
CREATE TABLE IF NOT EXISTS public.scans (
  id TEXT PRIMARY KEY,
  card_id TEXT REFERENCES public.nfc_cards(card_id) ON DELETE CASCADE,
  device TEXT NOT NULL,
  referrer TEXT NOT NULL,
  scan_type TEXT DEFAULT 'nfc',
  group_name TEXT DEFAULT 'General',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Migraciones seguras para tabla de escaneos
ALTER TABLE public.scans ADD COLUMN IF NOT EXISTS scan_type TEXT DEFAULT 'nfc';
ALTER TABLE public.scans ADD COLUMN IF NOT EXISTS group_name TEXT DEFAULT 'General';

-- Políticas de Seguridad RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nfc_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir lectura publica de productos" ON public.products;
DROP POLICY IF EXISTS "Permitir lectura publica de nfc_cards para redireccion" ON public.nfc_cards;
DROP POLICY IF EXISTS "Permitir escritura y actualizacion publica de nfc_cards" ON public.nfc_cards;
DROP POLICY IF EXISTS "Permitir insercion publica de escaneos" ON public.scans;

CREATE POLICY "Permitir lectura publica de productos" ON public.products FOR SELECT USING (true);
CREATE POLICY "Permitir lectura publica de nfc_cards para redireccion" ON public.nfc_cards FOR SELECT USING (true);
CREATE POLICY "Permitir escritura y actualizacion publica de nfc_cards" ON public.nfc_cards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir insercion publica de escaneos" ON public.scans FOR INSERT WITH CHECK (true);

