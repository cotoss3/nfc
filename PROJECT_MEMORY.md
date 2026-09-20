# 🧠 PROJECT MEMORY & DEVELOPER HANDBOOK - starTAP Panamá

Este documento contiene la **memoria viva del proyecto starTAP**. Debe ser consultado y mantenido actualizado por cualquier desarrollador que trabaje en esta base de código.

---

## 📌 1. Visión General del Proyecto

* **Nombre Comercial:** starTAP
* **Dominio Oficial:** `startap.com.pa`
* **Tecnologías Core:** Next.js 14 (App Router), React 18, Tailwind CSS, Lucide React, Supabase Client & LocalDbService.
* **Propósito del Negocio:** Venta de dispositivos físicos con tecnología NFC y QR (Stands para mostrador, Tarjetas personales y Placas acrílicas adhesivas) junto a una plataforma web sin mensualidades para incrementar reseñas en Google Maps, mejorar el SEO Local y captar clientes en Panamá.

---

## 🎨 2. Sistema de Diseño e Identidad Visual (Branding)

* **Paleta de Colores (`tailwind.config.ts`):**
  * **Blanco Puro:** `#FFFFFF` (`brand-50`)
  * **Negro Puro:** `#000000` (`brand-950`)
  * **Cyan starTAP (Color Acento):** `#01A6D2` (`accent-500`)
  * **Tonos Secundarios Cyan:** `#e0f7fb` (`accent-50`), `#0194bc` (`accent-600`)
* **Archivos de Logo (`public/logos/`):**
  * **Logo Principal Navbar:** `public/logos/Logo.webp` (Formato WebP ultra ligero de 85 KB con fondo transparente).
  * **Logo Footer (Fondo Oscuro):** `public/logos/negativo.jpeg` (con filtro CSS invertido).
  * **Favicon:** `public/logos/favicon.jpeg`.
* **Reglas de UI Navbar:**
  * Altura de la barra: `h-16`.
  * Altura del logo: `h-9 md:h-11` (`object-contain`).

---

## 🏗️ 3. Arquitectura de Rutas y Componentes

```
src/
├── app/
│   ├── layout.tsx             # Layout global con Navbar y Footer
│   ├── page.tsx               # Landing Page principal con Hero Gradient y catálogo
│   ├── shop/
│   │   ├── page.tsx           # Vista general del catálogo
│   │   └── [id]/
│   │       └── page.tsx       # Enrutador dinámico a Landings específicas
│   ├── dashboard/
│   │   └── page.tsx           # Panel de Clientes (Gestión, Reclamar TAP, Métricas)
│   ├── master-control/        # Panel Admin real (layout + page + products/new + products/edit/[id])
│   ├── app/                   # Landing unificada de funciones/app pro
│   ├── cart/ · checkout/      # Carrito y checkout
│   ├── corporativo/ · funciones/
│   ├── api/
│   │   ├── cards/route.ts     # Lectura/escritura de db_store.json (SIN AUTH - ver AUDIT.md)
│   │   └── upload/route.ts    # Subida a Supabase Storage (SIN AUTH - ver AUDIT.md)
│   └── r/
│       └── [id]/
│           └── route.ts       # Microservicio de redirección rápida NFC/QR
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── landings/              # Embudos de venta de alta conversión
│       ├── StandLanding.tsx   # Landing del Stand NFC (/shop/stand-nfc)
│       ├── TarjetaLanding.tsx # Landing de la Tarjeta NFC (/shop/tarjeta-nfc)
│       └── PlacaLanding.tsx   # Landing de la Placa Acrílica (/shop/placa-acrilica-nfc)
├── context/
│   └── CartContext.tsx        # Estado global del carrito de compras
├── lib/
│   ├── db.ts                  # Capa de datos (Supabase + LocalDbService Fallback)
│   ├── auth.ts                # Supabase Auth (Google OAuth, email/pass, reset)
│   └── rateLimiter.ts         # Definido pero NO aplicado aún
└── components/AdminAuthGuard.tsx  # Whitelist de super admins (solo cliente)
```

---

## 🏷️ 4. Formato de Dispositivos y Códigos de Etiquetas (STT)

* **Formato de Código Secuencial:** Todas las etiquetas impresas en stickers físicos y grabadas en chips NFC siguen la secuencia **`STT-1001`**, **`STT-1002`**, **`STT-1003`**, etc.
* **Redireccionamiento Inteligente (`/r/[id]`):**
  * Si un dispositivo `STT-XXXX` **no ha sido reclamado aún**, al escanearse redirigirá a `startap.com.pa/dashboard?claim=STT-XXXX` para guiar al comprador a crear su cuenta e ingresar su link.
  * Si el dispositivo **ya fue activado**, el microservicio registra la analítica (iOS/Android/Web, NFC vs QR) y redirige de inmediato a la URL de Google Maps/WhatsApp guardada en la nube.
* **Administrador de Etiquetas (`/master-control`):**
  * La pestaña *"Generador de Etiquetas STT"* permite a los administradores generar e imprimir lotes de etiquetas secuenciales para producción.

---

## 🗄️ 5. Base de Datos y Supabase Setup

* **Configuración del Entorno (`.env.local`):**
  ```env
  NEXT_PUBLIC_SUPABASE_URL=https://xnepnlaoiflngtikozqd.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=...
  SUPABASE_SERVICE_ROLE_KEY=...
  DATABASE_URL=postgresql://...
  ```
* **Esquema SQL de Tablas (`supabase_schema.sql`):**
  * `products` - Catálogo de productos.
  * `orders` - Registro de compras de clientes.
  * `nfc_cards` - Dispositivos TAP vinculados a cuentas de usuario.
  * `scans` - Historial de escaneos y analíticas en tiempo real.

---

## 🤖 6. Grafo de Conocimiento (Graphify System)

El proyecto cuenta con una infraestructura de conocimiento construida con `graphify` para acelerar el desarrollo y mantener la coherencia del mapa mental del sistema sin gastar tokens extra:

* **Archivos del Mapa:** `graphify-out/graph.json`, `graphify-out/GRAPH_REPORT.md`, `graphify-out/graph.html`.
* **Comando para consultar el código con Graphify:**
  ```powershell
  py -m graphify.cli query "¿Cómo funciona la redireccion de tarjetas no reclamadas?"
  ```

---

## 🛠️ 7. Comandos de Desarrollo Frecuentes

* **Iniciar Servidor Local:** `npm run dev`
* **Compilar para Producción:** `npm run build`
* **Verificar Cambios Git:** `git status`
* **Desplegar a GitHub:** `git add . ; git commit -m "..." ; git push`

---
## 🔍 8. SEO (implementado sep 2026)

* `src/app/sitemap.ts` — sitemap dinámico (estáticas + productos del catálogo).
* `src/app/robots.ts` — bloquea /master-control, /api, /dashboard, /cart, /checkout, /r.
* `src/components/StructuredData.tsx` — JSON-LD Organization + WebSite + ProfessionalService
  (negocio de ZONA DE SERVICIO: sin dirección de calle, areaServed = Panamá).
* **Patrón obligatorio de páginas:** cada `page.tsx` es Server Component que exporta `metadata`
  y renderiza un `<XClient />` con el `'use client'`. NO poner `'use client'` en `page.tsx`,
  porque entonces la página no puede exportar metadata y hereda el título del layout.
  Aplicado en: `/`, `/shop`, `/shop/[id]`, `/corporativo`, `/app`.
* `/resenas-google` (hub) y `/resenas-google/[industria]` — páginas por tipo de negocio
  (restaurantes, clínicas, barberías-y-salones, talleres-y-mecanicas, hoteles-y-hospedajes,
  tiendas-y-comercios). Todo el contenido vive en `src/lib/industrias.ts`: para añadir una
  industria nueva basta agregar un objeto ahí, la ruta y el sitemap se generan solos.
  Emiten JSON-LD `FAQPage` + `BreadcrumbList`.
* `/shop/[id]` usa `generateMetadata` + JSON-LD `Product` leyendo `db_store.json` en servidor.

## 🛒 9. Landings de producto (refactor sep 2026)

* Las 3 landings duplicadas (Stand/Tarjeta/Placa, ~467 líneas c/u) se unificaron en
  `src/components/landings/ProductLanding.tsx`, alimentado por `src/lib/landings.ts`.
* Para cambiar textos, FAQs, colores o beneficios de una landing NO se toca el componente:
  se edita `src/lib/landings.ts`. Para añadir un producto con landing propia, se agrega
  una entrada nueva a `LANDINGS` con sus `ids`.
* `CONDICIONES` (envío, garantía, pago, soporte) y `TESTIMONIOS` viven ahí también.
  `TESTIMONIOS` está vacío a propósito: la sección solo se renderiza con testimonios reales.
* Las fotos salen de `product.images` / `product.image`. Si no hay foto, se muestra un
  marcador discreto. Al cargar las fotos al catálogo aparecen solas, sin tocar código.
* Los archivos viejos quedaron en `_to_delete/landings-viejas/` (borrar a mano).

## 📝 10. BITÁCORA DE PROGRESO

> Regla permanente: **toda sesión de trabajo se registra aquí antes de terminar.**
> Entrada nueva arriba. Formato: fecha · qué se hizo · qué quedó pendiente.
> Fernando maneja el deploy por su propio proceso de GitHub; el código se deja
> compilando y commiteable, nunca se publica desde la sesión.

### 2026-09-15 · Marca alineada a "starTAP Panamá"

Decisión tras el hallazgo de homónimos: no se cambia el nombre, se **califica**.
"starTAP" a secas compite contra startap.pro (mismo producto), startap.com.ar,
startap.lat y varios más. "starTAP Panamá" no tiene competencia y es lo que ya
usamos en Facebook.

Cambios en el código:

- `src/app/layout.tsx` — título por defecto "starTAP Panamá | Tarjetas NFC para
  Reseñas de Google" y `openGraph.siteName` a "starTAP Panamá". El `template` ya
  era `%s | starTAP Panamá`.
- `src/app/page.tsx` — título de home a "Tarjetas y Placas NFC para Reseñas de
  Google | starTAP Panamá" (antes repetía Panamá dos veces), capitalización
  unificada y Facebook agregado al `sameAs` del LocalBusiness.
- `src/components/StructuredData.tsx` — el `name` de Organization y de
  ProfessionalService pasa a "starTAP Panamá"; las variantes quedan en
  `alternateName: ['starTAP', 'StarTAP', 'Star TAP']` para que Google las asocie a
  la misma entidad. Facebook agregado al `sameAs` de ambas.
- `src/lib/blog.ts` — cargo y bio del autor a "starTAP Panamá", Facebook en su
  `sameAs`.

El nombre en la ficha de Google se queda como "starTAP": cambiarlo puede disparar
otra revisión y el perfil acaba de ser aprobado. La consistencia de entidad la
aporta el `alternateName` del schema.

`npm run build` limpio.

**Ojo con la capitalización**: el sitio mezclaba "StarTAP", "starTAP" y
"starTAP Panamá". Queda "starTAP Panamá" como forma canónica. Vale un barrido
completo en algún momento; quedan usos sueltos de "StarTAP" en textos de FAQ.

### 2026-09-15 · Perfil de Google aprobado + hallazgo de marca

El perfil de Google Business quedó **verificado**: starTAP, 5.0 con 4 opiniones,
categoría "Servicio de comercio electrónico", teléfono 6713-4341, área de servicio
marcada (Coclé, Panamá, Veraguas y 9 zonas más). Código de tienda
`02098562584205432947`.

**Hallazgo grave de marca: el nombre ya está tomado**

Al buscar "starTAP" en Google, el primer resultado orgánico es **startap.pro**, que
vende exactamente lo mismo: *"StarTap: Tarjetas NFC para conseguir más reseñas en
Google. Impulsa tu posicionamiento local... TAP. CONNECT. GROW."* La visión general
de IA de Google resume que *"StarTAP es un término que se usa para nombrar varios
proyectos diferentes"* y cita a startap.com.ar. startap.com.pa no aparece en la
primera página.

Otros homónimos: startap.com.ar (consultoría), startap.lat (software de pedidos),
STARTAP Servicios de Limpieza (Buenos Aires), StartAP (iniciativa de Andhra Pradesh).

Esto cambia la estrategia: el SEO de marca por "starTAP" a secas no es ganable a
corto plazo. Hay que apuntar a "starTAP Panamá" y a las consultas de producto
("tarjetas NFC reseñas Google Panamá"), que es donde ya estamos trabajando. Queda
pendiente decidir con Fernando si vale la pena discutir el nombre.

**Riesgo de política en la descripción de la ficha**

La descripción actual dice *"capturar reseñas positivas de 5 estrellas"*. Eso
describe selección de reseñas, prohibido por la política de Google, y está escrito
en la propia ficha de Google. También afirma ser *"la solución líder en Panamá"*,
que no se puede respaldar. Hay una descripción de reemplazo redactada, pendiente de
que Fernando la pegue.

**Nota operativa: el editor de la ficha no se deja automatizar**

El panel "Editar perfil" vive dentro de la página de resultados de Google. Al
escribir en el textarea de descripción el texto se duplicó, y después la pestaña
dejó de responder a capturas de pantalla. Desde el Administrador de Perfiles
(business.google.com/locations) el icono de lápiz tampoco abre el panel. Se
verificó que **no quedó ningún cambio guardado ni dañado**. Conclusión: los cambios
en la ficha de Google los hace Fernando a mano; desde la sesión solo se audita.

**Pendiente en la ficha**

- Pegar la descripción nueva.
- Vincular el perfil de Facebook en "perfiles de redes sociales".
- Conectar WhatsApp.
- Subir fotos (mismo lote pendiente de las landings).
- Revisar que el sitio web apunte a startap.com.pa.
- Cargar productos y servicios.

### 2026-09-15 · Ranking de equipo: riesgo con la política de Google

El bloque `employee-ranking` de `/app` premiaba a los empleados por **reseñas
conseguidas** ("184 Escaneos (48 Reseñas)", "medición de rendimiento para programas
de incentivos"). Eso es exactamente lo que la política de contenido de Google Maps
señala como manipulación de valoraciones, y el cambio de abril de 2026 lo mira con
más lupa. Vender la función así nos pone del lado equivocado de la política y expone
las fichas de los clientes.

Reescrito para que mida **la invitación, no el resultado**:

- Título: "Ranking de Equipo por Escaneos" (antes "Ranking de Empleados / Leaderboard").
- El mockup ya no muestra reseñas por persona, solo escaneos.
- Copy nuevo: se cuenta quién ofreció el dispositivo, y el texto dice explícitamente
  que nunca es para premiar por cantidad de reseñas.
- Nota visible bajo la tabla: "Se cuentan escaneos, no reseñas. Google prohíbe
  condicionar o premiar las opiniones de los clientes."
- `kicker` pasó de "GAMIFICACIÓN DE EQUIPO" a "ACTIVIDAD DEL EQUIPO".

Barrido del resto del sitio buscando lenguaje de incentivos: el blog, `lib/industrias.ts`
y el hub de `/resenas-google` ya decían lo correcto (que incentivar está prohibido).
Solo se corrigió un texto mal escrito en el hub: "No Incentives Financieramente" →
"No incentives la reseña".

`npm run build` limpio.

### 2026-09-15 · Auditoría del portfolio comercial de Meta

**Arreglado en esta sesión**

- La página **Startap Panamá** no estaba en el portfolio: se creó desde el perfil
  personal y quedó suelta. Se reclamó y ahora aparece como propiedad de DataKorex
  (identificador de página en el portfolio: `1245573605315053`).
- Dominio **startap.com.pa** agregado al portfolio (`2137924417118846`). Meta dio
  la metaetiqueta y quedó puesta en `src/app/layout.tsx` dentro de
  `metadata.verification.other`, que Next la renderiza en el `<head>`:
  `facebook-domain-verification = h26bx4dq1m5gmqq8uzzy4j4gq72uz2`.
  Falta desplegar y pulsar "Verificar dominio".

**Ya estaba bien**

- Método de pago cargado en la cuenta publicitaria (`945892215066961`).
- Píxel `starTAP Pixel` conectado a la cuenta publicitaria starTAP Panamá.
- API de Conversiones habilitada en el conjunto de datos.
- 2FA exigida a "Todos" a nivel de portfolio.

**Pendiente**

- **0 de 2 personas tienen la 2FA activada** aunque el portfolio la exige. Riesgo
  real de quedarse fuera del propio portfolio.
- **No hay administrador alternativo.** Si Fernando pierde el acceso, no hay quien
  recupere el portfolio. Es lo más urgente de la lista de seguridad.
- Verificar el dominio startap.com.pa después del deploy.
- Ubicación principal del negocio vacía y dirección puesta solo como "Panamá".
- Límite de creación de cuentas publicitarias: 1, ya consumido. Para más hace
  falta la verificación del negocio.
- Las 2 cuentas publicitarias no tienen aprobación de pares.
- La página no tiene foto de perfil ni portada, ni cuenta de Instagram vinculada
  (lo único que ofrece "Conectar activos" es Instagram).
- WhatsApp sin conectar a la página.

**Ojo con la "verificación rechazada"**

El portfolio muestra "Estado de la verificación del negocio: Rechazada", pero el
caso de uso enviado fue *"La app requiere acceso a los permisos en Meta for
Developers"*, a nombre de **KoreNet Cloud & Web**. Esa es la verificación para
acceso avanzado a la API, no la que hace falta para anunciar. No bloquea las
campañas; sí bloquea permisos de API y el límite de cuentas publicitarias.

### 2026-09-15 · Tilopay con SDK V2: cobro dentro del sitio

**Por qué**

Fernando no quiere que el cliente salga a la página de Tilopay. Se cambió de la
Hosted Payment Page (redirección) al **SDK V2**, donde el formulario de tarjeta vive
en startap.com.pa y los datos van del navegador directo a Tilopay.

`ClinicaV2` no sirvió de referencia: su `lib/tilopay/client.ts` es un stub
(`createOrder` devuelve `mock_token_123`, `verifyWebhookSignature` siempre `true`).
Todo se armó desde la documentación oficial de Tilopay.

**Cómo funciona el SDK V2** (docs: tilopay.com/developers/sdk)

- Script: `https://app.tilopay.com/sdk/v2/sdk_tpay.min.js`. Sin versionado inmutable,
  sin hash SRI y sin changelog: el archivo puede cambiar sin aviso.
- Token del SDK: `POST /api/v1/loginSdk` con apiuser/password. **Vive 1 hora**
  (el del API dura 24). Es lo único que baja al navegador.
- El SDK no dibuja el formulario: busca inputs por `id` y toma control de ellos.
  Los ids son un contrato: `tlpy_payment_method`, `tlpy_saved_cards`,
  `tlpy_cc_number`, `tlpy_cc_expiration_date`, `tlpy_cvv`, más un div
  `responseTilopay` **fuera del formulario** donde monta el 3DS.
- `Tilopay.Init({...})` autentica y devuelve `methods`, `cards` y `test`.
- `Tilopay.startPayment()` no recibe parámetros, maneja el 3DS completo y al
  terminar navega a la URL de `redirect` de Init.
- Pruebas y producción **comparten host** (`app.tilopay.com`). La única señal del
  modo es el campo `test` de Init (`1` pruebas, `0` producción), y el modo se
  cambia desde el portal, no desde el código.
- Tarjetas de prueba: `4111111111111111` aprueba sin fricción,
  `4012000000020071` aprueba con challenge 3DS, `4012000000020121` rechaza.
  En la pantalla de challenge el código es **`3ds2`**.
- Yappy también es un método del SDK: el `id` tiene forma `A:B:C` y el segundo
  segmento `18` es Yappy; el teléfono va en `phoneYappy` de Init, no en el DOM.
- Webhooks: la única verificación de origen es `orderHash` y **su algoritmo no es
  público** — se pide a sac@tilopay.com. Por eso no se toma ninguna decisión
  irreversible con el webhook: se confirma contra `/consult`.

**Archivos**

- `src/lib/checkout-total.ts` (nuevo) — `calcularTotal()` extraído para que lo usen
  los dos endpoints. Con el SDK el `amount` sale del navegador, así que el total
  autoritativo del servidor importa más que antes.
- `src/lib/tilopay.ts` — `getTilopaySdkToken()` contra `/api/v1/loginSdk`.
- `src/app/api/tilopay/sdk-session/route.ts` (nuevo) — abre la sesión: devuelve
  token del SDK, monto autoritativo, orderNumber y la URL de redirect. apiuser,
  password y key nunca salen del servidor.
- `src/components/checkout/TilopayCardForm.tsx` (nuevo) — los inputs `tlpy_*`, el
  div `responseTilopay`, carga del script, Init y startPayment. Se monta siempre y
  se oculta con CSS: si se desmonta al cambiar de método, el SDK no encuentra los
  ids. Falla ruidosamente si Tilopay responde `test: 0` fuera de producción.
- `src/app/checkout/page.tsx` — la rama de tarjeta ya no redirige: llama a
  `sdk-session` y luego a `pagar()` del formulario.
- `src/app/api/tilopay/process/route.ts` — se queda como respaldo (página alojada).
- `src/app/api/tilopay/callback/route.ts` — sin cambios: sigue confirmando contra
  `/consult` antes de dar el pago por bueno.

`npm run build` limpio sobre un clon fresco de `cotoss3/nfc`.

**Pendiente**

- Poner la cuenta de Tilopay en **modo pruebas** desde el portal y correr el flujo
  completo con `4111111111111111` y con `4012000000020071` (challenge, código `3ds2`).
- Confirmar con Tilopay que la cuenta tiene el SDK habilitado.
- `TILOPAY_API_USER`, `TILOPAY_API_PASSWORD` y `TILOPAY_API_KEY` en producción.
- Evaluar mover Yappy al SDK (hoy es manual con referencia): quitaría la
  verificación a mano, pero exige pedir el teléfono Yappy del cliente.
- Cumplimiento PCI: la página captura los datos de tarjeta aunque no los toque el
  servidor. Eso mueve el alcance de SAQ A a **SAQ A-EP**. Confirmarlo con Tilopay.
- Pedir a sac@tilopay.com el algoritmo de `orderHash` y el contrato del webhook de
  `processPayment`, para no depender solo de `/consult`.
- Los pedidos siguen en `dbLocal` (localStorage + db_store.json): no persisten en
  Vercel. Sigue siendo el pendiente de fondo del checkout.

### 2026-09-15 · Facebook, cuenta publicitaria y píxel de Meta

**Hecho**

- Página de Facebook creada: **Startap Panamá** — `facebook.com/profile.php?id=61594455868652`
  - Meta rechazó el nombre "StarTAP" (formato inválido); quedó "Startap Panamá".
  - Categoría: Servicio de marketing en internet (igual que el perfil de Google).
  - Web startap.com.pa · Tel +507 6713-4341 · Correo info@datakorex.com
  - Ubicación Arraiján (corregimiento), sin dirección física: negocio de área de servicio.
- Cuenta publicitaria **starTAP Panamá** — ID `120250675056060696`, dentro del portfolio
  comercial DataKorex (`1032660859932197`).
  - Zona horaria **GMT-05:00 America/Panama** y divisa USD. Ojo: la zona horaria de una
    cuenta publicitaria **no se puede cambiar después de crearla**.
- Píxel / conjunto de datos **starTAP Pixel** — ID `1591597945771251`, con la API de
  Conversiones habilitada desde la creación.
- Píxel instalado en el sitio:
  - `src/lib/fbpixel.ts` — ID desde `NEXT_PUBLIC_FB_PIXEL_ID`, helper `track()` que no
    hace nada si la variable falta, y `itemsParaMeta()` para armar content_ids/contents.
  - `src/components/MetaPixel.tsx` — snippet con `next/script` + PageView en cada cambio
    de ruta (en el App Router la navegación no recarga, el PageView del snippet solo
    cuenta la primera visita). Usa `useSearchParams`, así que en el layout va envuelto
    en `<Suspense>` o el build estático falla.
  - `src/context/CartContext.tsx` — evento `AddToCart` dentro de `addToCart`.
  - `src/app/checkout/page.tsx` — `InitiateCheckout` al iniciar el pago y `Purchase`
    en los dos caminos: retorno de Tilopay (`?status=success`, los datos salen del
    pedido guardado porque el carrito todavía no está hidratado) y confirmación de Yappy.
  - `.env.local` y `.env.example` con `NEXT_PUBLIC_FB_PIXEL_ID`.
- `npm run build` limpio sobre un clon fresco de `cotoss3/nfc` con los cambios aplicados.

**Pendiente**

- Cargar el método de pago de la cuenta publicitaria (lo hace Fernando; la sesión no
  mete datos de tarjeta ni de facturación).
- Foto de perfil y portada de la página de Facebook.
- Conectar WhatsApp a la página (Meta manda un código al celular).
- Definir el público y la primera campaña.
- `NEXT_PUBLIC_FB_PIXEL_ID` en las variables de entorno de producción; sin eso el píxel
  no carga en el sitio publicado.
- Verificar el dominio startap.com.pa en el portfolio comercial (hace falta para las
  conversiones agregadas de eventos de iOS).
- Validar con el Meta Pixel Helper después del deploy.

### 2026-09-15 · Blog con SEO completo + reglas de contenido

**Hecho**
* **Blog montado**: `/blog` (hub), `/blog/[slug]` y `/autor/[slug]`. Build verificado, 45 páginas.
* **Arquitectura**: los artículos viven en `src/content/blog/*.ts` (metadatos + cuerpo markdown +
  FAQs). `src/lib/blog.ts` los registra y expone helpers. Para publicar uno nuevo se crea el
  archivo de contenido y se añade al array `POSTS`. La ruta, el sitemap y los enlaces salen solos.
* **Renderizador propio** en `src/components/Markdown.tsx`, sin dependencias nuevas. Cubre
  `##`, `###`, listas, negrita, cursiva y enlaces, y genera ids para las anclas.
* **SEO del artículo**: JSON-LD `BlogPosting` + `FAQPage` + `BreadcrumbList`, autor como `Person`
  con `@id` estable y `sameAs`, OpenGraph de tipo article con fechas, Twitter card, canonical,
  tabla de contenidos automática, y enlaces internos a industrias y catálogo.
* **Página de autor** con schema `Person` y `knowsAbout`. Es la pieza de E-E-A-T: la misma
  entidad Fernando Contreras debe usarse en startap y en datakorex, con la misma bio y los
  mismos `sameAs`.
* **Primer artículo publicado**: "Cómo pedir reseñas de Google sin que te penalicen".
  1.962 palabras, 8 FAQs, verificado contra fuentes oficiales de Google.
* **`REGLAS_CONTENIDO.md` (nuevo)**: requisitos E-E-A-T y 12 patrones de IA prohibidos.
  Lectura obligatoria antes de escribir cualquier texto publicable. Enlazado desde `CLAUDE.md`.

* **5 Imágenes reales procesadas y optimizadas a WebP (<140 KB c/u):**
  - **Portada del blog:** `public/blog/pedir-resenas-google-panama-nfc.webp` (1200x675, 76 KB, cliente tocando el Stand starTAP en mesa de restaurante).
  - **Foto de autor E-E-A-T:** `public/autores/fernando-contreras.webp` (400x400, 8.2 KB, retrato profesional de Fernando en traje). Activada en `src/lib/blog.ts` y en `/autor/fernando-contreras`.
  - **Catálogo Stand NFC:** `public/products/NFC10002/stand-nfc-resenas-google-frontal.webp` (800x800, 29 KB, stand frontal sobre fondo blanco). Integrada en `src/config/products.ts`.
  - **Catálogo Tarjeta NFC:** `public/products/tarjeta-nfc/tarjeta-nfc-en-lanyard-empleado.webp` (1000x1000, 138 KB, tarjeta en lanyard/portacredencial de empleado). Integrada en `src/config/products.ts`.
  - **Catálogo Placa Acrílica:** `public/products/NFC_10001/placa-acrilica-resistente-agua-limpieza.webp` (1000x1000, 124 KB, placa acrílica mojada siendo limpiada con paño). Integrada en `src/config/products.ts`.
* Build de producción verificado: 45/45 páginas estáticas generadas sin errores.

**Pendiente**
1. **Revisar el texto de `/app`**: anuncia "Ranking de Empleados por Escaneos". Mide escaneos,
   no reseñas, y esa diferencia lo salva de la política de abril 2026, pero hay que decirlo
   explícito para que ningún cliente lo use como cuota de reseñas.
2. Añadir el LinkedIn real de Fernando al array `sameAs` de `src/lib/blog.ts`. Cada perfil
   verificable suma a la entidad de autor.
3. Replicar la misma firma de autor en datakorex.com y enlazar las dos páginas entre sí.

### 2026-09-14 · Checkout, pagos y SEO técnico

**Hecho**
* **Pago con tarjeta conectado a Tilopay de verdad.** El checkout capturaba número de tarjeta
  y CVV en formulario propio y marcaba `payment_status: 'completed'` con un `setTimeout`.
  No cobraba nada. La integración de Tilopay ya existía pero nunca se llamaba.
* **Total calculado en el servidor** (`/api/tilopay/process`) desde `config/products.ts`.
  Antes se cobraba el `total` que mandaba el navegador.
* **Callback verificado contra la API de Tilopay** (`consultTilopayPayment`). Antes daba el
  pago por bueno leyendo `code=1` de la URL de retorno, que el cliente puede escribir a mano.
* **Yappy**: número real 6713-4341 (Fernando Contreras). El pedido queda `pending` hasta
  verificación manual; antes entraba como pagado con cualquier referencia.
* **Retiro en oficina eliminado.** Quedan Panamá Centro, Uno Express y Servientrega.
* **Envío gratis desde $50** + barra de progreso en el carrito.
* **Nuevo `src/config/shipping.ts`**: umbral, tarifas y datos de Yappy en un solo lugar.
* SEO: JSON-LD movido de `<head>` al `<body>` (en App Router los hijos de `<head>` del layout
  raíz no se renderizan de forma fiable); quitado el sufijo duplicado del title en las páginas
  de industria; enlaces de industria apuntando a `/catalogo` en vez de `/shop`;
  `/shop/[id]` convertido en redirect permanente.
* **Search Console resuelto**: el conector entra con la cuenta de servicio
  `datakorex-analytics-api@gen-lang-client-0012367217.iam.gserviceaccount.com`, no con el Gmail.
  Se agregó como propietaria en startap.com.pa y ya hay acceso por API.
* **Fotos de Reseñas de Google completadas**: las 6 fotos de la carpeta `reseñas/` se convirtieron a WebP de alta fidelidad (<150 KB), con nombres de archivo y atributos ALT orientados a SEO para la marca starTAP en Panamá. Se asignaron al hub `/resenas-google` y a las 6 landings de industria (`/resenas-google/[industria]`) sin repetirse.
* **Emparejamiento de pedidos Tilopay**: `dbLocal.createOrder` ahora acepta y respeta el `orderNumber` generado (`orderData.id`), y se agregó `dbLocal.updateOrderPaymentStatus` sincronizado con Supabase para marcar el pago como `completed` en el retorno exitoso de Tilopay.
* `npm run build` verificado en limpio: compila sin errores, 42 páginas estáticas generadas.

**Pendiente**
1. Variables de Tilopay en producción: `TILOPAY_API_USER`, `TILOPAY_API_PASSWORD`,
   `TILOPAY_API_KEY`, `NEXT_PUBLIC_BASE_URL`.
2. Probar un pago real de $1 antes de anunciar la tienda.
3. **Los pedidos siguen en `dbLocal`** (localStorage + `db_store.json`), que en Vercel no
   persiste. Riesgo real: Tilopay cobra y el pedido no queda registrado si no hay sesión activa. Ver `AUDIT.md`.
4. Indexación: solo el home está indexado. El resto sale "Descubierta, sin indexar".
   Tras desplegar, pedir indexación manual del home, el hub y las 6 de industria en Google Search Console.
5. Fotos restantes de productos de catálogo pendientes si se requieren más ángulos (ver `FOTOS_LANDINGS.md`).
6. Recategorización de dominio pendiente en Cisco Talos y Symantec/Bluecoat
   (FortiGuard ya enviada: estaba como "Newly Observed Domain / Security Risk").

## 📎 11. Documentos hermanos
* `CLAUDE.md` — reglas de trabajo para sesiones de IA (ahorro de tokens). Leerlo primero.
* `AUDIT.md` — auditoría de seguridad y deuda técnica (2026-09-08).
* `AUDITORIA_CHECKOUT.md` — auditoría del checkout y pagos (2026-09-14).
* `SEO_PLAN.md` — plan de posicionamiento.
* `FOTOS_LANDINGS.md` — lista de las 15 fotos que faltan y cómo tomarlas.

*Última actualización:* 2026-09-15 (ver bitácora, sección 10) · anterior: 2026-09-14 (ver bitácora, sección 10) · anterior: 2026-09-08 (auditoría + CLAUDE.md; anterior: 2026-09-07 (Integración de Landings, Reclamación de TAPs, Identidad Cyan y Supabase Setup)

## 16 sep 2026 · Correo propio + campaña Meta

**Correo startap.com.pa (terminado).** DNS en Vercel: MX `bh8954.banahosting.com` (p.0),
SPF, DMARC y DKIM `default._domainkey`. cPanel ya firma con DKIM. Buzón único
`info@startap.com.pa` + reenviadores `ventas@`, `soporte@`, `facturacion@` → info@.

**Web (terminado).** Todo `info@datakorex.com` sustituido por el dominio propio:
- `src/lib/resend.ts`: remitente ahora `EMAIL_FROM` (por defecto
  `starTAP Panamá <pedidos@send.startap.com.pa>` — el subdominio verificado en Resend)
  y `EMAIL_REPLY_TO` (por defecto `info@startap.com.pa`).
- Pedidos y cotizaciones → `ventas@startap.com.pa`; suscripciones → `info@`.
- Se quitó `fbcontrerras@gmail.com` de los destinatarios del callback de Tilopay.
- Footer, structured data, envíos, privacidad, términos y plantillas de correo.
`npx tsc --noEmit` pasa limpio.

**Campaña Meta (a medias, en borrador).** Cuenta 3382566721898189.
Campaña `starTAP | Fase 1 - Test de publicos | WhatsApp`, objetivo Interacción,
presupuesto por conjunto (no CBO), Advantage+ de público desactivado.
- Conjunto A `A - Admins de paginas FB`: Panamá, 28-55, comportamiento
  "Administradores de páginas de Facebook", $5/día. LISTO.
- Conjunto B `B - Gastronomia`: comportamiento "Administradores de páginas de comida
  y restaurantes" + sector "Alimentación y restaurantes" + interés "Restaurantes
  (comedor)". ~700-820 mil. LISTO.
- Conjunto C `C - Belleza y cuidado personal`: comportamiento "Administradores de
  páginas de salud y belleza". LISTO.
- Conjunto D `D - Amplio`: sin intereses ni comportamientos, solo Panamá 28-55.
  ~1,6-1,9 millones. Es la referencia del test. LISTO.
Los cuatro a $5/día, Panamá, 28-55, ambos sexos, sin creativo.

**Bloqueos que dependen de Fernando:**
- El destino es Messenger porque WhatsApp pide "Conectar perfil" (verificación del
  6713-4341 por código). Sin eso la campaña no cumple su propósito.
- Meta pide confirmar datos de la cuenta en "Resumen de la cuenta" antes de publicar.

## 20 sep 2026 · Auditoría estructural + generador de video Veo 3

**Auditoría** → `AUDITORIA_ESTRUCTURAL.md` (nuevo). 25 hallazgos sobre BDD,
master-control y flujo de cliente. Los cuatro críticos:
1. Los pedidos no llegan al servidor: `nfc_orders` no está en `ALLOWED_KEYS` de
   `/api/cards` (403) y `public.orders` tiene RLS sin políticas. Un pedido pagado
   vive solo en el localStorage del cliente.
2. `/api/yappy/checkout` cobra el `total` que manda el navegador, sin recalcular.
3. El IPN de Yappy usa el id sin guiones (`STP12345678`) y el pedido se guardó con
   guion: el UPDATE afecta cero filas en silencio.
4. `nfc_cards` tiene política `FOR ALL USING(true)`: con la anon key del bundle
   cualquiera reescribe los `target_url` de los 107 dispositivos.

**Veo 3** → `herramientas/veo.mjs` (nuevo). Genera video por la Gemini API
(`veo-3.1-generate-preview`), 9:16 por defecto para Reels. Lee la llave de
`GEMINI_API_KEY` o de `.env.veo` en la raíz (ya está en `.gitignore`, junto con
`herramientas/videos/`). Prompt del creativo 1 en `herramientas/prompts/creativo1.txt`.
Google Cloud: proyecto `gen-lang-client-0012367217` ("DataKorex - Produ"),
Vertex AI / Agent Platform API **habilitada**, facturación **vinculada**.
Falta solo que Fernando genere la llave en aistudio.google.com/apikey y la
ponga en `.env.veo` — no la maneja la sesión.

## 20 sep 2026 (cont.) · Correcciones aplicadas + traspaso a Antigravity

**Hecho en código** (compila limpio, `npx tsc --noEmit` = 0; sin commit ni push):
1. `/api/yappy/checkout` recalcula el total con `calcularTotal` y rechaza 409 si
   el navegador manda otro. Antes cobraba lo que dijera el cliente.
2. ID de orden unificado: checkout devuelve `yappyOrderId`; el callback busca por
   `yappy_order_id` o `id` con `.or(...)`, usa `.select()` y loguea
   `[YAPPY_IPN_SIN_COINCIDENCIA]` si no actualizó ninguna fila.
3. Nueva `src/app/api/pedidos/route.ts`: upsert en `orders` con service_role
   antes de cobrar; `checkout/page.tsx` la llama en las ramas Tilopay y Yappy.
4. `master-control/productos` → `/api/admin/precio` (contrato real: `{id, precio}`)
   y muestra el error en vez de decir "guardado" siempre.
5. `isPack` en vez de `product_name.includes('pack')` en el checkout.
6. `escaparHtml()` en `/r/[id]` — era XSS reflejado en el dominio principal.
7. `cleanEmail.includes('admin')` eliminado de `db.ts`.
8. Producto no reconocido lanza (antes se cobraba a $20); `handleLogout` ahora
   llama a `authService.signOut()`.

**Nuevos archivos:** `AUDITORIA_ESTRUCTURAL.md`, `INSTRUCCIONES_ANTIGRAVITY.md`,
`migracion_20260920_seguridad.sql` (PARTE A segura; PARTE B comentada a propósito).

**Para Antigravity** (ver `INSTRUCCIONES_ANTIGRAVITY.md`): correr la PARTE A del
SQL (bloqueante: `/api/pedidos` inserta `yappy_order_id` que aún no existe),
verificar `SUPABASE_SERVICE_ROLE_KEY` y `ADMIN_EMAILS` en Vercel, rotar la
service_role, y subir a GitHub. La PARTE B (cerrar escritura pública de
`nfc_cards`) requiere antes crear `/api/tarjetas` con service_role, porque el
navegador escribe esa tabla en 8 puntos de `db.ts`.

**Yappy — sin resolver:** el manual que mandó Fernando es del conector de comercio
afiliado (`/v1/session/login`, `/v1/movement/*`), NO del Botón de Pago
(`apipagosbg.bgeneral.cloud/payments/payment-wc`) que usa el sitio. La firma del
IPN sigue sin verificar contra documentación oficial.

**Veo 3: en pausa** por decisión de Fernando. Queda todo listo en
`herramientas/veo.mjs` + `herramientas/prompts/creativo1.txt`; Google Cloud
(`gen-lang-client-0012367217`) con API habilitada y facturación vinculada. Solo
falta que él genere la llave en aistudio.google.com/apikey y la ponga en `.env.veo`.

## 20 sep 2026 (cont. 2) · Yappy confirmado y callback corregido

Fernando pasó la documentación correcta del Botón de Pago:
https://www.yappy.com.pa/comercial/desarrolladores/boton-de-pago-yappy-nueva-integracion/

- **Firma del IPN CONFIRMADA.** HMAC-SHA256 sobre `orderId + status + domain`,
  clave secreta en base64 partida por `.` usando la primera parte. La
  implementación ya era correcta. Deja de ser un "sin confirmar".
- `orderId`: máximo 15 caracteres alfanuméricos (error E009). El `.slice(0,15)`
  del checkout es correcto.
- Estados: E (ejecutado), R (rechazado, no confirmó en 5 min), C (cancelado en
  la app), X (expirado, nunca inició).

**Corregido en `api/yappy/callback/route.ts`:**
1. Usaba el cliente **anon**, que RLS bloquea sobre `orders` → el UPDATE nunca
   habría funcionado. Ahora usa service_role, igual que `/api/pedidos`.
2. Solo manejaba `E`: R, C y X dejaban el pedido en `pending` para siempre.
   Ahora los tres lo marcan `failed`/`cancelled`.
3. La comparación del hash pasó a `crypto.timingSafeEqual`.

`npx tsc --noEmit` limpio.

## 20 sep 2026 (cont. 3) · Ajustes de UI, métrica de visitas, aislamiento de tarjetas e inventario STT-1001..1050

**1. Ajuste Banner Pack Especial (`HomeClient.tsx`):**
- Se convirtió el bloque de miniaturas en retícula de 3 columnas (`grid grid-cols-3 gap-2.5 w-full mb-3.5`).
- Se amplió la altura de los contenedores a `h-20 sm:h-24` (`rounded-2xl`), haciendo que las fotos (1x Placa + 2x Tarjetas) abarquen el ancho completo alineado con el botón de `$50.00 USD`.

**2. Corrección Contador de Visitas en Tiempo Real (`api/tracking/ping/route.ts` & `master-control/page.tsx`):**
- Se eliminó el cálculo defectuoso que sumaba únicamente órdenes + carritos abandonados.
- `/api/tracking/ping` ahora registra y devuelve `total_visits_today` (visitantes únicos diarios).
- El cuadro directivo de **Resumen Ejecutivo** calcula las visitas con `Math.max(totalVisitsToday, realActiveSessions.length, totalOrdersCount + activeAbandoned.length)` eliminando el falso "0 visitas".

**3. Reinicio de Tarjetas y Aislamiento por Cliente (`db.ts`, `db_store.json`, `master-control/cards/page.tsx`):**
- Se desvincularon las tarjetas de prueba asociadas a Fernando Contreras (`cotoss3@gmail.com`) en `db_store.json` y `DEFAULT_SEED_CARDS`.
- `getCardsByOwner()` e `getCardsByOwnerAsync()` ahora filtran estrictamente por `c.claimed === true` y `c.owner_email === email`, asegurando que las cuentas nuevas empiecen con 0 tarjetas hasta que reclamen su serial.
- En **Master Control Cards** (`/master-control/cards`), se mejoró el buscador unificado por **Cliente (Nombre/Email)** y **Código Serial (`STT-XXXX`)**, agregando badge de `RECLAMADA POR CLIENTE` vs `EN STOCK`.

**4. Depuración de Inventario Físico (`STT-1001` a `STT-1050`):**
- Se eliminaron 60 tarjetas ficticias superiores a `STT-1050` de `db_store.json`.
- `getCards()` y `getNextStickerCode()` en `db.ts` restringen el inventario exclusivamente a las 50 unidades reales (`STT-1001` a `STT-1050`).

`npx tsc --noEmit` limpio, cambios subidos a `origin main`.
