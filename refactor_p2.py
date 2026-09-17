import re

with open('src/components/landings/ProductLanding.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Locate the businessName block
bn_start_str = '{/* DESTACADO: Enlace o Nombre del Negocio */}'
bn_start = content.find(bn_start_str)

# Find the end of it: wait, it ends right before the "100% auto-configurable" block.
next_block_str = '<div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4 space-y-1.5">'
bn_end = content.find(next_block_str, bn_start)

# Extract it
bn_block = content[bn_start:bn_end]

# Modify it: remove required, change label
bn_block = bn_block.replace('Requerido para programar', 'Opcional, hazlo luego')
bn_block = bn_block.replace('Paso 1: Enlace o Nombre de tu Negocio', 'Paso Opcional: Enlace o Nombre')
bn_block = bn_block.replace('required', '')

# Remove it from original position
content = content[:bn_start] + content[bn_end:]

# Insert it before "Cantidad" block
cantidad_str = '<div className="space-y-2 pt-2">\n                  <p className="text-xs sm:text-sm font-bold text-brand-950">Cantidad</p>'
insert_idx = content.find(cantidad_str)

# also let's define the Upsell block
upsell_ui = '''
                  {/* Oferta Especial Upsell */}
                  <div
                    className={`border rounded-2xl p-4 sm:p-5 transition-all mt-2 ${
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

content = content[:insert_idx] + upsell_ui + '\n\n                  ' + bn_block + '\n\n                  ' + content[insert_idx:]

with open('src/components/landings/ProductLanding.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Phase 2 done.")
