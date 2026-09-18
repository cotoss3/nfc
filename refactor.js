const fs = require('fs');
let code = fs.readFileSync('src/app/master-control/page.tsx', 'utf8');

// Replace the return block wrapper
// We want to remove the <div className="min-h-screen...flex... flex-col md:flex-row">
// and the <aside> and <nav> for mobile.

let newCode = code.replace(/<div className="min-h-screen[^>]*>[\s\S]*?<main[^>]*>/, '<main className="flex-1 w-full">');
newCode = newCode.replace(/<\/main>\s*<\/div>\s*<\/AdminAuthGuard>/, '</main>');

// We also need to remove AdminAuthGuard from the page.tsx because it's now in the layout.
// Let's just remove the AdminAuthGuard wrapper from the return block.
newCode = newCode.replace(/<AdminAuthGuard>\s*<main/, '<main');
// We already removed </AdminAuthGuard> in the previous step.

fs.writeFileSync('src/app/master-control/page.tsx', newCode);
console.log('Refactor complete.');
