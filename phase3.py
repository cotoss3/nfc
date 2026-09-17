import re

with open('src/components/landings/ProductLanding.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_bar = """      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-brand-200 p-3.5 shadow-[0_-8px_20px_rgba(0,0,0,0.12)] flex items-center justify-between gap-3">
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

new_bar = """      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-brand-200 p-3.5 shadow-[0_-8px_20px_rgba(0,0,0,0.12)] flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-brand-500 block uppercase font-extrabold tracking-wider">Total con envío</span>
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

content = content.replace(old_bar, new_bar)

with open('src/components/landings/ProductLanding.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Phase 3 done.")
