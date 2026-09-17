# Reglas de E-commerce, CRO y SEO - starTAP Panamá

Este documento establece las reglas obligatorias de diseño, arquitectura, flujo de conversión (CRO) y SEO para el proyecto **starTAP Panamá** (`startap.com.pa`). Debe ser respetado en todas las modificaciones y nuevos desarrollos del proyecto.

---

## 1. Principios de Flujo de Conversión (CRO & UX)
- **Cero Fricción en Checkout:** El proceso de compra no debe exigir creación de cuenta ni contraseñas obligatorias. Checkout rápido como invitado o vía WhatsApp/Yappy.
- **Transparencia Total de Precios:** Los costos de envío y promociones deben mostrarse claramente antes de llegar al último paso del pago. Nunca agregar costos ocultos.
- **Gestión de Variaciones Clara:** Las variaciones agotadas (ej. color Negro) deben mostrarse deshabilitadas (`disabled={true}`) con etiqueta visible de **Agotado**, permitiendo seleccionar únicamente las opciones disponibles (Blanco / Acrílico Transparente/Blanco).
- **Sticky CTA en Móviles:** En dispositivos móviles, los botones primarios de acción ("Añadir al Carrito" / "Comprar con Yappy") deben ser fácilmente accesibles con el pulgar.
- **Prueba Social Visible:** Resaltar valoraciones, badges de garantía (90 días) y pago único sin mensualidades en todas las landings y detalles de producto.

---

## 2. Reglas de SEO & Arquitectura Web
- **Metadatos de Alto CTR:** Cada página debe incluir `title` optimizado para intención de búsqueda en Panamá, `description` persuasiva (< 160 caracteres), URL `canonical` absoluta y metadatos `openGraph`.
- **Estructura Schema.org (JSON-LD):** Mantener esquemas validados:
  - `Product` (con `AggregateRating`, `Offer`, `MerchantReturnPolicy` y `ShippingDetails`) en páginas de catálogo.
  - `FAQPage` y `BreadcrumbList` en páginas de industria.
  - `Service` y `Organization` en página corporativa.
- **Indexación y Sitemap:** Toda nueva landing o ruta pública comercial debe incorporarse al `sitemap.ts` con prioridad adecuada (0.9 a 1.0 para páginas comerciales).
- **Rendimiento y Core Web Vitals:** Usar imágenes optimizadas (`WebP`/`AVIF`) con dimensiones explícitas, carga asíncrona de scripts de analítica (`next/script`) y mantener el First Load JS bajo control.

---

## 3. Reglas de Negocio & Rentabilidad Operativa
- **Pago Único:** Destacar siempre el beneficio diferencial: *"Pago único de por vida, sin contratos y sin mensualidades"*.
- **Estrategia B2B / Corporativo:** Promover el aumento del valor promedio del pedido (AOV) mediante el **Pack Trío Comercial** (28% OFF) y opciones de personalización de logo (+ $5.00).
- **Soporte Post-Venta Simplificado:** Mantener la guía de auto-configuración y ruteo dinámico para minimizar consultas de soporte post-entrega.
