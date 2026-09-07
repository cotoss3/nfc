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
│   ├── admin/
│   │   └── page.tsx           # Panel de Control Administrativo & Generador STT
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
└── lib/
    └── db.ts                  # Capa de datos (Supabase + LocalDbService Fallback)
```

---

## 🏷️ 4. Formato de Dispositivos y Códigos de Etiquetas (STT)

* **Formato de Código Secuencial:** Todas las etiquetas impresas en stickers físicos y grabadas en chips NFC siguen la secuencia **`STT-1001`**, **`STT-1002`**, **`STT-1003`**, etc.
* **Redireccionamiento Inteligente (`/r/[id]`):**
  * Si un dispositivo `STT-XXXX` **no ha sido reclamado aún**, al escanearse redirigirá a `startap.com.pa/dashboard?claim=STT-XXXX` para guiar al comprador a crear su cuenta e ingresar su link.
  * Si el dispositivo **ya fue activado**, el microservicio registra la analítica (iOS/Android/Web, NFC vs QR) y redirige de inmediato a la URL de Google Maps/WhatsApp guardada en la nube.
* **Administrador de Etiquetas (`/admin`):**
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
*Última actualización:* 2026-09-07 (Integración de Landings, Reclamación de TAPs, Identidad Cyan y Supabase Setup)
