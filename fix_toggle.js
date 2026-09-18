const fs = require('fs');
let file = 'src/app/master-control/pedidos/[id]/page.tsx';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(/const newStatus = order\.payment_status === 'completed' \? 'pending' \: 'delivered';/g, "const newStatus = order.payment_status === 'completed' ? 'pending' : 'completed';");
fs.writeFileSync(file, code);
console.log('Fixed button toggle.');
