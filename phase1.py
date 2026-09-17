# -*- coding: utf-8 -*-
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
        initial_redirect_url: businessName,
        image: '/products/tarjeta-nfc/tarjeta-nfc-bolsillo-resenas-google-panama.webp'
      });
    }
'''
if 'Tarjeta NFC de Bolsillo (Oferta Especial)' not in content:
    content = content[:addToCart_end] + '\n' + upsell_logic + content[addToCart_end:]

# 4. Modify price display to include upsell
# const totalPrice = (unitPrice * quantity) + (addUpsellCard ? 15 * quantity : 0);
unitprice_def = 'const unitPrice = product.price + logoPrice + qrPrice;\n  const totalPrice = unitPrice * quantity;'
new_unitprice_def = 'const unitPrice = product.price + logoPrice + qrPrice;\n  const totalPrice = (unitPrice * quantity) + (addUpsellCard ? 15 * quantity : 0);'
content = content.replace(unitprice_def, new_unitprice_def)

# 5. Extract form string to reorder it
# Let's find the businessName block:
bn_start_str = '{/* DESTACADO: Enlace o Nombre del Negocio */}'
bn_end_str = '</div>\n                  </div>\n\n                  <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4 space-y-1.5">'
bn_start = content.find(bn_start_str)
bn_end = content.find('</div>\n                  </div>', bn_start) + len('</div>\n                  </div>')

# Actually, the user wants the businessName block at the bottom.
# So I'll remove it from the top and put it right before the "Cantidad" block or right after `hasQrCode`.
# Let's find the hasQrCode block end:
qr_end_str = 'Agrega un código QR' # let's search for hasQrCode div end
# The hasQrCode block is:
qr_block_start = content.find('hasQrCode ? \'border-brand-950 bg-brand-50/60 shadow-sm\' : \'border-brand-200 bg-white\'')
# find the ending div of that block
qr_block_end = content.find('</div>\n                </div>\n\n                <div className="space-y-2 pt-2">', qr_block_start)

# We will just rewrite the `renderCheckoutForm` since we are doing major surgery.
with open('src/components/landings/ProductLanding.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Phase 1 done.")
