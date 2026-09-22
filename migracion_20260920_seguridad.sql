-- ============================================================================
-- starTAP · Migración de seguridad y persistencia de pedidos
-- 20 de septiembre de 2026
--
-- Corre esto COMPLETO en el SQL Editor de Supabase (proyecto xnepnlaoiflngtikozqd).
-- Es idempotente: se puede volver a correr sin romper nada.
--
-- Qué arregla:
--   1. `orders` tenía RLS activado y CERO políticas → ningún pedido se podía
--      insertar. Los pedidos vivían solo en el localStorage del cliente.
--   2. `nfc_cards` tenía FOR ALL USING(true): con la anon key del bundle
--      cualquiera podía reescribir los target_url de los 107 dispositivos.
--   3. Faltaban columnas y tablas que el código ya usa.
-- ============================================================================

-- ============================================================================
-- PARTE A — SEGURA, CORRER AHORA
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. PEDIDOS: cerrar la tabla y dejar que solo el servidor escriba
-- ---------------------------------------------------------------------------
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS yappy_order_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS confirmation_sent_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_orders_yappy_order_id
  ON public.orders (yappy_order_id);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Sin políticas para anon/authenticated: la llave service_role ignora RLS por
-- diseño, así que /api/pedidos y los callbacks siguen funcionando y el
-- navegador queda sin acceso. Esto es intencional, no un olvido.
DROP POLICY IF EXISTS "Permitir lectura publica de pedidos" ON public.orders;
DROP POLICY IF EXISTS "Permitir escritura publica de pedidos" ON public.orders;

-- ---------------------------------------------------------------------------
-- 3. PRODUCTOS: columnas que el código ya envía y que no existen
-- ---------------------------------------------------------------------------
-- El upsert de updateFullProduct manda `in_stock` e `images`; hoy falla
-- siempre con "column does not exist" y el error solo se loguea.
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS in_stock BOOLEAN DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- ---------------------------------------------------------------------------
-- 4. TABLAS QUE EL CÓDIGO USA Y NO EXISTEN
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.b2b_quotes (
  id TEXT PRIMARY KEY,
  company_name TEXT,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  quantity INTEGER,
  message TEXT,
  status TEXT DEFAULT 'nuevo',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.b2b_quotes ENABLE ROW LEVEL SECURITY;
-- Sin políticas: solo service_role.

CREATE TABLE IF NOT EXISTS public.abandoned_checkouts (
  id TEXT PRIMARY KEY,
  email TEXT,
  phone TEXT,
  cart JSONB,
  step TEXT,
  total NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.abandoned_checkouts ENABLE ROW LEVEL SECURITY;
-- Sin políticas: solo service_role.

-- ---------------------------------------------------------------------------
-- 5. NFC_CARDS: columna que solo existía como ALTER suelto
-- ---------------------------------------------------------------------------
ALTER TABLE public.nfc_cards ADD COLUMN IF NOT EXISTS channels JSONB DEFAULT '[]'::jsonb;

-- ---------------------------------------------------------------------------
-- Verificación: corre esto después y revisa el resultado
-- ---------------------------------------------------------------------------
-- SELECT tablename, policyname, cmd
--   FROM pg_policies
--  WHERE schemaname = 'public'
--  ORDER BY tablename, policyname;
--
-- Lo correcto es ver:
--   nfc_cards  → SOLO una política, de SELECT
--   orders     → ninguna política
--   products   → solo lectura pública
--   scans      → solo INSERT público


-- ----------------------------------------------------------------------------
-- Modelo de tags: asignar en vez de generar (20/09/2026)
-- ----------------------------------------------------------------------------

-- Estado del ciclo de vida del tag: 'en_stock' (grabado, sin vender),
-- 'asignado' (vendido, todavia apagado) o 'configurado' (el cliente puso su
-- enlace real y ya redirige). Los 70 tags actuales arrancan en 'en_stock'.
ALTER TABLE public.nfc_cards ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'en_stock';

-- Numero de pedido que se llevo este tag, para poder rastrear quien lo tiene.
ALTER TABLE public.nfc_cards ADD COLUMN IF NOT EXISTS order_id TEXT;

-- Cuantos tags quedaron sin asignar en ese pedido por falta de stock fisico.
-- El pedido se acepta igual; el panel de Inventario avisa de los pendientes.
ALTER TABLE public.orders   ADD COLUMN IF NOT EXISTS tags_pendientes INTEGER DEFAULT 0;

-- La asignacion busca tags libres filtrando por claimed = false en cada venta.
CREATE INDEX IF NOT EXISTS idx_nfc_cards_claimed ON public.nfc_cards (claimed);

-- Para listar rapido todos los tags de un pedido.
CREATE INDEX IF NOT EXISTS idx_nfc_cards_order_id ON public.nfc_cards (order_id);

-- Los escaneos se consultan y cuentan siempre por tarjeta.
CREATE INDEX IF NOT EXISTS idx_scans_card_id ON public.scans (card_id);


-- ----------------------------------------------------------------------------
-- CUPONES
--
-- Antes los cupones que creaba el admin vivian solo en el localStorage del
-- navegador. El cliente veia el descuento, el servidor no conocia el cupon,
-- calculaba otro total y el cobro se caia con un 409: toda campana con cupon
-- nuevo nacia muerta. Con esta tabla, lo que ve el cliente y lo que se cobra
-- salen del mismo lugar.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coupons (
  code TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('percent','fixed','free_shipping')),
  value NUMERIC(10,2) NOT NULL DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  expira_el TIMESTAMPTZ,
  usos_maximos INTEGER,
  usos INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Sin politicas a proposito: solo el service_role escribe y lee, igual que
-- orders. El navegador nunca toca esta tabla directo, porque con la anon key
-- cualquiera podria crearse un cupon del 100%.
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Los 3 cupones que ya existian en el codigo, para que la tabla sea la unica
-- fuente. ON CONFLICT DO NOTHING: correr esto dos veces no pisa cambios del
-- admin (por ejemplo, si ya desactivo alguno).
INSERT INTO public.coupons (code, type, value, description, is_active) VALUES
  ('EVG',        'free_shipping', 0,  'Envío gratis en todo Panamá',      true),
  ('STARTAP10',  'percent',       10, '10% de descuento en tu pedido',    true),
  ('DESCUENTO5', 'fixed',         5,  '$5.00 de descuento en tu pedido',  true)
ON CONFLICT (code) DO NOTHING;


-- ---------------------------------------------------------------------------
-- Contador de usos de cupon, atomico
-- ---------------------------------------------------------------------------
-- Leer `usos` y despues escribir `usos + 1` desde la app pierde cuentas cuando
-- dos pedidos entran a la vez. Esta funcion hace el incremento dentro de la
-- base, en una sola sentencia, y devuelve el valor resultante.
CREATE OR REPLACE FUNCTION public.incrementar_uso_cupon(codigo TEXT)
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.coupons
     SET usos = COALESCE(usos, 0) + 1
   WHERE code = upper(trim(codigo))
  RETURNING usos;
$$;

-- ============================================================================
-- PARTE B — NO CORRER TODAVIA
--
-- Esto cierra la escritura publica sobre nfc_cards. Es la falla mas grave de
-- seguridad que queda: con la anon key, que va en el bundle de JavaScript del
-- sitio, cualquiera puede reescribir los target_url de los 107 dispositivos y
-- mandar los escaneos de los clientes a otra pagina.
--
-- PERO: hoy el navegador escribe nfc_cards directo con esa misma anon key en
-- 8 lugares de src/lib/db.ts (lineas 624, 977, 1088, 1104, 1143, 1200, 1250,
-- 1283, 1312): activar dispositivo, cambiar destino, activar/desactivar,
-- editar canales y borrar. Si corres esto ANTES de mover esas escrituras a una
-- ruta de servidor con service_role, el panel deja de poder activar y editar
-- dispositivos.
--
-- Orden correcto:
--   1. Crear /api/tarjetas (POST/PATCH/DELETE) con service_role que verifique
--      owner_email contra la sesion de Supabase.
--   2. Apuntar esos 8 puntos de db.ts a esa ruta.
--   3. Recien entonces correr lo de abajo.
-- ============================================================================

/*
-- ---------------------------------------------------------------------------
-- 2. NFC_CARDS: quitar la escritura pública (secuestro de redirecciones)
-- ---------------------------------------------------------------------------
-- La política vieja permitía UPDATE y DELETE a cualquiera con la anon key,
-- que está en el bundle de JavaScript del sitio.
DROP POLICY IF EXISTS "Permitir insercion y edicion protegida por owner_email" ON public.nfc_cards;
DROP POLICY IF EXISTS "Permitir escritura y actualizacion publica de nfc_cards" ON public.nfc_cards;

-- Se conserva SOLO la lectura pública, que es lo que /r/[id] necesita.
DROP POLICY IF EXISTS "Permitir lectura publica de nfc_cards para redireccion" ON public.nfc_cards;
CREATE POLICY "Permitir lectura publica de nfc_cards para redireccion"
  ON public.nfc_cards FOR SELECT USING (true);

*/
