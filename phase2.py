import re

with open('src/components/landings/ProductLanding.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

bn_block_start = content.find('{/* DESTACADO: Enlace o Nombre del Negocio */}')
bn_block_end = content.find('</div>\n                  </div>', bn_block_start) + len('</div>\n                  </div>')

# We also want to remove the "Requerido para programar" text and make it "Opcional"
bn_block = content[bn_block_start:bn_block_end]
bn_block = bn_block.replace('Requerido para programar', 'Opcional, hazlo luego')
bn_block = bn_block.replace('required', '')
bn_block = bn_block.replace('Paso 1: Enlace o Nombre de tu Negocio', 'Paso Opcional: Enlace o Nombre')

# We remove the block from its original position
# Also remove the amber 100% autoconfigurable box which is right after it, we'll keep it there or move it? Let's just remove the bn_block.
content = content[:bn_block_start] + content[bn_block_end:]

upsell_ui = '''
                  <div
                    className={`border rounded-2xl p-4 sm:p-5 transition-all mt-4 ${
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

insert_idx = content.find('<div className="space-y-2 pt-2">') # Just above the Quantity section

content = content[:insert_idx] + upsell_ui + '\n\n' + bn_block + '\n\n' + content[insert_idx:]

with open('src/components/landings/ProductLanding.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Phase 2 done.")
