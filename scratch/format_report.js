const fs = require('fs');

const data = JSON.parse(fs.readFileSync('scratch/gsc_full_report.json', 'utf8'));

console.log('=== SITES SUMMARY ===');
for (const siteUrl of Object.keys(data)) {
  console.log(`\nSite: ${siteUrl}`);
  const periods = data[siteUrl].periods;

  for (const pName of ['7_days', '30_days', '90_days']) {
    const pData = periods[pName];
    if (pData) {
      const s = pData.summary;
      console.log(`  [${pName}] Clicks: ${s.clicks}, Impressions: ${s.impressions}, CTR: ${(s.ctr * 100).toFixed(2)}%, Avg Position: ${s.position.toFixed(1)}`);
    }
  }

  console.log('  Top 5 Queries (30d):', periods['30_days'].queries.slice(0, 5).map(q => `${q.keys[0]} (clicks: ${q.clicks}, imp: ${q.impressions}, pos: ${q.position.toFixed(1)})`));
  console.log('  Top 5 Pages (30d):', periods['30_days'].pages.slice(0, 5).map(p => `${p.keys[0]} (clicks: ${p.clicks}, imp: ${p.impressions})`));
}
