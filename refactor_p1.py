import re

with open('src/components/landings/ProductLanding.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. State for addUpsellCard
state_str = 'const [isMobileCheckoutOpen, setIsMobileCheckoutOpen] = useState(false);'
if 'addUpsellCard' not in content:
    content = content.replace(state_str, state_str + '\n  const [addUpsellCard, setAddUpsellCard] = useState(false);')

# 2. Modify handleAddToCart to remove businessName required check
bname_alert = '''    if (!businessName) {
      alert('Por favor ingresa el nombre de tu negocio para continuar');
      return;
    }'''
content = content.replace(bname_alert, '')
# Fallback in case of slightly different formatting
bname_alert_alt = '''    if (!businessName) {
      alert('Por favor ingresa el nombre de tu negocio para continuar');
      return;
    }
'''
content = content.replace(bname_alert_alt, '')

# 3. Add upsell product to cart inside handleAddToCart
cart_call_start = '    addToCart({'
cart_call_end = '    });'
addToCart_idx = content.find(cart_call_start)
addToCart_end = content.find(cart_call_end, addToCart_idx) + len(cart_call_end)

upsell_logic = '''
    if (addUpsellCard) {
      addToCart({
        product_id: 'tarjeta-nfc-bolsillo',
        product_name: 'Tarjeta NFC de Bolsillo (Oferta Especial)',
        price: 15,
        unit_price_base: 15,
        has_custom_logo: false,
        has_qr_code: true,
        logo_file_name: null,
        quantity: quantity,
        selected_color: 'Negro Premium',
        initial_redirect_url: businessName || '',
        image: '/products/tarjeta-nfc/tarjeta-nfc-bolsillo-resenas-google-panama.webp'
      });
    }
'''
if 'Tarjeta NFC de Bolsillo (Oferta Especial)' not in content:
    content = content[:addToCart_end] + '\n' + upsell_logic + content[addToCart_end:]

# 4. Modify price display to include upsell
unitprice_def = 'const unitPrice = product.price + logoPrice + qrPrice;\n  const totalPrice = unitPrice * quantity;'
new_unitprice_def = 'const unitPrice = product.price + logoPrice + qrPrice;\n  const totalPrice = (unitPrice * quantity) + (addUpsellCard ? 15 * quantity : 0);'
content = content.replace(unitprice_def, new_unitprice_def)


with open('src/components/landings/ProductLanding.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Phase 1 done.")
