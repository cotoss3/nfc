-- =====================================================================
-- starTAP · Catálogo único en Supabase
-- Correr en Supabase → SQL Editor. Es idempotente: se puede repetir.
--
-- Deja SOLO los 4 productos activos y cierra la escritura pública de
-- precios, que hoy no existe como política pero conviene dejar explícito.
-- =====================================================================

-- 1. Los 4 productos activos, con sus precios de lista.
--    ON CONFLICT actualiza nombre/descripción pero RESPETA el precio si el
--    producto ya existe, para no pisar lo que el admin haya puesto.
INSERT INTO public.products (id, name, description, price, image, category, type)
VALUES
  ('tarjeta-nfc-bolsillo',
   'Tarjeta NFC de Bolsillo',
   'Tarjeta de PVC contactless para llevar en el bolsillo o entregar en mano.',
   20.00, '/productos/tarjeta-nfc-bolsillo.webp', 'cards', 'google'),

  ('placa-nfc-mostrador',
   'Placa NFC para Reseñas de Google',
   'Placa acrílica de 3mm para mostrador o recepción.',
   30.00, '/productos/placa-nfc-mostrador.webp', 'plates', 'google'),

  ('stand-nfc-mesa',
   'Stand NFC para Reseñas de Google',
   'Stand de mesa para restaurantes, cafés y salones.',
   35.00, '/productos/stand-nfc-mesa.webp', 'plates', 'google'),

  ('pack-trio-comercial',
   'Pack Trío Comercial (1 Placa Mostrador + 2 Tarjetas de Bolsillo)',
   'Combo para negocios: una placa de mostrador y dos tarjetas de bolsillo. Envío gratis.',
   50.00, '/productos/pack-trio-comercial.webp', 'accessories', 'google')
ON CONFLICT (id) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      image = EXCLUDED.image,
      category = EXCLUDED.category,
      type = EXCLUDED.type;
      -- price NO se toca a propósito.

-- 2. Fuera todo lo demás: catálogos viejos y productos de prueba.
DELETE FROM public.products
WHERE id NOT IN (
  'tarjeta-nfc-bolsillo',
  'placa-nfc-mostrador',
  'stand-nfc-mesa',
  'pack-trio-comercial'
);

-- 3. Seguridad: lectura pública sí, escritura pública NO.
--    Sin política de escritura, RLS bloquea el UPDATE con la llave anon.
--    Solo service_role (el endpoint /api/admin/precio) puede cambiar precios.
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir lectura publica de productos" ON public.products;
CREATE POLICY "Permitir lectura publica de productos"
  ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Escritura publica de productos" ON public.products;
DROP POLICY IF EXISTS "Permitir escritura publica de productos" ON public.products;

-- 4. Comprobación.
SELECT id, name, price FROM public.products ORDER BY price;
