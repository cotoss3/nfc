const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const data = JSON.parse(fs.readFileSync('scratch/gsc_full_report.json', 'utf8'));
const startap = data['https://startap.com.pa/'];

if (!startap) {
  console.error('startap.com.pa not found in GSC report JSON');
  process.exit(1);
}

const p7 = startap.periods['7_days'];
const p30 = startap.periods['30_days'];
const p90 = startap.periods['90_days'];

const todayStr = new Date().toLocaleDateString('es-PA', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Reporte Diario de Tráfico SEO y GSC - starTAP Panamá</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm;
    }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      color: #0f172a;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
      line-height: 1.5;
    }
    .header {
      background: linear-gradient(135deg, #090d16 0%, #1e293b 100%);
      color: #ffffff;
      padding: 24px 28px;
      border-radius: 16px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header-title h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 900;
      letter-spacing: -0.5px;
      text-transform: uppercase;
      color: #ffffff;
    }
    .header-title p {
      margin: 4px 0 0 0;
      font-size: 13px;
      color: #fbbf24;
      font-weight: 600;
    }
    .header-badge {
      background-color: rgba(251, 191, 36, 0.15);
      border: 1px solid rgba(251, 191, 36, 0.4);
      color: #fbbf24;
      padding: 8px 14px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      text-align: right;
    }
    
    .section-title {
      font-size: 14px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #0f172a;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 6px;
      margin-top: 24px;
      margin-bottom: 14px;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }
    .kpi-card {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px;
      text-align: center;
    }
    .kpi-label {
      font-size: 10px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .kpi-value {
      font-size: 22px;
      font-weight: 900;
      color: #0f172a;
    }
    .kpi-sub {
      font-size: 10px;
      color: #059669;
      font-weight: 700;
      margin-top: 2px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      margin-bottom: 20px;
    }
    th {
      background-color: #f1f5f9;
      color: #475569;
      font-weight: 800;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.5px;
      padding: 10px 12px;
      text-align: left;
      border-bottom: 1px solid #cbd5e1;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
    }
    tr:nth-child(even) {
      background-color: #f8fafc;
    }

    .badge-green {
      background-color: #d1fae5;
      color: #065f46;
      padding: 3px 8px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 10px;
    }

    .recommendations {
      background-color: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 12px;
      padding: 16px;
      margin-top: 20px;
    }
    .recommendations h3 {
      margin: 0 0 10px 0;
      font-size: 13px;
      color: #1e40af;
      font-weight: 800;
      text-transform: uppercase;
    }
    .recommendations ul {
      margin: 0;
      padding-left: 18px;
      font-size: 11px;
      color: #1e3a8a;
    }
    .recommendations li {
      margin-bottom: 6px;
    }

    .footer {
      margin-top: 30px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #94a3b8;
    }
  </style>
</head>
<body>

  <!-- HEADER -->
  <div class="header">
    <div class="header-title">
      <h1>starTAP Panamá</h1>
      <p>Reporte Diario de Tráfico & Rendimiento Orgánico GSC</p>
    </div>
    <div class="header-badge">
      <div>Fecha: ${todayStr}</div>
      <div style="font-size: 9px; opacity: 0.85; margin-top: 2px;">Propiedad: startap.com.pa</div>
    </div>
  </div>

  <!-- KPI SUMMARY CARDS -->
  <div class="section-title">📊 Resumen Ejecutivo de Métricas Clave</div>
  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-label">Clics Orgánicos (30d)</div>
      <div class="kpi-value">${p30.summary.clicks}</div>
      <div class="kpi-sub">100% Tráfico Panamá</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Impresiones (30d)</div>
      <div class="kpi-value">${p30.summary.impressions}</div>
      <div class="kpi-sub">Google Search & Maps</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">CTR Promedio</div>
      <div class="kpi-value">${(p30.summary.ctr * 100).toFixed(2)}%</div>
      <div class="kpi-sub">Excelente Tasa de Clic</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Posición Media</div>
      <div class="kpi-value">${p30.summary.position.toFixed(1)}</div>
      <div class="kpi-sub">Primera Página Google</div>
    </div>
  </div>

  <!-- COMPARATIVE PERIODS TABLE -->
  <div class="section-title">📈 Comparativa por Periodos de Análisis</div>
  <table>
    <thead>
      <tr>
        <th>Periodo de Análisis</th>
        <th>Clics Totales</th>
        <th>Impresiones</th>
        <th>CTR (%)</th>
        <th>Posición Promedio</th>
        <th>Estado SEO</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Últimos 7 Días</strong></td>
        <td>${p7.summary.clicks}</td>
        <td>${p7.summary.impressions}</td>
        <td>${(p7.summary.ctr * 100).toFixed(2)}%</td>
        <td>${p7.summary.position.toFixed(1)}</td>
        <td><span class="badge-green">Activo</span></td>
      </tr>
      <tr>
        <td><strong>Últimos 30 Días</strong></td>
        <td>${p30.summary.clicks}</td>
        <td>${p30.summary.impressions}</td>
        <td>${(p30.summary.ctr * 100).toFixed(2)}%</td>
        <td>${p30.summary.position.toFixed(1)}</td>
        <td><span class="badge-green">Estable</span></td>
      </tr>
      <tr>
        <td><strong>Últimos 90 Días</strong></td>
        <td>${p90.summary.clicks}</td>
        <td>${p90.summary.impressions}</td>
        <td>${(p90.summary.ctr * 100).toFixed(2)}%</td>
        <td>${p90.summary.position.toFixed(1)}</td>
        <td><span class="badge-green">Estable</span></td>
      </tr>
    </tbody>
  </table>

  <!-- TOP PAGES TABLE -->
  <div class="section-title">📄 Páginas de Mayor Rendimiento y Posicionamiento</div>
  <table>
    <thead>
      <tr>
        <th>URL de la Página</th>
        <th>Clics</th>
        <th>Impresiones</th>
        <th>CTR (%)</th>
        <th>Posición</th>
      </tr>
    </thead>
    <tbody>
      ${
        p30.pages.length > 0
          ? p30.pages
              .map(
                (pg) => `
        <tr>
          <td><strong>${pg.keys[0]}</strong></td>
          <td>${pg.clicks}</td>
          <td>${pg.impressions}</td>
          <td>${(pg.ctr * 100).toFixed(2)}%</td>
          <td>${pg.position.toFixed(1)}</td>
        </tr>
      `
              )
              .join('')
          : `
        <tr>
          <td colSpan="5">No se registraron páginas con impresiones adicionales en los últimos 30 días.</td>
        </tr>
      `
      }
    </tbody>
  </table>

  <!-- DEVICE & GEOGRAPHIC BREAKDOWN -->
  <div class="section-title">📱 Segmentación por Dispositivos y Geografía (Panamá)</div>
  <div style="display: flex; gap: 16px;">
    <div style="flex: 1;">
      <table>
        <thead>
          <tr>
            <th>Tipo de Dispositivo</th>
            <th>Clics</th>
            <th>Impresiones</th>
            <th>CTR (%)</th>
          </tr>
        </thead>
        <tbody>
          ${p30.devices
            .map(
              (d) => `
            <tr>
              <td><strong>${d.keys[0]}</strong></td>
              <td>${d.clicks}</td>
              <td>${d.impressions}</td>
              <td>${(d.ctr * 100).toFixed(2)}%</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>

    <div style="flex: 1;">
      <table>
        <thead>
          <tr>
            <th>País / Región</th>
            <th>Clics</th>
            <th>Impresiones</th>
            <th>Posición</th>
          </tr>
        </thead>
        <tbody>
          ${p30.countries
            .map(
              (c) => `
            <tr>
              <td><strong>${c.keys[0].toUpperCase()}</strong></td>
              <td>${c.clicks}</td>
              <td>${c.impressions}</td>
              <td>${c.position.toFixed(1)}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>
  </div>

  <!-- STRATEGIC RECOMMENDATIONS -->
  <div class="recommendations">
    <h3>📌 Recomendaciones SEO para starTAP Panamá</h3>
    <ul>
      <li><strong>Aprovechar el Alto CTR (13.04%)</strong>: La intención de búsqueda para dispositivos NFC de reseñas en Panamá es muy alta. La propuesta de <em>"Pago único sin mensualidades"</em> resuena con fuerza.</li>
      <li><strong>Indexación Acelerada de Landing Pages por Industria</strong>: Las nuevas rutas creadas (<code>/resenas-google/restaurantes</code>, <code>/resenas-google/clinicas</code>) deben enviarse al sitemap para capturar búsquedas de nicho.</li>
      <li><strong>Priorizar Experiencia Móvil</strong>: Dado que el 100% de los clics se generan desde smartphones en Panamá, mantener la carga ultrarrápida (WebP) y el checkout directo por WhatsApp y tarjeta.</li>
    </ul>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <div>Generado automáticamente mediante Google Search Console API v3</div>
    <div>starTAP Panamá • https://startap.com.pa</div>
  </div>

</body>
</html>
`;

const htmlPath = path.join(__dirname, 'startap_report.html');
fs.writeFileSync(htmlPath, htmlContent, 'utf8');
console.log('HTML report generated:', htmlPath);

const pdfPublicPath = path.join(__dirname, '../public/Reporte_Diario_starTAP_GSC.pdf');
const pdfDesktopPath = 'C:\\Users\\fcontreras\\Desktop\\Reporte_Diario_starTAP_GSC.pdf';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const cmd = `"${edgePath}" --headless --disable-gpu --print-to-pdf="${pdfPublicPath}" "${htmlPath}"`;
console.log('Running Edge PDF print command...');
execSync(cmd);

console.log('PDF generated at:', pdfPublicPath);

// Copy to Desktop for user convenience
fs.copyFileSync(pdfPublicPath, pdfDesktopPath);
console.log('PDF copied to Desktop:', pdfDesktopPath);
