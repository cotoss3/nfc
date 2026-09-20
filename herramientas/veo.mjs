#!/usr/bin/env node
/**
 * Generador de video con Veo 3 (Gemini API) para los creativos de starTAP.
 *
 * Uso:
 *   node herramientas/veo.mjs "tu prompt aqui"
 *   node herramientas/veo.mjs --prompt-file herramientas/prompts/creativo1.txt
 *
 * Opciones:
 *   --modelo <id>      veo-3.1-generate-preview (def) | veo-3.1-fast-generate-preview | veo-3.1-lite-generate-preview
 *   --formato <ar>     9:16 (def, para Reels/Stories) | 16:9
 *   --resolucion <r>   720p (def) | 1080p | 4k
 *   --duracion <s>     4 | 6 | 8 (def)
 *   --personas <p>     allow_adult (def) | allow_all
 *   --salida <archivo> ruta del .mp4 (def: herramientas/videos/<fecha>-<n>.mp4)
 *
 * La llave se lee de la variable de entorno GEMINI_API_KEY, o de un archivo
 * .env.veo en la raiz del proyecto con la linea:  GEMINI_API_KEY=xxxxx
 * Ese archivo NO se sube a git (esta en .gitignore).
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'https://generativelanguage.googleapis.com/v1beta';

// --- llave ---------------------------------------------------------------
function leerLlave() {
  if (process.env.GEMINI_API_KEY?.trim()) return process.env.GEMINI_API_KEY.trim();
  const env = resolve(RAIZ, '.env.veo');
  if (existsSync(env)) {
    const m = readFileSync(env, 'utf8').match(/^\s*GEMINI_API_KEY\s*=\s*(.+)\s*$/m);
    if (m) return m[1].replace(/^["']|["']$/g, '').trim();
  }
  console.error(
    'Falta la llave.\n' +
    '  1. Sacala en https://aistudio.google.com/apikey (proyecto "DataKorex - Produ")\n' +
    `  2. Crea ${env} con la linea:  GEMINI_API_KEY=tu_llave\n` +
    'Ese archivo esta ignorado por git, no se sube a GitHub.'
  );
  process.exit(1);
}

// --- argumentos ----------------------------------------------------------
function parsear(argv) {
  const o = {
    modelo: 'veo-3.1-generate-preview',
    formato: '9:16',
    resolucion: '720p',
    duracion: '8',
    personas: 'allow_adult',
    salida: null,
    prompt: null,
  };
  const sueltos = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--modelo') o.modelo = argv[++i];
    else if (a === '--formato') o.formato = argv[++i];
    else if (a === '--resolucion') o.resolucion = argv[++i];
    else if (a === '--duracion') o.duracion = String(argv[++i]);
    else if (a === '--personas') o.personas = argv[++i];
    else if (a === '--salida') o.salida = argv[++i];
    else if (a === '--prompt-file') o.prompt = readFileSync(resolve(argv[++i]), 'utf8').trim();
    else sueltos.push(a);
  }
  if (!o.prompt) o.prompt = sueltos.join(' ').trim();
  if (!o.prompt) {
    console.error('Falta el prompt. Ej: node herramientas/veo.mjs "una mano toca un stand NFC en la mesa de un restaurante"');
    process.exit(1);
  }
  if (!o.salida) {
    const sello = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    o.salida = resolve(RAIZ, `herramientas/videos/veo-${sello}.mp4`);
  }
  return o;
}

// --- API -----------------------------------------------------------------
async function pedir(url, llave, init = {}) {
  const res = await fetch(url, {
    ...init,
    headers: { 'x-goog-api-key': llave, 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
  const cuerpo = await res.text();
  if (!res.ok) {
    let detalle = cuerpo;
    try { detalle = JSON.parse(cuerpo)?.error?.message ?? cuerpo; } catch {}
    throw new Error(`${res.status} ${res.statusText} — ${detalle}`);
  }
  return cuerpo ? JSON.parse(cuerpo) : {};
}

async function main() {
  const llave = leerLlave();
  const o = parsear(process.argv.slice(2));

  console.log(`Modelo:     ${o.modelo}`);
  console.log(`Formato:    ${o.formato} · ${o.resolucion} · ${o.duracion}s`);
  console.log(`Prompt:     ${o.prompt.slice(0, 120)}${o.prompt.length > 120 ? '…' : ''}`);
  console.log('');

  const inicio = await pedir(`${BASE}/models/${o.modelo}:predictLongRunning`, llave, {
    method: 'POST',
    body: JSON.stringify({
      instances: [{ prompt: o.prompt }],
      parameters: {
        aspectRatio: o.formato,
        resolution: o.resolucion,
        durationSeconds: o.duracion,
        personGeneration: o.personas,
      },
    }),
  });

  const operacion = inicio.name;
  if (!operacion) throw new Error(`La API no devolvio una operacion: ${JSON.stringify(inicio)}`);
  console.log(`Operacion:  ${operacion}`);
  process.stdout.write('Generando');

  // Veo tarda entre 1 y 6 minutos. Sondeo cada 10s, tope 15 min.
  const TOPE = Date.now() + 15 * 60 * 1000;
  let estado;
  while (true) {
    await new Promise((r) => setTimeout(r, 10_000));
    process.stdout.write('.');
    estado = await pedir(`${BASE}/${operacion}`, llave);
    if (estado.done) break;
    if (Date.now() > TOPE) throw new Error('\nSe paso de 15 minutos. La operacion sigue viva; reconsultala con su nombre.');
  }
  console.log('');

  if (estado.error) throw new Error(`Veo fallo: ${estado.error.message || JSON.stringify(estado.error)}`);

  const muestras =
    estado.response?.generateVideoResponse?.generatedSamples ??
    estado.response?.generatedSamples ??
    estado.response?.videos ?? [];
  const uri = muestras[0]?.video?.uri ?? muestras[0]?.uri;
  if (!uri) throw new Error(`No vino ningun video. Respuesta: ${JSON.stringify(estado.response)}`);

  const res = await fetch(uri, { headers: { 'x-goog-api-key': llave } });
  if (!res.ok) throw new Error(`No se pudo descargar el video: ${res.status} ${res.statusText}`);
  mkdirSync(dirname(o.salida), { recursive: true });
  writeFileSync(o.salida, Buffer.from(await res.arrayBuffer()));

  console.log(`Listo:      ${o.salida}`);
  if (muestras.length > 1) console.log(`(Veo devolvio ${muestras.length} muestras; se guardo la primera)`);
}

main().catch((e) => { console.error(`\n${e.message}`); process.exit(1); });
