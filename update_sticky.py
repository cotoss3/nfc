import re

with open('src/components/landings/ProductLanding.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix broken chars
content = content.replace('Panamǟ', 'Panamá')
content = content.replace('fǟbica', 'fábrica')
content = content.replace('opciǟn', 'opción')
content = content.replace('Configuraciǟn', 'Configuración')
content = content.replace('Tǟ', 'Tú')
content = content.replace('aquǟ', 'aquí')
content = content.replace('Escrǟbenos', 'Escríbenos')
content = content.replace('informaciǟn', 'información')
content = content.replace('Envos', 'Envíos')
content = content.replace('pas', 'país')
content = content.replace('Reseas', 'Reseñas')
content = content.replace('ǭngulo', 'ángulo')
content = content.replace('telǸfono', 'teléfono')
content = content.replace('cmodamente', 'cómodamente')
content = content.replace('cafeteras', 'cafeterías')
content = content.replace('clnicas', 'clínicas')
content = content.replace('recepci"n', 'recepción')
content = content.replace('Acrlico', 'Acrílico')
content = content.replace('ACR?LICO', 'ACRÍLICO')
content = content.replace('envo', 'envío')
content = content.replace('env\no', 'envío')
content = content.replace('GUǟA', 'GUÍA')
content = content.replace('AUTOCONFIGURACIǟ?oN', 'AUTOCONFIGURACIÓN')
content = content.replace('panameǟos', 'panameños')

# Fix "Total con envio" to "Total" in the sticky bar
# Also add Whatsapp button
sticky_old = """      {/* Sticky Mobile Buy Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-brand-200 p-3.5 shadow-[0_-8px_20px_rgba(0,0,0,0.12)] flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-brand-500 block uppercase font-extrabold tracking-wider">Total con envío</span>
          <span className="text-xl font-black text-brand-950">${totalPrice.toFixed(2)}</span>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileCheckoutOpen(true)}
          className="shopify-btn-primary flex-1 py-3.5 rounded-xl shadow-lg font-bold flex items-center justify-center gap-2"
        >
          Comprar <ArrowRight className="w-5 h-5" />
        </button>
      </div>"""

sticky_new = """      {/* Sticky Mobile Buy Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-brand-200 p-3.5 shadow-[0_-8px_20px_rgba(0,0,0,0.12)] flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-brand-500 block uppercase font-extrabold tracking-wider">Total</span>
          <span className="text-xl font-black text-brand-950">${totalPrice.toFixed(2)}</span>
        </div>
        <div className="flex gap-2 flex-1 justify-end">
          <a
            href={whatsappProducto}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Consultar por WhatsApp"
            className="w-12 h-12 flex items-center justify-center bg-[#25D366] text-white rounded-xl shadow-lg flex-shrink-0"
          >
            <MessageCircle className="w-6 h-6" />
          </a>
          <button
            type="button"
            onClick={() => setIsMobileCheckoutOpen(true)}
            className="shopify-btn-primary flex-1 py-3.5 rounded-xl shadow-lg font-bold flex items-center justify-center gap-2"
          >
            Comprar <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>"""

if sticky_old in content:
    content = content.replace(sticky_old, sticky_new)
    print("Sticky Bar replaced.")
else:
    print("Sticky Bar not found as string, trying regex.")
    match = re.search(r'\{\/\* Sticky Mobile Buy Bar \*\/}.*?Comprar <ArrowRight className="w-5 h-5" \/>\s*<\/button>\s*<\/div>', content, flags=re.DOTALL)
    if match:
        content = content[:match.start()] + sticky_new + content[match.end():]
        print("Sticky Bar replaced via Regex.")

with open('src/components/landings/ProductLanding.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

