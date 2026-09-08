# 🔎 AUDITORÍA INTEGRAL — starTAP Panamá
**Fecha:** 2026-09-08 · **Alcance:** todo `src/`, `supabase_schema.sql`, `db_store.json`, config y Git.
**Veredicto:** el producto funciona como demo, pero **no es apto para producción con clientes pagando**.
Hay 9 fallas críticas de seguridad y una arquitectura de datos con tres fuentes de verdad que se
contradicen entre sí. Nada de esto requiere reescribir el proyecto: es ~2 semanas de trabajo enfocado.

---

## 1. SEGURIDAD

### 🔴 S1 — Llave `service_role` de Supabase en el código y en el historial de Git
`src/app/api/upload/route.ts:5` la trae como fallback literal. Esa llave ignora RLS: lectura, escritura
y borrado total de la base y del Storage, para cualquiera que vea el repo. Además está en commits viejos.
**Fix:** rotar la llave en Supabase, dejar solo `process.env.SUPABASE_SERVICE_ROLE_KEY`, y si el repo
fue público alguna vez, tratar todo dato anterior como comprometido.

### 🔴 S2 — `POST /api/cards` sin autenticación: toma de control total
Acepta `{key, value}` arbitrario y lo escribe en `db_store.json`. Un `curl` anónimo puede reemplazar
`nfc_cards` (redirigir TODAS las tarjetas de tus clientes a cualquier sitio), `nfc_products`
(cambiar precios a $0) o `nfc_orders`. Es la vulnerabilidad más grave del sistema.
**Fix:** exigir sesión de super-admin + lista blanca de claves + validación de esquema.

### 🔴 S3 — `POST /api/upload` sin autenticación
Cualquiera sube archivos de 10MB a tu bucket público e incluso dispara la creación de buckets.
Hosting gratis para terceros y factura de Storage a tu nombre.
**Fix:** validar sesión admin en el servidor; quitar `ensureBucketExists` del path público.

### 🔴 S4 — RLS de Supabase efectivamente desactivada
`nfc_cards FOR ALL USING (true) WITH CHECK (true)`: cualquier anónimo con la anon key (que es pública
por diseño) puede **leer, editar y borrar todas las tarjetas**, incluidos los `owner_email` de tus
clientes. La vista `active_cards` además otorga `SELECT` de esos correos a `anon`.
**Fix:** SELECT público solo de los campos de redirección (o mover la redirección a una función
`security definer`); UPDATE/DELETE restringido a `auth.uid() = owner_id`.

### 🔴 S5 — XSS reflejado en `/r/[id]`
En `src/app/r/[id]/route.ts` el valor `resolvedCardId` (que viene directo de la URL cuando la tarjeta
no existe) se interpola sin escapar dentro de 4 plantillas HTML: `<h1>${resolvedCardId}</h1>`.
Un link tipo `startap.com.pa/r/<script>...` ejecuta código en tu dominio. Y ese dominio es
exactamente el que imprimes en las tarjetas de tus clientes.
**Fix:** escapar (`&`,`<`,`>`,`"`,`'`) o validar con regex `^[A-Za-z0-9-]{1,20}$` antes de renderizar.

### 🔴 S6 — Inyección de filtro PostgREST
`.or(\`card_id.ilike.${searchCode},activation_code.ilike.${searchCode}\`)` con `searchCode` sin
sanitizar: comas y paréntesis en la URL alteran el filtro de la consulta.
**Fix:** validar el formato del ID antes de la query.

### 🔴 S7 — Panel admin protegido solo en el navegador
`AdminAuthGuard` acepta `localStorage.admin_authenticated_email`. Escribir esa clave en la consola
abre `/master-control`. Como las APIs tampoco validan nada, el bypass es total, no cosmético.
**Fix:** middleware de Next + verificación de rol en cada route handler.

### 🔴 S8 — Escalada de privilegios por nombre de correo
`db.ts:766` → `const isAdmin = cleanEmail === 'admin@startap.com.pa' || cleanEmail.includes('admin')`.
Cualquiera que se registre con `admin@gmail.com` o `radmin@x.com` puede borrar las tarjetas de otros
comercios. `.includes('admin')` no es un control de acceso.
**Fix:** usar la whitelist `SUPER_ADMIN_EMAILS` verificada contra la sesión de Supabase, en servidor.

### 🔴 S9 — Checkout: datos de tarjeta y pagos falsos
`src/app/checkout/page.tsx` pide número de tarjeta, vencimiento y CVV en un formulario propio,
y luego un `setTimeout(...)` marca `payment_status: 'completed'` **sin cobrar nada**.
Dos problemas: (a) capturar PAN/CVV sin pasarela te pone bajo PCI-DSS y fuera de norma;
(b) todo pedido queda como pagado sin dinero recibido.
**Fix:** eliminar los campos de tarjeta y redirigir a **Tilopay** (que ya tienes); el estado de pago
debe venir del webhook de la pasarela, nunca del cliente.

### 🟠 S10 — Reclamación de dispositivos sin secreto
`claimCard` acepta cualquier código `STT-XXXX` no reclamado. Los códigos son secuenciales y
adivinables, así que alguien puede reclamar las tarjetas de tu lote antes que el cliente real.
**Fix:** `activation_code` aleatorio (8 caracteres) impreso aparte del `card_id` visible.

### 🟠 S11 — `rateLimiter` solo en el cliente
Se usa en `dashboard/page.tsx` (donde se salta desde la consola) y no se aplica en ninguna API.

---

## 2. ARQUITECTURA Y DEUDA TÉCNICA

### 🔴 A1 — Tres fuentes de verdad sin sincronía
`localStorage` del navegador + `db_store.json` en disco + tablas de Supabase. Cada método de `db.ts`
escribe en una o dos, nunca en las tres de forma consistente, y sin transacciones. Es la causa raíz
de la mayoría de los bugs de "se me borró / no se guardó / veo datos viejos".
**Decisión pendiente:** Supabase como única fuente de verdad; `localStorage` solo como caché de UI.

### 🔴 A2 — `eval("require('fs')")` en `db.ts:246` y `:278`
Truco para saltarse el bundler de Next. Rompe el análisis estático, bloquea el runtime Edge y
**no funciona en Vercel**: el filesystem es de solo lectura y efímero. En producción cada deploy borra
lo escrito y cada instancia ve un archivo distinto.

### 🔴 A3 — Pedidos que nunca llegan al negocio
`createOrder` guarda en `localStorage` del comprador. Tú no recibes nada. Y la tabla `orders` tiene RLS
activo **sin ninguna política**, así que tampoco podría insertarse desde el cliente. Hoy, si alguien
compra, la venta existe solo en el navegador del cliente.

### 🟠 A4 — Analítica de escaneos frágil
`registerScan` hace read-modify-write del JSON completo en cada escaneo: condición de carrera con
escaneos simultáneos, array que crece sin límite, y escritura a disco por visita.

### 🟠 A5 — Datos falsos sembrados en producción
`init()` genera escaneos aleatorios de prueba para `STT-1001`. Un cliente real puede ver métricas
inventadas en su dashboard.

### 🟠 A6 — Migraciones ad-hoc por banderas booleanas
`init()` acumula ~10 flags (`hasNewProduct`, `isWebpImagesUpdated`, `hasCorrectPrices`, `hasAirbnb`...)
para decidir si re-sembrar el catálogo. Cada cambio de producto agrega otra bandera. No escala.

### 🟠 A7 — Redundancia de código
* Las 3 landings (`Stand` 468, `Tarjeta` 467, `Placa` 467) son casi idénticas: ~900 líneas duplicadas.
  Un solo `ProductLanding.tsx` con props las cubre.
* La lógica de "normalizar STT-xxx" está repetida en `db.ts` (3 veces) y en `r/[id]/route.ts`.
* Las 4 páginas de error HTML de `/r/[id]` repiten la misma plantilla completa.
* `INITIAL_PRODUCTS` en `db.ts` duplica lo que ya está en `db_store.json`.

### 🟠 A8 — Monolitos de UI
`dashboard/page.tsx` (1530 líneas) y `master-control/page.tsx` (1308) mezclan auth, fetching, estado y
render. Encarecen cada cambio y cada sesión de IA (~20k tokens por lectura).

### 🟡 A9 — Higiene del proyecto
* Sin tests, sin CI, sin validación de entrada (`zod`), sin manejo de errores centralizado.
* `pg` en dependencias sin uso → peso y superficie de ataque.
* `<script src="cdn.tailwindcss.com">` en las páginas de `/r` (build de desarrollo, lento, dependencia externa).
* IDs con `Date.now() + Math.random()`: colisionables y adivinables. Usar `crypto.randomUUID()`.
* `catch (err: any)` genérico; `strict` está activo pero se evade con `any`.
* Carpeta `productos/` con PNG pesados versionados y desincronizada con `public/products/`.

---

## 3. PLAN DE CORRECCIÓN

### FASE 0 — Contención (hoy, 2-3 h) 🔴
1. Rotar la `service_role` key en Supabase y quitar el literal del código.
2. Poner auth de super-admin en `POST /api/cards` y `POST /api/upload` (o desactivar ambos endpoints).
3. Escapar `resolvedCardId` en `/r/[id]` (cierra el XSS).
4. Quitar `.includes('admin')` de `deleteCard`.
5. Quitar los campos de tarjeta del checkout (dejar solo Yappy/transferencia manual) mientras entra Tilopay.

### FASE 1 — Blindar los datos (semana 1) 🔴
6. Reescribir las políticas RLS: SELECT mínimo para redirección, UPDATE/DELETE por dueño.
7. Quitar los correos de la vista `active_cards`.
8. Añadir políticas a `orders` e insertar los pedidos vía route handler con service key en servidor.
9. Middleware de Next protegiendo `/master-control` y `/api/*` con verificación real de sesión.
10. Validación de entrada con `zod` en todos los route handlers.

### FASE 2 — Una sola fuente de verdad (semana 2) 🟠
11. Supabase como única BD. `db.ts` se parte en `lib/supabase/{cards,products,orders,scans}.ts`.
12. Eliminar `eval(require('fs'))`, `db_store.json` y la escritura desde el cliente.
13. `localStorage` queda solo como caché de UI (carrito y sesión).
14. Escaneos: `INSERT` directo a `scans`, y borrar los datos de prueba sembrados en `init()`.
15. Reemplazar las banderas de `init()` por un script de seed idempotente (`scripts/seed.ts`).

### FASE 3 — Pagos reales (semana 2-3) 🟠
16. Integrar Tilopay: redirección a la pasarela + webhook que marca `payment_status`.
17. Correo de confirmación al cliente y notificación al admin por cada pedido.
18. `activation_code` aleatorio por dispositivo, distinto del `card_id` impreso.

### FASE 4 — Limpieza y ahorro (semana 3) 🟡
19. Unificar las 3 landings en `ProductLanding.tsx` (−900 líneas).
20. Extraer una `errorPage()` compartida para `/r/[id]` (−200 líneas) y quitar el Tailwind CDN.
21. Partir `dashboard` y `master-control` en componentes por pestaña.
22. Centralizar `resolveCardId` en `lib/cardId.ts`.
23. Quitar `pg`, añadir ESLint + `tsc --noEmit` en CI, y tests del redirect y del claim.

**Orden no negociable:** Fase 0 antes de seguir vendiendo. Las fases 1 y 3 antes de cobrar en línea.
