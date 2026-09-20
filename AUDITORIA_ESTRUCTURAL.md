# Auditoría estructural — BDD, master-control y flujo de cliente
**20 de septiembre de 2026** · starTAP (startap.com.pa)

Lo que sigue son fallas confirmadas leyendo el código. Ordenadas por lo que
cuesta dinero o pierde pedidos, no por lo que es más fácil de arreglar.

---

## El diagnóstico en una frase

El sistema tiene **cuatro fuentes de verdad distintas** para el precio y
**ninguna** para el pedido. Un pedido pagado hoy existe únicamente en el
`localStorage` del teléfono del cliente. No está en Supabase, no está en
`db_store.json`, y tú no lo ves en master-control.

---

## CRÍTICO

### 1. Los pedidos nunca llegan al servidor
`src/lib/db.ts:590` · `src/app/api/cards/route.ts:12-18` · `supabase_schema.sql:101`

Tres capas fallan a la vez:

1. `dbLocal.createOrder` corre en el navegador (`checkout/page.tsx:295`, `:1103`),
   así que escribe en `localStorage` y hace `POST /api/cards`.
2. `/api/cards` solo acepta `nfc_cards, nfc_products, nfc_deleted_product_ids,
   nfc_scans, nfc_users`. **`nfc_orders` no está en la lista** → 403.
   Comprobado: `db_store.json` tiene 11 productos y 107 tarjetas. Cero pedidos.
3. El respaldo a Supabase (`db.ts:625`) usa la llave **anon**, y `public.orders`
   tiene RLS activado **sin ninguna política**. El INSERT se bloquea y el error
   solo se imprime en la consola del navegador (`db.ts:640`).

**Escenario:** cliente paga con tarjeta desde su teléfono. El pedido existe solo
en ese teléfono. Tú abres master-control (`page.tsx:107` lee `getOrders()` de
*tu* localStorage) y no hay nada. Cobrado, invisible, sin despachar.

**Arreglo:** crear el pedido desde una ruta de servidor (`POST /api/pedidos`)
con `SUPABASE_SERVICE_ROLE_KEY` **antes** de iniciar el pago, y añadir políticas
RLS para `orders` (solo service_role).

### 2. Yappy cobra el monto que dicta el navegador
`src/app/api/yappy/checkout/route.ts:6-14, 90-91`

La ruta toma `total` del body y lo manda tal cual a Banco General. No llama a
`calcularTotal`. No tiene el guard 409 — ese solo existe en las rutas de Tilopay.
Es exactamente el bug del cobro de $23.75, pero en el otro método de pago.

**Escenario:** un POST directo con `{orderNumber:"STP-1", total:0.01}` genera una
orden legítima de Yappy por un centavo.

**Arreglo:** recalcular con `calcularTotal(items, shippingMethod, couponCode)`
dentro de la ruta y usar solo ese valor. Replicar el 409.

### 3. El IPN de Yappy nunca encuentra el pedido
`yappy/checkout/route.ts:65` vs `yappy/callback/route.ts:41-49`

El ID que se registra en Yappy es `orderNumber.replace(/[^A-Za-z0-9]/g,'')` →
`STP12345678`. El pedido local se guarda como `STP-12345678`. El IPN vuelve con
el ID limpio y el `UPDATE ... eq('id','STP12345678')` actualiza **cero filas**,
en silencio.

**Escenario:** cliente paga $50 por Yappy, el IPN llega correcto, y el pedido se
queda en `payment_status: 'pending'` para siempre.

**Arreglo:** un solo identificador en ambos lados, y verificar que el UPDATE
afectó ≥1 fila; si no, alertar.

### 4. Escritura pública total sobre `nfc_cards`
`supabase_schema.sql:113` — `FOR ALL USING (true) WITH CHECK (true)`

La `NEXT_PUBLIC_SUPABASE_ANON_KEY` está en el bundle del navegador. Con ella
cualquiera puede reescribir los `target_url` de los 107 dispositivos, o borrar
la tabla. `/r/[id]` lee de ahí y redirige.

**Escenario:** un tercero apunta todos los NFC de tus clientes a su propia
página. Tus clientes ven que "starTAP los mandó a otro sitio".

**Arreglo:** dejar solo SELECT público; toda escritura por ruta de servidor con
service_role y verificación de `owner_email` contra la sesión.

---

## ALTO

### 5. Cuatro fuentes de precio, y la tienda muestra una distinta a la que cobra
- `src/config/products.ts:27` (estático)
- `nfc_products` en localStorage / `db_store.json`
- Supabase `products` (lo que escribe `/api/admin/precio`)
- El `price` congelado en `nfc_cart` al agregar al carrito

Quién gana:
| Ruta | Fuente |
|---|---|
| `/shop` | localStorage del visitante |
| `/catalogo` y landings | `config/products.ts` estático |
| **El cobro** | **Supabase** |
| `/api/catalogo` | Supabase — pero **nadie lo consume** |

**Escenario:** bajas la placa de $30 a $25. `/catalogo` sigue mostrando $30, el
cliente agrega a $30, el servidor calcula $25 → **409 y no puede pagar**. El
guard evita el cobro malo pero convierte cada cambio de precio en tienda rota.

### 6. El admin escribe precios en localStorage; nunca llegan a Supabase
`master-control/productos/page.tsx:68` → `db.ts:394-406`

`updateProductPrice` escribe tu localStorage y luego intenta un update con la
llave anon, que RLS bloquea a propósito. El resultado ni se inspecciona
(`db.ts:401`) → **la UI siempre dice "guardado"**.

### 7. Los cupones que creas bloquean el pago
`config/shipping.ts:123-148` + `checkout-total.ts:72`

`validateCoupon` busca los cupones personalizados solo `if (typeof window !==
'undefined')`. En el servidor solo existen `EVG`, `STARTAP10`, `DESCUENTO5`.
Los que creas en `/master-control/cupones` viven en localStorage y no salen.

**Escenario:** creas "NAVIDAD20". El cliente lo aplica, ve $40, el servidor
calcula $50 → 409. La campaña nace muerta.

### 8. El descuento por volumen se aplica dos veces por caminos distintos
`CartContext.tsx:124-131` vs `checkout-total.ts:61-68`. Coinciden solo si el
precio base del carrito es igual al de Supabase. Un carrito viejo tras un cambio
de precio queda permanentemente en 409, sin mensaje que diga "vacía el carrito".

### 9. "Pack" se detecta distinto en cliente y servidor
`checkout/page.tsx:168-173` (por nombre) vs `checkout-total.ts:54` (por
`isPack`). Diferencia de $3.75–$7.50 → 409.

### 10. El rate limiter de login es solo de cliente
`rateLimiter.ts:12,44` — estado en el localStorage del atacante. No protege nada.
Ningún endpoint de servidor tiene límite.

### 11. `/api/email/*` es un relay abierto con tu marca
Sin auth, sin límite, sin verificar que el pedido exista. Se puede quemar la
cuota de Resend y mandar "confirmaciones de pedido" con la marca starTAP a
terceros desde un dominio legítimo.

---

## MEDIO

| # | Falla | Dónde |
|---|---|---|
| 12 | Rastreo en vivo en memoria del proceso → números falsos en Vercel | `tracking/ping/route.ts:24-41` |
| 13 | XSS reflejado en la página de dispositivo inactivo | `r/[id]/route.ts:100` |
| 14 | `fs.writeFileSync` sobre `db_store.json` — falla en Vercel y devuelve `success: true` | `db.ts:209-228` |
| 15 | `/api/cards` acepta escrituras anónimas sobre claves sensibles | `cards/route.ts:28-46` |
| 16 | `cleanEmail.includes('admin')` da permisos de admin a `badminton@x.com` | `db.ts:1215` |
| 17 | Master-control se protege solo en el cliente; no hay middleware | `master-control/layout.tsx:34` |
| 18 | Callback de Tilopay sin idempotencia → un correo por cada recarga | `tilopay/callback/route.ts:93-135` |
| 19 | El correo de confirmación **inventa** el contenido del pedido (y un total de $20 si Tilopay no lo manda) | `tilopay/callback/route.ts:115-125` |
| 20 | Esquema: falta `products.in_stock` (el upsert falla siempre), faltan `b2b_quotes` y `abandoned_checkouts`, `nfc_cards.channels` solo por ALTER | varios `.sql` |

---

## BAJO

| # | Falla | Dónde |
|---|---|---|
| 21 | Producto no reconocido se cobra a $20 en vez de rechazarse | `checkout-total.ts:40-42` |
| 22 | IDs de pedido colisionables; `createOrder` **sobrescribe** el existente | `db.ts:581,584` |
| 23 | `eval("require('fs')")` para evadir el bundler | `db.ts:179-181` |
| 24 | "Cerrar sesión" no llama a `signOut()`; la sesión sigue viva | `master-control/layout.tsx:26-31` |
| 25 | La caché de precios de 30 s no se invalida entre lambdas | `precios.ts:22,78` |

---

## Sin confirmar

- ~~**Firma del IPN de Yappy**~~ — **CONFIRMADA** el 20/09/2026 contra la
  documentación oficial del Botón de Pago Yappy. HMAC-SHA256 sobre
  `orderId + status + domain`, con la clave secreta decodificada de base64 y
  partida por `.`, usando la primera parte. La implementación era correcta.
  Fuente: https://www.yappy.com.pa/comercial/desarrolladores/boton-de-pago-yappy-nueva-integracion/
- **Tilopay**: el callback sí verifica autenticidad contra `/consult`, así que
  nadie puede falsificar un "pagado". Lo que no se pudo confirmar es si existe
  un webhook servidor-a-servidor. Si no lo hay y el cliente cierra la pestaña
  tras el 3DS, **el pago queda cobrado y sin confirmar**.
- Todo lo de RLS y columnas sale de los `.sql` del repo, no de la base en
  producción.

---

## Orden de arreglo

1. **Recalcular el total en `/api/yappy/checkout`** (#2). Es dinero, hoy.
2. **Unificar el ID de orden con Yappy (#3) y persistir pedidos en servidor con
   RLS (#1).** Son pedidos reales que se están perdiendo.
3. **Cerrar la política `FOR ALL USING(true)` de `nfc_cards`** (#4).
4. **Conectar master-control a `/api/admin/precio` y la tienda a
   `/api/catalogo`** (#5, #6). Cierra la familia del cobro de $23.75 y apaga los
   409 espurios.
