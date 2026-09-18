const fs = require('fs');
let file = 'src/components/checkout/YappyButton.tsx';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(/trackGA\('purchase_yappy'/g, "trackGA('purchase'");
fs.writeFileSync(file, code);
console.log('Fixed GA event.');
