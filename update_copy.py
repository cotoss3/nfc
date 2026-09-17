import os

replacements = {
    "src/components/landings/ProductLanding.tsx": [
        ("Llega listo y pre-programado. En el primer toque lo vinculas a tu negocio en 30", 
         "Es auto-configurable al llegar. En tu primer toque lo vinculas a tu negocio en 30")
    ],
    "src/app/HomeClient.tsx": [
        ("Llega lista para usar, configurada con tu ficha de Google Maps y sin mensualidades.", 
         "Es auto-configurable al llegar. Se vincula con tu ficha de Google Maps en un toque y sin mensualidades."),
        ("Lista y configurada con el enlace oficial de tu negocio. Retiras la protección de la cinta 3M y la fijas en tu recepción o mesa.", 
         "Auto-configurable en segundos. Retiras la protección de la cinta 3M, la vinculas con tu celular y la fijas en tu recepción."),
        ("Pide tu placa en línea con pago por Yappy o tarjeta. Te la enviamos configurada y lista para colocar en tu mostrador.", 
         "Pide tu placa en línea con pago por Yappy o tarjeta. Te la enviamos lista para colocar en tu mostrador y auto-configurar en segundos.")
    ],
    "src/app/catalogo/[id]/page.tsx": [
        ("Configurado y listo para usar en tu negocio en Panamá.", 
         "Auto-configurable al llegar a tu negocio en Panamá.")
    ],
    "src/lib/landings.ts": [
        ("Al procesar tu pedido programamos el chip para que apunte a tu perfil de Google Maps. Te llega listo para usar.", 
         "No necesitas enviarnos ningún enlace al comprar. Es auto-configurable: lo vinculas a tu perfil de Google Maps en segundos cuando te llegue.")
    ],
    "src/app/checkout/page.tsx": [
        ("Dispositivos configurados y listos para usar sin apps.", 
         "Dispositivos auto-configurables al llegar, sin apps y listos para usar.")
    ],
    "src/app/shop/[id]/ProductDetailClient.tsx": [
        ("Tu dispositivo llega listo y pre-programado. En tu primer toque lo vinculas a tu negocio en 30 segundos sin necesidad de ingresar URLs complicadas ahora.", 
         "Tu dispositivo es auto-configurable al llegar. En tu primer toque lo vinculas a tu negocio en 30 segundos sin necesidad de ingresar URLs ahora.")
    ],
    "src/app/resenas-google/page.tsx": [
        ("Adquiere tus dispositivos NFC + QR programados y configurados con tu enlace directo.", 
         "Adquiere tus dispositivos NFC + QR auto-configurables en segundos con tu enlace directo.")
    ],
    "src/app/resenas-google/[industria]/page.tsx": [
        ("100% Configurado • Listo en 0s", 
         "Auto-configurable • Listo en segundos")
    ]
}

for file_path, reps in replacements.items():
    if not os.path.exists(file_path):
        print(f"Skipping {file_path} (does not exist)")
        continue
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    changes = 0
    for old, new in reps:
        if old in content:
            content = content.replace(old, new)
            changes += 1
        else:
            print(f"Warning: String not found in {file_path}:\n'{old}'")
            
    if changes > 0:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {changes} instances in {file_path}")

