const fs = require('fs');
let code = fs.readFileSync('src/app/master-control/page.tsx', 'utf8');

// The code currently has:
// </main>
// 
// {/* --- MOBILE APP STICKY BOTTOM NAVIGATION BAR --- */}
// <nav> ... </nav>

// We need to delete from </main> onwards, and replace it with just </main>
code = code.replace(/<\/main>[\s\S]*/, '</main>\n  );\n}\n');

fs.writeFileSync('src/app/master-control/page.tsx', code);
console.log('Fixed JSX root error.');
