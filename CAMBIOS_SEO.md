# Bitácora de cambios SEO — starTAP

Para saber qué se tocó y cuándo, y poder leer Search Console contra una fecha.
Search Console no tiene anotaciones como Google Analytics, así que esta tabla es
la anotación. Cada vez que se toque algo que pueda mover posiciones o clics, va
una fila aquí, con la fecha del **despliegue**, no la del commit.

| Fecha despliegue | Qué cambió | Páginas | Qué esperamos | Cuándo medir |
| --- | --- | --- | --- | --- |
| pendiente (preparado 14 oct 2026) | Metas ultra-optimizadas con precios y CTR hooks: Placa ($35), Tarjeta ($20), Stand ($30) y Pack ($50). Titles bajo 50-56 caracteres | `/catalogo/[id]` y `/catalogo` | Desbloquear clics en consultas Top 1 a 7 («placas nfc» pos 1.7, «tarjeta de bolsillo» pos 1.0) | 3 nov 2026 |
| pendiente (preparado 13 oct 2026) | Titles recortados a 60 caracteres y descripciones a 155, con precio, pago único y envío gratis dentro | `/`, `/catalogo`, `/resenas-google`, `/corporativo`, `/distribuidores`, `/blog` y las 6 de industria | Primer clic en `/catalogo` y `/resenas-google`, que llevaban 25 y 6 impresiones en posiciones 4,3 y 4,7 con cero clics | 3 nov 2026 |
| pendiente (preparado 13 oct 2026) | `/app` con `noindex` y fuera del `sitemap.ts` | `/app` | Que salga del índice. Llevaba 11 impresiones en posición 9,5 mostrando cifras de ejemplo | 3 nov 2026 |
| pendiente (preparado 13 oct 2026) | La descripción del catálogo ya no lista precio por producto, solo «desde $20». Evita que se desincronice cada vez que cambian los precios | `/catalogo` | Nada medible | — |

## Línea base del 13 oct 2026

Search Console, 15 sep al 12 oct 2026, búsqueda web:

| Indicador | Valor |
| --- | --- |
| Clics, 28 días | 10 |
| Impresiones | ~250 |
| Páginas con impresiones | 18 |
| Posición por «startap» | 9,4 |
| `/catalogo` | 25 impresiones, posición 4,3, **0 clics** |
| `/resenas-google` | 6 impresiones, posición 4,7, **0 clics** |
| `/catalogo/tarjeta-nfc-bolsillo` | 10 impresiones, posición 7,6, **0 clics** |
| `/envios` | 13 impresiones, posición 9,5, **0 clics** |
| `/app` | 11 impresiones, posición 9,5, 0 clics |
| Consulta «placas nfc» | posición 1,7, **0 clics** |
| Consulta «tarjeta de bolsillo» | posición 1, **0 clics** |

## Cómo medir el 3 de noviembre

Una sola pregunta: **¿`/catalogo` y `/resenas-google` pasaron de cero a algún
clic, con la posición igual o mejor?**

- Si sí, el problema era el texto del resultado y se repite el ejercicio con las
  páginas de industria.
- Si la posición se mantiene y el clic sigue en cero, el texto no era el
  problema. Toca mirar a mano qué muestra Google arriba de nosotros en esas
  búsquedas desde Panamá.

Ojo con los volúmenes: entre 4 y 36 impresiones por página. Un clic de
diferencia mueve el porcentaje muchísimo. Lo que vale es el patrón en varias
páginas a la vez, no el número de ninguna.

---

## Política de envío confirmada · 13 oct 2026

Fernando confirmó: **todo carrito mayor a $49.99 ($50.00 o más) tiene envío gratis a todo Panamá.**
Todo pedido menor paga envío según el método seleccionado ($3.75 Panamá Centro / $6.50 Uno Express / $7.50 Servientrega). El Pack Trío Comercial ($50.00) incluye envío gratis por superar el umbral.

Aplicado en el código, listo para desplegar:

| Archivo | Qué cambió |
| --- | --- |
| `src/config/shipping.ts` | `FREE_SHIPPING_THRESHOLD = 50`. `calculateShippingCost` da gratis si `hasPack || qualifiesForFreeShipping(subtotal)`. `amountMissingForFreeShipping` y `qualifiesForFreeShipping` restaurados |
| `src/app/cart/page.tsx` | Barra de progreso activa ($0 a $50). Muestra cuánto falta para el envío gratis o felicita si supera $49.99 / lleva Pack |
| `src/app/checkout/page.tsx` | `envioGratis` activado si supera $49.99 ($50+), si lleva pack o si tiene cupón de envío gratis |
| `src/config/products.ts` y `src/lib/landings.ts` | Textos del Pack Trío indican «Envío gratis a todo Panamá» |
| `catalogo/page.tsx` y `catalogo/[id]/page.tsx` | El `shippingRate` del schema es `0.00` si `price >= 50 || isPack`, y `$3.75` (Panamá Centro) si es menor |
| Meta descriptions de `/` y `/catalogo` | Indican «Envío gratis desde $50» (compras mayores a $49.99) |

**Pendiente fuera del código:** el volante en PDF y los mensajes guardados de
WhatsApp dicen «envío gratis desde $50». Hay que rehacerlos con la regla nueva.

**Ojo con los pedidos en curso:** a quien se le cotizó con la regla vieja se le
respeta lo prometido.

**Precios verificados el 13 oct 2026** contra `src/config/products.ts`: tarjeta
$20, stand $30, placa $35, Pack Trío $50. El ahorro de $25 del pack calza
(35 + 20 + 20 = 75). La plantilla de correo y los textos de ahorro están
correctos. El volante en PDF ya lo corrigió Fernando.

### Corrección del 13 oct 2026, misma tarde

Fernando revirtió la política: **vuelve el envío gratis en todo pedido sobre
$49.99**, no solo con el Pack. Él mismo dejó el código consistente
(`shipping.ts`, carrito, checkout, schema y meta descriptions), y de paso mejoró
el `shippingRate` del JSON-LD a `(price >= 50 || isPack)` conservando la tarifa
base corregida de $3.75.

Los tres manuales de escritura quedaron alineados a esta regla. La frase única
vuelve a ser «Envío gratis desde $50 a todo Panamá».

Lección para la bitácora: la política de envío cambió dos veces en el mismo día.
Ningún texto debe repetir la regla sin mirar antes `src/config/shipping.ts`.

## 19 de octubre de 2026 — Feed de Google Merchant: fuera los GTIN prestados

Pendiente de desplegar. Fecha de despliegue: ____________

Los siete productos llevaban códigos de barras GTIN-13 de la serie
`0745301294801` a `...863`. El dígito verificador de los siete es correcto, pero
el prefijo GS1 `0745301` está registrado a nombre de otra empresa, no de
starTAP. Google Merchant lee ese prefijo y le atribuye el producto a ese
fabricante, y en el schema de las páginas pasaba lo mismo.

Para producto propio hecho a mano, sin código de barras comprado a GS1, lo que
Google pide es declarar que no existe identificador. Eso se hizo:

- `src/config/products.ts`: fuera el campo `gtin13` del tipo y de los 7 productos.
- `src/app/google-merchant.xml/route.ts`: fuera `<g:gtin>`, entra
  `<g:identifier_exists>no</g:identifier_exists>`.
- `src/app/page.tsx`, `src/app/catalogo/page.tsx` y `src/app/catalogo/[id]/page.tsx`:
  fuera `gtin13` del JSON-LD de Product. Un GTIN equivocado en el schema es peor
  que ninguno.

El `sku` y el `mpn` se quedan: esos sí son códigos propios de starTAP.

También en el feed:

- La marca se queda como «starTAP Panamá», que es la decisión del 15 de
  septiembre por el tema de los homónimos (startap.pro, startap.lat y varios
  más). No se toca.
- Entra `<g:google_product_category>222</g:google_product_category>` (Electronics)
  y `<g:product_type>` propio por formato (Tarjetas, Stands, Placas, Packs).
- La descripción del canal ahora nombra a la empresa que opera la marca:
  KoreNet Cloud & Web.

**Fuera del código, en el panel de Google Merchant Center:** el nombre del
negocio y el del feed todavía son de la empresa anterior. Eso no se arregla
desde el repositorio; hay que cambiarlo en la configuración de la cuenta.

### Merchant Center, mismo 19 de octubre

Entramos a la cuenta 666381414 («Startap») a ver por qué no se mostraba nada.

Lo que había:

- En Fuentes de datos, bajo «Encontrado por Google», aparecía **smartzonie.com**
  con 0 productos, reintentando cada 24 horas. De ahí salía el error «La URL de la
  tienda online no coincide» en el 100% de los productos.
- Los únicos productos de la cuenta eran cuatro cargados a mano en septiembre, los
  cuatro en «No aprobado»: Stand NFC de mesa, Stand NFC para Reseñas de Google
  (duplicado del anterior), Tarjeta NFC de Bolsillo y «Diseño Web» de $250, que es
  un servicio de DataKorex y Merchant no acepta servicios. Los tres NFC estaban sin
  precio fijo («Varios»).
- `google-merchant.xml` NO estaba dado de alta como fuente de datos. Por eso
  Merchant nunca vio los siete productos reales.

Lo que se hizo:

- Archivados los tres productos NFC cargados a mano. «Diseño Web» se dejó por
  decisión de Fernando.
- Dada de alta la fuente **«starTAP Panama - feed XML»** apuntando a
  `https://startap.com.pa/google-merchant.xml`, solo Panamá, español, etiqueta de
  feed PA, actualización cada 24 horas. La primera descarga entró con los **siete
  productos**, todos los atributos reconocidos y sin problemas en el archivo.

Lo que quedó pendiente:

- Los siete siguen en «No aprobado» porque el error de cuenta «No se ha mostrado
  ningún producto» bloquea toda la cuenta. La revisión ya está solicitada y tarda
  unos días.
- La opción para sacar smartzonie.com de la lista es «Dejar de gestionar
  productos», pero apaga la detección automática de TODA la tienda, también la de
  startap.com.pa. No se tocó. Con el feed dado de alta esa fila pesa poco.
- Un producto tiene la imagen por debajo de 500x500 px.
- El teléfono de la cuenta es el personal de Fernando (6713-4341) y no el de la
  empresa (6483-9004).
