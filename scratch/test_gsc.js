const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');

const keyPath = 'C:\\Users\\fcontreras\\Desktop\\Vitales locales\\Search_coto.json';

if (!fs.existsSync(keyPath)) {
  console.error('Key file not found at:', keyPath);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function getAccessToken() {
  return new Promise((resolve, reject) => {
    const now = Math.floor(Date.now() / 1000);
    const header = { alg: 'RS256', typ: 'JWT' };
    const claimSet = {
      iss: serviceAccount.client_email,
      scope: 'https://www.googleapis.com/auth/webmasters.readonly https://www.googleapis.com/auth/webmasters',
      aud: serviceAccount.token_uri,
      exp: now + 3600,
      iat: now,
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedClaimSet = base64UrlEncode(JSON.stringify(claimSet));
    const signatureInput = `${encodedHeader}.${encodedClaimSet}`;

    const signer = crypto.createSign('RSA-SHA256');
    signer.update(signatureInput);
    const signature = signer.sign(serviceAccount.private_key, 'base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const jwt = `${signatureInput}.${signature}`;

    const postData = new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }).toString();

    const req = https.request(
      serviceAccount.token_uri,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            if (data.access_token) {
              resolve(data.access_token);
            } else {
              reject(new Error('Failed to get access token: ' + body));
            }
          } catch (e) {
            reject(e);
          }
        });
      }
    );

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function apiRequest(accessToken, method, urlPath, postBody = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'www.googleapis.com',
      path: urlPath,
      method: method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          resolve(data);
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on('error', reject);
    if (postBody) {
      req.write(JSON.stringify(postBody));
    }
    req.end();
  });
}

async function main() {
  try {
    console.log('Authenticating with Google Service Account:', serviceAccount.client_email);
    const token = await getAccessToken();
    console.log('Access token obtained successfully.');

    console.log('\n--- Fetching Verified Sites in Search Console ---');
    const sites = await apiRequest(token, 'GET', '/webmasters/v3/sites');
    console.log('Sites:', JSON.stringify(sites, null, 2));

    if (sites.siteEntry && sites.siteEntry.length > 0) {
      for (const site of sites.siteEntry) {
        console.log(`\n========================================`);
        console.log(`Querying GSC Traffic Data for Site: ${site.siteUrl}`);
        console.log(`========================================`);

        // Query last 30 days
        const endDate = new Date().toISOString().split('T')[0];
        const startDateObj = new Date();
        startDateObj.setDate(startDateObj.getDate() - 30);
        const startDate = startDateObj.toISOString().split('T')[0];

        // Overall summary
        const summary = await apiRequest(token, 'POST', `/webmasters/v3/sites/${encodeURIComponent(site.siteUrl)}/searchAnalytics/query`, {
          startDate,
          endDate,
          dimensions: [],
          rowLimit: 1
        });
        console.log('\nSummary (Last 30 Days):', JSON.stringify(summary, null, 2));

        // Top Queries
        const queries = await apiRequest(token, 'POST', `/webmasters/v3/sites/${encodeURIComponent(site.siteUrl)}/searchAnalytics/query`, {
          startDate,
          endDate,
          dimensions: ['query'],
          rowLimit: 15
        });
        console.log('\nTop 15 Search Queries:', JSON.stringify(queries, null, 2));

        // Top Pages
        const pages = await apiRequest(token, 'POST', `/webmasters/v3/sites/${encodeURIComponent(site.siteUrl)}/searchAnalytics/query`, {
          startDate,
          endDate,
          dimensions: ['page'],
          rowLimit: 15
        });
        console.log('\nTop 15 Pages:', JSON.stringify(pages, null, 2));

        // Top Countries
        const countries = await apiRequest(token, 'POST', `/webmasters/v3/sites/${encodeURIComponent(site.siteUrl)}/searchAnalytics/query`, {
          startDate,
          endDate,
          dimensions: ['country'],
          rowLimit: 10
        });
        console.log('\nTop Countries:', JSON.stringify(countries, null, 2));

        // Top Devices
        const devices = await apiRequest(token, 'POST', `/webmasters/v3/sites/${encodeURIComponent(site.siteUrl)}/searchAnalytics/query`, {
          startDate,
          endDate,
          dimensions: ['device'],
          rowLimit: 5
        });
        console.log('\nTop Devices:', JSON.stringify(devices, null, 2));
      }
    }
  } catch (err) {
    console.error('GSC Fetch Error:', err);
  }
}

main();
