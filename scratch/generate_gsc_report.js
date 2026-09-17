const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');

const keyPath = 'C:\\Users\\fcontreras\\Desktop\\Vitales locales\\Search_coto.json';
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
      scope: 'https://www.googleapis.com/auth/webmasters.readonly',
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
          const data = JSON.parse(body);
          resolve(data.access_token);
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
          resolve(JSON.parse(body));
        } catch {
          resolve(body);
        }
      });
    });
    req.on('error', reject);
    if (postBody) req.write(JSON.stringify(postBody));
    req.end();
  });
}

function getDateDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

async function runReport() {
  const token = await getAccessToken();
  const sites = await apiRequest(token, 'GET', '/webmasters/v3/sites');

  const reportData = {};

  const endDate = getDateDaysAgo(1); // yesterday
  const startDate30 = getDateDaysAgo(30);
  const startDate7 = getDateDaysAgo(7);
  const startDate90 = getDateDaysAgo(90);

  if (sites.siteEntry) {
    for (const site of sites.siteEntry) {
      const siteUrl = site.siteUrl;
      reportData[siteUrl] = {
        siteUrl,
        permissionLevel: site.permissionLevel,
        periods: {}
      };

      const periods = [
        { name: '7_days', startDate: startDate7 },
        { name: '30_days', startDate: startDate30 },
        { name: '90_days', startDate: startDate90 },
      ];

      for (const p of periods) {
        const summary = await apiRequest(token, 'POST', `/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
          startDate: p.startDate,
          endDate,
          dimensions: []
        });

        const queries = await apiRequest(token, 'POST', `/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
          startDate: p.startDate,
          endDate,
          dimensions: ['query'],
          rowLimit: 25
        });

        const pages = await apiRequest(token, 'POST', `/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
          startDate: p.startDate,
          endDate,
          dimensions: ['page'],
          rowLimit: 25
        });

        const countries = await apiRequest(token, 'POST', `/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
          startDate: p.startDate,
          endDate,
          dimensions: ['country'],
          rowLimit: 10
        });

        const devices = await apiRequest(token, 'POST', `/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
          startDate: p.startDate,
          endDate,
          dimensions: ['device'],
          rowLimit: 5
        });

        const dates = await apiRequest(token, 'POST', `/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
          startDate: p.startDate,
          endDate,
          dimensions: ['date']
        });

        reportData[siteUrl].periods[p.name] = {
          summary: summary.rows ? summary.rows[0] : { clicks: 0, impressions: 0, ctr: 0, position: 0 },
          queries: queries.rows || [],
          pages: pages.rows || [],
          countries: countries.rows || [],
          devices: devices.rows || [],
          dailyTrend: dates.rows || []
        };
      }
    }
  }

  fs.writeFileSync('scratch/gsc_full_report.json', JSON.stringify(reportData, null, 2));
  console.log('Full GSC report generated successfully in scratch/gsc_full_report.json');
}

runReport().catch(console.error);
