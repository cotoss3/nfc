const fs = require('fs');

let file = 'src/app/master-control/pedidos/[id]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace order.status === 'completed' with 'delivered'
code = code.replace(/'completed'/g, "'delivered'");

fs.writeFileSync(file, code);

// Same for the page.tsx list view
let file2 = 'src/app/master-control/pedidos/page.tsx';
let code2 = fs.readFileSync(file2, 'utf8');
code2 = code2.replace(/status === 'completed'/g, "status === 'delivered'");
code2 = code2.replace(/value="completed"/g, "value=\"delivered\"");
fs.writeFileSync(file2, code2);

console.log('Fixed status enum.');
