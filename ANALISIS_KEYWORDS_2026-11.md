# Análisis de palabras clave · nicho NFC y QR comercial
**11 de noviembre de 2026 · datos de DataForSEO (Google Ads), volumen mensual promedio**

Continúa a `ANALISIS_KEYWORDS.md` (16 sep 2026), que se hizo sin datos de volumen.
Ahora sí los hay. El archivo con todas las filas está en `scratch/volumen_nicho.csv`.

Se midieron **86 keywords** del nicho, transaccionales e informacionales, en tres
países. Costo de la consulta: $0.27.

---

## 1. El tamaño real del nicho

| Grupo | Panamá | México | Colombia |
| --- | ---: | ---: | ---: |
| Reseñas, informacional | 190 | 5.690 | 1.830 |
| Genérico Panamá | 190 | 20 | 20 |
| Tarjeta de presentación | 90 | 4.320 | 950 |
| Reseñas, transaccional | 70 | 1.170 | 110 |
| Restaurante y menú | 40 | 80 | 40 |
| Wifi | 20 | 150 | 30 |
| Otros usos NFC y QR | 20 | 1.160 | 230 |
| Instagram | 10 | 50 | 20 |
| **Airbnb** | **0** | **0** | **0** |
| **TOTAL** | **630** | **12.640** | **3.230** |

**De las 86 keywords medidas, solo 28 tienen volumen mayor que cero en Panamá.**
Las otras 58 están en cero.

---

## 2. Lo único que se busca en Panamá

| Vol. | Keyword | CPC |
| ---: | --- | ---: |
| 170 | articulos promocionales panama | $0.94 |
| 140 | que es nfc | $0.37 |
| 50 | tarjeta de presentacion digital | $1.18 |
| 30 | stand nfc | — |
| 10 | comprar tarjeta nfc | $0.39 |
| 10 | perfil de empresa en google | $7.50 |
| 10 | tarjetas nfc personalizadas | $1.16 |
| 10 | placa nfc reseñas google | — |
| 10 | tarjeta nfc reseñas google | — |
| 10 | placa google reseñas | — |
| 10 | nfc panama | $0.28 |
| 10 | codigo qr para menu | — |
| 10 | menu qr restaurante | — |
| 10 | menu digital qr | — |
| 10 | carta digital qr | — |
| 10 | qr para wifi | $0.34 |
| 10 | qr para instagram | — |
| 10 | etiqueta nfc / ntag215 | $0.08–0.24 |
| 10 | como conseguir reseñas en google | — |
| 10 | mi negocio no aparece en google maps | — |

El 10 es el piso de medición de Google Ads, así que varias de esas pueden ser
menos todavía.

---

## 3. Las cuatro conclusiones

### 3.1 El SEO transaccional en Panamá no va a traer ventas

Todo el territorio de compra de nuestro producto suma **70 búsquedas al mes**,
repartidas entre siete keywords de 10 cada una más «stand nfc» con 30. Aunque
quedáramos primeros en las siete, el techo son unas pocas visitas al mes.

Esto confirma con números lo que ya se veía en Search Console: la venta de starTAP
es por prospección directa, y el sitio sirve para que el prospecto que ya nos
conoce verifique que existimos. No para que nos descubran.

### 3.2 El mercado está afuera

México tiene **20 veces** el volumen de Panamá y Colombia **5 veces**. «Que es nfc»
son 5.400 al mes en México contra 140 aquí.

El contenido del blog, que está en español neutro con ejemplos panameños, puede
atraer ese tráfico. Pero no les podemos vender hardware porque no enviamos fuera
de Panamá. Ese tráfico solo sirve si alguna vez hay producto digital, programa de
distribuidores internacional, o si se usa para [[datakorex]] y no para starTAP.

### 3.3 Airbnb queda descartado como apuesta de contenido

Las diez keywords de Airbnb dieron **cero en los tres países**. No es que haya poca
demanda: no hay búsqueda. Eso no impide vender placas a hospedajes, pero se vende
empujando puerta a puerta, nunca esperando que alguien lo busque. No se escribe
artículo para eso.

### 3.4 Hay una categoría adyacente más grande que la nuestra

«Articulos promocionales panama» son **170 búsquedas al mes con CPC de $0.94**, el
único término comercial del estudio con volumen y con anunciantes pagando. Es más
del doble que todo nuestro transaccional junto.

Ahí hay una posición que nadie en el nicho NFC está ocupando: presentarnos como
proveedor de artículos y señalética para negocios en Panamá, con NFC adentro, en
vez de como vendedor de un aparato que casi nadie sabe que existe.

---

## 4. Qué hacer, en orden

1. **No escribir más artículos pensando en volumen panameño.** El blog ya tiene
   diez y el nicho entero son 630 búsquedas al mes. Lo que falta no es contenido,
   es enlazado interno desde la portada, que sigue pendiente desde octubre.
2. **«Que es nfc» (140/mes) es la única informacional con tamaño real en Panamá.**
   Ninguna página nuestra la ataca hoy. Es el mejor candidato si se escribe algo.
3. **Medir «articulos promocionales panama» antes de moverse.** Ver quién rankea y
   si tiene sentido abrir esa puerta.
4. **Tarjeta de presentación digital: 50/mes en Panamá, 3.600 en México.** Es el
   segundo término comercial más grande de Panamá. Sigue siendo poco para montar
   una línea con desarrollo propio, pero es más de lo que tiene el producto que ya
   vendemos. Revisar la evaluación del 10 de noviembre con este dato.
5. **La prospección sigue siendo el canal.** Los datos no cambian eso, lo confirman.

---

## 5. Cómo reproducir esto

Script: `scratch/volumen_nicho.py`. Lee las credenciales de DataForSEO del
`.env.local`, mide las 86 keywords en Panamá, México y Colombia y escribe
`scratch/volumen_nicho.csv`. Las keywords están agrupadas por vertical arriba del
archivo y se editan ahí.

Para expandir una semilla y descubrir keywords nuevas:
`scratch/dataforseo_keywords.py`, que usa el endpoint de sugerencias.
