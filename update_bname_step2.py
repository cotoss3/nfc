import re

with open('src/components/landings/ProductLanding.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Try to find the block
start_str = '{/* DESTACADO: Enlace o Nombre del Negocio */}'
start_idx = content.find(start_str)

if start_idx != -1:
    # Find the next section. We know Cantidad comes after it.
    end_str = '<div className="space-y-2 pt-2">'
    end_idx = content.find(end_str, start_idx)
    
    if end_idx != -1:
        # Just to be safe, let's remove everything from start_idx to end_idx
        content = content[:start_idx] + content[end_idx:]
        with open('src/components/landings/ProductLanding.tsx', 'w', encoding='utf-8') as f:
            f.write(content)
        print("UI Block removed successfully.")
    else:
        print("End string not found.")
else:
    print("Start string not found.")

