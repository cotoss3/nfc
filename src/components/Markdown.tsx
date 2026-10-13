import React from 'react';
import Link from 'next/link';

/**
 * Renderizador de markdown mínimo, sin dependencias.
 * Cubre lo que usamos en el blog: ##, ###, párrafos, listas con - y 1.,
 * **negrita**, *cursiva* y [enlaces](url).
 *
 * Si algún día el contenido necesita tablas o imágenes embebidas,
 * conviene cambiar a react-markdown en vez de estirar esto.
 */

function inline(texto: string, keyBase: string): React.ReactNode[] {
  const partes: React.ReactNode[] = [];
  // enlaces, negrita, cursiva
  const regex = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let ultimo = 0;
  let m: RegExpExecArray | null;
  let i = 0;

  while ((m = regex.exec(texto)) !== null) {
    if (m.index > ultimo) partes.push(texto.slice(ultimo, m.index));

    if (m[1] && m[2]) {
      const href = m[2];
      const externo = href.startsWith('http');
      partes.push(
        externo ? (
          <a
            key={`${keyBase}-a-${i}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-600 underline underline-offset-2 hover:text-accent-700"
          >
            {m[1]}
          </a>
        ) : (
          <Link
            key={`${keyBase}-a-${i}`}
            href={href}
            className="text-accent-600 underline underline-offset-2 hover:text-accent-700"
          >
            {m[1]}
          </Link>
        )
      );
    } else if (m[3]) {
      partes.push(
        <strong key={`${keyBase}-b-${i}`} className="font-bold text-brand-950">
          {m[3]}
        </strong>
      );
    } else if (m[4]) {
      partes.push(<em key={`${keyBase}-i-${i}`}>{m[4]}</em>);
    }

    ultimo = m.index + m[0].length;
    i++;
  }

  if (ultimo < texto.length) partes.push(texto.slice(ultimo));
  return partes;
}

function renderTableCell(cell: string, keyBase: string): React.ReactNode {
  const c = cell.trim();
  const cleanWord = c.replace(/\*/g, '').trim().toLowerCase();
  if (cleanWord === 'sí' || cleanWord === 'si') {
    return (
      <span key={keyBase} className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Sí
      </span>
    );
  }
  if (cleanWord === 'no') {
    return (
      <span key={keyBase} className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        No
      </span>
    );
  }
  return inline(cell, keyBase);
}

/** Convierte un encabezado en un id estable para anclas y tabla de contenidos */
export function slugificar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[¿?¡!.,:;()"']/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export function extraerEncabezados(markdown: string): { texto: string; id: string }[] {
  return markdown
    .split('\n')
    .filter((l) => l.startsWith('## '))
    .map((l) => {
      const texto = l.replace(/^##\s+/, '').trim();
      return { texto, id: slugificar(texto) };
    });
}

export default function Markdown({ children }: { children: string }) {
  const lineas = children.split('\n');
  const salida: React.ReactNode[] = [];
  let lista: string[] = [];
  let listaOrdenada = false;
  let tablaLineas: string[] = [];
  let k = 0;

  const cerrarLista = () => {
    if (!lista.length) return;
    const items = lista.map((li, idx) => (
      <li key={`li-${k}-${idx}`} className="pl-1">
        {inline(li, `li-${k}-${idx}`)}
      </li>
    ));
    salida.push(
      listaOrdenada ? (
        <ol key={`ol-${k++}`} className="list-decimal pl-6 space-y-2 text-brand-600 my-6">
          {items}
        </ol>
      ) : (
        <ul key={`ul-${k++}`} className="list-disc pl-6 space-y-2 text-brand-600 my-6">
          {items}
        </ul>
      )
    );
    lista = [];
  };

  const parseFilaTabla = (linea: string): string[] => {
    let clean = linea.trim();
    if (clean.startsWith('|')) clean = clean.slice(1);
    if (clean.endsWith('|')) clean = clean.slice(0, -1);
    return clean.split('|').map((c) => c.trim());
  };

  const esSeparadorTabla = (celdas: string[]): boolean => {
    return celdas.length > 0 && celdas.every((c) => /^:?-+:?$/.test(c));
  };

  const cerrarTabla = () => {
    if (!tablaLineas.length) return;

    const filasRaw = tablaLineas.map(parseFilaTabla);
    if (!filasRaw.length) {
      tablaLineas = [];
      return;
    }

    const headers = filasRaw[0];
    let bodyRows = filasRaw.slice(1);

    if (bodyRows.length && esSeparadorTabla(bodyRows[0])) {
      bodyRows = bodyRows.slice(1);
    }

    salida.push(
      <div
        key={`table-wrapper-${k++}`}
        className="not-prose my-8 rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden"
      >
        {/* Barra superior de acento con gradiente de marca starTAP */}
        <div className="h-1.5 bg-gradient-to-r from-[#01A6D2] via-[#0194bc] to-[#01A6D2]" />

        <div className="overflow-x-auto scrollbar-thin">
          <table className="min-w-[480px] sm:min-w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-950 text-white divide-x divide-slate-800">
                {headers.map((h, i) => (
                  <th
                    key={`th-${k}-${i}`}
                    className="px-4 py-3 sm:px-6 sm:py-3.5 font-black uppercase tracking-wider text-xs sm:text-sm text-white"
                  >
                    {inline(h || 'Característica', `th-${k}-${i}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bodyRows.map((row, rIdx) => (
                <tr
                  key={`tr-${k}-${rIdx}`}
                  className="odd:bg-white even:bg-slate-50/50 hover:bg-[#01A6D2]/5 transition-colors divide-x divide-slate-100"
                >
                  {row.map((cell, cIdx) => (
                    <td
                      key={`td-${k}-${rIdx}-${cIdx}`}
                      className={`px-4 py-3 sm:px-6 sm:py-3.5 align-middle ${
                        cIdx === 0
                          ? 'font-bold text-slate-950 bg-slate-50/40'
                          : 'text-slate-600'
                      }`}
                    >
                      {renderTableCell(cell, `td-${k}-${rIdx}-${cIdx}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Indicador móvil interactivo con branding starTAP */}
        <div className="sm:hidden px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span>← Desliza para comparar →</span>
          <span className="font-bold text-[#01A6D2]">starTAP Panamá</span>
        </div>
      </div>
    );

    tablaLineas = [];
  };

  for (const linea of lineas) {
    const l = linea.trim();

    if (!l) {
      cerrarLista();
      cerrarTabla();
      continue;
    }

    if (l.startsWith('|') && l.endsWith('|')) {
      cerrarLista();
      tablaLineas.push(l);
      continue;
    }

    cerrarTabla();

    const imgMatch = l.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      cerrarLista();
      const alt = imgMatch[1];
      const src = imgMatch[2];
      if (src.startsWith('placeholder:')) {
        const rutaSugerida = src.replace(/^placeholder:/, '');
        salida.push(
          <figure
            key={`fig-${k++}`}
            className="my-8 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/40 p-6 sm:p-8 text-center"
          >
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-amber-600 shadow-xs border border-amber-200 font-black text-lg">
              📷
            </div>
            <p className="text-[11px] font-black uppercase tracking-widest text-amber-800">
              Espacio para foto del artículo
            </p>
            <p className="mt-2 text-sm font-semibold text-brand-800 max-w-xl mx-auto leading-relaxed">
              {alt}
            </p>
            {rutaSugerida && (
              <p className="mt-2 text-xs font-mono text-brand-500">
                Archivo sugerido: <code className="bg-white px-2 py-0.5 rounded border border-brand-200">{rutaSugerida}</code>
              </p>
            )}
          </figure>
        );
        continue;
      }
      salida.push(
        <figure key={`fig-${k++}`} className="my-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="w-full max-h-[480px] object-cover rounded-2xl shadow-sm border border-brand-100"
            loading="lazy"
          />
          {alt && (
            <figcaption className="text-center text-xs text-brand-500 mt-2.5 italic">
              {alt}
            </figcaption>
          )}
        </figure>
      );
      continue;
    }

    if (l.startsWith('### ')) {
      cerrarLista();
      const t = l.replace(/^###\s+/, '');
      salida.push(
        <h3 key={`h3-${k++}`} id={slugificar(t)} className="text-xl font-bold text-brand-950 mt-10 mb-3">
          {inline(t, `h3-${k}`)}
        </h3>
      );
      continue;
    }

    if (l.startsWith('## ')) {
      cerrarLista();
      const t = l.replace(/^##\s+/, '');
      salida.push(
        <h2
          key={`h2-${k++}`}
          id={slugificar(t)}
          className="text-2xl sm:text-3xl font-black text-brand-950 mt-14 mb-4 scroll-mt-24"
        >
          {inline(t, `h2-${k}`)}
        </h2>
      );
      continue;
    }

    const ordenada = /^\d+\.\s+/.test(l);
    if (l.startsWith('- ') || ordenada) {
      if (lista.length && listaOrdenada !== ordenada) cerrarLista();
      listaOrdenada = ordenada;
      lista.push(l.replace(/^(-|\d+\.)\s+/, ''));
      continue;
    }

    cerrarLista();
    salida.push(
      <p key={`p-${k++}`} className="text-brand-600 leading-relaxed my-5">
        {inline(l, `p-${k}`)}
      </p>
    );
  }

  cerrarLista();
  cerrarTabla();
  return <>{salida}</>;
}
