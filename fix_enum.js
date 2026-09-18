const fs = require('fs');

const files = [
  'src/app/api/yappy/callback/route.ts',
  'src/app/master-control/pedidos/page.tsx',
  'src/app/master-control/pedidos/[id]/page.tsx'
];

files.forEach(f => {
  let code = fs.readFileSync(f, 'utf8');
  code = code.replace(/'paid'/g, "'completed'");
  fs.writeFileSync(f, code);
});
console.log('Fixed payment_status enum.');
