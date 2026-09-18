const fs = require('fs');

let file = 'src/app/master-control/pedidos/[id]/page.tsx';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(/dbLocal\.updateOrder\(/g, "dbLocal.updateOrderDetails(");
fs.writeFileSync(file, code);
console.log('Fixed updateOrderDetails.');
