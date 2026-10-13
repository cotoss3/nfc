"""
generar_lista_mayorista.py

Genera el PDF "Lista de Precios para Distribuidores" de starTAP Panamá.

Qué hace:
  - Define en un solo lugar (PRODUCTOS y NIVELES) los precios al detal y
    los precios por nivel de distribuidor, para que cambiar un precio sea
    editar un dato y no tocar el diseño.
  - Calcula y valida que cada precio mayorista deje margen al distribuidor
    frente al precio mínimo de reventa (falla si algún precio queda mal).
  - Dibuja el PDF con la identidad de starTAP (cian #01A6D2, negro, blanco).

Uso:
  python generar_lista_mayorista.py  ->  crea starTAP_Lista_Distribuidores.pdf

Reglas de texto aplicadas (REGLAS_CONTENIDO.md de starTAP):
  sin rayas largas, sin adverbios en -mente, sin cifras inventadas.
"""

from dataclasses import dataclass
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

# ---------------------------------------------------------------------------
# Identidad de marca
# ---------------------------------------------------------------------------
CIAN = colors.HexColor("#01A6D2")
NEGRO = colors.HexColor("#0A0A0A")
GRIS = colors.HexColor("#5F6B73")
GRIS_CLARO = colors.HexColor("#EEF6F9")

SALIDA = Path(__file__).with_name("starTAP_Lista_Distribuidores.pdf")
VIGENCIA = "31 de diciembre de 2026"


# ---------------------------------------------------------------------------
# Datos de precios (única fuente de verdad)
# ---------------------------------------------------------------------------
@dataclass(frozen=True)
class Producto:
    nombre: str
    detalle: str
    precio_detal: float  # también es el precio mínimo de reventa


@dataclass(frozen=True)
class Nivel:
    nombre: str
    rango: str
    precios: tuple  # mismo orden que PRODUCTOS


PRODUCTOS = (
    Producto("Tarjeta NFC de Bolsillo", "PVC 0.76 mm, NFC + QR", 20.00),
    Producto("Stand NFC de Mesa", "Estructura autoportante, NFC + QR", 30.00),
    Producto("Placa NFC de Mostrador", "Acrílico 3 mm con adhesivo 3M", 35.00),
)

NIVELES = (
    Nivel("Distribuidor", "25 a 99 unidades", (10.00, 15.00, 17.50)),
    Nivel("Mayorista", "100 unidades o más", (9.00, 13.50, 16.00)),
)


def validar_precios() -> None:
    """Corta la generación si algún precio no deja margen al revendedor."""
    for nivel in NIVELES:
        if len(nivel.precios) != len(PRODUCTOS):
            raise ValueError(f"El nivel {nivel.nombre} no tiene precio para cada producto")
        for producto, precio in zip(PRODUCTOS, nivel.precios):
            if precio >= producto.precio_detal:
                raise ValueError(
                    f"{producto.nombre} en nivel {nivel.nombre}: "
                    f"${precio:.2f} no deja margen frente a ${producto.precio_detal:.2f}"
                )


def usd(valor: float) -> str:
    return f"${valor:,.2f}"


# ---------------------------------------------------------------------------
# Estilos
# ---------------------------------------------------------------------------
def estilos() -> dict:
    return {
        "marca": ParagraphStyle("marca", fontName="Helvetica-Bold", fontSize=26,
                                textColor=NEGRO, leading=30),
        "titulo": ParagraphStyle("titulo", fontName="Helvetica-Bold", fontSize=15,
                                 textColor=CIAN, leading=19, spaceBefore=2),
        "aviso": ParagraphStyle("aviso", fontName="Helvetica-Oblique", fontSize=9,
                                textColor=GRIS, leading=12),
        "h2": ParagraphStyle("h2", fontName="Helvetica-Bold", fontSize=12,
                             textColor=NEGRO, leading=15, spaceBefore=10, spaceAfter=5),
        "cuerpo": ParagraphStyle("cuerpo", fontName="Helvetica", fontSize=9.5,
                                 textColor=NEGRO, leading=13.5),
        "celda": ParagraphStyle("celda", fontName="Helvetica", fontSize=9,
                                textColor=NEGRO, leading=11.5),
        "celda_b": ParagraphStyle("celda_b", fontName="Helvetica-Bold", fontSize=9.5,
                                  textColor=NEGRO, leading=12),
        "pie": ParagraphStyle("pie", fontName="Helvetica", fontSize=8.5,
                              textColor=GRIS, leading=11),
    }


# ---------------------------------------------------------------------------
# Bloques del documento
# ---------------------------------------------------------------------------
def tabla_precios(e: dict) -> Table:
    encabezado = ["Producto", "Precio al detal\n(mínimo de reventa)"]
    encabezado += [f"{n.nombre}\n{n.rango}" for n in NIVELES]

    filas = [encabezado]
    for i, p in enumerate(PRODUCTOS):
        fila = [
            Paragraph(f"<b>{p.nombre}</b><br/><font color='#5F6B73'>{p.detalle}</font>", e["celda"]),
            usd(p.precio_detal),
        ]
        fila += [usd(n.precios[i]) for n in NIVELES]
        filas.append(fila)

    tabla = Table(filas, colWidths=[2.55 * inch, 1.45 * inch, 1.45 * inch, 1.45 * inch])
    tabla.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NEGRO),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 8.5),
        ("FONTNAME", (1, 1), (-1, -1), "Helvetica-Bold"),
        ("FONTSIZE", (1, 1), (-1, -1), 11),
        ("TEXTCOLOR", (2, 1), (-1, -1), CIAN),
        ("TEXTCOLOR", (1, 1), (1, -1), GRIS),
        ("ALIGN", (1, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, GRIS_CLARO]),
        ("LINEBELOW", (0, 0), (-1, -1), 0.4, colors.HexColor("#D5E3E8")),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ]))
    return tabla


def tabla_ganancia(e: dict) -> Table:
    """Muestra cuánto gana el distribuidor por unidad vendida al precio mínimo."""
    filas = [["Producto"] + [f"Tu ganancia por unidad\n(nivel {n.nombre})" for n in NIVELES]]
    for i, p in enumerate(PRODUCTOS):
        filas.append([p.nombre] + [usd(p.precio_detal - n.precios[i]) for n in NIVELES])

    tabla = Table(filas, colWidths=[2.55 * inch, 2.175 * inch, 2.175 * inch])
    tabla.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), CIAN),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("FONTNAME", (1, 1), (-1, -1), "Helvetica-Bold"),
        ("ALIGN", (1, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, GRIS_CLARO]),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ]))
    return tabla


CONDICIONES = (
    "<b>Pedido mínimo:</b> 25 unidades por pedido. Puedes combinar productos para llegar al mínimo; "
    "el nivel se calcula con el total de unidades del pedido.",
    "<b>Pago:</b> 100% por adelantado con Yappy, transferencia ACH o tarjeta. No se despacha sin pago confirmado.",
    "<b>Precio mínimo de reventa:</b> no puedes publicar ni ofrecer los productos por debajo del precio al detal "
    "de esta lista, en ningún canal. Incumplirlo hace perder el precio de distribuidor.",
    "<b>Marca:</b> los productos se entregan con diseño neutro (sin la marca starTAP) o con tu marca, "
    "previa aprobación del arte. No puedes usar el nombre starTAP en tus anuncios ni en tu dominio.",
    "<b>Canales:</b> no se permite la reventa en marketplaces (Mercado Libre, Encuentra24, "
    "Facebook Marketplace, Amazon y similares).",
    "<b>Configuración:</b> cada dispositivo se vincula desde el panel de starTAP. El soporte técnico del "
    "dispositivo lo da starTAP; la atención comercial a tu cliente la das tú.",
    "<b>Entrega:</b> el plazo se confirma en cada pedido según el inventario disponible. Envíos a todo Panamá.",
    "<b>Precios:</b> en dólares, válidos hasta el " + VIGENCIA + ". Pueden cambiar con aviso previo de 30 días.",
)


def construir() -> None:
    validar_precios()
    e = estilos()

    doc = SimpleDocTemplate(
        str(SALIDA), pagesize=letter,
        leftMargin=0.75 * inch, rightMargin=0.75 * inch,
        topMargin=0.55 * inch, bottomMargin=0.5 * inch,
        title="starTAP Panamá | Lista de precios para distribuidores",
        author="starTAP Panamá",
    )

    historia = [
        Paragraph("star<font color='#01A6D2'>TAP</font>", e["marca"]),
        Paragraph("Lista de precios para distribuidores", e["titulo"]),
        Spacer(1, 3),
        Paragraph("Documento confidencial. Solo para distribuidores aprobados por starTAP Panamá. "
                  "No se publica ni se comparte con clientes finales.", e["aviso"]),
        Spacer(1, 6),
        Table([[""]], colWidths=[6.9 * inch], rowHeights=[2],
              style=[("BACKGROUND", (0, 0), (-1, -1), CIAN)]),

        Paragraph("Precios por nivel (USD por unidad)", e["h2"]),
        tabla_precios(e),

        Paragraph("Cuánto ganas por unidad vendida al precio mínimo", e["h2"]),
        tabla_ganancia(e),

        Paragraph("Condiciones", e["h2"]),
    ]
    for condicion in CONDICIONES:
        historia.append(Paragraph("•&nbsp;&nbsp;" + condicion, e["cuerpo"]))
        historia.append(Spacer(1, 2))

    historia += [
        Spacer(1, 10),
        Paragraph("Pedidos y consultas: WhatsApp +507 6483-9004  |  info@startap.com.pa  |  startap.com.pa",
                  e["pie"]),
        Paragraph("Para comprar como distribuidor debes tener firmado el Acuerdo de Distribución de starTAP.",
                  e["pie"]),
    ]

    doc.build(historia)


if __name__ == "__main__":
    construir()
    print(f"PDF generado: {SALIDA}")
