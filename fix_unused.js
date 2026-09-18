const fs = require('fs');
let file = 'src/app/cart/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Remove YappyBadge function
code = code.replace(/function YappyBadge\(\) \{[\s\S]*?\}\n/g, "");

// Remove generateWhatsAppMessage function
code = code.replace(/const generateWhatsAppMessage = \(\) => \{[\s\S]*?return encodeURI\(message\);\n  \};\n/g, "");

fs.writeFileSync(file, code);
console.log('Removed unused functions.');
