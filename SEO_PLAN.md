# 🎯 PLAN SEO — Posicionar starTAP #1 en Panamá
**Fecha:** 2026-09-08 · **Objetivo:** que starTAP sea la marca por defecto en Panamá para
"más reseñas de Google", tanto en el pack local de Maps como en la búsqueda orgánica.

---

## DIAGNÓSTICO: hoy starTAP es invisible

Cinco hallazgos verificados, no opiniones:

1. **El sitio no está en Google Search Console.** Las propiedades de la cuenta son lijadoraspro,
   datakorex, panamatoons y emprendedor.datakorex. `startap.com.pa` no existe ahí. Sin GSC no hay
   indexación monitoreada, ni datos de consultas, ni forma de saber si algo funciona.
2. **No hay sitemap.** `robots.ts` lo anuncia en `https://startap.com.pa/sitemap.xml`, pero no existe
   `src/app/sitemap.ts`. Le estás diciendo a Google que busque un archivo que no está.
3. **Todo el sitio comparte un solo title y una sola meta description.** Cada página (`/`, `/shop`,
   `/shop/[id]`, `/corporativo`, `/funciones`, `/app`) empieza con `'use client'`, y en Next.js una
   página cliente **no puede exportar `metadata`**. Resultado: las 6+ páginas compiten entre sí con
   el mismo título en los resultados de Google. Este es el bloqueo técnico principal.
4. **No hay datos estructurados** (`Product`, `Organization`, `LocalBusiness`, `FAQPage`). Sin ellos
   no hay estrella de precio, ni rich snippet, ni ficha de conocimiento.
5. **El SERP panameño está vacío de competencia local.** Buscando "tarjetas NFC reseñas Google Panamá"
   los resultados son de España, Chile y Colombia. **Nadie está posicionado en Panamá.** Esa es toda
   la oportunidad: no hay que desplazar a nadie, hay que llegar primero.

---

## LA ESTRATEGIA: dos batallas distintas

No las mezcles, porque se ganan con tácticas diferentes.

### Batalla A — El pack local de Maps (Google Business Profile)
Para que starTAP salga en el mapa cuando alguien en Panamá busca "cómo conseguir reseñas de Google".
Se gana con una ficha de Google Business Profile bien armada, no con el sitio web.

**La jugada de marca:** starTAP vende reseñas de 5 estrellas. Su propia ficha tiene que ser la mejor
prueba de que el producto funciona. Un starTAP con 80 reseñas usando su propio producto es el
argumento de venta más fuerte que puedes tener, y de paso es la señal #1 del pack local.

### Batalla B — La búsqueda orgánica en Panamá
Para que startap.com.pa sea el resultado #1 de "tarjeta NFC reseñas Google Panamá" y sus variantes.
Se gana con arquitectura de páginas + contenido por intención + enlaces.

---

## FASE 0 — Destrabar lo técnico (semana 1)

Sin esto, nada de lo demás rankea. Es trabajo de código, no de marketing.

1. **Registrar `startap.com.pa` en Search Console** como propiedad de dominio (verificación por DNS,
   así cubre www y subdominios de una vez). Vincular también Google Analytics.
2. **Crear `src/app/sitemap.ts`** con home, /shop, cada producto, /corporativo, /funciones, /app.
   Enviarlo desde GSC.
3. **Arreglar el bloqueo de `'use client'`.** Patrón: convertir cada `page.tsx` en Server Component
   que exporta `metadata` y renderiza dentro un `<XClient />` con la interactividad. Es un refactor
   mecánico, media hora por página.
4. **Escribir title y meta description únicos por página.** Fórmula para Panamá:
   `[Producto] para [beneficio] en Panamá | starTAP` — máximo 60 caracteres, con "Panamá" adentro.
5. **Un solo `<h1>` por página**, con la keyword principal. Hoy las landings repiten estructura pero
   no están optimizadas por término.
6. **JSON-LD:** `Organization` + `LocalBusiness` en el layout, `Product` con precio y disponibilidad
   en cada página de producto, `FAQPage` en /funciones.
7. **Canonical y `metadataBase`** apuntando a `https://startap.com.pa`, y confirmar que www y no-www
   redirigen a una sola versión.
8. **Peso de página.** Ya hiciste bien el paso a WebP; verificar que ninguna imagen supere ~150 KB y
   que el LCP del home esté por debajo de 2.5 s en móvil.

---

## FASE 1 — Ficha de Google Business Profile (semana 1-2)

9. **Crear la ficha de starTAP.** Como no atiendes al público en un local, configúrala como
   **negocio con zona de servicio**: Panamá Oeste, Ciudad de Panamá, San Miguelito, Arraiján, La Chorrera.
10. **Categoría principal:** la que más se acerque a marketing/publicidad o servicio de rótulos.
    Secundarias: consultor de marketing, tienda de electrónica, servicio de diseño gráfico.
    La categoría principal es la señal más pesada del pack local — probá una, medí 3 semanas, ajustá.
11. **Completar todo:** horario, teléfono con WhatsApp, sitio web enlazado al home, descripción con
    "reseñas de Google" y "Panamá", 15+ fotos reales de los dispositivos en negocios panameños,
    y los productos cargados con precio.
12. **Conseguir las primeras 20 reseñas usando tu propio producto** con tus clientes actuales.
    Responder **todas**, dentro de 24 horas. La tasa de respuesta del dueño es señal de ranking y
    además es la demostración viva de lo que vendes.
13. **Publicar 1 post por semana** en la ficha: un caso de cliente, una foto de instalación, una promo.
14. **Registrar la ficha bajo el mismo NAP en todos lados** (nombre, dirección, teléfono idénticos):
    Páginas Amarillas Panamá, Encuentra24, directorios de la Cámara de Comercio, y la ficha de DataKorex.

---

## FASE 2 — Arquitectura de contenido que sí puede rankear (semanas 2-6)

El error clásico es escribir un blog genérico. La arquitectura correcta para starTAP tiene tres capas:

### Capa 1 — Páginas de producto (transaccional, ya existen, hay que optimizarlas)
Una keyword principal por landing, nada de canibalización:
* `/shop/stand-nfc` → "stand NFC para reseñas de Google Panamá"
* `/shop/tarjeta-nfc` → "tarjeta NFC reseñas Google Panamá"
* `/shop/placa-acrilica-nfc` → "placa NFC para reseñas Panamá"

### Capa 2 — Páginas por industria (comercial, hay que crearlas) ← **la de mayor retorno**
Una página por tipo de negocio, cada una con su caso, sus fotos y su CTA:
* "Más reseñas de Google para restaurantes en Panamá"
* "...para clínicas y consultorios" (te conecta con MediKorex)
* "...para barberías y salones de belleza"
* "...para talleres y mecánicas"
* "...para hoteles y hospedajes"
* "...para tiendas y minisúper"
Estas ganan porque son específicas, tienen poca competencia y atraen exactamente a quien compra.

### Capa 3 — Páginas informativas (captan al que aún no sabe que existes)
* "Cómo conseguir más reseñas en Google Maps (guía para negocios en Panamá)"
* "Cómo aparecer primero en Google Maps en Panamá"
* "¿Sirven las tarjetas NFC para reseñas? Qué dice la política de Google"
* "Cómo responder una reseña negativa sin dañar tu reputación"
Cada una enlaza hacia la capa 2 y la capa 2 hacia la capa 1. Ese enlazado interno es la mitad del trabajo.

**Ritmo realista:** 2 páginas por semana. En 6 semanas tienes las 6 de industria; en 10, todo el mapa.

---

## FASE 3 — El activo que ningún competidor puede copiar (mes 2-3)

15. **Página pública por cliente.** Cada negocio que compra un starTAP recibe una página en
    `startap.com.pa/negocios/[nombre-del-negocio]` con su ficha, su ubicación y su enlace de reseñas.
    Tres efectos a la vez: rankea por el nombre de ese negocio, le das valor gratis al cliente, y
    construyes cientos de páginas locales reales con datos verdaderos. Es la versión honesta de las
    páginas programáticas — contenido real de clientes reales, no plantillas vacías.
16. **Casos de éxito con números.** "De 12 a 140 reseñas en 3 meses: [restaurante] en Costa del Este."
    Con permiso del cliente, foto y captura del antes/después. Es el contenido que más convierte y el
    que más enlaces gana.
17. **Enlaces desde tus propios activos:** datakorex.com, emprendedor.datakorex.com y las fichas de
    tus otras marcas. Son enlaces legítimos entre proyectos propios; no abuses, uno contextual por sitio.
18. **Prensa y gremios locales:** Cámara de Comercio de Panamá, cámaras de turismo, asociaciones de
    restaurantes. Una nota o una mención en su directorio vale más que veinte directorios genéricos.

---

## MEDICIÓN — qué mirar y cuándo

| Semana | Qué revisar | Meta |
| --- | --- | --- |
| 2 | GSC: páginas indexadas | Las 6 páginas principales indexadas |
| 4 | GSC: impresiones por consulta | Primeras impresiones en "NFC reseñas Panamá" |
| 6 | GBP: vistas y llamadas | Ficha apareciendo en búsquedas de descubrimiento |
| 12 | Posición media de las 3 keywords de producto | Top 10 |
| 24 | Posición media | Top 3, y pack local para consultas de marca |

Revisar en GSC una vez al mes: consultas con muchas impresiones y CTR bajo (ahí se arregla el title,
no el contenido) y consultas donde apareces en posición 8-15 (ahí un empujón te mete al top 5).

---

## LO QUE NO HAY QUE HACER

- **No pedir reseñas solo a clientes contentos ni filtrarlas.** Va contra la política de Google y te
  puede costar la ficha. Como vendes exactamente esto, tu propio cumplimiento es parte del producto.
- **No meter keywords en el nombre del negocio** de la ficha ("starTAP Reseñas Google Panamá" ← no).
- **No comprar backlinks** ni entrar a redes de enlaces. En un mercado tan chico no hace falta.
- **No escribir 30 artículos genéricos con IA.** Seis páginas de industria con fotos y casos reales
  valen más que treinta artículos que nadie enlaza.
- **No perseguir "reseñas Google" a secas.** Ese término lo dominan Google y medios internacionales.
  Tu terreno es todo lo que lleva "Panamá" o el nombre de una industria adentro.

---

## ORDEN DE ATAQUE (si solo puedes hacer una cosa por semana)

1. Search Console + sitemap
2. Ficha de Google Business Profile completa
3. Metadata única por página (arreglar el `'use client'`)
4. Primeras 20 reseñas propias respondidas
5. Página de industria #1: restaurantes
6. JSON-LD de producto y organización
7. Páginas de industria #2 y #3
8. Primer caso de éxito con números
