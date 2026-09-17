with open('src/components/landings/ProductLanding.tsx', 'r', encoding='utf-8') as f:
    content = f.read()
import re
content = re.sub(r"image: '/products/tarjeta-nfc/tarjeta-nfc-bolsillo-resenas-google-panama\.webp'", "", content)
with open('src/components/landings/ProductLanding.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
