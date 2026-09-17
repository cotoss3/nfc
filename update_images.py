import re

with open('src/config/products.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the images array for stand-nfc-mesa
old_images = """      images: [
        '/products/NFC10002/stand-nfc-resenas-google-startap-panama.webp',
        '/products/NFC10002/stand-nfc-escaneo-restaurante-panama.webp',
        '/products/NFC10002/stand-nfc-taller-mecanico-clientes-felices.webp',
        '/products/NFC10002/stand-nfc-aumento-confianza-seo-local.webp',
        '/products/NFC10002/panel-administracion-startap-nfc.webp',
        '/products/NFC10002/NFC_10002_Stan.webp',
        '/products/NFC10002/stand-nfc-resenas-google-frontal.webp'
      ],"""

new_images = """      images: [
        '/products/NFC10002/stand-nfc-resenas-google-startap-panama.webp',
        '/products/NFC10002/stand-nfc-taller-mecanico-clientes-felices.webp',
        '/products/NFC10002/stand-nfc-aumento-confianza-seo-local.webp',
        '/products/NFC10002/stand-nfc-escaneo-restaurante-panama.webp',
        '/products/NFC10002/panel-administracion-startap-nfc.webp'
      ],"""

if old_images in content:
    content = content.replace(old_images, new_images)
    print("Replaced successfully")
else:
    print("Could not find old_images block exactly. Trying regex or softer replacement.")
    # Fallback just in case
    import re
    match = re.search(r"id:\s*'stand-nfc-mesa'.*?images:\s*\[(.*?)\]", content, flags=re.DOTALL)
    if match:
        content = content[:match.start(1)] + "\n        '/products/NFC10002/stand-nfc-resenas-google-startap-panama.webp',\n        '/products/NFC10002/stand-nfc-taller-mecanico-clientes-felices.webp',\n        '/products/NFC10002/stand-nfc-aumento-confianza-seo-local.webp',\n        '/products/NFC10002/stand-nfc-escaneo-restaurante-panama.webp',\n        '/products/NFC10002/panel-administracion-startap-nfc.webp'\n      " + content[match.end(1):]
        print("Replaced via fallback")

with open('src/config/products.ts', 'w', encoding='utf-8') as f:
    f.write(content)
