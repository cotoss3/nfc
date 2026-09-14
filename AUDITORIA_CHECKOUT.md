# 🛒 Auditoría del checkout y pagos — 14 sep 2026

## 🔴 Lo más grave que se encontró: el pago con tarjeta no existía

`src/app/checkout/page.tsx` pedía número de tarjeta, vencimiento y CVV en un formulario propio
y luego hacía esto:

```js
setTimeout(() => {
  dbLocal.createOrder({ ..., payment_status: 'completed' })
}, 1800)
```

Un `setTimeout` de 1.8 segundos y el pedido quedaba marcado como **pagado**. No se cobraba nada.

La integración de Tilopay (`src/lib/tilopay.ts` y `/api/tilopay/process`) estaba escrita y funcional,
pero **el checkout nunca la llamaba**. Estaba ahí sin conectar.

Dos consecuencias reales:

1. Capturar PAN y CVV en un formulario propio pone el negocio bajo PCI-DSS y fuera de norma.
2. Todo pedido quedaba "pagado" sin dinero recibido.

**Corregido:** la tarjeta ahora redirige a la pasarela de Tilopay. El sitio ya no pide ni guarda
datos de tarjeta.

## 🔴 El monto se calculaba en el navegador

`/api/tilopay/process` recibía `total` desde el cliente y cobraba ese número. Cualquiera podía
mandar `total: 1` y pagar un dólar por un pack de $50.

**Corregido:** el total se recalcula en el servidor desde `config/products.ts`, con los extras de
logo y QR y la regla de envío. El número del navegador ya no se usa para cobrar; si no coincide,
se registra en el log y gana el del servidor.

## 🔴 El retorno de pago se creía cualquier cosa

`/api/tilopay/callback` daba el pago por bueno con `code === '1'` leído de la URL. Esa URL la
abre el navegador del cliente y se puede escribir a mano.

**Corregido:** el callback ahora consulta la transacción contra la API de Tilopay
(`consultTilopayPayment`) y solo entonces decide. Los parámetros de la URL ya no deciden nada.

## 🟠 Yappy apuntaba a otra cuenta

Decía `@panacards`. **Corregido:** ahora muestra **6713-4341 · Fernando Contreras**, y el pedido
queda en `payment_status: 'pending'` hasta que verifiques el pago a mano. Antes entraba como pagado
solo con escribir una referencia cualquiera.

## Cambios de negocio aplicados

- **Retiro en oficina eliminado.** Quedan Panamá Centro ($3.75), Uno Express ($6.50) y
  Servientrega ($7.50).
- **Envío gratis desde $50.** Antes solo era gratis con pack.
- **Barra de progreso en el carrito** que le dice al cliente cuánto le falta para el envío gratis,
  y lo celebra cuando llega. Es la palanca más simple para subir el ticket promedio.

## Archivos tocados

| Archivo | Qué cambió |
| --- | --- |
| `src/config/shipping.ts` | **Nuevo.** Umbral, tarifas y datos de Yappy en un solo lugar |
| `src/app/checkout/page.tsx` | Tilopay real, sin campos de tarjeta, sin retiro en oficina, envío gratis |
| `src/app/cart/page.tsx` | Barra de progreso hacia el envío gratis |
| `src/app/api/tilopay/process/route.ts` | Total calculado en servidor |
| `src/app/api/tilopay/callback/route.ts` | Verificación real contra Tilopay |

## ⚠️ Pendiente / a revisar

1. **No se pudo compilar.** El shell de la VM del equipo no levantaba
   ("Workspace unavailable"), así que los cambios se hicieron por staging de archivos.
   **Correr `npm run build` antes de desplegar.**
2. **Variables de entorno de Tilopay.** Verificar que existan en producción:
   `TILOPAY_API_USER`, `TILOPAY_API_PASSWORD`, `TILOPAY_API_KEY` y `NEXT_PUBLIC_BASE_URL`.
   Sin ellas el pago con tarjeta devuelve error.
3. **El `orderNumber` que se le manda a Tilopay puede no coincidir con el id que genera
   `dbLocal.createOrder`**, que arma su propio id. Conviene que `createOrder` acepte un id
   externo, o el callback no podrá casar el pago con el pedido.
4. **Probar un pago real de $1** en producción antes de anunciar la tienda.
5. **Los pedidos siguen guardándose con `dbLocal`** (localStorage + `db_store.json`), que en
   Vercel no persiste. Sigue pendiente lo de `AUDIT.md`: mover pedidos a Supabase de verdad.
   Mientras eso no pase, una venta con tarjeta cobrada por Tilopay puede no quedar registrada
   en ningún lado que tú puedas ver.
