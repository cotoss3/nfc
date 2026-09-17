import re

with open('src/components/landings/ProductLanding.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove businessName state
state_old = "const [businessName, setBusinessName] = useState('');\n  const [hasCustomLogo, setHasCustomLogo] = useState(false);"
state_new = "const [hasCustomLogo, setHasCustomLogo] = useState(false);"
content = content.replace(state_old, state_new)

# 2. Remove businessName from addToCart
cart_old = """        quantity: 1,
        selected_color: 'Negro Premium',
        business_name: businessName,
      });"""
cart_new = """        quantity: 1,
        selected_color: 'Negro Premium',
      });"""
content = content.replace(cart_old, cart_new)

cart_old_2 = """        quantity,
        selected_color: color,
        business_name: businessName,
        logo_url: logoPreview || undefined,
      });"""
cart_new_2 = """        quantity,
        selected_color: color,
        logo_url: logoPreview || undefined,
      });"""
content = content.replace(cart_old_2, cart_new_2)

# 3. Remove the UI block
ui_regex = r'\{\/\* DESTACADO: Enlace o Nombre del Negocio \*\/}.*?<\/div>\s*<\/div>'
# Wait, let's look at what the UI block looks like before I regex it.
