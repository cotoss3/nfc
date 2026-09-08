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

## 📎 10. Documentos hermanos
* `CLAUDE.md` — reglas de trabajo para sesiones de IA (ahorro de tokens). Leerlo primero.
* `AUDIT.md` — auditoría de seguridad y deuda técnica vigente (2026-09-08).

*Última actualización:* 2026-09-08 (auditoría + CLAUDE.md; anterior: 2026-09-07 (Integración de Landings, Reclamación de TAPs, Identidad Cyan y Supabase Setup)
