# Instrucciones para Antigravity — starTAP
**20 de septiembre de 2026** · de parte de Fernando

Esto es lo que quedó pendiente de la auditoría estructural. El detalle completo
de cada falla está en `AUDITORIA_ESTRUCTURAL.md`; aquí va solo lo que hay que
hacer, en orden.

**El código ya está corregido y compila limpio** (`npx tsc --noEmit` sale en 0).
Lo que sigue no se pudo hacer desde la sesión porque necesita la consola de
Supabase, variables de entorno de Vercel, o credenciales.

---

## 1 · Correr la PARTE A de `migracion_20260920_seguridad.sql` — BLOQUEANTE

> **Actualizado 20/09:** la PARTE A creció. Ahora incluye también las columnas
> del nuevo modelo de tags (`nfc_cards.estado`, `nfc_cards.order_id`,
> `orders.tags_pendientes`) y tres índices. Sin eso, la asignación de tags de
> `/api/pedidos` falla por columna inexistente.

SQL Editor de Supabase, proyecto `xnepnlaoiflngtikozqd`. Es idempotente.

**Sin esto el sitio queda peor que antes**, porque `/api/pedidos` (nuevo) inserta
una columna `yappy_order_id` que todavía no existe. Córrelo antes de desplegar.

Añade: `orders.yappy_order_id`, `orders.confirmation_sent_at`, índice,
`products.in_stock`, `products.images`, `nfc_cards.channels`, y crea
`b2b_quotes` y `abandoned_checkouts` (que el código ya usa y no existían).

Al final del archivo hay un `SELECT` de verificación. Córrelo y confirma que
`orders` no tiene ninguna política: eso es correcto, la service_role ignora RLS
por diseño y así el navegador queda sin acceso a los pedidos.

**La PARTE B está comentada a propósito. No la corras todavía** — ver punto 4.

## 2 · Variables de entorno en Vercel — BLOQUEANTE

| Variable | Para qué | Estado |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | `/api/pedidos` y `/api/admin/precio`. Sin ella no se registra ningún pedido. | verificar |
| `ADMIN_EMAILS` | Autoriza `/api/admin/precio`. **Debe incluir el correo de Fernando** | verificar |
| `NEXT_PUBLIC_FB_PIXEL_ID` | `1591597945771251` | pendiente |
| `EMAIL_FROM` | opcional, por defecto `starTAP Panamá <pedidos@send.startap.com.pa>` | opcional |
| `EMAIL_REPLY_TO` | opcional, por defecto `info@startap.com.pa` | opcional |

Ojo con `ADMIN_EMAILS`: el panel de precios ahora muestra un error honesto si la
API responde 403. Antes decía "guardado" aunque no guardara nada. Si Fernando no
está en esa lista, va a ver el 403 — es correcto, hay que agregarlo.

## 3 · Rotar la `service_role` de Supabase — PENDIENTE DESDE ANTES

La llave estuvo hardcodeada en `src/app/api/upload/route.ts` en un **repositorio
público**. Se quitó del código, pero la llave sigue comprometida.

1. Supabase → API Keys → crear una `sb_secret_` nueva
2. Actualizarla en Vercel, desplegar, verificar que el sitio funciona
3. Recién entonces: "Disable JWT-based API keys"

## 4 · Cerrar la escritura pública de `nfc_cards` — LA MÁS GRAVE QUE QUEDA

Hoy `nfc_cards` tiene `FOR ALL USING(true)`. La anon key va en el bundle de
JavaScript del sitio. Cualquiera puede reescribir los `target_url` de los 107
dispositivos y mandar los escaneos de los clientes a su propia página.

**No se puede cerrar de golpe**: el navegador escribe esa tabla directo en 8
lugares de `src/lib/db.ts` (líneas 624, 977, 1088, 1104, 1143, 1200, 1250, 1283,
1312) — activar dispositivo, cambiar destino, activar/desactivar, editar canales,
borrar. Si corres la PARTE B antes, el panel deja de poder activar dispositivos.

Orden:
1. Crear `/api/tarjetas` (POST/PATCH/DELETE) con `service_role`, que valide la
   sesión de Supabase y compare `owner_email` contra el usuario autenticado.
   Hoy esa verificación multi-tenant vive en `db.ts:1141` y es solo de
   aplicación: se puentea escribiendo directo a la API de Supabase.
2. Apuntar esos 8 puntos a la ruta nueva.
3. Descomentar y correr la PARTE B.

## 5 · Cupones: sacarlos del localStorage

`config/shipping.ts:123-148` busca los cupones personalizados solo
`if (typeof window !== 'undefined')`. En el servidor solo existen `EVG`,
`STARTAP10` y `DESCUENTO5`. Los que Fernando crea en `/master-control/cupones`
viven en `nfc_coupons` de su localStorage y nunca salen de ahí.

Resultado: el cliente aplica el cupón, ve el descuento, el servidor no lo
reconoce, y el pago se rechaza con 409. **Toda campaña con cupón nuevo nace
muerta.** Mover los cupones a Supabase y leerlos con service_role dentro de
`calcularTotal`.

## 6 · La tienda todavía no consume `/api/catalogo`

La ruta existe y devuelve el precio correcto de Supabase, pero nadie la llama:
- `/shop` lee `dbLocal.getProducts()` → localStorage del visitante
- `/catalogo` y las landings leen `config/products.ts` estático
- El cobro usa Supabase

Mientras eso no se unifique, cada cambio de precio rompe la tienda: el cliente
ve un precio, el servidor calcula otro, y el guard 409 le impide pagar. El guard
está bien (evita el cobro erróneo de $23.75), pero el arreglo de fondo es que
`/shop`, `/catalogo` y las landings consuman `/api/catalogo`.

Relacionado: `CartContext.tsx:124-131` guarda el `price` ya con el descuento por
volumen aplicado, y el servidor lo vuelve a aplicar sobre el precio de Supabase.
Un carrito guardado antes de un cambio de precio queda en 409 permanente, sin
mensaje que le diga al cliente que lo vacíe. Lo correcto es no guardar `price`
en el carrito: solo `product_id`, cantidad y extras.

## 7 · Cosas que siguen sin resolverse y no dependen de código

**Firma del IPN de Yappy — CONFIRMADA, ya no es un riesgo.** Verificada el
20/09/2026 contra la documentación oficial del Botón de Pago
(https://www.yappy.com.pa/comercial/desarrolladores/boton-de-pago-yappy-nueva-integracion/):
HMAC-SHA256 sobre `orderId + status + domain`, con la clave secreta decodificada
de base64 y partida por `.`, usando la primera parte. La implementación era
correcta. El `orderId` tiene un máximo de 15 caracteres (error E009 de Yappy) y
el código ya hace `.slice(0, 15)`.

Nota: el PDF "Yappy APIs - Manual de Integración v1.0.0" que anda circulando es
de **otro producto** (conector de comercio afiliado: `/v1/session/login`,
`/v1/movement/*`). No sirve para el Botón de Pago.

**Tilopay: no se sabe si hay webhook servidor-a-servidor.** El callback actual
depende de que el navegador vuelva. Si el cliente cierra la pestaña después del
3DS, el pago queda cobrado y sin confirmar en el sistema. Hay que revisarlo en
el panel de Tilopay.

**El modo prueba de Tilopay hay que apagarlo** cuando terminen las pruebas.

## 8 · Deuda menor, para cuando haya tiempo

- `/api/email/*` es un relay abierto: sin auth, sin rate limit, sin verificar que
  el pedido exista. Se puede quemar la cuota de Resend y mandar "confirmaciones"
  con la marca starTAP desde un dominio legítimo. Los correos deberían salir solo
  desde el callback tras confirmar el pago.
- El correo de confirmación de Tilopay **inventa el contenido del pedido**
  (`callback/route.ts:115-125`): manda "1 × Dispositivo NFC starTAP" siempre, y
  si Tilopay no devuelve el monto pone `$20`. Ahora que los pedidos se guardan en
  el servidor, hay que leerlos por `orderNumber` y armar el correo de verdad.
- El callback de Tilopay no es idempotente: cada recarga de la pestaña reenvía el
  correo. Ya existe la columna `confirmation_sent_at` para cortarlo.
- El rate limiter de login (`rateLimiter.ts`) vive en el localStorage del
  atacante. No protege nada. Hay que limitar por IP en el servidor.
- `/api/cards` acepta escrituras anónimas sobre `nfc_cards` y `nfc_products`.
- `/api/tracking/ping` guarda el estado en memoria del proceso: en Vercel cada
  lambda tiene la suya, así que los números del panel en vivo son falsos.
- `db.ts:209-228` hace `fs.writeFileSync` sobre `db_store.json`. En Vercel el
  filesystem es de solo lectura: falla, se traga el error y devuelve
  `success: true`.
- IDs de pedido: `PED-${Math.random()*9000}` son 9.000 valores y `createOrder`
  **sobrescribe** si colisionan.
- `master-control` se protege solo en el cliente. Falta un `middleware.ts` que
  valide la sesión antes de servir `/master-control/*`.
- `api/tilopay/process` compara totales con tolerancia 0.01 y `sdk-session` con
  0.05. Unificar.
- La raíz del repo tiene scripts sueltos (`patch1.py`, `refactor*.py`, `temp.tsx`,
  un archivo llamado `ervidor no coinciden"`) y un `_to_delete/`. Limpiar.

---

## Resumen de lo que ya quedó hecho en el código

| # | Qué | Dónde |
|---|---|---|
| 1 | `/api/yappy/checkout` recalcula el total en el servidor y rechaza con 409 si no coincide. Antes cobraba lo que dijera el navegador. | `api/yappy/checkout/route.ts` |
| 2 | ID de orden unificado con Yappy; el callback busca por `yappy_order_id` **o** `id` y avisa si el UPDATE no afectó ninguna fila. | `api/yappy/{checkout,callback}` |
| 3 | Nueva ruta `/api/pedidos`: registra el pedido en Supabase con service_role **antes** de cobrar. | `api/pedidos/route.ts`, `checkout/page.tsx` |
| 4 | El panel de precios llama a `/api/admin/precio` y muestra el error real. | `master-control/productos/page.tsx` |
| 5 | "Pack" se detecta igual en cliente y servidor (`isPack`, no el nombre). | `checkout/page.tsx` |
| 6 | HTML escapado en `/r/[id]` (era XSS reflejado en el dominio principal). | `r/[id]/route.ts` |
| 7 | `cleanEmail.includes('admin')` fuera: daba permisos de admin a `badminton@x.com`. | `db.ts` |
| 8 | Producto no reconocido ya no se cobra a $20, lanza y devuelve 400. Cerrar sesión ahora cierra la sesión de Supabase. | `checkout-total.ts`, `master-control/layout.tsx` |

Fernando quiere que **subas tú los cambios a GitHub** (`cotoss3/nfc`, rama `main`).
Desde la sesión no se despliega, por regla del proyecto.
