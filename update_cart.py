import re

with open('src/components/landings/ProductLanding.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the businessName validation
bname_alert = """    if (!businessName) {
      alert('Por favor ingresa el nombre de tu negocio para continuar');
      return;
    }
"""
content = content.replace(bname_alert, "")

# Add upsell logic
cart_call = """    addToCart({
      product_id: product.id,
      product_name: product.name,
      price: unitPrice,
      unit_price_base: product.price,
      has_custom_logo: hasCustomLogo,
      has_qr_code: hasQrCode,
      logo_price: logoPrice,
      qr_price: qrPrice,
      quantity,
      selected_color: color,
      business_name: businessName,
      logo_url: logoPreview || undefined,
    });"""

upsell_logic = cart_call + """

    if (addUpsellCard) {
      addToCart({
        product_id: 'tarjeta-nfc-bolsillo',
        product_name: 'Tarjeta NFC de Bolsillo (Oferta Especial)',
        price: 15,
        unit_price_base: 15,
        has_custom_logo: false,
        has_qr_code: true,
        logo_price: 0,
        qr_price: 0,
        quantity: 1,
        selected_color: 'Negro Premium',
        business_name: businessName,
      });
    }"""

if cart_call in content:
    content = content.replace(cart_call, upsell_logic)
    print("Upsell logic added.")
else:
    print("Could not find addToCart block exactly.")

with open('src/components/landings/ProductLanding.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
