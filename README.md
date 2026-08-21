# PanaCards NFC - Panamá

Plataforma completa de comercio electrónico y motor de redireccionamiento dinámico con analíticas en tiempo real para tarjetas y placas inteligentes NFC en Panamá.

Inspirado en la funcionalidad de `biicards.com` pero con una interfaz de usuario minimalista y premium de nivel comercial (Shopify-style).

---

## 🚀 Características Clave

1.  **Tienda Completa (E-commerce):** Catálogo de placas y tarjetas NFC personalizadas con selector de color/material, cargador de logotipo y definición de enlace de destino.
2.  **Checkout Localizado para Panamá:** Proceso de pago dividido (split-screen) con soporte para provincias panameñas y simulación de pasarelas de pago locales:
    *   **Yappy Comercial** (Banco General).
    *   **PagueloFacil** (Tarjetas de crédito Visa, Mastercard y Clave).
3.  **Portal del Cliente (Dashboard):** Panel administrativo donde el dueño del negocio puede actualizar el enlace de su tarjeta NFC en tiempo real (por ejemplo, redirigir hoy a Google Reviews y mañana a su menú digital de WhatsApp) sin cambiar el hardware físico.
4.  **Motor de Redirección Inteligente:** Ruta de redirección `/r/[card_id]` ultra rápida que detecta el tipo de dispositivo del cliente (iOS vs Android) y registra la métrica antes de redirigir (302).
5.  **Panel Administrativo:** Sección backend para gestionar órdenes de grabado láser, visualizar logotipos cargados y despachar envíos provinciales (Uno Express, Servientrega).
6.  **Arquitectura de Datos Flexible:** Base de datos simulada en `localStorage` integrada por defecto para pruebas locales e inmediatas sin requerir bases externas, con cliente de **Supabase (PostgreSQL)** preparado para producción.

---

## 🛠️ Tecnologías

*   **Framework:** Next.js 14 (App Router)
*   **Lenguaje:** TypeScript
*   **Estilos:** Tailwind CSS & Lucide Icons
*   **Animaciones:** Framer Motion y Canvas-Confetti
*   **Base de Datos:** Supabase (PostgreSQL) / Fallback de LocalStorage

---

## 💻 Instalación y Desarrollo Local

1.  Clonar el repositorio.
2.  Instalar las dependencias de node:
    ```bash
    npm install
    ```
3.  Iniciar el servidor de desarrollo:
    ```bash
    npm run dev
    ```
4.  Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

---

## 🇵🇦 Métodos de Envío Configurados
*   **Mensajería Local** (Ciudad de Panamá)
*   **Uno Express** (Retiro en Oficina)
*   **Servientrega** (A domicilio a nivel nacional)
*   **Retiro en Sucursal** (San Francisco, Ciudad de Panamá)
