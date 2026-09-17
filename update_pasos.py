with open('src/components/landings/ProductLanding.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('paísos', 'pasos')

with open('src/components/landings/ProductLanding.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
