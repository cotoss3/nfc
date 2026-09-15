const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = (match[2] || '').trim();
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      process.env[match[1]] = value;
    }
  });
}

const apiuser = process.env.TILOPAY_API_USER;
const password = process.env.TILOPAY_API_PASSWORD;
const key = process.env.TILOPAY_API_KEY;

async function consult(orderNumber) {
  const tokenRes = await fetch('https://app.tilopay.com/api/v1/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiuser, password, key })
  });
  const tokenData = await tokenRes.json();
  const token = tokenData.access_token;

  const res = await fetch('https://app.tilopay.com/api/v1/consult', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `bearer ${token}`,
    },
    body: JSON.stringify({
      key: key,
      orderNumber: orderNumber,
    }),
  });

  return await res.json();
}

async function testAll() {
  console.log('Testing consult with PFC026299-STP-98393535:');
  console.log(await consult('PFC026299-STP-98393535'));

  console.log('\nTesting consult with STP-98393535:');
  console.log(await consult('STP-98393535'));
}

testAll();
