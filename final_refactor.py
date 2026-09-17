# -*- coding: utf-8 -*-
import re

with open('src/components/landings/ProductLanding.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add addUpsellCard state
state_str = 'const [isMobileCheckoutOpen, setIsMobileCheckoutOpen] = useState(false);'
if 'addUpsellCard' not in content:
    content = content.replace(state_str, state_str + '\n  const [addUpsellCard, setAddUpsellCard] = useState(false);')

# 2. Modify handleAddToCart
bname_alert = '''    if (!businessName) {
      alert('Por favor ingresa el nombre de tu negocio para continuar');
      return;
    }
'''
content = content.replace(bname_alert, '')

# Fallback in case of exact match issues
if 'Por favor ingresa el nombre de tu negocio para continuar' in content:
    import sys
    print("Warning: Failed to remove businessName alert")

# Add Upsell to Cart
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
        quantity: quantity,
        selected_color: 'Negro Premium',
        initial_redirect_url: businessName || '',
        image: '/products/tarjeta-nfc/tarjeta-nfc-bolsillo-resenas-google-panama.webp'
      });
    }
'''
if 'Tarjeta NFC de Bolsillo' not in content:
    content = content[:addToCart_end] + '\n' + upsell_logic + content[addToCart_end:]

# 3. Update Price Calculation
unitprice_def = 'const unitPrice = product.price + logoPrice + qrPrice;\n  const totalPrice = unitPrice * quantity;'
new_unitprice_def = 'const unitPrice = product.price + logoPrice + qrPrice;\n  const totalPrice = (unitPrice * quantity) + (addUpsellCard ? 15 * quantity : 0);'
content = content.replace(unitprice_def, new_unitprice_def)

# 4. Extract businessName block and move it down
bn_start_str = '{/* DESTACADO: Enlace o Nombre del Negocio */}'
bn_start = content.find(bn_start_str)
bn_end_str = '</div>\\n                  </div>\\n\\n                  <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4 space-y-1.5">'
# Due to python here-string quirks with \n, let's just regex find it
match = re.search(r'</div>\s*</div>\s*<div className="bg-amber-50/90', content[bn_start:])
if match:
    bn_end = bn_start + match.start()
    
    bn_block = content[bn_start:bn_end]
    bn_block = bn_block.replace('Requerido para programar', 'Opcional, hazlo luego')
    bn_block = bn_block.replace('Paso 1: Enlace o Nombre de tu Negocio', 'Paso Opcional: Enlace o Nombre')
    bn_block = bn_block.replace('required', '')
    
    # Remove from top
    content = content[:bn_start] + content[bn_end:]
    
    cantidad_str = '<div className="space-y-2 pt-2">\\n                  <p className="text-xs sm:text-sm font-bold text-brand-950">Cantidad</p>'
    # let's regex find it
    c_match = re.search(r'<div className="space-y-2 pt-2">\s*<p className="text-xs sm:text-sm font-bold text-brand-950">Cantidad</p>', content)
    if c_match:
        insert_idx = c_match.start()
        
        upsell_ui = '''
                  {/* Oferta Especial Upsell */}
                  <div
                    className={`border rounded-2xl p-4 sm:p-5 transition-all mt-4 mb-6 ${
                      addUpsellCard ? 'border-brand-950 bg-brand-50/60 shadow-sm' : 'border-emerald-200 bg-emerald-50/40'
                    }`}
                  >
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addUpsellCard}
                        onChange={(e) => setAddUpsellCard(e.target.checked)}
                        className="mt-0.5 h-4 w-4 accent-brand-950 rounded cursor-pointer"
                      />
                      <span className="flex-1">
                        <span className="flex justify-between items-center flex-wrap gap-1">
                          <span className="text-xs sm:text-sm font-black text-emerald-900 uppercase flex items-center gap-1.5">
                            <Sparkles className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                            Oferta Especial
                          </span>
                          <span className="text-xs font-black text-white bg-emerald-600 px-2 py-0.5 rounded-md shadow-sm">+ $15.00 USD</span>
                        </span>
                        <span className="block text-xs text-emerald-800 mt-1 font-medium">
                          Lleva una tarjeta inteligente NFC de bolsillo extra a un precio exclusivo.
                        </span>
                      </span>
                    </label>
                  </div>
'''
        
        content = content[:insert_idx] + upsell_ui + bn_block + '</div>\n                  </div>\n\n                  ' + content[insert_idx:]
    else:
        print("Warning: Could not find Cantidad block")
else:
    print("Warning: Could not find end of businessName block")

with open('src/components/landings/ProductLanding.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
