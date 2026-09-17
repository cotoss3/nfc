const fs = require('fs');
const data = JSON.parse(fs.readFileSync('scratch/gsc_full_report.json', 'utf8'));
console.log('Site keys:', Object.keys(data));
