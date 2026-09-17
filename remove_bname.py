import re

with open('src/components/landings/ProductLanding.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the state
content = re.sub(r"\s*const \[businessName, setBusinessName\] = useState\(''\);", "", content)

# Remove the alert block
content = re.sub(r"\s*if \(\!businessName\) \{[^}]*return;\s*\}", "", content)

# Remove business_name from addToCart calls
content = re.sub(r"\s*business_name:\s*businessName,", "", content)
content = re.sub(r"\s*initial_redirect_url:\s*businessName\s*\|\|\s*'',", "", content)

with open('src/components/landings/ProductLanding.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Removed all businessName references.")
