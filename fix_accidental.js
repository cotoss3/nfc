const fs = require('fs');
let file = 'src/app/master-control/pedidos/[id]/page.tsx';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(/payment_status === 'delivered'/g, "payment_status === 'completed'");
fs.writeFileSync(file, code);

let file2 = 'src/app/master-control/pedidos/page.tsx';
let code2 = fs.readFileSync(file2, 'utf8');
code2 = code2.replace(/payment_status === 'delivered'/g, "payment_status === 'completed'");
fs.writeFileSync(file2, code2);
console.log('Fixed accidental replacement.');
