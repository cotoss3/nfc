import re

with open('src/components/landings/ProductLanding.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the variables
vars_old = """  const unitPrice = product.price + logoPrice + qrPrice;
  const productTotal = (unitPrice * quantity) * (quantity > 1 ? 0.9 : 1);
  const totalPrice = productTotal + (addUpsellCard ? 15 * quantity : 0);"""

vars_new = """  const unitPrice = product.price + logoPrice + qrPrice;
  const getDiscountPercent = (q: number) => {
    if (q >= 10) return 20;
    if (q >= 5) return 15;
    if (q >= 3) return 10;
    return 0;
  };
  const discount = getDiscountPercent(quantity);
  const discountMultiplier = 1 - (discount / 100);

  const productTotal = (unitPrice * quantity) * discountMultiplier;
  const totalPrice = productTotal + (addUpsellCard ? 15 * quantity : 0);"""

content = content.replace(vars_old, vars_new)

# 2. Update addToCart
cart_old = """      product_name: product.name,
      price: unitPrice * (quantity > 1 ? 0.9 : 1),
      unit_price_base: product.price,"""

cart_new = """      product_name: product.name,
      price: unitPrice * discountMultiplier,
      unit_price_base: product.price,"""
      
content = content.replace(cart_old, cart_new)

# 3. Update the UI Badge
badge_old = """                      {quantity > 1 && (
                        <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200 shadow-sm">
                          10% de desc. aplicado
                        </span>
                      )}"""

badge_new = """                      {discount > 0 && (
                        <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200 shadow-sm">
                          {discount}% de desc. aplicado
                        </span>
                      )}"""

content = content.replace(badge_old, badge_new)

with open('src/components/landings/ProductLanding.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Pricing logic updated.")
