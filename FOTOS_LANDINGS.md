# 📸 Lista de fotos para las landings de producto

**15 fotos en total** — 5 por cada producto (Stand, Tarjeta, Placa).

## Cómo se cargan

El orden importa. El componente lee `product.images` del catálogo y las coloca así:

| Posición | Dónde aparece |
| --- | --- |
| 1 | Hero (arriba del todo, junto al título) |
| 2 | Beneficio 1 |
| 3 | Beneficio 2 |
| 4 | Bloque del panel de control |
| 5 (última) | Formulario de compra |

Se suben desde `/master-control` → editar producto → imágenes, **en ese orden**.
No hay que tocar código: al guardarlas, los recuadros punteados se reemplazan solos.

## Reglas técnicas para todas

- **Formato:** WebP. Si disparas en JPG, conviértelo antes de subir.
- **Peso:** máximo 150 KB por imagen. Por encima de eso empeora el LCP y te penaliza en móvil.
- **Ancho:** 1600 px basta. Más es peso muerto.
- **Proporción:** hero en vertical 4:5; el resto cuadradas 1:1; la del panel en 16:9.
- **Nombre del archivo:** descriptivo y con guiones, porque Google lo lee:
  `stand-nfc-resenas-google-panama-mostrador.webp`, no `IMG_4821.webp`.
- **Fondo:** limpio y consistente entre las tres landings, para que el catálogo se vea como un sistema y no como fotos sueltas.
- **Luz:** natural, de ventana, en día nublado o a media mañana. Nada de flash directo: el acrílico rebota y se ve barato.
- **Con celular alcanza.** Un iPhone o Android reciente en modo retrato, apoyado en algo para que no tiemble, rinde perfecto. No hace falta cámara profesional.

---

# 🟦 STAND NFC — `stand-nfc`

### 1. Hero · vertical 4:5
**Qué:** el stand sobre un mostrador real de un negocio, en ángulo de tres cuartos (no de frente).
**Dónde:** barra de un restaurante, recepción de una clínica, caja de una tienda. Que se note que es Panamá, no un render.
**Detalles:** fondo desenfocado con algo de vida detrás — una cafetera, una planta, un estante. El stand ocupa el tercio inferior, con aire arriba.
**Por qué:** es la primera imagen que ve alguien decidiendo si gastar $35. Tiene que verse instalado y funcionando, no en una caja.

### 2. Beneficio 1 · cuadrada
**Qué:** una mano acercando el celular al stand, a 2-3 cm.
**Detalles:** que se vea la pantalla del teléfono con la ficha de Google abierta. Congela el gesto justo antes del contacto — eso comunica "un toque" mejor que cualquier texto.
**Truco:** que otra persona sostenga el teléfono mientras tú disparas. Con una sola mano se ve forzado.

### 3. Beneficio 2 · cuadrada
**Qué:** macro del material. Zoom al canto del acrílico y a la base.
**Detalles:** luz lateral para que se marque el brillo y el grosor. Si tienes la versión con logo grabado, esta es la foto para lucirlo.
**Por qué:** justifica el precio. El cliente necesita ver que no es plástico barato.

### 4. Panel · 16:9
**Qué:** captura de pantalla del dashboard real de starTAP.
**Detalles:** que se vean las gráficas de escaneos y el botón de editar enlace. **Tapa el nombre y el correo de cualquier cliente real.** Usa un dispositivo de prueba tuyo.

### 5. Producto solo · cuadrada
**Qué:** el stand aislado sobre fondo blanco o gris muy claro, tipo catálogo.
**Detalles:** centrado, sombra suave debajo, sin props. Es la foto que va junto al formulario de compra y también la que sirve para Meta Ads.

---

# 🟩 TARJETA NFC — `tarjeta-nfc`

### 1. Hero · vertical 4:5
**Qué:** un mesero o vendedor sosteniendo la tarjeta hacia la cámara, sonriendo.
**Detalles:** persona real, uniforme si aplica, local de fondo desenfocado. La cara importa: es lo que separa esta landing de la del stand.
**Por qué:** esta tarjeta se vende por el equipo humano, no por el objeto.

### 2. Beneficio 1 · cuadrada
**Qué:** la tarjeta en contexto de uso — colgada de un lanyard en el cuello, o saliendo de una billetera.
**Detalles:** una moneda o una tarjeta de crédito al lado da escala sin necesidad de explicar medidas.

### 3. Beneficio 2 · cuadrada
**Qué:** las variantes de material juntas: PVC negro, PVC blanco, bambú y nogal, en abanico.
**Detalles:** luz rasante para que se vea la veta de la madera. Es tu diferenciador de precio contra la tarjeta genérica de Alibaba.

### 4. Panel · 16:9
**Qué:** captura del panel mostrando **varias tarjetas asignadas a distintos empleados**.
**Detalles:** con nombres inventados tipo "Mesero 1", "Vendedor Zona Este". Es la prueba visual de que puedes medir quién genera más reseñas.

### 5. Producto solo · cuadrada
**Qué:** las dos caras de la tarjeta, frente y reverso con el QR, sobre fondo blanco.

---

# 🟨 PLACA ACRÍLICA — `placa-acrilica-nfc`

### 1. Hero · vertical 4:5
**Qué:** la placa ya pegada en una puerta de cristal o en una mesa de restaurante.
**Detalles:** en ángulo, con el local vivo detrás a través del cristal. Que se lea que ya está instalada y en uso.

### 2. Beneficio 1 · cuadrada
**Qué:** el momento de la instalación — despegando la cinta protectora del adhesivo 3M.
**Detalles:** dedos en cuadro, cinta a medio despegar. Comunica "sin taladro" de un vistazo, que es la objeción principal de quien alquila el local.

### 3. Beneficio 2 · cuadrada
**Qué:** la placa con gotas de agua encima, o alguien pasándole un paño.
**Detalles:** un rociador de agua y listo. Prueba visual de que resiste limpieza y humedad.

### 4. Panel · 16:9
**Qué:** captura del panel con **varias placas del mismo local** y sus escaneos por ubicación.
**Detalles:** etiquetas tipo "Mesa 4", "Puerta principal", "Caja".

### 5. Producto solo · cuadrada
**Qué:** la placa aislada sobre fondo blanco, ligeramente inclinada para que se vea el grosor de 3 mm.

---

# Prioridad si no puedes hacerlas todas de una

1. **Las 3 del hero** (una por producto). Son las que deciden la venta.
2. **Las 3 de producto solo.** Sirven además para el catálogo, Meta Ads y la ficha de Google Business.
3. **Las 3 capturas del panel.** No requieren fotografía, son screenshots — se hacen en diez minutos.
4. El resto de beneficios.

Con las primeras 9 la landing ya se sostiene.

# Lo que NO conviene

- **Renders o mockups genéricos.** El comprador panameño distingue una foto real de un render, y el render mata la confianza justo donde la necesitas.
- **Fotos de stock de gente extranjera.** Rompe el argumento local completo.
- **Fondos saturados de logos de otras marcas.** Pide permiso al negocio donde dispares y evita que salgan marcas ajenas en primer plano.
- **Datos de clientes reales en las capturas.** Correos, nombres de negocio o enlaces reales: tápalos.

# De paso, aprovecha la sesión

Mientras estés disparando en un local, saca también:

- **10-15 fotos para el perfil de Google Business** — es lo que te falta ahí, y las fotos son señal de ranking en el pack local.
- **Un video vertical de 15 segundos** del gesto completo: acercar el teléfono, abrirse la pantalla, dejar la reseña. Es el creativo que vas a necesitar para los Meta Ads click-to-WhatsApp.
- **Una foto del taller** con las unidades y el material de empaque, por si Google te pide verificación por video del perfil de empresa.
