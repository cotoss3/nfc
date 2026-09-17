import re

with open('src/components/landings/ProductLanding.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix totalPrice formula
price_old = "const totalPrice = (unitPrice * quantity) + (addUpsellCard ? 15 * quantity : 0);"
price_new = "const productTotal = (unitPrice * quantity) * (quantity > 1 ? 0.9 : 1);\n  const totalPrice = productTotal + (addUpsellCard ? 15 * quantity : 0);"
content = content.replace(price_old, price_new)

# 2. Fix addToCart price
cart_old = """    addToCart({
      product_id: product.id,
      product_name: product.name,
      price: unitPrice,"""
cart_new = """    addToCart({
      product_id: product.id,
      product_name: product.name,
      price: unitPrice * (quantity > 1 ? 0.9 : 1),"""
content = content.replace(cart_old, cart_new)

# 3. Replace Quantity UI
qty_ui_old = """                  <div className="space-y-2 pt-2">
                    <p className="text-xs sm:text-sm font-bold text-brand-950">Cantidad</p>
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        aria-label="Reducir cantidad"
                        className="w-11 h-11 flex items-center justify-center rounded-xl border border-brand-200 hover:bg-brand-100 font-extrabold text-lg text-brand-800 transition-colors"
                      >
                        -
                      </button>
                      <span className="font-black text-lg text-brand-950 w-10 text-center" aria-live="polite">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        aria-label="Aumentar cantidad"
                        className="w-11 h-11 flex items-center justify-center rounded-xl border border-brand-200 hover:bg-brand-100 font-extrabold text-lg text-brand-800 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>"""

qty_ui_new = """                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs sm:text-sm font-bold text-brand-950">Cantidad</p>
                      {quantity > 1 && (
                        <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200 shadow-sm">
                          10% de desc. aplicado
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 3, 5, 10].map((qty) => (
                        <button
                          key={qty}
                          type="button"
                          onClick={() => setQuantity(qty)}
                          className={`py-2.5 rounded-xl border font-bold text-sm sm:text-base transition-all ${
                            quantity === qty
                              ? 'bg-brand-950 text-white border-brand-950 shadow-md scale-[1.02]'
                              : 'bg-white text-brand-700 border-brand-200 hover:bg-brand-50 hover:border-brand-300'
                          }`}
                        >
                          {qty} {qty === 1 ? 'ud' : 'uds'}
                        </button>
                      ))}
                    </div>
                  </div>"""

if qty_ui_old in content:
    content = content.replace(qty_ui_old, qty_ui_new)
    print("Quantity UI replaced successfully.")
else:
    print("Quantity UI not found via literal string. Using regex...")
    # fallback regex
    match = re.search(r'<div className="space-y-2 pt-2">.*?Aumentar cantidad".*?<\/button>\s*<\/div>\s*<\/div>', content, flags=re.DOTALL)
    if match:
        content = content[:match.start()] + qty_ui_new + content[match.end():]
        print("Quantity UI replaced via Regex.")
    else:
        print("Regex also failed to find Quantity UI.")

with open('src/components/landings/ProductLanding.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
