with open('src/components/landings/ProductLanding.tsx', 'rb') as f:
    raw = f.read()
try:
    text = raw.decode('utf-8')
except UnicodeDecodeError:
    text = raw.decode('cp1252', errors='replace')
    with open('src/components/landings/ProductLanding.tsx', 'w', encoding='utf-8') as f:
        f.write(text)
