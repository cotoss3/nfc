import re

with open(r"src\app\catalogo\[id]\page.tsx", 'r', encoding='utf-8') as f:
    content = f.read()

# Add standard og:type and product meta tags to OpenGraph
og_search = """    openGraph: {
      title: `${product.name} en Panamá | starTAP`,
      description: shortDesc.slice(0, 160),
      url: `${BASE_URL}/catalogo/${product.id}`,
      siteName: 'starTAP Panamá',
      images: product.image ? [`${BASE_URL}${product.image}`] : undefined,
    },"""

og_replace = """    openGraph: {
      title: `${product.name} en Panamá | starTAP`,
      description: shortDesc.slice(0, 160),
      url: `${BASE_URL}/catalogo/${product.id}`,
      siteName: 'starTAP Panamá',
      images: product.image ? [`${BASE_URL}${product.image}`] : undefined,
      type: 'website', // Facebook uses og:type
    },
    // Meta (Facebook/Instagram) Catalog Product Tags
    other: {
      'product:price:amount': product.price.toFixed(2),
      'product:price:currency': 'USD',
      'product:availability': 'in stock',
      'product:condition': 'new',
      'product:retailer_item_id': product.sku || `STP-${product.id.toUpperCase()}`
    },"""

# Fix accented characters if they were mangled
og_search_mangled = """    openGraph: {
      title: `${product.name} en Panamǭ | starTAP`,
      description: shortDesc.slice(0, 160),
      url: `${BASE_URL}/catalogo/${product.id}`,
      siteName: 'starTAP Panamǭ',
      images: product.image ? [`${BASE_URL}${product.image}`] : undefined,
    },"""

if og_search in content:
    content = content.replace(og_search, og_replace)
elif og_search_mangled in content:
    content = content.replace(og_search_mangled, og_replace)
else:
    print("Warning: Could not find openGraph block to patch.")

# Also let's fix any mangled Panamǭ in the file
content = content.replace('Panamǭ', 'Panamá')
content = content.replace('ǧnico', 'único')
content = content.replace('snico', 'único')
content = content.replace('Envos', 'Envíos')
content = content.replace('pas', 'país')
content = content.replace('Reseas', 'Reseñas')

with open(r"src\app\catalogo\[id]\page.tsx", 'w', encoding='utf-8') as f:
    f.write(content)

print("SEO tags for Meta Catalog updated.")
