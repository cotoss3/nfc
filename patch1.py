with open('src/components/landings/ProductLanding.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

changes = 0

state_old = "const [isMobileCheckoutOpen, setIsMobileCheckoutOpen] = useState(false);\n  const [hasQrCode, setHasQrCode] = useState(false);"
state_new = "const [isMobileCheckoutOpen, setIsMobileCheckoutOpen] = useState(false);\n  const [addUpsellCard, setAddUpsellCard] = useState(false);\n  const [hasQrCode, setHasQrCode] = useState(false);"
if state_old in content:
    content = content.replace(state_old, state_new)
    changes += 1

bn_check = """    if (!businessName) {
      alert('Por favor ingresa el nombre de tu negocio para continuar');
      return;
    }"""
if bn_check in content:
    content = content.replace(bn_check, "")
    changes += 1

# Finding the end of the addToCart block
cart_idx = content.find('    addToCart({')
if cart_idx != -1:
    cart_end = content.find('    });', cart_idx)
    if cart_end != -1:
        cart_full = content[cart_idx:cart_end + 7]
        upsell_logic = """

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
        quantity: quantity,
        selected_color: 'Negro Premium',
        initial_redirect_url: businessName || '',
        image: '/products/tarjeta-nfc/tarjeta-nfc-bolsillo-resenas-google-panama.webp'
      });
    }"""
        content = content[:cart_end + 7] + upsell_logic + content[cart_end + 7:]
        changes += 1
        print("Upsell cart logic added.")

price_old = "const unitPrice = product.price + logoPrice + qrPrice;\n  const totalPrice = unitPrice * quantity;"
price_new = "const unitPrice = product.price + logoPrice + qrPrice;\n  const totalPrice = (unitPrice * quantity) + (addUpsellCard ? 15 * quantity : 0);"
if price_old in content:
    content = content.replace(price_old, price_new)
    changes += 1

if changes > 0:
    with open('src/components/landings/ProductLanding.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Applied {changes} changes")
