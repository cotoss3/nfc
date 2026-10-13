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

## 5 · Cupones — HECHO, solo falta correr el SQL

El módulo estaba en stub ("Este módulo está siendo migrado") y los cupones que
creaba el admin vivían en su localStorage, así que el servidor no los conocía y
el pago se caía con 409. **Ya está resuelto en código.**

Qué se construyó:
- `src/lib/cupones.ts` — fuente de verdad del servidor (service_role + caché de
  30 s), con vencimiento y tope de usos.
- `src/lib/checkout-total.ts` usa `obtenerCupon()` en vez de la validación local.
  **Este es el cambio que cierra el 409.**
- `src/app/api/cupones/route.ts` — CRUD del admin (misma autenticación que
  `/api/admin/precio`: bearer + `ADMIN_EMAILS`).
- `src/app/api/cupones/validar/route.ts` — validación pública para el checkout,
  contra la misma fuente que cobra.
- `src/app/master-control/cupones/page.tsx` — panel completo.
- El contador de usos se incrementa con la función `incrementar_uso_cupon`, no
  con un leer-y-escribir desde la app.

**Lo único que falta: correr la PARTE A del SQL** (punto 1). Crea la tabla
`coupons`, siembra `EVG`, `STARTAP10` y `DESCUENTO5`, y crea la función
`incrementar_uso_cupon`. Hasta entonces el módulo cae al respaldo de los tres
cupones por defecto y los que cree Fernando no se guardarán.

Limitación conocida, no urgente: el tope de usos se revisa al validar pero no
hay bloqueo transaccional al cobrar, así que un cupón con un uso restante puede
aceptar dos pedidos casi simultáneos. A la escala de starTAP no compensa
arreglarlo.

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

## 7b · Blog: resuelto (queda como historial)

**Estado al 3 oct 2026:** los tres primeros artículos ya están en `POSTS` y en
línea. Lo de abajo quedó cumplido; se conserva porque describe el procedimiento
que hay que repetir con cada artículo nuevo.

**Corrección aplicada el 3 oct 2026 sobre el artículo ya publicado
`por-que-mi-negocio-no-aparece-en-google-maps`:** tenía dos cifras sin fuente que
violan `REGLAS_CONTENIDO.md`, "el 90% de los casos" y "cerca del 40% de los
negocios que visitamos". Las dos salieron. También se quitó un contraste binario
("No es que no existas. Es que Google no te está eligiendo."). Hay que
redesplegar para que el cambio llegue al sitio.

---

**Estado original:** en línea hay **un** artículo (`como-pedir-resenas-google-sin-penalizacion`).
El segundo está escrito y compilando, pero deliberadamente fuera del aire.

- Borrador en markdown: `contenido/articulo-no-aparezco-en-google-maps.md`
- Ya convertido a: `src/content/blog/por-que-mi-negocio-no-aparece-en-google-maps.ts`
- **NO está en el array `POSTS` de `src/lib/blog.ts`**, por eso el sitio no lo sirve.

**Por qué no está publicado.** `REGLAS_CONTENIDO.md` exige al menos dos datos de
experiencia propia por artículo ("un número propio", "un cliente concreto con
permiso") y dice que sin eso no se publica. Esos datos los tiene Fernando; no se
pueden inventar sin romper la regla de no inventar cifras.

**Qué falta, en concreto.** Dentro del `cuerpo` del `.ts` hay dos bloques
marcados:

1. `TODO_EXPERIENCIA_1` — cuántos negocios visitó Fernando y cuántos tenían la
   ficha sin reclamar, o cuántos creían que no aparecían en Maps y sí aparecían.
2. `TODO_EXPERIENCIA_2` — un cliente concreto con permiso: qué tenía antes, qué
   hizo, qué pasó. Si no hay caso cerrado, sirve un dato sostenible, como
   cuántas reseñas llevaba un negocio el día de la instalación.

**Para publicarlo:**

1. Pedirle a Fernando los dos datos y reemplazar los bloques.
2. Verificar que no quede ninguno:
   `grep -c TODO_EXPERIENCIA src/content/blog/por-que-mi-negocio-no-aparece-en-google-maps.ts`
   debe dar **0** (hay que quitar también los dos del comentario de cabecera).
3. En `src/lib/blog.ts`:
   ```ts
   import { post as articulo2 } from '@/content/blog/por-que-mi-negocio-no-aparece-en-google-maps';
   export const POSTS: BlogPost[] = [articulo1, articulo2];
   ```
4. **Falta la imagen de portada:** `/public/blog/negocio-no-aparece-google-maps-panama.webp`
   (1200×675). Sin ella el OpenGraph queda roto. Tiene que ser foto propia, no
   de banco de imágenes: lo pide `REGLAS_CONTENIDO.md`.
5. Pasar la checklist de la PARTE 3 de `REGLAS_CONTENIDO.md` antes de subir.

El resto del artículo ya cumple: cero rayas largas, cero adverbios en -mente,
sin vocabulario delator, con la sección de lo que el producto NO hace, la nota
de transparencia por conflicto de interés y dos fuentes oficiales de Google
enlazadas. Verificado con script, no a ojo.

## 7c · Blog: CUARTO artículo escrito y SIN PUBLICAR

**Archivo:** `src/content/blog/negocio-sin-local-google-maps-panama.ts`
**Slug:** `/blog/negocio-sin-local-google-maps-panama`
**NO está en `POSTS`**, por eso el sitio todavía no lo sirve. Compila limpio
(`npx tsc --noEmit` sin errores).

**Por qué este artículo y no el que se pidió.** La petición original era una guía
"Cómo posicionar tu tienda online o negocio físico en Google Maps Panamá". Esa
guía canibaliza a `por-que-mi-negocio-no-aparece-en-google-maps`, que ya está
publicado y ya reclama las keywords "posicionar mi negocio en Google Maps Panamá"
y "cómo salir primero en Google Maps". Fernando aprobó el 3 oct 2026 separar las
intenciones: el artículo publicado se queda con el negocio físico que no aparece,
y el nuevo ataca una intención que no estaba cubierta, el negocio sin local
(tienda online, negocio desde casa, servicio a domicilio) y la figura de zona de
servicio de Google.

**Qué falta para publicarlo:**

1. Los dos datos de experiencia que exige `REGLAS_CONTENIDO.md`. Están marcados
   dentro del `cuerpo`:
   - `TODO_EXPERIENCIA_1` — cuántos días tardó la verificación por video del
     perfil de starTAP y en qué terminó. Va justo después del párrafo que
     describe la configuración del perfil propio.
   - `TODO_EXPERIENCIA_2` — un negocio sin local concreto, con permiso: qué
     entregaba, dónde le pusimos el dispositivo y qué pasó. Va en la sección
     "Dónde pones el dispositivo de reseñas si no hay mostrador".
2. Verificar que no quede ninguno:
   `grep -c TODO_EXPERIENCIA src/content/blog/negocio-sin-local-google-maps-panama.ts`
   debe dar **0**.
3. Imagen de portada: `/public/blog/negocio-sin-local-google-maps-panama.webp`
   (1200×630), foto propia, no de banco de imágenes.
4. Registrarlo en `src/lib/blog.ts`:
   ```ts
   import { post as articulo4 } from '@/content/blog/negocio-sin-local-google-maps-panama';
   export const POSTS: BlogPost[] = [articulo1, articulo2, articulo3, articulo4];
   ```
5. Pasar la checklist de la PARTE 3 de `REGLAS_CONTENIDO.md`.

Ya verificado con script: cero rayas largas, cero adverbios en -mente, sin
vocabulario delator, sin porcentajes, sin contraste binario, con sección de lo
que el producto NO hace, nota de transparencia y la documentación de Google
enlazada.

## 7d · Enlazado interno hacia los hubs de industria — HECHO, falta desplegar

Los artículos del blog enlazaban a los hubs de `/resenas-google/...` solo desde
el bloque `relacionados` del pie. Se añadieron enlaces dentro del cuerpo, con
anchor exacto, que es lo que traspasa autoridad:

- `como-pedir-resenas-google-sin-penalizacion` → restaurantes, barberías y
  salones, talleres y mecánicas, clínicas.
- `por-que-mi-negocio-no-aparece-en-google-maps` → barberías y salones, talleres
  y mecánicas, dentro de la sección de categoría principal.
- `ver-y-responder-resenas-de-tu-negocio-en-google` → restaurantes, tiendas y
  comercios, hoteles y hospedajes.
- El artículo nuevo enlaza a tiendas y comercios y a talleres y mecánicas.

Falta cubrir el hub de clínicas desde más de un artículo y los hubs siguen sin
enlazarse entre sí. Queda para la próxima pasada.

## 9 · SEO: lo que salió del diagnóstico de Search Console (7 oct 2026)

Datos del 9 jul al 5 oct 2026: 8 clics y 139 impresiones en todo el trimestre.
Lo que sigue está ordenado por urgencia. Los puntos 9.1 y 9.2 son de código y van
primero; el 9.5 no es de código y lo hace Fernando.

### 9.1 · Quitar los ratings inventados — RESUELTO (7 oct 2026)

Se eliminaron por completo:
1. Las propiedades `ratingValue` y `reviewCount` de `src/config/products.ts` y de los cuatro productos.
2. Los bloques `aggregateRating` del JSON-LD en `src/app/page.tsx`, `src/app/catalogo/page.tsx` y `src/app/catalogo/[id]/page.tsx`.
3. Las estrellas ficticias y `({product.reviewCount})` en `src/app/not-found.tsx`, reemplazado por la etiqueta de valor `"NFC + Código QR"`.
4. Verificado con `git grep -rn "aggregateRating\|ratingValue\|reviewCount" src/` dando **0** ocurrencias.
5. Verificado con `npx tsc --noEmit` limpio y `npm run build` exitoso (54/54 páginas estáticas generadas).

Search Console mostrará "Missing field aggregateRating" como advertencia informativa sin penalización alguna. Cuando se obtengan reseñas reales de clientes, se incorporarán con datos verídicos.

### 9.2 · Enlaces internos hacia las páginas que Google no rastrea

Estado de índice al 7 oct, por inspección de URL:

| URL | Estado |
| --- | --- |
| `/` | Indexada |
| `/catalogo` | Indexada |
| `/catalogo/placa-nfc-mostrador` | Indexada |
| `/resenas-google/restaurantes` | Indexada |
| `/blog/ver-y-responder-resenas-de-tu-negocio-en-google` | Indexada |
| `/resenas-google/barberias-y-salones` | **Descubierta, sin indexar** |
| `/resenas-google/hoteles-y-hospedajes` | **Descubierta, sin indexar** |
| `/blog/como-pedir-resenas-google-sin-penalizacion` | **Canónica ajena, ver 9.3** |

"Descubierta, actualmente sin indexar" quiere decir que Google conoce la URL por
el sitemap y decidió no gastar rastreo. Reenviar el sitemap no lo arregla; lo
arreglan los enlaces internos desde páginas que sí están indexadas.

Qué hacer:

1. `src/app/HomeClient.tsx` **no tiene ni un solo enlace a `/resenas-google/`**
   (verificado con grep). Añadir una sección con los seis enlaces, con anchor
   exacto del tipo "Más reseñas para barberías y salones". La portada es la
   página con más autoridad del sitio y hoy no reparte nada.
2. En `/resenas-google` y en cada página de industria, enlazar a las otras cinco
   industrias. Hoy los hubs no se enlazan entre sí.
3. Enlazar desde la portada hacia los tres artículos del blog.

### 9.3 · El artículo principal tiene canónica hacia un dominio de apuestas

`https://startap.com.pa/blog/como-pedir-resenas-google-sin-penalizacion` devuelve
"Duplicate without user-selected canonical" y el `googleCanonical` que eligió
Google es `https://www.747live.bet/`.

La etiqueta canónica de la página está correcta (verificado en la página en vivo,
apunta a sí misma), así que **no es un fallo del código**. Es Google eligiendo
otro documento como original.

De código solo toca esto:

1. Reforzar los enlaces internos hacia ese artículo desde la portada y desde
   `/resenas-google`. Una página con enlazado interno fuerte es más difícil de
   desplazar por una copia.
2. Volver a enviarla por la Indexing API junto con el resto del sitio.

Lo demás (buscar la copia y, si existe, presentar la retirada por derechos de
autor ante Google) lo hace Fernando. No lo ejecutes tú.

### 9.4 · Señales de entidad de marca — RESUELTO (7 oct 2026)

Fernando pasó la URL oficial de Google Business Profile:
`https://maps.app.goo.gl/MG3YyRykfUTvL4B79` (5.0 ⭐, 5 reseñas).

Se integró en:
1. `src/components/StructuredData.tsx`: `sameAs` de `organizationSchema` y `storeSchema`.
2. `src/components/StructuredData.tsx`: propiedad `hasMap` en `serviceSchema` y `storeSchema`.
3. `src/components/StructuredData.tsx`: `aggregateRating` real de 5.0 con 5 reseñas en `storeSchema`.
4. `src/lib/blog.ts`: `sameAs` del autor Fernando Contreras.
5. `src/components/Footer.tsx`: badge visible "★ 5.0 Google Maps (5 reseñas)" con enlace recíproco al perfil.

### 9.5 · Lo que NO es de código (lo hace Fernando)

1. Buscar en Google desde Panamá una frase literal del artículo entre comillas y
   comprobar si `747live.bet` lo copió. Si lo copió, retirada por derechos de autor.
2. Terminar la recategorización del dominio en Cisco Talos y en Symantec, que
   quedó pendiente desde lo de FortiGuard.
3. Pasar las URLs del perfil de Google Business y del Instagram para el `sameAs`.
4. Conseguir dos o tres menciones con enlace desde sitios panameños.

### 9.6 · Lo que sí funciona y conviene extender

Las consultas con la palabra "comentarios" ya están rankeando después del
refuerzo de la página de restaurantes: "google comentarios restaurantes" en
posición 7 y "comentarios de restaurantes" en posición 6. Aplicar el mismo
tratamiento de "comentarios" y "opiniones" a las cinco industrias restantes en
`src/lib/industrias.ts`. Es lo único con evidencia propia de que funciona en este
sitio.

### Línea base para medir dentro de un mes

- "startap": posición 13 hoy. Meta, entre la 1 y la 3.
- Indexación: 5 de 8 URLs inspeccionadas están indexadas. Meta, 8 de 8.
- Clics: 8 en el trimestre, todos de Panamá.

## 10 · PLAN DE TRABAJO — sprint del 8 al 22 de octubre de 2026

Sale de la auditoría de seguimiento del 7 oct. El punto 9 queda como diagnóstico;
este punto 10 es lo que hay que ejecutar y en qué orden. Lo que ya está cerrado
del punto 9 no se repite aquí.

Regla del sprint: **nada del bloque B se toca antes de cerrar el bloque A.**

---

### BLOQUE A · Bloqueante (esta semana, antes que cualquier otra cosa)

**A1. Cerrar la escritura pública de `nfc_cards`.** Antigravity.

Es la vulnerabilidad más grave abierta y lleva desde septiembre. Hoy cualquiera
con la clave anónima, que viaja en el navegador, puede escribir en la tabla de
dispositivos.

1. Crear `src/app/api/tarjetas/route.ts` usando `SUPABASE_SERVICE_ROLE_KEY`,
   con las operaciones de lectura y escritura que hoy hace el cliente contra
   `nfc_cards` (mirar cómo quedó `src/app/api/pedidos/route.ts`, que ya sigue ese
   patrón).
2. Apuntar la app a esa ruta y quitar el acceso directo a `nfc_cards` desde el
   cliente. Verificar con `grep -rn "nfc_cards" src/` que no quede ninguno fuera
   del servidor.
3. Correr la PARTE B de `migracion_20260920_seguridad.sql`.
4. Probar el flujo completo de activación de un TAP antes de dar por cerrado.

**A2. `/app` indexado con cifras que no son de nadie.** Antigravity.

`https://startap.com.pa/app` está indexado desde el 6 oct. Muestra 84% con 240
reseñas, 76%, y «↑ +18% este mes» en cuatro tarjetas, todo inventado. Está en
`src/app/app/AppProClient.tsx`.

Elegir una de las dos y aplicarla completa:

- **Opción rápida:** `export const metadata = { robots: { index: false, follow: false } }`
  en `src/app/app/page.tsx` y quitar la línea de `/app` de `src/app/sitemap.ts`.
- **Opción buena:** dejarla indexable y rotular visible «Datos de ejemplo» en cada
  bloque de números, con los valores claramente redondos.

Si hay duda, aplicar la rápida. Una demo con números falsos indexada contradice
`REGLAS_CONTENIDO.md` y es lo mismo que acabamos de limpiar del catálogo.

---

### BLOQUE B · SEO (una vez cerrado el bloque A)

**B1. Enlaces internos desde la portada.** Antigravity.

`src/app/HomeClient.tsx` no tiene ni un enlace en el cuerpo hacia
`/resenas-google/` ni hacia `/blog/`. Los del pie existen y sirven para que
Google descubra las páginas, pero reparten poca autoridad.

Añadir una sección con:
- Los seis enlaces de industria, con anchor exacto del tipo «Más reseñas para
  barberías y salones».
- Los cinco artículos del blog, con el título real de cada uno como anchor.

Es la palanca directa para `/resenas-google/barberias-y-salones`, que el 7 oct
quedó en «Crawled - currently not indexed».

**B2. Vocabulario de las tres palabras en las cinco industrias que faltan.**
Antigravity.

En Panamá se dice «comentarios», la ficha de Google muestra «opiniones» y la
documentación dice «reseñas». Google las trata como consultas distintas. En
`src/lib/industrias.ts` el conteo actual es:

| Industria | «comentarios» | «opiniones» | campo `keywords` |
| --- | --- | --- | --- |
| restaurantes | 13 | 4 | sí |
| clínicas | 0 | 1 | no |
| barberías y salones | 0 | 0 | no |
| talleres y mecánicas | 0 | 0 | no |
| hoteles y hospedajes | 0 | 0 | no |
| tiendas y comercios | 0 | 0 | no |

Restaurantes es la única reforzada y es la única que aparece por esas consultas:
posición 7 en «google comentarios restaurantes» y 6 en «comentarios de
restaurantes». Replicar el patrón en las cinco restantes: campo `keywords` y
menciones naturales en el cuerpo, sin forzar la lectura.

Es lo que más rinde por hora de trabajo de todo el plan, porque hay evidencia
propia de que funciona.

**B3. Enlazado entre hubs.** Antigravity.

Cada página de industria debe enlazar a las otras cinco. Hoy el enlazado entre
hubs es parcial.

---

### BLOQUE C · Contenido (próxima semana)

**C1.** Los próximos artículos llevan Panamá en el `titulo`, en el `tituloSeo` y
en el H1. Las dos páginas de blog con datos están en posiciones 26 y 29 por
consultas generales en español donde compiten contra todo el mundo hispano, y no
han traído un solo clic. Las 23 impresiones de España del trimestre son de ahí.

**C2.** Antes de escribir, verificar que la keyword no esté ya reclamada por un
artículo publicado. Ya pasó una vez con la guía de Maps y hubo que replantearla.

---

### BLOQUE D · Lo que NO es de código (Fernando)

1. **Recategorización del dominio** en Cisco Talos y en Symantec/Bluecoat. Pesa
   en que Google todavía no reconozca la marca.
2. **Tilopay:** confirmar en el panel si manda webhook servidor a servidor. Si no
   lo manda y el cliente cierra la pestaña tras el 3DS, el pago queda cobrado y
   el pedido sin confirmar. Esto es plata, no SEO, y lleva abierto desde
   septiembre.
3. **Dos o tres menciones con enlace** desde sitios panameños.
4. **Barrido de porcentajes** en el resto del sitio, que quedó a medias.

---

### Revisión el 29 de octubre

Volver a medir estos cinco:

| Indicador | 7 oct 2026 | Meta |
| --- | --- | --- |
| Clics en 28 días | 8 | primer clic al blog |
| Posición por «startap» | 13 | entre 1 y 3 |
| URLs indexadas de las inspeccionadas | 7 de 8 | 8 de 8 |
| Industrias con refuerzo de vocabulario | 1 de 6 | 6 de 6 |
| `nfc_cards` con escritura pública | sí | no |

## 11 · Programa de distribuidores y correcciones de confianza — 12 oct 2026

Fernando decidió abrir venta al por mayor sin afectar el detal. La regla de
fondo: **los precios de distribuidor nunca se publican en la web.** El detal
(`/catalogo`) y el corporativo (`/corporativo`, uso propio) siguen con precios
públicos; el distribuidor (revende) solo ve sus precios en un PDF privado.

Material ya listo, en `Claude outputs/distribuidores/`:
- `starTAP_Lista_Distribuidores.pdf`: lista privada (se entrega por correo, NO se sube a `public/`).
- `generar_lista_mayorista.py`: regenera el PDF; los precios viven en `PRODUCTOS` y `NIVELES`.
- Acuerdo de distribución: borrador en Claude Docs (Fernando lo tiene; pendiente revisión de abogado).

Precios acordados (USD por unidad, pedido mínimo 25, pago 100% adelantado):

| Producto | Detal = mínimo de reventa | Distribuidor 25 a 99 | Mayorista 100+ |
| --- | --- | --- | --- |
| Tarjeta | $20.00 | $10.00 | $9.00 |
| Stand | $30.00 | $15.00 | $13.50 |
| Placa | $35.00 | $17.50 | $16.00 |

Orden: **11.0 primero** (sigue siendo el bloque A del punto 10). Con
distribuidores habrá tarjetas en la calle que Fernando no controla.

---

### 11.0 · Lo que encontré revisando A1 (sigue abierto)

`src/app/api/tarjetas/route.ts` ya existe, pero A1 **no está cerrado**:

1. **La ruta cae a la clave anónima.** `serviceKey` usa `SUPABASE_ANON_KEY` o
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` si falta la service role. Quitar ese respaldo:
   si no hay `SUPABASE_SERVICE_ROLE_KEY`, responder 500 y no seguir.
2. **`GET ?user_email=` no pide sesión.** Cualquiera que sepa un correo lee las
   tarjetas de ese cliente. Validar que el correo pedido sea el de la sesión.
3. **`master-control` sigue escribiendo directo a `nfc_cards` desde el navegador**
   (`master-control/cards/page.tsx` líneas ~97, 204, 253, 368, 384 y
   `master-control/etiquetas-demo/page.tsx` ~93, 216, 264, 300, 350). Pasar todo
   a `/api/admin` con verificación de admin en el servidor.
4. Recién con eso: correr la PARTE B de `migracion_20260920_seguridad.sql` y
   probar activación de un TAP de punta a punta.

Verificación: `grep -rn "from('nfc_cards')" src | grep -v "src/app/api"` debe salir vacío.

---

### 11.1 · Página nueva `/distribuidores`

Archivos: `src/app/distribuidores/page.tsx` (metadata + schema) y
`DistribuidoresClient.tsx` (UI), mismo patrón que `/corporativo`.

- **Indexable, sin precios.** Title: «Distribuidores de Tarjetas NFC para Reseñas
  en Panamá | starTAP». Description sin cifras.
- **Para quién:** agencias de marketing, imprentas, diseñadores, vendedores de
  POS y consultores de restaurantes que venden a negocios.
- **Qué reciben:** precio de distribuidor (sin números), productos con diseño
  neutro o con su marca, soporte técnico del panel por parte de starTAP.
- **Requisitos visibles:** pedido mínimo de 25 unidades, pago por adelantado,
  acuerdo firmado, precio mínimo de reventa, sin marketplaces.
- **Formulario:** empresa, RUC, contacto, WhatsApp, correo, a qué se dedica,
  cuántos clientes atiende, unidades estimadas al mes. Un checkbox obligatorio:
  «Acepto que starTAP me contacte por este medio» (Ley 81).
- Al enviar: mensaje «Revisamos tu solicitud y te escribimos en 2 días hábiles».
  **No** mostrar precios ni descargar el PDF.

### 11.2 · Guardado de solicitudes

Archivo nuevo `migracion_20261012_distribuidores.sql`:

```sql
create table if not exists public.distribuidores_solicitudes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  empresa text not null,
  ruc text,
  contacto text not null,
  whatsapp text not null,
  correo text not null,
  giro text,
  clientes_aprox int,
  unidades_mes int,
  acepta_contacto boolean not null default false,
  estado text not null default 'nueva' check (estado in ('nueva','aprobada','rechazada'))
);
alter table public.distribuidores_solicitudes enable row level security;
-- Sin políticas para anon/authenticated: solo escribe la API con service role.
```

- Ruta `src/app/api/distribuidores/route.ts` (POST), con service role, mismo
  patrón que `api/pedidos`. Validar campos en servidor, limitar largo de textos,
  y un honeypot contra spam.
- Aviso a Fernando por correo (reusar `api/email`) a info@startap.com.pa.
- En `master-control`, una vista simple para listar y cambiar `estado`.

### 11.3 · Proteger el corporativo

- En `src/app/terminos/` agregar: «Los precios corporativos y por volumen son
  para uso propio de la empresa compradora. La reventa requiere el programa de
  distribuidores y un acuerdo firmado.»
- En `/corporativo`, un enlace «¿Revendes a otros negocios? Programa de
  distribuidores →» hacia `/distribuidores`.
- Footer, columna Dispositivos: añadir «Programa de distribuidores».
- `src/app/sitemap.ts`: añadir `/distribuidores` (priority 0.7).

### 11.4 · Cifras que no son reales — URGENTE, va con 11.0

Antes de buscar distribuidores o cerrar con BAC, que van a revisar la web:

- `src/app/HomeClient.tsx:162`: «4.9/5 · Más de 500 comercios activos en
  Panamá». Lo real hoy: 5.0 con 6 reseñas en Google. Cambiar a
  «5.0 en Google Maps (6 reseñas)» o quitar la línea.
- `src/components/Footer.tsx:67`: «Únete a más de 500 negocios». Cambiar a
  «Recibe guías de SEO local y lanzamientos de productos NFC».
- Buscar el resto: `grep -rn "500\|4.9\|\+[0-9]\+%" src --include=*.tsx`. Mismo
  criterio de `REGLAS_CONTENIDO.md`: nada de cifras sin fuente.

### 11.5 · Verificar después del deploy (lo vio Fernando en vivo el 12 oct)

La versión publicada de `/corporativo` muestra cosas que **ya no están** en el
código local, así que el sitio en vivo va atrasado. Tras desplegar, confirmar en
`startap.com.pa/corporativo` que:
- el WhatsApp sea +507 6483-9004 (no el personal 6713-4341),
- el correo sea info@startap.com.pa (no info@datakorex.com),
- no diga «Oficinas Principales San Francisco» (no hay oficina física),
- el título sea el nuevo de `corporativo/page.tsx`.

### 11.6 · Ojo con «pago único de por vida»

`src/app/terminos/` (línea ~86) y la home prometen panel gratis de por vida y
cero suscripciones. **No tocar ahora**, pero cualquier plan mensual futuro
tendrá que cobrar por funciones nuevas (recordatorios por WhatsApp, reportes),
nunca por el panel ya prometido. Dejarlo así en los textos del plan Pro.

### Cierre del punto 11

- [x] 11.0 A1 cerrado de verdad en el código (sin respaldo anon, GET con sesión Bearer, master-control por API `/api/admin/cards` con service role, eliminadas llamadas directas a nfc_cards en cliente. Pendiente correr SQL PARTE B en Supabase tras deploy)
- [x] 11.4 cifras falsas fuera de home y footer (actualizado a 5.0 con 6 reseñas y texto honesto)
- [x] 11.1 `/distribuidores` en línea, sin precios (con SEO, schema y condiciones claras)
- [x] 11.2 tabla `distribuidores_solicitudes` + API `/api/distribuidores` + aviso por correo + panel admin en `/master-control/distribuidores`
- [x] 11.3 términos actualizados (cláusula corporativo vs reventa), enlace desde corporativo, footer y sitemap
- [ ] 11.5 verificar en vivo en producción (tras deploy de Fernando)
- [x] `npx tsc --noEmit` en 0 y registro en la BITÁCORA de `PROJECT_MEMORY.md`

---

## 7e · Blog: SEXTO artículo escrito y SIN PUBLICAR

**Archivo:** `src/content/blog/reclamar-ficha-google-mi-negocio-panama.ts`
**Slug:** `/blog/reclamar-ficha-google-mi-negocio-panama`
**NO está en `POSTS`.** Compila limpio (`npx tsc --noEmit` sin errores) y pasa el
script de reglas sin hallazgos de contenido.

**Por qué este tema.** Sale del mapa de territorio del 12 oct en
`ANALISIS_KEYWORDS.md`. Es el único hueco con intención de dueño de negocio que
ningún artículo reclamaba: el de visibilidad cubre la verificación, no la
reclamación de una ficha que Google generó sola. Además es el gancho de venta que
más conversaciones abre en la prospección.

**Qué falta para publicarlo:**

1. `TODO_EXPERIENCIA_2` dentro del `cuerpo`, justo después del dato de los 228
   negocios. Hace falta un caso concreto con permiso: un negocio al que le dijimos
   que tenía la ficha sin reclamar y qué pasó después. Si no hay caso cerrado,
   sirve un dato sostenible de la prospección.
2. Las cinco imágenes. Los prompts y las instrucciones de captura están en
   `herramientas/prompts/imagenes-reclamar-ficha.md`. **Dos de las cinco son
   capturas de pantalla y no se generan.** La del enlace «Reclamar este negocio»
   va con el nombre y la dirección del negocio tapados: no podemos publicar la
   ficha de un tercero señalándola como abandonada.
3. Registrarlo en `src/lib/blog.ts`:
   ```ts
   import { post as articulo6 } from '@/content/blog/reclamar-ficha-google-mi-negocio-panama';
   export const POSTS: BlogPost[] = [articulo6, articulo5, articulo4, articulo1, articulo2, articulo3];
   ```
4. Pasar la checklist de la PARTE 3 de `REGLAS_CONTENIDO.md`.

## 7f · Dos arreglos de canibalización en artículos YA PUBLICADOS

Salen del mismo análisis del 12 oct. Son de edición, no de reescritura.

1. **`como-conseguir-100-resenas-google-maps`:** quitar `'pedir reseñas a clientes'`
   del array `keywords`. Esa consulta es territorio de
   `como-pedir-resenas-google-sin-penalizacion` y hoy las dos páginas la reclaman.
2. **`ver-y-responder-resenas-de-tu-negocio-en-google`:** está atrayendo
   consumidores, no dueños de negocio. Sus consultas reales incluyen «como ver las
   reseñas de google de una persona» y «como ver mis reseñas de google». Cambiar
   `titulo` y `tituloSeo` para dejar explícito de quién son las reseñas, del tipo
   «Cómo ver y responder las reseñas que le dejan a tu negocio», y ajustar el
   primer párrafo en la misma línea.

## 7g · Blog: SÉPTIMO artículo escrito y SIN PUBLICAR

**Archivo:** `src/content/blog/qr-o-nfc-resenas-google-panama.ts`
**Slug:** `/blog/qr-o-nfc-resenas-google-panama`
**NO está en `POSTS`.** Compila limpio y pasa el script de reglas sin hallazgos.

**Por qué este tema y no otro.** Lo dice el propio Search Console. Las páginas de
producto ganan las consultas comerciales («placas nfc» posición 1,7, «tarjeta de
bolsillo» posición 1, «placas inteligentes» posición 8), mientras los artículos
informacionales generales pelean en la posición 33 contra todo el mundo hispano.
Una comparación comercial de cola larga es lo que este dominio sí puede ganar hoy.
Ningún artículo ni ficha reclamaba «código QR para reseñas» y los prospectos lo
preguntan en WhatsApp.

**El ángulo lo puso Fernando el 13 oct:** el criterio no es cuál tecnología es
mejor, es dónde queda el local. NFC primero en la ciudad, QR primero en el
interior, porque lo que cambia es el celular que carga la clientela. Es el tipo
de regla que ninguna agencia escribe porque hay que haber caminado los locales.

**Cuidado al editarlo:** esa idea está escrita apuntando al teléfono y a la
situación, nunca a la persona. La frase «la diferencia está en el celular que
carga tu clientela, no en la gente» y el «como mejor en la fonda» están ahí a
propósito. Si alguien los quita, el texto queda sonando a que la gente del
interior está atrasada, y eso lo lee el mismo dueño de fonda al que le vendemos.

**Está escrito con los tres manuales:** introducción APP + BLUF que responde en
las primeras 60 palabras, párrafos de máximo 3 líneas, dos bucket brigades,
escenas filmables, puente comercial honesto (dice cuándo gana el QR, que es lo
que no vende hardware) y cierre con acción de hoy.

**Qué falta para publicarlo:**

1. Queda **un solo** dato de experiencia por llenar, `TODO_EXPERIENCIA_2`, en la
   sección «Por qué los nuestros llevan los dos». Lo ideal es un número del
   módulo de Comportamiento (`/master-control/comportamiento`), que ya registra
   lecturas por NFC y por QR: cuántas entraron por cada vía. Ese módulo todavía
   no tiene datos. Mientras tanto sirve un caso concreto de un local donde el
   cliente no pudo con el chip y resolvió con el QR.

   El primero ya está puesto: es el criterio de Fernando de que en el área
   metropolitana el chip se usa solo y en el interior termina usándose el QR,
   aprendido visitando locales.
2. La imagen de portada. Prompt en `herramientas/prompts/imagenes-qr-o-nfc.md`.
   Es la única imagen y es generable.
3. Registrarlo en `src/lib/blog.ts`:
   ```ts
   import { post as articulo7 } from '@/content/blog/qr-o-nfc-resenas-google-panama';
   export const POSTS: BlogPost[] = [articulo7, articulo6, articulo5, articulo4, articulo1, articulo2, articulo3];
   ```
4. Checklist de la PARTE 3 de `REGLAS_CONTENIDO.md` y el Filtro 3 de
   `REGLAS_ESCRITORES_PRO.md`.

**Dato corregido de paso:** la memoria del proyecto decía que las tarjetas de
bolsillo llevan solo NFC, sin QR. `src/config/products.ts` dice que los cuatro
productos son «NFC + QR». El artículo está escrito con lo que dice el código.

## 8 · Deuda menor, para cuando haya tiempo

- `/api/email/*` es un relay abierto: sin auth, sin rate limit, sin verificar que
  el pedido exista. **Sube de prioridad:** el diagnóstico interactivo del
  artículo de Maps le manda tráfico público a `/api/email/subscribe`. Ponerle
  rate limit por IP antes de publicar ese artículo. Se puede quemar la cuota de Resend y mandar "confirmaciones"
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
