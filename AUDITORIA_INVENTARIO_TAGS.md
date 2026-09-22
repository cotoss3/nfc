# Auditoría — Inventario y Tags NFC en master-control
**20 de septiembre de 2026** · starTAP

Encargo: ¿está optimizado? Respuesta corta: **el rendimiento está bien y no hay
que tocarlo**. El problema no es la velocidad, es que el inventario no mide nada
real y que el generador de códigos NFC está a una venta de romperse.

Corrección a la auditoría anterior: `db_store.json` tiene **70 tarjetas y 4
productos**, no 107 y 11. Ese dato estaba mal.

---

## LO URGENTE · El modelo está al revés: se generan códigos en vez de asignarlos

**Corrección de diseño (dicha por Fernando, 20/09/2026):** los tags NO se generan
al vender. Existen físicamente antes: se compran, se graban y entran al
inventario. Una venta debe **asignar uno de los que ya hay en stock**.

Hoy el código hace lo contrario. `createOrder` (`src/lib/db.ts:684,702,720`) llama
a `getNextStickerCode()`, que **inventa un código nuevo** leyendo el máximo y
sumando uno. Nunca mira si hay tags disponibles.

Estado real del inventario, medido en `db_store.json`:

- **70 tags**, todos `owner_name: "Sin Asignar (Stock)"`, `claimed: false`,
  `is_active: false`.
- `STT-1001` a `STT-1050` (50 placas) y `STTT-1001` a `STTT-1020` (20 tarjetas).
- **Ninguno vendido ni asignado todavía.**

Consecuencias del modelo actual:

1. **La primera venta inventa `STT-1051`, un tag que no existe físicamente.** El
   cliente recibiría una placa grabada con un código distinto al que el sistema
   cree haberle dado.
2. Las 70 unidades reales **nunca se consumen**: el sistema las ignora y sigue
   creando códigos hacia arriba. El inventario de tags no baja jamás.
3. Además, `getCards()` y `getCardsAsync()` (`db.ts:1099,1105,1123,1129`) filtran
   con un techo `STT- <= 1050` / `STTT- <= 1020`. Ese techo **coincide
   exactamente con el inventario actual**, así que los códigos inventados quedan
   invisibles y `getNextStickerCode()` repite el mismo para cada pedido.
   Peor: `getCardsAsync` hace `setStorageItem('nfc_cards', validOnly)` — reescribe
   el almacenamiento con la lista recortada, borrándolos de verdad.

**El techo sigue siendo un problema aunque se arregle la asignación**, por otra
razón: cuando importes el siguiente lote físico (`STT-1051` en adelante), esos
tags serán invisibles y el panel los borrará al abrirse. Hay que quitarlo igual.

### Cómo debe funcionar

**Asignar, no generar.** Al confirmarse un pedido, en el servidor
(`/api/pedidos`, no en el navegador):

1. Buscar los tags libres del tipo que toque (`STT-` para placa/stand, `STTT-`
   para tarjeta de bolsillo), ordenados por código, en estado `en_stock`.
2. Tomar tantos como unidades tenga el pedido. El Pack Trío consume **1 placa +
   2 tarjetas**.
3. Marcarlos con el dueño y el `order_id`, en una sola operación con condición
   `estado = 'en_stock'` para que dos pedidos simultáneos no se lleven el mismo
   tag.

**Si no alcanzan los tags** (decisión de Fernando, 20/09/2026): el pedido **se
acepta igual**. Se cobra, se registra, y los tags que faltaron quedan
pendientes:

- El pedido se marca con `tags_pendientes = N`.
- Salta una alerta en el panel de Inventario: "Pedido PED-XXXX espera N tags".
- Cuando entre el lote nuevo, el admin los asigna desde ahí.

Nunca se inventa un código. Un tag que no existe físicamente no se le promete a
nadie.

### Estados del tag

| Estado | Qué significa | `is_active` (redirige) |
|---|---|---|
| `en_stock` | grabado, en la caja, sin vender | false |
| `asignado` | vendido, con dueño, sin configurar | false |
| `configurado` | el cliente puso su enlace de Google | **true** |

**El tag se enciende cuando el cliente lo configura** (decisión de Fernando), no
al pagar ni al entregar. Llega apagado y empieza a redirigir en el momento en
que el cliente entra a su panel y pone el enlace de su ficha de Google.

Eso resuelve dos cosas de una: un tag nunca redirige mientras está en tu casa o
en el courier, y nunca redirige a `https://google.com` genérico —que es el
`target_url` que tienen hoy las 70 unidades— porque hasta que no hay enlace
real, no hay redirección.

Los dos booleanos sueltos de hoy (`is_active`, `claimed`) se derivan del estado,
así no hay que tocar `/r/[id]`, que sigue mirando solo `is_active`.

**`getNextStickerCode()` deja de usarse al vender.** Sigue teniendo sentido en un
solo sitio: cuando el admin da de alta un lote nuevo en Inventario y necesita
saber por dónde va la numeración (`inventario/page.tsx:275,515`,
`cards/page.tsx:97,208`).

## A · Inventario

### A.1 Hay tres sistemas de stock que no se hablan

| Dónde | Tipo | Quién lo lee |
|---|---|---|
| `inventory_product_stocks` (localStorage) | número | solo la página de Inventario |
| `products.in_stock` | booleano | Productos y el catálogo público |
| `inventory_batches.quantity_remaining` | número | solo se muestra; **nunca se decrementa** |

Puedes tener `current_stock = 0` en Inventario y `in_stock = true` en Productos
a la vez, y la tienda sigue vendiendo.

**El botón "Agotado / En Stock" no funciona.** `getProducts()` (`db.ts:347-367`)
reconstruye cada producto desde el catálogo central campo por campo y **no copia
`in_stock`** — solo rescata `price`. Se ve el cambio, y al recargar vuelve atrás.

### A.2 El stock no se descuenta cuando entra un pedido

Existe el código (`db.ts:679-721`, dentro de `createOrder`), pero `createOrder`
corre **en el navegador del comprador**. El descuento ocurre en el localStorage
de quien compró, en su teléfono. El admin nunca lo ve.

`/api/pedidos` — la ruta de servidor que sí registra el pedido — **no toca el
stock**. Y `inventory_product_stocks` ni siquiera existe como tabla en Supabase.

**En la práctica: el número del panel solo cambia cuando lo cambias tú a mano.**

Mismo problema con la creación de las tarjetas STT del pedido (`db.ts:611-676`):
también vive en el navegador del comprador.

### A.3 No hay control de sobreventa

`CartContext.tsx:106-125` solo valida que la cantidad sea > 0. `/api/pedidos`
valida que haya items y que el total sea > 0. **Nada consulta el stock.**

El "Stand NFC de Mesa" tiene `current_stock: 0` ahora mismo y se puede comprar.
Se pueden pedir 50.

### A.4 El Kardex existe pero le falta la mitad

Registra ajustes manuales y entradas por lote. **No registra las salidas por
venta**: el tipo `'salida_venta'` está declarado pero el único movimiento de ese
tipo es el de demo sembrado en `inventario/page.tsx:250-258` ("Orden #1024").
Ese movimiento es falso.

Los IDs son `MOV-${Date.now().slice(-4)}`: colisionan cada ~10 segundos y se usan
como `key` de React.

---

## B · Tags NFC

**No hay `order_id` en `nfc_cards`.** El único vínculo con el pedido es el
`owner_email` y una etiqueta de texto. Puedes saber a qué correo se mandó una
tarjeta, pero no de qué pedido salió. `owner_id` es siempre el literal
`'user-session'`.

**No hay estados.** Dos booleanos sueltos, `is_active` y `claimed`, que se
encienden juntos en el momento de la venta — antes de fabricar y antes de
entregar. No existe "vendida pero no enviada".

**Cualquiera puede crear tarjetas visitando una URL.** `getCardById`
(`db.ts:1176-1200`): si el código no existe, **lo crea**. Entrar a
`/r/STT-9999` inserta una fila nueva.

**El contador de escaneos del panel es falso.** Se escribe en la tabla `scans`
(`db.ts:1556`) y el panel lee `nfc_scans` (`cards/page.tsx:80`), que no existe
en ningún `.sql`. El error se traga y cae al array local, que incluye **45
escaneos generados con `Math.random()`** (`db.ts:320-342`). Es una palabra de
diferencia.

**Los escaneos son lo único que crece sin tope.** Cada tap hace un
`readFileSync` + `writeFileSync` de `db_store.json` **entero**, sin locking, en
la ruta caliente. Con 70 tarjetas a ~1 tap/día son ~25.000 filas al año. El tope
local de 500 (`db.ts:1490`) se llena en **una semana**; el corte por defecto de
1.000 filas de PostgREST, en **dos**. A partir de ahí el panel miente sin avisar.

---

## C · Rendimiento — esto está bien

**No hay N+1.** Ni una sola query dentro de un `.map()`. El patrón es una query
grande y todo en memoria, que para 70 registros **es la decisión correcta**.

**Los agregados están memoizados** casi todos. La excepción es "Ventas por
Provincia" (`master-control/page.tsx:795-803`), un `reduce` escrito inline en el
JSX que se recalcula cada 3 segundos por culpa de un `setInterval`.

**Los `useEffect` están bien**, todos con array de dependencias, ninguno en bucle.

**Se trae todo y se muestra una parte.** `inventario/page.tsx:139-144` lanza 4
queries completas para pintar 15 tarjetas y 8 movimientos. A esta escala no
importa. Lo que sí importa es que ninguna consulta tiene `.limit()`, y PostgREST
corta en 1.000 filas en silencio.

**Basura que gasta sin dar nada:** `inventario/page.tsx:281-284` tiene un
`setInterval` cada 12 s que hace `setOnlineUsers(Math.random())` — y
`onlineUsers` **no se renderiza en ninguna parte**. Re-renderiza un componente
de 1.291 líneas cada 12 segundos para nada.

**¿A partir de cuándo duele?**

| Tarjetas | Qué pasa |
|---|---|
| 70 (hoy) | ~40 KB. Invisible. |
| 1.000 | ~560 KB. Sigue bien. |
| **~2.000** | **El DOM es el cuello**: `cards/page.tsx:564` renderiza una fila por tarjeta sin paginar. ~20.000 nodos, scroll con tirones. Este es el número a vigilar. |
| ~5.000 | 3 MB por la red en cada apertura. Cada clic en "activar" reserializa el array entero. |
| ~9.000 | Límite de localStorage (5 MB). |

Al ritmo actual eso es dentro de años. **Los escaneos desbordan en semanas.**

---

## D · Qué hacer

### Hazlo ya

1. **Borrar el techo de 1050/1020** en `db.ts:1099,1105,1123,1129`. Lo más
   urgente del informe: la próxima venta genera códigos duplicados, y
   `getCardsAsync` además borra las tarjetas de más cada vez que abres el panel.
2. **Cambiar `nfc_scans` por `scans`** en `cards/page.tsx:80`. Una palabra. Hoy
   el contador de escaneos muestra datos inventados con `Math.random()`.
3. **Mover el descuento de stock y la creación de tarjetas a `/api/pedidos`.** Es
   el mismo código de `db.ts:611-721`, movido de sitio. Sin esto, el inventario
   no mide nada.
4. **Una sola fuente de stock.** Quedarse con el número y derivar
   `in_stock = current_stock > 0`. Quitar el botón de Agotado, que hoy miente.
5. **Llevar `inventory_product_stocks` a Supabase.** Son 4 filas. Hoy el stock
   que ves en el portátil y el que ves en el móvil son distintos.
6. **Validar stock en `/api/pedidos` antes de cobrar.** Cuatro líneas. Un pedido
   sobrevendido cuesta una disculpa y un reembolso.
7. **Autenticar el `POST /api/cards`.** El `GET` está bloqueado; el `POST` no.
   Acepta `{key, value}` sin autenticación y **sobrescribe `nfc_cards` entero**.
   Un `curl` borra las 70 tarjetas.
8. **`CREATE INDEX idx_scans_card_id ON public.scans(card_id);`** Una línea.
   Postgres no indexa las claves foráneas solo, y es la única tabla que crece.
9. **Borrar el `setInterval` de `onlineUsers`** (`inventario/page.tsx:281-284`).
   Cuatro líneas.
10. **`.limit()` en las lecturas del panel**, o mejor `count: 'exact', head: true`
    para el contador de escaneos: traer el número sin traer las filas.

### Hazlo cuando crezcas

- **Registrar la salida por venta en el Kardex** — desde ~20 pedidos/mes, en
  cuanto quieras cuadrar inventario físico contra ventas.
- **Añadir `order_id` a `nfc_cards`** — desde ~50 clientes con recompra. Sin eso,
  cada reposición es trabajo de detective.
- **Paginar la tabla de tarjetas** — desde ~500; obligatorio pasando de 2.000.
- **Vista agregada de escaneos por día** en vez de leer filas crudas — en cuanto
  quieras una gráfica mensual, o sea, probablemente ya.
- **Descontar `quantity_remaining` de los lotes**, o quitar el campo de la UI.

### No lo hagas

- **No añadas índices en `products`, `orders` ni `nfc_cards.created_at`.** Con 4,
  ~10 y 70 filas, Postgres los ignora. Solo `scans.card_id` se justifica.
- **No pagines ni muevas los filtros al servidor en Inventario.** Con 4 productos
  filtrar en el navegador es correcto y da búsqueda instantánea. Esto está bien
  y lo estará durante años.
- **No metas React Query, SWR ni Zustand.** Tres páginas con un `loadData()` y
  `useState` es lo proporcionado.
- **No construyas lotes FIFO con costeo promedio ponderado** para 4 SKUs.
- **No reescribas `dbLocal` entero.** Los puntos 3, 5 y 6 mueven solo lo que es
  dinero. El resto puede seguir como está.

---

## Sin confirmar

- Si `scans` tiene filas reales en producción. Por el bug del nombre de tabla,
  todo lo que se ve en el panel es local y mock. La estimación de ~25.000/año es
  una proyección razonada, no una medición.
- Si `migracion_20260920_seguridad.sql` ya se corrió. Si no, `products.in_stock`
  ni existe como columna, lo que sería una segunda razón — independiente de la
  de A.1 — por la que el toggle no persiste.
- El límite de filas de PostgREST configurado en este proyecto (se asumió el
  valor por defecto de 1.000).
