# CLAUDE.md — starTAP (reglas de trabajo para ahorrar tokens)

## Lee esto primero, no explores el repo
- Mapa del proyecto: `PROJECT_MEMORY.md` (rutas, branding, DB, convenciones).
- Grafo de código: `graphify-out/GRAPH_REPORT.md` y `graphify-out/graph.json`.
  Consulta: `py -m graphify.cli query "pregunta"` en vez de leer archivos completos.
- Auditoría vigente y deuda técnica: `AUDIT.md`.

## Reglas anti-desperdicio de tokens
1. NUNCA leer archivos completos >300 líneas. Usar `grep -n` y `sed -n 'A,Bp'` para el bloque exacto.
2. NUNCA leer: `node_modules/`, `.next/`, `package-lock.json`, `graphify-out/cache/`, `.graphify_ast.json`, imágenes/PNG.
3. Archivos grandes conocidos (usar grep, no cat): `src/app/dashboard/page.tsx` (1530), `src/app/master-control/page.tsx` (1308), `src/lib/db.ts` (954), `src/app/app/page.tsx` (947).
4. Editar con `sed -i` / parche puntual. No reescribir archivos enteros salvo que sean <150 líneas.
5. Un solo comando bash encadenado (`&&`) por paso en lugar de muchas llamadas.
6. No ejecutar `npm run build` para verificar cambios pequeños; usar `npx tsc --noEmit` si hace falta.
7. Al terminar una sesión con cambios estructurales: actualizar `PROJECT_MEMORY.md` (2-3 líneas), no regenerar el documento.

## Convenciones
- Rutas admin reales: `/master-control` (NO `/admin`).
- Códigos de dispositivo: `STT-1001`... ; redirección en `src/app/r/[id]/route.ts`.
- Acento cyan `#01A6D2`, negro `#000`, blanco `#fff`.
