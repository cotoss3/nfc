'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ClipboardCheck,
  RotateCcw,
  Send,
  CheckCircle2,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

type Respuesta = 'si' | 'no' | 'nose';

interface Pregunta {
  id: number;
  texto: string;
}

const PREGUNTAS: Pregunta[] = [
  { id: 1, texto: '¿Tu ficha está reclamada y verificada?' },
  { id: 2, texto: '¿Tienes más de una ficha del mismo negocio?' },
  { id: 3, texto: '¿La categoría principal describe lo que la gente busca?' },
  { id: 4, texto: '¿Te llegó alguna reseña nueva en los últimos 30 días?' },
  { id: 5, texto: '¿Tu nombre, dirección y teléfono están escritos igual en todos lados?' },
  { id: 6, texto: '¿Tienes fotos tuyas subidas este año?' },
];

const OPCIONES: { valor: Respuesta; etiqueta: string }[] = [
  { valor: 'si', etiqueta: 'Sí' },
  { valor: 'no', etiqueta: 'No' },
  { valor: 'nose', etiqueta: 'No sé' },
];

interface Hallazgo {
  titulo: string;
  cuerpo: React.ReactNode;
}

function construirHallazgos(r: Record<number, Respuesta>): Hallazgo[] {
  const lista: Hallazgo[] = [];

  if (r[1] === 'no' || r[1] === 'nose') {
    return [
      {
        titulo: 'Tu problema es la verificación',
        cuerpo: (
          <>
            La ficha no está reclamada o no está verificada. Hasta que eso se resuelva, el resto de
            la lista no cambia nada: una ficha sin verificar puede verse en el mapa y aun así no
            competir en las búsquedas de categoría. Reclámala desde Google Business Profile con la
            cuenta del negocio y completa la verificación que te pida Google, hoy casi siempre por
            video. Si no sabes si está verificada, entra a la ficha desde la cuenta del dueño y
            revísalo ahí.
          </>
        ),
      },
    ];
  }

  if (r[2] === 'si') {
    lista.push({
      titulo: 'Tienes fichas duplicadas',
      cuerpo: (
        <>
          Dos fichas del mismo negocio reparten las señales entre las dos: las reseñas quedan en
          una, las fotos en otra, y ninguna termina con el peso completo. Pide la fusión desde el
          soporte de Google Business Profile, indicando cuál quieres conservar. Antes de eso, apunta
          qué hay en cada una para no perder reseñas en el camino.
        </>
      ),
    });
  }

  if (r[3] === 'no' || r[3] === 'nose') {
    lista.push({
      titulo: 'La categoría principal no encaja',
      cuerpo: (
        <>
          Google decide en qué búsquedas te muestra en buena parte por la categoría principal. Busca
          en Maps el término con el que tú quieres que te encuentren, mira los tres negocios que
          salen arriba en tu zona y revisa qué categoría usan. Ajusta la tuya a eso y deja las demás
          como categorías secundarias.
        </>
      ),
    });
  }

  if (r[4] === 'no') {
    lista.push({
      titulo: 'Llevas más de un mes sin reseñas nuevas',
      cuerpo: (
        <>
          Una ficha con 80 reseñas viejas pesa menos que una con 30 que siguen llegando. Lo que mueve
          esto es pedirla en el momento en que el cliente todavía está contigo, no un correo tres
          días después. Es el punto que atacan los dispositivos NFC que vendemos: el cliente acerca
          el celular y le sale el formulario de reseña. Ataca este punto y ninguno de los otros
          cinco. Puedes{' '}
          <Link
            href="/catalogo"
            className="text-accent-600 underline underline-offset-2 hover:text-accent-700 font-semibold"
          >
            verlos en el catálogo
          </Link>
          , o resolverlo pidiendo la reseña a mano, que funciona igual si lo haces todos los días.
        </>
      ),
    });
  }

  if (r[5] === 'no' || r[5] === 'nose') {
    lista.push({
      titulo: 'Tu nombre, dirección y teléfono no coinciden',
      cuerpo: (
        <>
          Si en la ficha dice una cosa, en tu web otra y en el directorio de la cámara una tercera,
          Google tiene tres versiones de ti y confía menos en todas. Escoge una forma exacta de
          escribir el nombre, la dirección y el teléfono, y corrígela en la ficha, en tu web, en
          redes y en cualquier directorio donde estés listado.
        </>
      ),
    });
  }

  if (r[6] === 'no') {
    lista.push({
      titulo: 'No tienes fotos de este año',
      cuerpo: (
        <>
          Las fotos que se ven en tu ficha son casi siempre las que suben los clientes, y esas
          muestran lo que a ellos les llamó la atención. Sube las tuyas: fachada, entrada, interior,
          lo que vendes, el equipo trabajando. Tomadas con el celular está bien, mientras se vea el
          local real y no un banco de imágenes.
        </>
      ),
    });
  }

  return lista;
}

export default function DiagnosticoFicha() {
  const [respuestas, setRespuestas] = useState<Record<number, Respuesta>>({});
  const [indice, setIndice] = useState(0);
  const [terminado, setTerminado] = useState(false);

  const [email, setEmail] = useState('');
  const [envio, setEnvio] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorEnvio, setErrorEnvio] = useState('');

  const pregunta = PREGUNTAS[indice];

  const responder = (valor: Respuesta) => {
    const nuevas = { ...respuestas, [pregunta.id]: valor };
    setRespuestas(nuevas);
    if (indice + 1 < PREGUNTAS.length) {
      setIndice(indice + 1);
    } else {
      setTerminado(true);
    }
  };

  const reiniciar = () => {
    setRespuestas({});
    setIndice(0);
    setTerminado(false);
    setEmail('');
    setEnvio('idle');
    setErrorEnvio('');
  };

  const enviarCorreo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setEnvio('error');
      setErrorEnvio('Escribe un correo válido.');
      return;
    }

    setEnvio('loading');
    setErrorEnvio('');

    try {
      const res = await fetch('/api/email/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (data.success) {
        setEnvio('success');
        setEmail('');
      } else {
        setEnvio('error');
        setErrorEnvio(data.error || 'No pudimos guardar tu correo. Inténtalo otra vez.');
      }
    } catch (err) {
      console.error('[DIAGNOSTICO_FICHA_SUBSCRIBE_ERROR]', err);
      setEnvio('error');
      setErrorEnvio('Falló la conexión. Inténtalo otra vez en un momento.');
    }
  };

  const hallazgos = terminado ? construirHallazgos(respuestas) : [];
  const soloVerificacion = terminado && respuestas[1] !== 'si';

  return (
    <section
      aria-labelledby="diagnostico-ficha"
      className="not-prose my-14 rounded-2xl border border-brand-200 bg-white shadow-xs overflow-hidden"
    >
      <header className="bg-brand-50/70 border-b border-brand-200 px-6 py-5">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-accent-600">
          <ClipboardCheck className="w-3.5 h-3.5" aria-hidden="true" />
          Revisión de tu ficha
        </span>
        <h2 id="diagnostico-ficha" className="mt-2 text-xl sm:text-2xl font-black text-brand-950">
          Revisa tu ficha en seis preguntas
        </h2>
        <p className="mt-2 text-sm text-brand-600 leading-relaxed">
          Las mismas seis que reviso yo, en el mismo orden. Al final te digo qué tienes mal y por
          dónde empezar.
        </p>
      </header>

      {!terminado && (
        <div className="px-6 py-7">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-1.5 flex-1 rounded-full bg-brand-100 overflow-hidden">
              <div
                className="h-full bg-accent-500 transition-all duration-300"
                style={{ width: `${(indice / PREGUNTAS.length) * 100}%` }}
              />
            </div>
            <span className="text-xs font-bold text-brand-500 tabular-nums">
              {indice + 1} de {PREGUNTAS.length}
            </span>
          </div>

          <p className="text-lg sm:text-xl font-bold text-brand-950 leading-snug">
            {pregunta.texto}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
            {OPCIONES.map((o) => (
              <button
                key={o.valor}
                type="button"
                onClick={() => responder(o.valor)}
                className="flex-1 px-5 py-3 rounded-xl border border-brand-200 bg-white text-sm font-bold text-brand-800 hover:border-accent-500 hover:text-accent-600 transition shadow-2xs"
              >
                {o.etiqueta}
              </button>
            ))}
          </div>

          {indice > 0 && (
            <button
              type="button"
              onClick={() => setIndice(indice - 1)}
              className="mt-5 text-xs font-bold text-brand-500 hover:text-accent-600 transition"
            >
              Volver a la anterior
            </button>
          )}
        </div>
      )}

      {terminado && (
        <div className="px-6 py-7">
          {hallazgos.length === 0 ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
              <h3 className="font-black text-brand-950 text-base mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                Tu ficha está sana
              </h3>
              <p className="text-sm text-brand-700 leading-relaxed">
                Los seis puntos están en orden, así que lo que te queda es competir por prominencia
                contra los negocios de tu zona que llevan más tiempo en esto. Eso toma tiempo y
                depende de cuánta competencia tengas cerca. Sigue pidiendo reseñas, sube fotos
                nuevas cada tanto y revisa que la información siga igual en todos lados.
              </p>
            </div>
          ) : (
            <>
              <h3 className="font-black text-brand-950 text-base mb-1">
                {soloVerificacion
                  ? 'Empieza por aquí, lo demás puede esperar'
                  : hallazgos.length === 1
                  ? 'Esto es lo que tienes que arreglar'
                  : `Encontramos ${hallazgos.length} cosas, en este orden`}
              </h3>
              {!soloVerificacion && (
                <p className="text-xs text-brand-500 mb-4">
                  Van ordenadas como yo las atacaría: primero las de una tarde, después las de
                  trabajo continuo.
                </p>
              )}
              <ol className="space-y-4 mt-4">
                {hallazgos.map((h, i) => (
                  <li
                    key={h.titulo}
                    className="rounded-2xl border border-brand-200 bg-brand-50/50 p-5"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-accent-600 text-white text-xs font-black flex items-center justify-center">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <h4 className="font-bold text-brand-950 text-sm mb-1.5">{h.titulo}</h4>
                        <p className="text-sm text-brand-700 leading-relaxed">{h.cuerpo}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </>
          )}

          <div className="mt-7 pt-6 border-t border-brand-200">
            {envio === 'success' ? (
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-700">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                Listo, te lo mandamos a ese correo.
              </div>
            ) : (
              <form onSubmit={enviarCorreo} className="space-y-2">
                <label htmlFor="diagnostico-email" className="block text-sm font-bold text-brand-950">
                  ¿Te mando el detalle por correo?
                </label>
                <p className="text-xs text-brand-500">
                  Opcional. Tu resultado ya está arriba completo, dejes el correo o no.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <input
                    id="diagnostico-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu.correo@negocio.com"
                    className="flex-grow px-4 py-3 rounded-xl border border-brand-200 bg-white text-sm text-brand-900 placeholder-brand-400 focus:outline-none focus:border-accent-500"
                  />
                  <button
                    type="submit"
                    disabled={envio === 'loading'}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-accent-500 hover:bg-accent-600 disabled:opacity-60 text-white font-bold text-sm transition shadow-xs"
                  >
                    {envio === 'loading' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                        Enviando
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" aria-hidden="true" />
                        Mándamelo
                      </>
                    )}
                  </button>
                </div>
                {envio === 'error' && (
                  <p className="flex items-start gap-1.5 text-xs font-semibold text-red-600 pt-1">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                    {errorEnvio}
                  </p>
                )}
              </form>
            )}
          </div>

          <button
            type="button"
            onClick={reiniciar}
            className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-brand-500 hover:text-accent-600 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Empezar de nuevo
          </button>
        </div>
      )}
    </section>
  );
}
